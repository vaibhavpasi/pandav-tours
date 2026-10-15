import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const BUSINESS_TIMEZONE = "Asia/Kolkata";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 150050 → "₹1,500.50"; 150000 → "₹1,500". Paise must be an integer. */
export function formatPaise(paise: number): string {
  if (!Number.isSafeInteger(paise)) {
    throw new RangeError(`Amount in paise must be a safe integer, got ${paise}`);
  }
  return inrFormatter.format(paise / 100);
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: BUSINESS_TIMEZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

/** Formats an ISO timestamp in Nashik local time (IST). */
export function formatDateTimeIST(iso: string | Date): string {
  return dateTimeFormatter.format(typeof iso === "string" ? new Date(iso) : iso);
}
