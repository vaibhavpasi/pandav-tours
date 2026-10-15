/**
 * Public catalogue: vehicle categories, routes, starting prices, packages and
 * public business settings. Read with the publishable key (RLS limits it to
 * active/published rows), cached with `use cache` and tagged "catalog" so
 * admin edits can refresh it with updateTag("catalog") in Phase 4.
 *
 * This data is for DISPLAY. Prices actually charged are always recomputed
 * from fresh database rows in lib/booking/service.ts.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/env";
import type {
  BusinessSettingsRow,
  Database,
  RouteRow,
  TourPackageRow,
  TripType,
  VehicleCategoryRow,
} from "@/types/database";

export type PublicCategory = Pick<
  VehicleCategoryRow,
  "id" | "slug" | "name" | "description" | "example_models" | "seating_capacity" | "luggage_capacity" | "image_url"
>;

export type PublicRoute = Pick<
  RouteRow,
  "id" | "slug" | "name" | "trip_type" | "origin" | "destination" | "distance_km" | "description" | "is_featured"
>;

/** Pre-tax starting price of a route in one category, for "from ₹X" labels. */
export type PublicFareSummary = {
  routeId: string;
  categoryId: string;
  startingPaise: number;
  includedKm: number;
  includedHours: number | null;
};

export type PublicPackageSummary = Pick<
  TourPackageRow,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "duration_days"
  | "duration_nights"
  | "price_paise"
  | "price_basis"
  | "image_url"
  | "is_featured"
>;

export type PublicPackage = PublicPackageSummary &
  Pick<
    TourPackageRow,
    "description" | "highlights" | "itinerary" | "inclusions" | "exclusions" | "tax_rate_bps" | "seo_title" | "seo_description"
  >;

export type PublicSettings = Pick<
  BusinessSettingsRow,
  | "business_name"
  | "tagline"
  | "phone"
  | "whatsapp_number"
  | "public_email"
  | "address"
  | "service_area"
  | "timezone"
  | "payment_window_minutes"
  | "min_booking_lead_minutes"
  | "max_booking_advance_days"
  | "night_charge_start"
  | "night_charge_end"
  | "terms_version"
  | "cancellation_policy_summary"
>;

export type Catalog = {
  /** False when Supabase isn't configured or couldn't be reached. */
  available: boolean;
  categories: PublicCategory[];
  routes: PublicRoute[];
  fares: PublicFareSummary[];
  packages: PublicPackageSummary[];
  settings: PublicSettings;
};

/** Mirrors the column defaults in the business_settings migration. */
export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  business_name: "Pandav Tours & Travel",
  tagline: null,
  phone: null,
  whatsapp_number: null,
  public_email: null,
  address: null,
  service_area: null,
  timezone: "Asia/Kolkata",
  payment_window_minutes: 30,
  min_booking_lead_minutes: 120,
  max_booking_advance_days: 90,
  night_charge_start: "22:00:00",
  night_charge_end: "06:00:00",
  terms_version: "draft",
  cancellation_policy_summary: null,
};

const SETTINGS_COLUMNS =
  "business_name, tagline, phone, whatsapp_number, public_email, address, service_area, timezone, " +
  "payment_window_minutes, min_booking_lead_minutes, max_booking_advance_days, night_charge_start, " +
  "night_charge_end, terms_version, cancellation_policy_summary";

const PACKAGE_SUMMARY_COLUMNS =
  "id, slug, title, summary, duration_days, duration_nights, price_paise, price_basis, image_url, is_featured";

const EMPTY_CATALOG: Catalog = {
  available: false,
  categories: [],
  routes: [],
  fares: [],
  packages: [],
  settings: DEFAULT_PUBLIC_SETTINGS,
};

function publicClient() {
  const { url, publishableKey } = supabasePublicConfig();
  return createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag("catalog");

  if (!isSupabaseConfigured()) {
    cacheLife("hours");
    return EMPTY_CATALOG;
  }

  try {
    const supabase = publicClient();
    const [categories, routes, fares, packages, settings] = await Promise.all([
      supabase
        .from("vehicle_categories")
        .select("id, slug, name, description, example_models, seating_capacity, luggage_capacity, image_url")
        .order("sort_order")
        .order("name"),
      supabase
        .from("routes")
        .select("id, slug, name, trip_type, origin, destination, distance_km, description, is_featured")
        .order("sort_order")
        .order("name"),
      supabase
        .from("route_fares")
        .select("route_id, vehicle_category_id, base_fare_paise, min_fare_paise, included_km, included_hours"),
      supabase.from("tour_packages").select(PACKAGE_SUMMARY_COLUMNS).order("sort_order").order("title"),
      supabase.from("business_settings").select(SETTINGS_COLUMNS).eq("id", 1).maybeSingle(),
    ]);

    const failed = [categories, routes, fares, packages, settings].find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);

    cacheLife("hours");
    return {
      available: true,
      categories: categories.data ?? [],
      routes: routes.data ?? [],
      fares: (fares.data ?? []).map((f) => ({
        routeId: f.route_id,
        categoryId: f.vehicle_category_id,
        startingPaise: Math.max(f.base_fare_paise, f.min_fare_paise),
        includedKm: f.included_km,
        includedHours: f.included_hours,
      })),
      packages: (packages.data ?? []) as PublicPackageSummary[],
      settings: (settings.data as PublicSettings | null) ?? DEFAULT_PUBLIC_SETTINGS,
    };
  } catch (error) {
    // Don't cache an outage for long; show "call us" fallbacks meanwhile.
    console.error("[catalog] failed to load", error);
    cacheLife("seconds");
    return EMPTY_CATALOG;
  }
}

export async function getPackageBySlug(slug: string): Promise<PublicPackage | null> {
  "use cache";
  cacheTag("catalog");

  if (!isSupabaseConfigured() || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    cacheLife("hours");
    return null;
  }

  const { data, error } = await publicClient()
    .from("tour_packages")
    .select(
      `${PACKAGE_SUMMARY_COLUMNS}, description, highlights, itinerary, inclusions, exclusions, tax_rate_bps, seo_title, seo_description`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[catalog] failed to load package", error.message);
    cacheLife("seconds");
    return null;
  }
  cacheLife("hours");
  return (data as PublicPackage | null) ?? null;
}

// ------------------------------------------------------------ selectors

export function routesOfType(catalog: Catalog, types: TripType[]): PublicRoute[] {
  return catalog.routes.filter((r) => types.includes(r.trip_type));
}

/** Lowest pre-tax starting price for a route across categories, or null. */
export function startingPriceForRoute(catalog: Catalog, routeId: string): number | null {
  const prices = catalog.fares.filter((f) => f.routeId === routeId).map((f) => f.startingPaise);
  return prices.length ? Math.min(...prices) : null;
}

/** Lowest pre-tax starting price for a category across routes, or null. */
export function startingPriceForCategory(catalog: Catalog, categoryId: string): number | null {
  const prices = catalog.fares.filter((f) => f.categoryId === categoryId).map((f) => f.startingPaise);
  return prices.length ? Math.min(...prices) : null;
}
