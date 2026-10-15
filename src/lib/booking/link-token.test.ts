import { describe, expect, it } from "vitest";
import { createBookingLinkToken, verifyBookingLinkToken } from "./link-token";

const SECRET = "test-secret-that-is-long-enough-123456";
const ID = "3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const NOW = new Date("2026-11-01T00:00:00Z");

describe("booking link tokens", () => {
  it("round-trips", () => {
    const token = createBookingLinkToken(ID, SECRET, NOW);
    expect(verifyBookingLinkToken(token, SECRET, NOW)).toBe(ID);
  });

  it("rejects expired tokens", () => {
    const token = createBookingLinkToken(ID, SECRET, NOW, 60);
    expect(verifyBookingLinkToken(token, SECRET, new Date(NOW.getTime() + 61_000))).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = createBookingLinkToken(ID, "another-secret-value-1234567890", NOW);
    expect(verifyBookingLinkToken(token, SECRET, NOW)).toBeNull();
  });

  it("rejects a token whose booking id or expiry was changed", () => {
    const [, exp, sig] = createBookingLinkToken(ID, SECRET, NOW).split(".");
    const otherId = "00000000-0000-4000-8000-000000000000";
    expect(verifyBookingLinkToken(`${otherId}.${exp}.${sig}`, SECRET, NOW)).toBeNull();
    expect(verifyBookingLinkToken(`${ID}.${Number(exp) + 9999}.${sig}`, SECRET, NOW)).toBeNull();
  });

  it.each(["", "a.b", "a.b.c.d", `${ID}.abc.sig`, "x".repeat(500)])("rejects malformed token %#", (token) => {
    expect(verifyBookingLinkToken(token, SECRET, NOW)).toBeNull();
  });
});
