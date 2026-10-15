/**
 * Booking, quote, enquiry and status-lookup schemas. Shared by the browser
 * forms (instant feedback) and the API routes (the authority). Business
 * rules that need the database or the clock (lead time, seats, fares) are
 * checked on the server in lib/booking/service.ts.
 */
import { z } from "zod";
import { parseBookingReference } from "@/lib/booking/reference";
import { normalizeIndianMobile } from "@/lib/phone";

export const CAB_TRIP_TYPES = ["one_way", "round_trip", "local", "airport_transfer", "railway_transfer"] as const;
export type CabTripType = (typeof CAB_TRIP_TYPES)[number];

export const TRIP_TYPE_LABELS: Record<CabTripType, string> = {
  one_way: "One way",
  round_trip: "Round trip",
  local: "Local rental",
  airport_transfer: "Airport transfer",
  railway_transfer: "Railway station transfer",
};

// Required single-line fields reject control characters outright.
const SINGLE_LINE = /^[^\p{Cc}]*$/u;
// Optional free text: control characters are stripped (newlines/tabs are
// kept in multi-line fields).
const CONTROL_CHARS = /\p{Cc}/gu;
const CONTROL_CHARS_EXCEPT_NEWLINE_TAB = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? `Enter ${label}` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`)
    .regex(SINGLE_LINE, `${label} contains invalid characters`);

const optionalText = (max: number, label: string, multiline = false) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      const cleaned = multiline
        ? v.replace(CONTROL_CHARS_EXCEPT_NEWLINE_TAB, "")
        : v.replace(CONTROL_CHARS, " ");
      return cleaned.trim() || undefined;
    });

export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
export const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a time");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter your mobile number")
  .transform((value, ctx) => {
    const normalised = normalizeIndianMobile(value);
    if (!normalised) {
      ctx.addIssue({ code: "custom", message: "Enter a valid 10-digit Indian mobile number" });
      return z.NEVER;
    }
    return normalised;
  });

const emailSchema = z
  .union([z.literal(""), z.email("Enter a valid email address").max(254)])
  .optional()
  .transform((v) => (v ? v.toLowerCase() : undefined));

const passengers = z.coerce
  .number({ message: "Enter the number of passengers" })
  .int()
  .min(1, "At least 1 passenger")
  .max(60, "Too many passengers");

/** Anti-spam field hidden from humans; bots tend to fill it in. */
const honeypot = z.string().max(0).optional();

const tripFields = {
  tripType: z.enum(CAB_TRIP_TYPES),
  routeId: z.uuid("Choose a route"),
  pickupDate: dateString,
  pickupTime: timeString,
  returnDate: dateString.optional().or(z.literal("")),
  returnTime: timeString.optional().or(z.literal("")),
  passengers,
};

function requireReturnForRoundTrip(
  value: { tripType: CabTripType; returnDate?: string; returnTime?: string },
  ctx: z.RefinementCtx,
) {
  if (value.tripType !== "round_trip") return;
  if (!value.returnDate) ctx.addIssue({ code: "custom", path: ["returnDate"], message: "Choose a return date" });
  if (!value.returnTime) ctx.addIssue({ code: "custom", path: ["returnTime"], message: "Choose a return time" });
}

export const quoteRequestSchema = z.object(tripFields).superRefine(requireReturnForRoundTrip);
export type QuoteRequest = z.output<typeof quoteRequestSchema>;

export const cabBookingSchema = z
  .object({
    ...tripFields,
    vehicleCategoryId: z.uuid("Choose a vehicle"),
    pickupLocation: text(3, 300, "Pickup address"),
    dropLocation: optionalText(300, "Drop address"),
    name: text(2, 100, "Name"),
    phone: phoneSchema,
    email: emailSchema,
    specialInstructions: optionalText(1000, "Special instructions", true),
    acceptTerms: z.literal(true, { message: "Please accept the terms to continue" }),
    termsVersion: z.string().min(1).max(40),
    /** The total the customer saw. Used only to detect price changes, never to charge. */
    quotedTotalPaise: z.number().int().positive(),
    website: honeypot,
  })
  .superRefine(requireReturnForRoundTrip);

export type CabBookingInput = z.input<typeof cabBookingSchema>;
export type CabBookingRequest = z.output<typeof cabBookingSchema>;

export const packageBookingSchema = z.object({
  packageId: z.uuid(),
  pickupLocation: text(3, 300, "Pickup address"),
  pickupDate: dateString,
  pickupTime: timeString,
  passengers,
  name: text(2, 100, "Name"),
  phone: phoneSchema,
  email: emailSchema,
  specialInstructions: optionalText(1000, "Special instructions", true),
  acceptTerms: z.literal(true, { message: "Please accept the terms to continue" }),
  termsVersion: z.string().min(1).max(40),
  quotedTotalPaise: z.number().int().positive(),
  website: honeypot,
});

export type PackageBookingInput = z.input<typeof packageBookingSchema>;
export type PackageBookingRequest = z.output<typeof packageBookingSchema>;

export const ENQUIRY_TYPES = ["cab", "package", "hotel", "flight_train", "general"] as const;

export const ENQUIRY_TYPE_LABELS: Record<(typeof ENQUIRY_TYPES)[number], string> = {
  cab: "Cab booking",
  package: "Tour package",
  hotel: "Hotel booking assistance",
  flight_train: "Flight / train booking assistance",
  general: "General question",
};

export const enquirySchema = z.object({
  enquiryType: z.enum(ENQUIRY_TYPES),
  name: text(2, 100, "Name"),
  phone: phoneSchema,
  email: emailSchema,
  routeId: z.uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  vehicleCategoryId: z.uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  packageId: z.uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  pickupLocation: optionalText(300, "Pickup location"),
  destination: optionalText(300, "Destination"),
  travelDate: dateString.optional().or(z.literal("")).transform((v) => v || undefined),
  passengers: z
    .union([z.literal(""), passengers])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  message: optionalText(2000, "Message", true),
  website: honeypot,
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryRequest = z.output<typeof enquirySchema>;

export const statusLookupSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1, "Enter your booking reference")
    .transform((value, ctx) => {
      const parsed = parseBookingReference(value);
      if (!parsed) {
        ctx.addIssue({ code: "custom", message: "Booking references look like PT-ABCD2345" });
        return z.NEVER;
      }
      return parsed;
    }),
  phone: phoneSchema,
});

export type StatusLookupInput = z.input<typeof statusLookupSchema>;
