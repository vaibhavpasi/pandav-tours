import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/security/request";
import { resolveTripTimes } from "./service";

const SETTINGS = { min_booking_lead_minutes: 120, max_booking_advance_days: 90 };
const NOW = new Date("2026-11-01T04:30:00Z"); // 10:00 IST

function fields(fn: () => unknown): Record<string, string> | undefined {
  try {
    fn();
  } catch (error) {
    if (error instanceof ApiError) return error.fields;
    throw error;
  }
  throw new Error("expected an ApiError");
}

describe("resolveTripTimes", () => {
  it("accepts a pickup after the lead time", () => {
    const { pickupAt, returnAt } = resolveTripTimes(
      { tripType: "one_way", pickupDate: "2026-11-01", pickupTime: "12:00" },
      SETTINGS,
      NOW,
    );
    expect(pickupAt.toISOString()).toBe("2026-11-01T06:30:00.000Z");
    expect(returnAt).toBeNull();
  });

  it("rejects pickups inside the lead time with a helpful message", () => {
    expect(
      fields(() =>
        resolveTripTimes({ tripType: "one_way", pickupDate: "2026-11-01", pickupTime: "11:59" }, SETTINGS, NOW),
      ),
    ).toEqual({ pickupTime: expect.stringMatching(/at least 2 hours notice/) });
  });

  it("rejects pickups in the past and too far ahead", () => {
    expect(
      fields(() => resolveTripTimes({ tripType: "local", pickupDate: "2026-10-01", pickupTime: "10:00" }, SETTINGS, NOW)),
    ).toHaveProperty("pickupTime");
    expect(
      fields(() => resolveTripTimes({ tripType: "local", pickupDate: "2027-03-01", pickupTime: "10:00" }, SETTINGS, NOW)),
    ).toHaveProperty("pickupDate");
  });

  it("validates round-trip returns", () => {
    const base = { tripType: "round_trip" as const, pickupDate: "2026-11-02", pickupTime: "06:00" };
    expect(fields(() => resolveTripTimes(base, SETTINGS, NOW))).toHaveProperty("returnDate");
    expect(
      fields(() => resolveTripTimes({ ...base, returnDate: "2026-11-02", returnTime: "05:00" }, SETTINGS, NOW)),
    ).toHaveProperty("returnDate");
    expect(
      fields(() => resolveTripTimes({ ...base, returnDate: "2026-12-15", returnTime: "05:00" }, SETTINGS, NOW)),
    ).toHaveProperty("returnDate");
    expect(
      resolveTripTimes({ ...base, returnDate: "2026-11-03", returnTime: "20:00" }, SETTINGS, NOW).returnAt?.toISOString(),
    ).toBe("2026-11-03T14:30:00.000Z");
  });

  it("ignores return fields for one-way trips", () => {
    expect(
      resolveTripTimes(
        { tripType: "one_way", pickupDate: "2026-11-02", pickupTime: "06:00", returnDate: "2026-11-01", returnTime: "01:00" },
        SETTINGS,
        NOW,
      ).returnAt,
    ).toBeNull();
  });
});
