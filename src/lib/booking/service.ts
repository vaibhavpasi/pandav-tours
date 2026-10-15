/**
 * Server-side booking logic. Everything that decides a price or creates a
 * record lives here, and always reads FRESH rows from the database (never
 * the display cache). Callers (API routes) handle rate limiting and parse
 * input with the schemas in lib/validators/booking.ts first.
 */
import "server-only";
import { ApiError } from "@/lib/security/request";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CabBookingRequest, PackageBookingRequest, QuoteRequest } from "@/lib/validators/booking";
import type { BusinessSettingsRow, EnquiryType, Json, RouteRow, TripType, VehicleCategoryRow } from "@/types/database";
import { calculateCabFare, calculatePackageFare, type FareBreakdown, type FareRule } from "./fare";
import { generateBookingReference } from "./reference";
import { istToUtc } from "./time";

const MAX_ROUND_TRIP_DAYS = 30;
const MAX_REFERENCE_ATTEMPTS = 3;

type Settings = Pick<
  BusinessSettingsRow,
  | "payment_window_minutes"
  | "min_booking_lead_minutes"
  | "max_booking_advance_days"
  | "night_charge_start"
  | "night_charge_end"
  | "terms_version"
>;

type QuoteCategory = Pick<
  VehicleCategoryRow,
  "id" | "slug" | "name" | "seating_capacity" | "luggage_capacity" | "example_models" | "image_url"
>;

export type CategoryQuote = {
  category: QuoteCategory;
  /** null → no approved fare for this category; offer an enquiry instead. */
  fare: FareBreakdown | null;
  fitsPassengers: boolean;
};

export type TripQuote = {
  route: Pick<RouteRow, "id" | "name" | "trip_type" | "origin" | "destination" | "distance_km">;
  pickupAt: string;
  returnAt: string | null;
  termsVersion: string;
  quotes: CategoryQuote[];
};

// ------------------------------------------------------------ helpers

async function loadSettings(): Promise<Settings> {
  const { data, error } = await createAdminClient()
    .from("business_settings")
    .select(
      "payment_window_minutes, min_booking_lead_minutes, max_booking_advance_days, night_charge_start, night_charge_end, terms_version",
    )
    .eq("id", 1)
    .single();
  if (error || !data) throw new Error(`Could not load business settings: ${error?.message}`);
  return data;
}

function hoursLabel(minutes: number): string {
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  return `${minutes} minutes`;
}

/** Converts and validates the requested IST times against booking rules. */
export function resolveTripTimes(
  input: { tripType: TripType; pickupDate: string; pickupTime: string; returnDate?: string; returnTime?: string },
  settings: Pick<Settings, "min_booking_lead_minutes" | "max_booking_advance_days">,
  now: Date,
): { pickupAt: Date; returnAt: Date | null } {
  const pickupAt = istToUtc(input.pickupDate, input.pickupTime);
  if (!pickupAt) {
    throw new ApiError(422, "invalid_input", "Check the pickup date and time.", { pickupDate: "Invalid date" });
  }

  const earliest = now.getTime() + settings.min_booking_lead_minutes * 60_000;
  if (pickupAt.getTime() < earliest) {
    throw new ApiError(422, "invalid_input", "Please choose a later pickup time.", {
      pickupTime: `Online bookings need at least ${hoursLabel(settings.min_booking_lead_minutes)} notice. For urgent trips, please call us.`,
    });
  }

  const latest = now.getTime() + settings.max_booking_advance_days * 86_400_000;
  if (pickupAt.getTime() > latest) {
    throw new ApiError(422, "invalid_input", "That date is too far ahead.", {
      pickupDate: `Bookings open ${settings.max_booking_advance_days} days in advance.`,
    });
  }

  if (input.tripType !== "round_trip") return { pickupAt, returnAt: null };

  const returnAt = input.returnDate && input.returnTime ? istToUtc(input.returnDate, input.returnTime) : null;
  if (!returnAt) {
    throw new ApiError(422, "invalid_input", "Check the return date and time.", { returnDate: "Choose a return date" });
  }
  if (returnAt <= pickupAt) {
    throw new ApiError(422, "invalid_input", "Return must be after pickup.", {
      returnDate: "Return must be after the pickup time",
    });
  }
  if (returnAt.getTime() - pickupAt.getTime() > MAX_ROUND_TRIP_DAYS * 86_400_000) {
    throw new ApiError(422, "invalid_input", "Trip is too long to book online.", {
      returnDate: `Online round trips can be up to ${MAX_ROUND_TRIP_DAYS} days. Please send an enquiry for longer trips.`,
    });
  }
  return { pickupAt, returnAt };
}

