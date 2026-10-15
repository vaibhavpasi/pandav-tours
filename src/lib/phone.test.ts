import { describe, expect, it } from "vitest";
import { formatPhoneForDisplay, normalizeIndianMobile } from "./phone";
import { buildWhatsAppUrl } from "./whatsapp";
import { formatPaise } from "./utils";

describe("normalizeIndianMobile", () => {
  it.each([
    ["9876543210", "+919876543210"],
    ["98765 43210", "+919876543210"],
    ["+91 98765-43210", "+919876543210"],
    ["919876543210", "+919876543210"],
    ["09876543210", "+919876543210"],
    ["0091 9876543210", "+919876543210"],
  ])("normalises %s", (input, expected) => {
    expect(normalizeIndianMobile(input)).toBe(expected);
  });

  it.each(["12345", "5876543210", "98765432101", "abcdefghij", ""])("rejects %s", (input) => {
    expect(normalizeIndianMobile(input)).toBeNull();
  });

  it("formats for display", () => {
    expect(formatPhoneForDisplay("+919876543210")).toBe("+91 98765 43210");
  });
});

describe("buildWhatsAppUrl", () => {
  it("URL-encodes the message", () => {
    expect(buildWhatsAppUrl("+919876543210", "Booking PT-ABCD2345 & 2 pax?")).toBe(
      "https://wa.me/919876543210?text=Booking%20PT-ABCD2345%20%26%202%20pax%3F",
    );
  });

  it("rejects invalid numbers", () => {
    expect(() => buildWhatsAppUrl("not-a-number")).toThrow();
  });
});

describe("formatPaise", () => {
  it("formats rupees in Indian grouping", () => {
    expect(formatPaise(150000)).toBe("₹1,500");
    expect(formatPaise(150050)).toBe("₹1,500.5");
    expect(formatPaise(1234567800)).toBe("₹1,23,45,678");
  });

  it("rejects non-integer paise", () => {
    expect(() => formatPaise(10.5)).toThrow(RangeError);
  });
});
