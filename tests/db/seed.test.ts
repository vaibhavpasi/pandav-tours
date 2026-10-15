import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createTestDatabase } from "./harness";

const seedSql = readFileSync(path.resolve(import.meta.dirname, "../../supabase/seed.sql"), "utf8");

describe("seed.sql", () => {
  it("applies cleanly and is idempotent", async () => {
    const db = await createTestDatabase();
    await db.exec(seedSql);
    await db.exec(seedSql);
    const { rows } = await db.query<{ n: number }>("select count(*)::int as n from public.route_fares");
    expect(rows[0].n).toBe(5);
  });

  it("marks every seeded record as test data", async () => {
    const db = await createTestDatabase();
    await db.exec(seedSql);
    for (const [table, column] of [
      ["vehicle_categories", "name"],
      ["routes", "name"],
      ["tour_packages", "title"],
    ]) {
      const { rows } = await db.query<{ value: string }>(`select ${column} as value from public.${table}`);
      for (const row of rows) expect(row.value, table).toMatch(/^\[TEST\] /);
    }
  });
});