// -------------------------------------------------------------- quotes

export async function quoteCabTrip(input: QuoteRequest, now: Date): Promise<TripQuote & { settings: Settings }> {
  const supabase = createAdminClient();
  const settings = await loadSettings();

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("id, name, trip_type, origin, destination, distance_km")
    .eq("id", input.routeId)
    .eq("is_active", true)
    .maybeSingle();
  if (routeError) throw new Error(routeError.message);
  if (!route || route.trip_type !== input.tripType) {
    throw new ApiError(404, "route_unavailable", "This route is not available for online booking.", {
      routeId: "Choose another route, or send us an enquiry",
    });
  }

  const { pickupAt, returnAt } = resolveTripTimes(input, settings, now);

  const [categoriesResult, faresResult] = await Promise.all([
    supabase
      .from("vehicle_categories")
      .select("id, slug, name, seating_capacity, luggage_capacity, example_models, image_url")
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("route_fares")
      .select(
        "id, vehicle_category_id, base_fare_paise, min_fare_paise, included_km, included_hours, included_days, " +
          "extra_km_rate_paise, extra_hour_rate_paise, extra_day_rate_paise, driver_allowance_paise, " +
          "night_charge_paise, toll_parking_policy, toll_parking_paise, free_waiting_minutes, " +
          "waiting_rate_per_hour_paise, tax_rate_bps",
      )
      .eq("route_id", route.id)
      .eq("is_active", true),
  ]);
  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (faresResult.error) throw new Error(faresResult.error.message);

  const fares = (faresResult.data ?? []) as unknown as (FareRule & { vehicle_category_id: string })[];
  const nightWindow = { start: settings.night_charge_start, end: settings.night_charge_end };

  const quotes = (categoriesResult.data ?? []).map((category) => {
    const rule = fares.find((f) => f.vehicle_category_id === category.id);
    return {
      category,
      fare: rule ? calculateCabFare({ tripType: route.trip_type, rule, pickupAt, returnAt, nightWindow }) : null,
      fitsPassengers: input.passengers <= category.seating_capacity,
    };
  });

  return {
    route,
    pickupAt: pickupAt.toISOString(),
    returnAt: returnAt?.toISOString() ?? null,
    termsVersion: settings.terms_version,
    quotes,
    settings,
  };
}

// ------------------------------------------------------------ creation

export type CreatedBooking = {
  bookingId: string;
  reference: string;
  totalPaise: number;
  paymentExpiresAt: string;
};

type RpcError = { code?: string; message: string };

function mapCreateError(error: RpcError): ApiError | null {
  if (error.code === "23514" || error.code === "P0001") {
    if (/Terms have changed/.test(error.message)) {
      return new ApiError(409, "terms_changed", "Our terms were updated. Please review and accept them again.");
    }
    if (/Too many passengers/.test(error.message)) {
      return new ApiError(422, "invalid_input", "Too many passengers for this vehicle.", {
        passengers: "Choose a larger vehicle or reduce passengers",
      });
    }
    if (/not available/.test(error.message)) {
      return new ApiError(409, "fare_unavailable", "This option is no longer available. Please choose again.");
    }
  }
  return null;
}

async function insertWithUniqueReference(
  call: (reference: string) => PromiseLike<{ data: unknown; error: RpcError | null }>,
): Promise<{ reference: string; data: unknown }> {
  for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
    const reference = generateBookingReference();
    const { data, error } = await call(reference);
    if (!error) return { reference, data };
    if (error.code === "23505" && /booking_reference/.test(error.message)) continue; // astronomically rare
    throw mapCreateError(error) ?? new Error(`create_booking failed: ${error.code} ${error.message}`);
  }
  throw new Error("Could not allocate a unique booking reference");
}

