import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./env";
import { parseServerEnv } from "./env.server";

describe("public env", () => {
  it("treats empty strings as unset", () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_WHATSAPP_NUMBER: "", NEXT_PUBLIC_APP_URL: "" });
    expect(env.NEXT_PUBLIC_WHATSAPP_NUMBER).toBeUndefined();
    expect(env.NEXT_PUBLIC_APP_URL).toBeUndefined();
  });

  it("normalises Indian mobile numbers written in common formats", () => {
    for (const input of ["+919876543210", "98765 43210", "+91-98765-43210", "09876543210", "919876543210"]) {
      expect(parsePublicEnv({ NEXT_PUBLIC_WHATSAPP_NUMBER: input }).NEXT_PUBLIC_WHATSAPP_NUMBER).toBe("+919876543210");
    }
  });

  it("accepts the business mobile as typed and a site address without a scheme", () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_BUSINESS_PHONE: "80101 77386", NEXT_PUBLIC_APP_URL: "pandavtours.com" });
    expect(env.NEXT_PUBLIC_BUSINESS_PHONE).toBe("+918010177386");
    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://pandavtours.com");
  });

  it("drops invalid contact details instead of failing the build", () => {
    const env = parsePublicEnv({
      NEXT_PUBLIC_BUSINESS_PHONE: "12345",
      NEXT_PUBLIC_WHATSAPP_NUMBER: "wa.me/918010177386?text=hi",
      NEXT_PUBLIC_BUSINESS_EMAIL: "not an email",
      NEXT_PUBLIC_APP_NAME: "Pandav Tours & Travel",
    });
    expect(env.NEXT_PUBLIC_BUSINESS_PHONE).toBeUndefined();
    expect(env.NEXT_PUBLIC_WHATSAPP_NUMBER).toBeUndefined();
    expect(env.NEXT_PUBLIC_BUSINESS_EMAIL).toBeUndefined();
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("Pandav Tours & Travel");
  });

  it("still fails on invalid integration settings", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url" })).toThrow(/SUPABASE_URL/);
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
