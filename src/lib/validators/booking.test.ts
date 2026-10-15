import { describe, expect, it } from "vitest";
import { cabBookingSchema, enquirySchema, quoteRequestSchema, statusLookupSchema } from "./booking";

const ROUTE = "11111111-1111-4111-8111-111111111111";
const CATEGORY = "22222222-2222-4222-8222-222222222222";

const validBooking = {
  tripType: "one_way",
  routeId: ROUTE,
  vehicleCategoryId: CATEGORY,
  pickupDate: "2026-11-01",
  pickupTime: "09:30",
  passengers: "2",
  pickupLocation: "Gangapur Road, Nashik",
  name: "Asha Patil",
  phone: "98765 43210",
  email: "ASHA@Example.com",
  acceptTerms: true,
  termsVersion: "v1",
  quotedTotalPaise: 262500,
};

describe("cabBookingSchema", () => {
  it("accepts and normalises a valid booking", () => {
    const parsed = cabBookingSchema.parse(validBooking);
    expect(parsed.phone).toBe("+919876543210");
    expect(parsed.email).toBe("asha@example.com");
    expect(parsed.passengers).toBe(2);
  });

  it("requires terms acceptance", () => {
    const result = cabBookingSchema.safeParse({ ...validBooking, acceptTerms: false });
    expect(result.success).toBe(false);
  });

  it("requires a return date/time for round trips", () => {
    const result = cabBookingSchema.safeParse({ ...validBooking, tripType: "round_trip" });
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((i) => i.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["returnDate", "returnTime"]));
  });

  it.each([
    ["phone", "12345"],
    ["pickupDate", "01/11/2026"],
    ["pickupTime", "9:30 AM"],
    ["routeId", "not-a-uuid"],
    ["passengers", "0"],
    ["name", "A"],
    ["name", "Asha\u0000Patil"],
    ["pickupLocation", "ab"],
    ["website", "http://spam.example"],
    ["quotedTotalPaise", 10.5],
    ["tripType", "helicopter"],
  ])("rejects invalid %s (%s)", (field, value) => {
    expect(cabBookingSchema.safeParse({ ...validBooking, [field]: value }).success).toBe(false);
  });

  it("strips control characters from free text but keeps line breaks", () => {
    const parsed = cabBookingSchema.parse({
      ...validBooking,
      specialInstructions: "Child seat\nplease\u0007",
    });
    expect(parsed.specialInstructions).toBe("Child seat\nplease");
  });

  it("does not accept a client-side amount field as a price", () => {
    const parsed = cabBookingSchema.parse({ ...validBooking, totalAmountPaise: 1 } as never);
    expect("totalAmountPaise" in parsed).toBe(false);
  });
});

describe("quoteRequestSchema", () => {
  it("accepts a minimal one-way quote", () => {
    expect(
      quoteRequestSchema.safeParse({
        tripType: "one_way",
        routeId: ROUTE,
        pickupDate: "2026-11-01",
        pickupTime: "09:30",
        passengers: 1,
      }).success,
    ).toBe(true);
  });
});

describe("enquirySchema", () => {
  it("treats empty optional fields as absent", () => {
    const parsed = enquirySchema.parse({
      enquiryType: "hotel",
      name: "Ravi",
      phone: "+91 98765 43210",
      email: "",
      routeId: "",
      travelDate: "",
      passengers: "",
      message: "Need a hotel near Trimbakeshwar",
    });
    expect(parsed).toMatchObject({ routeId: undefined, travelDate: undefined, passengers: undefined, email: undefined });
  });
});

describe("statusLookupSchema", () => {
  it("normalises the reference and phone", () => {
    expect(statusLookupSchema.parse({ reference: "pt-abcd2345", phone: "9876543210" })).toEqual({
      reference: "PT-ABCD2345",
      phone: "+919876543210",
    });
  });

  it("rejects malformed references", () => {
    expect(statusLookupSchema.safeParse({ reference: "12345", phone: "9876543210" }).success).toBe(false);
  });
});