function firstRow(data: unknown): { booking_id: string; payment_expires_at: string } {
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.booking_id) throw new Error("create_booking returned no row");
  return row;
}

export async function createCabBooking(input: CabBookingRequest, now: Date): Promise<CreatedBooking> {
  const quote = await quoteCabTrip(input, now);
  const option = quote.quotes.find((q) => q.category.id === input.vehicleCategoryId);

  if (!option?.fare) {
    throw new ApiError(409, "fare_unavailable", "Online booking isn't available for this vehicle on this route.", {
      vehicleCategoryId: "Choose another vehicle, or send us an enquiry",
    });
  }
  if (!option.fitsPassengers) {
    throw new ApiError(422, "invalid_input", "Too many passengers for this vehicle.", {
      passengers: `${option.category.name} seats up to ${option.category.seating_capacity} passengers`,
    });
  }
  if (input.termsVersion !== quote.termsVersion) {
    throw new ApiError(409, "terms_changed", "Our terms were updated. Please review and accept them again.");
  }
  if (input.quotedTotalPaise !== option.fare.totalPaise) {
    throw new ApiError(409, "price_changed", "The fare has changed since you saw it. Please review the new price.");
  }

  const snapshot = {
    ...option.fare,
    computedAt: now.toISOString(),
    trip: {
      tripType: quote.route.trip_type,
      routeId: quote.route.id,
      routeName: quote.route.name,
      origin: quote.route.origin,
      destination: quote.route.destination,
      pickupAt: quote.pickupAt,
      returnAt: quote.returnAt,
      passengers: input.passengers,
    },
    vehicleCategory: { id: option.category.id, name: option.category.name },
  };

  const supabase = createAdminClient();
  const { reference, data } = await insertWithUniqueReference((ref) =>
    supabase.rpc("create_booking", {
      p_booking_reference: ref,
      p_contact_name: input.name,
      p_contact_phone: input.phone,
      p_contact_email: input.email ?? null,
      p_booking_kind: "cab",
      p_trip_type: quote.route.trip_type,
      p_route_id: quote.route.id,
      p_route_fare_id: option.fare!.fareRuleId,
      p_vehicle_category_id: option.category.id,
      p_package_id: null,
      p_pickup_location: input.pickupLocation,
      p_destination: input.dropLocation ?? quote.route.destination,
      p_pickup_at: quote.pickupAt,
      p_return_at: quote.returnAt,
      p_passenger_count: input.passengers,
      p_special_instructions: input.specialInstructions ?? null,
      p_fare_snapshot: snapshot as unknown as Json,
      p_total_amount_paise: option.fare!.totalPaise,
      p_terms_version: input.termsVersion,
      p_payment_window_minutes: quote.settings.payment_window_minutes,
    }),
  );

  const row = firstRow(data);
  return {
    bookingId: row.booking_id,
    reference,
    totalPaise: option.fare.totalPaise,
    paymentExpiresAt: row.payment_expires_at,
  };
}

export async function quotePackage(packageId: string, passengers: number) {
  const { data: pkg, error } = await createAdminClient()
    .from("tour_packages")
    .select("id, slug, title, price_paise, price_basis, tax_rate_bps")
    .eq("id", packageId)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!pkg || pkg.price_paise === null) {
    throw new ApiError(409, "fare_unavailable", "This package is available on enquiry only.");
  }
  return { pkg, fare: calculatePackageFare({ pkg, passengers }) };
}

