import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./env";
import { parseServerEnv } from "./env.server";

describe("public env", () => {
  it("treats empty strings as unset", () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_WHATSAPP_NUMBER: "", NEXT_PUBLIC_APP_URL: "" });
    expect(env.NEXT_PUBLIC_WHATSAPP_NUMBER).toBeUndefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBeUndefined();
  });

  it("rejects phone numbers not in E.164 format", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_WHATSAPP_NUMBER: "98765 43210" })).toThrow(/E\.164/);
    expect(parsePublicEnv({ NEXT_PUBLIC_WHATSAPP_NUMBER: "+919876543210" }).NEXT_PUBLIC_WHATSAPP_NUMBER).toBe(
      "+919876543210",
    );
  });
});

describe("server env", () => {
  it("rejects live Razorpay keys outside production", () => {
    expect(() =>
      parseServerEnv({ RAZORPAY_KEY_ID: "rzp_live_abc123", VERCEL_ENV: "preview" }),
    ).toThrow(/live Razorpay keys/);
    expect(() =>
      parseServerEnv({ RAZORPAY_KEY_ID: "rzp_live_abc123", VERCEL_ENV: "production" }),
    ).not.toThrow();
  });

  it("requires the public and secret Razorpay key ids to match", () => {
    expect(() =>
      parseServerEnv({ RAZORPAY_KEY_ID: "rzp_test_aaa", NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_test_bbb" }),
    ).toThrow(/must equal RAZORPAY_KEY_ID/);
  });

  it("never includes secret values in error messages", () => {
    try {
      parseServerEnv({ RAZORPAY_KEY_SECRET: "s3cr3tV", SUPABASE_SECRET_KEY: "tiny-secret" });
      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).not.toContain("tiny-secret");
      expect((error as Error).message).not.toContain("s3cr3tV");
    }
  });
});
