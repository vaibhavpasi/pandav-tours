/**
 * Server-only secrets. Importing this file from a Client Component fails the
 * build (via `server-only`), which keeps keys out of browser bundles.
 */
import "server-only";
import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const serverSchema = z
  .object({
    SUPABASE_SECRET_KEY: optional(z.string().min(20)),
    RAZORPAY_KEY_ID: optional(z.string().regex(/^rzp_(test|live)_\w+$/)),
    RAZORPAY_KEY_SECRET: optional(z.string().min(10)),
    RAZORPAY_WEBHOOK_SECRET: optional(z.string().min(12)),
    SMTP_HOST: optional(z.string().min(1)),
    SMTP_PORT: optional(z.coerce.number().int().min(1).max(65535)),
    SMTP_USER: optional(z.string().min(1)),
    SMTP_PASS: optional(z.string().min(1)),
    SMTP_FROM: optional(z.string().min(3)),
    RATE_LIMIT_SALT: optional(z.string().min(16)),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: optional(z.string()),
    VERCEL_ENV: optional(z.enum(["production", "preview", "development"])),
  })
  .superRefine((env, ctx) => {
    if (
      env.RAZORPAY_KEY_ID &&
      env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
      env.RAZORPAY_KEY_ID !== env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_RAZORPAY_KEY_ID"],
        message: "must equal RAZORPAY_KEY_ID",
      });
    }
    // Live keys are only allowed in the production deployment.
    if (env.RAZORPAY_KEY_ID?.startsWith("rzp_live_") && env.VERCEL_ENV !== "production") {
      ctx.addIssue({
        code: "custom",
        path: ["RAZORPAY_KEY_ID"],
        message: "live Razorpay keys may only be used when VERCEL_ENV=production",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverSchema.safeParse(source);
  if (!result.success) {
    // Report variable names only, never values.
    const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid server environment variables:\n${issues}`);
  }
  return result.data;
}

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

function required<K extends keyof ServerEnv>(key: K): NonNullable<ServerEnv[K]> {
  const value = serverEnv()[key];
  if (value === undefined || value === null) {
    throw new Error(`${String(key)} is not configured (see .env.example).`);
  }
  return value as NonNullable<ServerEnv[K]>;
}

export function supabaseSecretKey(): string {
  return required("SUPABASE_SECRET_KEY");
}

export function razorpayConfig() {
  return {
    keyId: required("RAZORPAY_KEY_ID"),
    keySecret: required("RAZORPAY_KEY_SECRET"),
    webhookSecret: required("RAZORPAY_WEBHOOK_SECRET"),
  };
}

/** Email is optional for the MVP: returns null when SMTP is not configured. */
export function smtpConfig() {
  const env = serverEnv();
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    return null;
  }
  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  };
}

export function rateLimitSalt(): string {
  return required("RATE_LIMIT_SALT");
}
