/**
 * Public (browser-safe) environment configuration.
 *
 * Every NEXT_PUBLIC_* variable must be read with a literal
 * `process.env.NEXT_PUBLIC_X` expression so Next.js can inline it at build
 * time. Secrets live in env.server.ts and must never be imported here.
 *
 * Validation is lazy: the public marketing pages build and run without
 * Supabase configured, and each integration fails with a clear message only
 * when it is actually used.
 */
import { z } from "zod";

const e164 = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "must be in E.164 format, e.g. +919876543210");

/** Treats "" (an unset line in .env) the same as a missing variable. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: optional(z.url()),
  NEXT_PUBLIC_APP_NAME: optional(z.string().min(1)),
  NEXT_PUBLIC_SUPABASE_URL: optional(z.url()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional(z.string().min(20)),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: optional(z.string().regex(/^rzp_(test|live)_\w+$/)),
  NEXT_PUBLIC_BUSINESS_PHONE: optional(e164),
  NEXT_PUBLIC_WHATSAPP_NUMBER: optional(e164),
  NEXT_PUBLIC_BUSINESS_EMAIL: optional(z.email()),
});

export type PublicEnv = z.infer<typeof publicSchema>;

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid public environment variables:\n${issues}`);
  }
  return result.data;
}

let cached: PublicEnv | undefined;

export function publicEnv(): PublicEnv {
  cached ??= parsePublicEnv({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    NEXT_PUBLIC_BUSINESS_PHONE: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    NEXT_PUBLIC_BUSINESS_EMAIL: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
  });
  return cached;
}

export function appUrl(): string {
  return (publicEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function isSupabaseConfigured(): boolean {
  const env = publicEnv();
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function supabasePublicConfig(): { url: string; publishableKey: string } {
  const env = publicEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).",
    );
  }
  return { url: env.NEXT_PUBLIC_SUPABASE_URL, publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
}
