import { describe, expect, it } from "vitest";
import {
  BOOKING_REFERENCE_ALPHABET,
  generateBookingReference,
  isValidBookingReference,
  parseBookingReference,
} from "./reference";

describe("booking references", () => {
  it("uses a 32-symbol alphabet without look-alike characters", () => {
    expect(BOOKING_REFERENCE_ALPHABET).toHaveLength(32);
    expect(new Set(BOOKING_REFERENCE_ALPHABET).size).toBe(32);
    expect(BOOKING_REFERENCE_ALPHABET).not.toMatch(/[01IO]/);
  });

  it("generates valid, unique references", () => {
    const refs = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      const ref = generateBookingReference();
      expect(isValidBookingReference(ref)).toBe(true);
      refs.add(ref);
    }
    expect(refs.size).toBe(10_000);
  });

  it("matches the database CHECK constraint pattern", () => {
    const dbPattern = /^PT-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/;
    for (let i = 0; i < 1000; i++) {
      expect(generateBookingReference()).toMatch(dbPattern);
    }
  });

  it("parses customer-typed references", () => {
    expect(parseBookingReference(" pt-abcd 2345 ")).toBe("PT-ABCD2345");
    expect(parseBookingReference("ABCD2345")).toBe("PT-ABCD2345");
    expect(parseBookingReference("PT-ABCD234")).toBeNull(); // too short
    expect(parseBookingReference("PT-ABCD2340")).toBeNull(); // contains 0
    expect(parseBookingReference("'; drop table--")).toBeNull();
  });
});
