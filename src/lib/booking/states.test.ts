import { describe, expect, it } from "vitest";
import {
  BOOKING_STATUSES,
  canTransitionBooking,
  canTransitionPayment,
  PAYMENT_STATUSES,
  STATE_MACHINES,
} from "./states";

describe("state machines", () => {
  it("every transition target is a known state", () => {
    for (const [name, map] of Object.entries(STATE_MACHINES)) {
      const states = new Set(Object.keys(map));
      for (const [from, targets] of Object.entries(map)) {
        for (const to of targets as readonly string[]) {
          expect(states.has(to), `${name}: ${from} -> ${to}`).toBe(true);
        }
      }
    }
  });

  it("covers every declared status", () => {
    expect(Object.keys(STATE_MACHINES.booking).sort()).toEqual([...BOOKING_STATUSES].sort());
    expect(Object.keys(STATE_MACHINES.payment).sort()).toEqual([...PAYMENT_STATUSES].sort());
  });

  it("never lets a failed payment become captured", () => {
    expect(canTransitionPayment("failed", "captured")).toBe(false);
  });

  it("treats completed as terminal", () => {
    for (const to of BOOKING_STATUSES) {
      expect(canTransitionBooking("completed", to)).toBe(to === "completed");
    }
  });

  it("does not allow skipping straight to completion", () => {
    expect(canTransitionBooking("confirmed", "completed")).toBe(false);
    expect(canTransitionBooking("pending_payment", "assigned")).toBe(false);
  });
});