export async function createPackageBooking(input: PackageBookingRequest, now: Date): Promise<CreatedBooking> {
  const settings = await loadSettings();
  const { pickupAt } = resolveTripTimes({ ...input, tripType: "one_way" }, settings, now);
  const { pkg, fare } = await quotePackage(input.packageId, input.passengers);

  if (input.termsVersion !== settings.terms_version) {
    throw new ApiError(409, "terms_changed", "Our terms were updated. Please review and accept them again.");
  }
  if (input.quotedTotalPaise !== fare.totalPaise) {
    throw new ApiError(409, "price_changed", "The price has changed since you saw it. Please review the new price.");
  }

  const snapshot = {
    ...fare,
    computedAt: now.toISOString(),
    trip: { tripType: "package", packageSlug: pkg.slug, packageTitle: pkg.title, pickupAt: pickupAt.toISOString(), passengers: input.passengers },
  };

  const supabase = createAdminClient();
  const { reference, data } = await insertWithUniqueReference((ref) =>
    supabase.rpc("create_booking", {
      p_booking_reference: ref,
      p_contact_name: input.name,
      p_contact_phone: input.phone,
      p_contact_email: input.email ?? null,
      p_booking_kind: "package",
      p_trip_type: "package",
      p_route_id: null,
      p_route_fare_id: null,
      p_vehicle_category_id: null,
      p_package_id: pkg.id,
      p_pickup_location: input.pickupLocation,
      p_destination: null,
      p_pickup_at: pickupAt.toISOString(),
      p_return_at: null,
      p_passenger_count: input.passengers,
      p_special_instructions: input.specialInstructions ?? null,
      p_fare_snapshot: snapshot as unknown as Json,
      p_total_amount_paise: fare.totalPaise,
      p_terms_version: input.termsVersion,
      p_payment_window_minutes: settings.payment_window_minutes,
    }),
  );

  const row = firstRow(data);
  return { bookingId: row.booking_id, reference, totalPaise: fare.totalPaise, paymentExpiresAt: row.payment_expires_at };
}

// ----------------------------------------------------- enquiry & lookup

export async function createEnquiry(input: {
  enquiryType: EnquiryType;
  name: string;
  phone: string;
  email?: string;
  routeId?: string;
  vehicleCategoryId?: string;
  packageId?: string;
  pickupLocation?: string;
  destination?: string;
  travelDate?: string;
  passengers?: number;
  message?: string;
}): Promise<void> {
  const { error } = await createAdminClient().rpc("create_enquiry", {
    p_contact_name: input.name,
    p_contact_phone: input.phone,
    p_contact_email: input.email ?? null,
    p_enquiry_type: input.enquiryType,
    p_route_id: input.routeId ?? null,
    p_vehicle_category_id: input.vehicleCategoryId ?? null,
    p_package_id: input.packageId ?? null,
    p_pickup_location: input.pickupLocation ?? null,
    p_destination: input.destination ?? null,
    p_travel_date: input.travelDate ?? null,
    p_passenger_count: input.passengers ?? null,
    p_message: input.message ?? null,
  });
  if (error) {
    // A stale route/category/package id fails the FK; treat as bad input.
    if (error.code === "23503") {
      throw new ApiError(422, "invalid_input", "Some details are no longer valid. Please refresh and try again.");
    }
    throw new Error(`create_enquiry failed: ${error.code} ${error.message}`);
  }
}

export async function lookupBookingStatus(reference: string, phone: string) {
  const { data, error } = await createAdminClient().rpc("lookup_booking_status", {
    p_booking_reference: reference,
    p_phone: phone,
  });
  if (error) throw new Error(`lookup_booking_status failed: ${error.message}`);
  return data?.[0] ?? null;
}

/** Booking details for the signed checkout page (id comes from a verified token). */
export async function getBookingForCheckout(bookingId: string) {
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select(
      "id, booking_reference, booking_kind, trip_type, pickup_location, destination, pickup_at, return_at, " +
        "passenger_count, contact_name, fare_snapshot, total_amount_paise, booking_status, payment_status, " +
        "payment_expires_at, special_instructions",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as CheckoutBooking | null;
}

export type CheckoutBooking = {
  id: string;
  booking_reference: string;
  booking_kind: "cab" | "package";
  trip_type: string;
  pickup_location: string;
  destination: string | null;
  pickup_at: string;
  return_at: string | null;
  passenger_count: number;
  contact_name: string;
  fare_snapshot: FareBreakdown & {
    trip?: { routeName?: string; packageTitle?: string };
    vehicleCategory?: { name: string };
  };
  total_amount_paise: number;
  booking_status: string;
  payment_status: string;
  payment_expires_at: string | null;
  special_instructions: string | null;
};
