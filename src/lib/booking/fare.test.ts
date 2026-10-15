import { describe, expect, it } from "vitest";
import { calculateCabFare, calculatePackageFare, taxOn, type FareRule } from "./fare";
import { istToUtc } from "./time";

const NIGHT = { start: "22:00:00", end: "06:00:00" };

function rule(overrides: Partial<FareRule> = {}): FareRule {
  return {
    id: "fare-1",
    base_fare_paise: 250_000,
    min_fare_paise: 0,
    included_km: 170,
    included_hours: null,
    included_days: 1,
    extra_km_rate_paise: 1_200,
    extra_hour_rate_paise: 0,
    extra_day_rate_paise: 0,
    driver_allowance_paise: 0,
    night_charge_paise: 0,
    toll_parking_policy: "payable_at_actuals",
    toll_parking_paise: 0,
    free_waiting_minutes: 0,
    waiting_rate_per_hour_paise: 0,
    tax_rate_bps: 500,
    ...overrides,
  };
}

const at = (date: string, time: string) => istToUtc(date, time)!;

describe("taxOn", () => {
  it("rounds half up to the nearest paisa", () => {
    expect(taxOn(250_000, 500)).toBe(12_500);
    expect(taxOn(10, 500)).toBe(1); // 0.5 → 1
    expect(taxOn(9, 500)).toBe(0); // 0.45 → 0
    expect(taxOn(0, 500)).toBe(0);
  });

  it("rejects fractional paise", () => {
    expect(() => taxOn(10.5, 500)).toThrow(RangeError);
  });
});

describe("calculateCabFare — one way", () => {
  it("charges base + tax and lists at-actuals items without pricing them", () => {
    const fare = calculateCabFare({
      tripType: "one_way",
      rule: rule(),
      pickupAt: at("2026-11-01", "09:00"),
      returnAt: null,
      nightWindow: NIGHT,
    });
    expect(fare.lines).toEqual([
      { code: "base", label: "Base fare", detail: "Includes 170 km", amountPaise: 250_000 },
    ]);
    expect(fare.subtotalPaise).toBe(250_000);
    expect(fare.taxPaise).toBe(12_500);
    expect(fare.totalPaise).toBe(262_500);
    expect(fare.payableLater.map((c) => c.code)).toEqual(["toll_parking", "extra_km"]);
    expect(fare.payableLater[1].detail).toBe("₹12/km beyond 170 km");
  });

  it("never charges less than the minimum fare", () => {
    const fare = calculateCabFare({
      tripType: "one_way",
      rule: rule({ base_fare_paise: 50_000, min_fare_paise: 80_000, tax_rate_bps: 0 }),
      pickupAt: at("2026-11-01", "09:00"),
      returnAt: null,
      nightWindow: NIGHT,
    });
    expect(fare.totalPaise).toBe(80_000);
  });

  it("adds a fixed toll amount as a prepaid line", () => {
    const fare = calculateCabFare({
      tripType: "one_way",
      rule: rule({ toll_parking_policy: "fixed", toll_parking_paise: 30_000, tax_rate_bps: 0 }),
      pickupAt: at("2026-11-01", "09:00"),
      returnAt: null,
      nightWindow: NIGHT,
    });
    expect(fare.totalPaise).toBe(280_000);
    expect(fare.payableLater.some((c) => c.code === "toll_parking")).toBe(false);
  });

  it("lists included tolls as an inclusion", () => {
    const fare = calculateCabFare({
      tripType: "one_way",
      rule: rule({ toll_parking_policy: "included" }),
      pickupAt: at("2026-11-01", "09:00"),
      returnAt: null,
      nightWindow: NIGHT,
    });
    expect(fare.inclusions).toContain("Tolls & parking included");
  });
});

describe("night charge", () => {
  const nightRule = rule({ night_charge_paise: 25_000, tax_rate_bps: 0 });
  const fareAt = (time: string) =>
    calculateCabFare({
      tripType: "one_way",
      rule: nightRule,
      pickupAt: at("2026-11-01", time),
      returnAt: null,
      nightWindow: NIGHT,
    }).totalPaise;

  it.each([
    ["21:59", 250_000],
    ["22:00", 275_000],
    ["23:30", 275_000],
    ["00:15", 275_000],
    ["05:59", 275_000],
    ["06:00", 250_000],
  ])("pickup at %s IST → %i paise", (time, expected) => {
    expect(fareAt(time)).toBe(expected);
  });
});

