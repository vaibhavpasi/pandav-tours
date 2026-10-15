/**
 * Fare engine. Pure, deterministic, integer-only (paise).
 *
 * Runs ONLY on the server for real prices: it receives an approved fare rule
 * loaded from the database and returns an itemised breakdown. The result is
 * stored on the booking as an immutable snapshot, and the customer is
 * charged exactly `totalPaise`.
 *
 * Charges are split into:
 *   - lines:        prepaid online (base, extra days, driver allowance,
 *                   night charge, fixed tolls) + tax
 *   - payableLater: shown up front but settled with the driver at actuals
 *                   (extra km/hours, tolls & parking when not included,
 *                   waiting time) — never estimated or invented.
 */
import type { RouteFareRow, TollParkingPolicy, TourPackageRow, TripType } from "@/types/database";
import { istCalendarDaysInclusive, isInNightWindow } from "./time";

export const FARE_ENGINE_VERSION = "fare-v1";

export type FareRule = Pick<
  RouteFareRow,
  | "id"
  | "base_fare_paise"
  | "min_fare_paise"
  | "included_km"
  | "included_hours"
  | "included_days"
  | "extra_km_rate_paise"
  | "extra_hour_rate_paise"
  | "extra_day_rate_paise"
  | "driver_allowance_paise"
  | "night_charge_paise"
  | "toll_parking_policy"
  | "toll_parking_paise"
  | "free_waiting_minutes"
  | "waiting_rate_per_hour_paise"
  | "tax_rate_bps"
>;

export type NightWindow = { start: string; end: string };

export type FareLine = {
  code: "base" | "extra_days" | "driver_allowance" | "night_charge" | "toll_parking" | "package";
  label: string;
  detail?: string;
  amountPaise: number;
};

export type LaterCharge = {
  code: "extra_km" | "extra_hours" | "toll_parking" | "waiting";
  label: string;
  detail: string;
};

export type FareBreakdown = {
  engineVersion: typeof FARE_ENGINE_VERSION;
  currency: "INR";
  fareRuleId: string | null;
  packageId: string | null;
  tripDays: number;
  lines: FareLine[];
  subtotalPaise: number;
  taxRateBps: number;
  taxPaise: number;
  totalPaise: number;
  inclusions: string[];
  payableLater: LaterCharge[];
};

export type CabFareInput = {
  tripType: TripType;
  rule: FareRule;
  pickupAt: Date;
  returnAt: Date | null;
  nightWindow: NightWindow;
};

/** Tax with round-half-up on whole paise. */
export function taxOn(amountPaise: number, rateBps: number): number {
  assertPaise(amountPaise);
  if (!Number.isInteger(rateBps) || rateBps < 0) throw new RangeError("Invalid tax rate");
  return Math.floor((amountPaise * rateBps + 5_000) / 10_000);
}

