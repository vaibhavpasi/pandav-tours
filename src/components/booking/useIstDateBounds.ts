"use client";

import { useSyncExternalStore } from "react";
import { addDaysToIsoDate, istToday } from "@/lib/booking/time";

const noopSubscribe = () => () => {};

/**
 * min/max for date inputs, in IST. Null during server rendering (the clock
 * must not be read while prerendering) and filled in on the client.
 */
export function useIstDateBounds(maxAdvanceDays: number): { min: string; max: string } | null {
  const today = useSyncExternalStore(
    noopSubscribe,
    () => istToday(new Date()),
    () => null,
  );
  return today ? { min: today, max: addDaysToIsoDate(today, maxAdvanceDays) } : null;
}
