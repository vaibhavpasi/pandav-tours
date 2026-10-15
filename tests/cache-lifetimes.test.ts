import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const DATA_DIR = path.resolve(import.meta.dirname, "../src/lib/data");

/**
 * Pages read the catalogue outside <Suspense> so they can be prerendered.
 * Next.js excludes caches that expire in under 5 minutes (the "seconds"
 * preset) from prerendering, which fails `next build` — this broke a Vercel
 * deploy when Supabase returned an error and the error path used "seconds".
 */
describe("catalogue cache lifetimes", () => {
  it('never uses cacheLife("seconds") in src/lib/data', () => {
    for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith(".ts"))) {
      const source = readFileSync(path.join(DATA_DIR, file), "utf8");
      expect(source, file).not.toMatch(/cacheLife\(\s*["']seconds["']\s*\)/);
    }
  });
});