export function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function assertPaise(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Amount must be a non-negative integer number of paise, got ${value}`);
  }
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

const TOLL_LABELS: Record<TollParkingPolicy, string> = {
  included: "Tolls & parking included",
  fixed: "Tolls & parking",
  payable_at_actuals: "Tolls & parking",
};

export function calculateCabFare(input: CabFareInput): FareBreakdown {
  const { tripType, rule, pickupAt, returnAt, nightWindow } = input;

  for (const key of [
    "base_fare_paise",
    "min_fare_paise",
    "extra_km_rate_paise",
    "extra_hour_rate_paise",
    "extra_day_rate_paise",
    "driver_allowance_paise",
    "night_charge_paise",
    "toll_parking_paise",
    "waiting_rate_per_hour_paise",
  ] as const) {
    assertPaise(rule[key]);
  }

  if (tripType === "round_trip") {
    if (!returnAt) throw new Error("Round trips need a return date and time");
    if (returnAt <= pickupAt) throw new Error("Return must be after pickup");
  }

  const tripDays = tripType === "round_trip" && returnAt ? istCalendarDaysInclusive(pickupAt, returnAt) : 1;
  const lines: FareLine[] = [];
  const inclusions: string[] = [];
  const payableLater: LaterCharge[] = [];

  // Base fare (never below the configured minimum).
  const basePaise = Math.max(rule.base_fare_paise, rule.min_fare_paise);
  const covered: string[] = [];
  if (rule.included_km > 0) covered.push(`${rule.included_km} km`);
  if (tripType === "local" && rule.included_hours) covered.push(plural(rule.included_hours, "hour"));
  if (tripType === "round_trip") covered.push(plural(rule.included_days, "day"));
  lines.push({
    code: "base",
    label: "Base fare",
    detail: covered.length ? `Includes ${covered.join(", ")}` : undefined,
    amountPaise: basePaise,
  });
  if (covered.length) inclusions.push(...covered.map((c) => `${c} included`));

  // Round trips longer than the included days.
  const extraDays = tripType === "round_trip" ? Math.max(0, tripDays - rule.included_days) : 0;
  if (extraDays > 0 && rule.extra_day_rate_paise > 0) {
    lines.push({
      code: "extra_days",
      label: "Additional days",
      detail: `${formatRupees(rule.extra_day_rate_paise)} × ${plural(extraDays, "day")}`,
      amountPaise: rule.extra_day_rate_paise * extraDays,
    });
  }

  if (rule.driver_allowance_paise > 0) {
    lines.push({
      code: "driver_allowance",
      label: "Driver allowance",
      detail: `${formatRupees(rule.driver_allowance_paise)} × ${plural(tripDays, "day")}`,
      amountPaise: rule.driver_allowance_paise * tripDays,
    });
  }

  if (rule.night_charge_paise > 0 && isInNightWindow(pickupAt, nightWindow.start, nightWindow.end)) {
    lines.push({
      code: "night_charge",
      label: "Night pickup charge",
      detail: `Pickup between ${nightWindow.start.slice(0, 5)} and ${nightWindow.end.slice(0, 5)}`,
      amountPaise: rule.night_charge_paise,
    });
  }

  switch (rule.toll_parking_policy) {
    case "included":
      inclusions.push(TOLL_LABELS.included);
      break;
    case "fixed":
      if (rule.toll_parking_paise > 0) {
        lines.push({ code: "toll_parking", label: TOLL_LABELS.fixed, amountPaise: rule.toll_parking_paise });
      }
      break;
    case "payable_at_actuals":
      payableLater.push({
        code: "toll_parking",
        label: TOLL_LABELS.payable_at_actuals,
        detail: "Paid as per actual receipts during the trip",
      });
      break;
  }

  if (rule.extra_km_rate_paise > 0) {
    payableLater.push({
      code: "extra_km",
      label: "Extra distance",
      detail: `${formatRupees(rule.extra_km_rate_paise)}/km beyond ${rule.included_km} km`,
    });
  }
  if (tripType === "local" && rule.included_hours && rule.extra_hour_rate_paise > 0) {
    payableLater.push({
      code: "extra_hours",
      label: "Extra time",
      detail: `${formatRupees(rule.extra_hour_rate_paise)}/hour beyond ${plural(rule.included_hours, "hour")}`,
    });
  }
  if (rule.waiting_rate_per_hour_paise > 0) {
    payableLater.push({
      code: "waiting",
      label: "Waiting time",
      detail:
        `${formatRupees(rule.waiting_rate_per_hour_paise)}/hour` +
        (rule.free_waiting_minutes > 0 ? ` after ${rule.free_waiting_minutes} free minutes` : ""),
    });
  }

  return finalise({ lines, taxRateBps: rule.tax_rate_bps, tripDays, inclusions, payableLater, fareRuleId: rule.id });
}

export type PackageFareInput = {
  pkg: Pick<TourPackageRow, "id" | "title" | "price_paise" | "price_basis" | "tax_rate_bps">;
  passengers: number;
};

export function calculatePackageFare({ pkg, passengers }: PackageFareInput): FareBreakdown {
  if (pkg.price_paise === null) throw new Error("This package is priced on request");
  assertPaise(pkg.price_paise);
  if (!Number.isInteger(passengers) || passengers < 1) throw new RangeError("Invalid passenger count");

  const perPerson = pkg.price_basis === "per_person";
  const quantity = perPerson ? passengers : 1;
  return finalise({
    lines: [
      {
        code: "package",
        label: pkg.title,
        detail: perPerson ? `${formatRupees(pkg.price_paise)} × ${plural(passengers, "person")}` : undefined,
        amountPaise: pkg.price_paise * quantity,
      },
    ],
    taxRateBps: pkg.tax_rate_bps,
    tripDays: 1,
    inclusions: [],
    payableLater: [],
    packageId: pkg.id,
  });
}

function finalise(parts: {
  lines: FareLine[];
  taxRateBps: number;
  tripDays: number;
  inclusions: string[];
  payableLater: LaterCharge[];
  fareRuleId?: string;
  packageId?: string;
}): FareBreakdown {
  const subtotalPaise = parts.lines.reduce((sum, line) => sum + line.amountPaise, 0);
  assertPaise(subtotalPaise);
  const taxPaise = taxOn(subtotalPaise, parts.taxRateBps);
  const totalPaise = subtotalPaise + taxPaise;
  if (totalPaise <= 0) throw new Error("Fare total must be greater than zero");

  return {
    engineVersion: FARE_ENGINE_VERSION,
    currency: "INR",
    fareRuleId: parts.fareRuleId ?? null,
    packageId: parts.packageId ?? null,
    tripDays: parts.tripDays,
    lines: parts.lines,
    subtotalPaise,
    taxRateBps: parts.taxRateBps,
    taxPaise,
    totalPaise,
    inclusions: parts.inclusions,
    payableLater: parts.payableLater,
  };
}