describe("calculateCabFare — round trip", () => {
  const roundRule = rule({
    base_fare_paise: 400_000,
    included_km: 340,
    included_days: 1,
    extra_day_rate_paise: 300_000,
    driver_allowance_paise: 30_000,
    tax_rate_bps: 0,
  });

  it("same-day return counts as one day", () => {
    const fare = calculateCabFare({
      tripType: "round_trip",
      rule: roundRule,
      pickupAt: at("2026-11-01", "06:00"),
      returnAt: at("2026-11-01", "22:00"),
      nightWindow: NIGHT,
    });
    expect(fare.tripDays).toBe(1);
    expect(fare.totalPaise).toBe(400_000 + 30_000);
  });

  it("counts IST calendar days across midnight and charges extra days + allowance per day", () => {
    const fare = calculateCabFare({
      tripType: "round_trip",
      rule: roundRule,
      pickupAt: at("2026-11-01", "23:30"),
      returnAt: at("2026-11-03", "00:30"),
      nightWindow: NIGHT,
    });
    expect(fare.tripDays).toBe(3);
    expect(fare.lines.map((l) => [l.code, l.amountPaise])).toEqual([
      ["base", 400_000],
      ["extra_days", 600_000],
      ["driver_allowance", 90_000],
    ]);
    expect(fare.totalPaise).toBe(1_090_000);
  });

  it("requires a return after pickup", () => {
    expect(() =>
      calculateCabFare({
        tripType: "round_trip",
        rule: roundRule,
        pickupAt: at("2026-11-02", "10:00"),
        returnAt: at("2026-11-01", "10:00"),
        nightWindow: NIGHT,
      }),
    ).toThrow(/Return must be after pickup/);
    expect(() =>
      calculateCabFare({
        tripType: "round_trip",
        rule: roundRule,
        pickupAt: at("2026-11-02", "10:00"),
        returnAt: null,
        nightWindow: NIGHT,
      }),
    ).toThrow(/return date/);
  });
});

describe("calculateCabFare — local rental", () => {
  it("shows included hours and prices extra hours/km as payable later", () => {
    const fare = calculateCabFare({
      tripType: "local",
      rule: rule({ base_fare_paise: 200_000, included_km: 80, included_hours: 8, extra_hour_rate_paise: 15_000 }),
      pickupAt: at("2026-11-01", "10:00"),
      returnAt: null,
      nightWindow: NIGHT,
    });
    expect(fare.lines[0].detail).toBe("Includes 80 km, 8 hours");
    expect(fare.payableLater.map((c) => c.code)).toEqual(["toll_parking", "extra_km", "extra_hours"]);
  });
});

describe("guards", () => {
  it("rejects fractional or negative amounts in a rule", () => {
    expect(() =>
      calculateCabFare({
        tripType: "one_way",
        rule: rule({ base_fare_paise: 100.5 }),
        pickupAt: at("2026-11-01", "10:00"),
        returnAt: null,
        nightWindow: NIGHT,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateCabFare({
        tripType: "one_way",
        rule: rule({ driver_allowance_paise: -1 }),
        pickupAt: at("2026-11-01", "10:00"),
        returnAt: null,
        nightWindow: NIGHT,
      }),
    ).toThrow(RangeError);
  });

  it("rejects a zero total", () => {
    expect(() =>
      calculateCabFare({
        tripType: "one_way",
        rule: rule({ base_fare_paise: 0 }),
        pickupAt: at("2026-11-01", "10:00"),
        returnAt: null,
        nightWindow: NIGHT,
      }),
    ).toThrow(/greater than zero/);
  });
});

describe("calculatePackageFare", () => {
  const pkg = { id: "p1", title: "Shirdi day trip", price_paise: 300_000, tax_rate_bps: 500 };

  it("multiplies per-person prices by passengers", () => {
    const fare = calculatePackageFare({ pkg: { ...pkg, price_basis: "per_person" }, passengers: 3 });
    expect(fare.subtotalPaise).toBe(900_000);
    expect(fare.totalPaise).toBe(945_000);
  });

  it("charges per-vehicle prices once", () => {
    const fare = calculatePackageFare({ pkg: { ...pkg, price_basis: "per_vehicle" }, passengers: 3 });
    expect(fare.subtotalPaise).toBe(300_000);
  });

  it("refuses packages priced on request", () => {
    expect(() =>
      calculatePackageFare({ pkg: { ...pkg, price_paise: null, price_basis: "per_vehicle" }, passengers: 1 }),
    ).toThrow(/on request/);
  });
});
