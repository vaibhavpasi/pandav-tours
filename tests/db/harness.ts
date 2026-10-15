/**
 * Runs the real migration files against PGlite (PostgreSQL compiled to WASM)
 * so schema, triggers and RLS policies can be tested without Docker or a
 * Supabase project. A small stub recreates the parts of Supabase the
 * migrations depend on: the anon/authenticated/service_role roles, the auth
 * schema and auth.uid(), and Supabase's default table grants.
 *
 * This is a close approximation, not a substitute for running the
 * migrations on a real Supabase project before launch (see docs/DATABASE.md).
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite, type Transaction } from "@electric-sql/pglite";

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, "../../supabase/migrations");

const SUPABASE_STUB = `
  create role anon nologin noinherit;
  create role authenticated nologin noinherit;
  create role service_role nologin noinherit bypassrls;

  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;

  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

export function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

export async function createTestDatabase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of migrationFiles()) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    try {
      await db.exec(sql);
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
    }
  }
  return db;
}

export type DbRole = "anon" | "authenticated" | "service_role";

/**
 * Runs `fn` inside a transaction as the given database role, optionally with
 * an auth user id (what auth.uid() returns). The transaction is always rolled
 * back so tests stay independent.
 */
export async function asRole<T>(
  db: PGlite,
  role: DbRole,
  userId: string | null,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  let result: T | undefined;
  const rollback = new Error("__rollback__");
  try {
    await db.transaction(async (tx) => {
      await tx.exec(`set local role ${role}`);
      if (userId) {
        await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId]);
      }
      result = await fn(tx);
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  return result as T;
}

/** Runs `fn` as the superuser inside a transaction that is rolled back. */
export async function inRollback<T>(db: PGlite, fn: (tx: Transaction) => Promise<T>): Promise<T> {
  let result: T | undefined;
  const rollback = new Error("__rollback__");
  try {
    await db.transaction(async (tx) => {
      result = await fn(tx);
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
  return result as T;
}

export const IDS = {
  adminUser: "00000000-0000-4000-8000-000000000001",
  staffUser: "00000000-0000-4000-8000-000000000002",
  strangerUser: "00000000-0000-4000-8000-000000000003",
} as const;

/** Inserts users/profiles and a minimal catalogue used by several tests. */
export async function seedFixtures(db: PGlite) {
  await db.exec(`
    insert into auth.users (id, email) values
      ('${IDS.adminUser}', 'admin@test.invalid'),
      ('${IDS.staffUser}', 'staff@test.invalid'),
      ('${IDS.strangerUser}', 'stranger@test.invalid');
    insert into public.profiles (id, full_name, role) values
      ('${IDS.adminUser}', 'Test Admin', 'admin'),
      ('${IDS.staffUser}', 'Test Staff', 'staff');
  `);

  const cat = await db.query<{ id: string }>(`
    insert into public.vehicle_categories (slug, name, seating_capacity, luggage_capacity)
    values ('test-sedan', '[TEST] Sedan', 4, 2) returning id`);
  const inactiveCat = await db.query<{ id: string }>(`
    insert into public.vehicle_categories (slug, name, seating_capacity, is_active)
    values ('test-retired', '[TEST] Retired', 4, false) returning id`);
  const route = await db.query<{ id: string }>(`
    insert into public.routes (slug, name, trip_type, origin, destination, distance_km)
    values ('test-nashik-mumbai', '[TEST] Nashik to Mumbai', 'one_way', 'Nashik', 'Mumbai', 170)
    returning id`);
  const fare = await db.query<{ id: string }>(
    `insert into public.route_fares (route_id, vehicle_category_id, base_fare_paise, included_km, tax_rate_bps)
     values ($1, $2, 100000, 170, 500) returning id`,
    [route.rows[0].id, cat.rows[0].id],
  );
  const customer = await db.query<{ id: string }>(`
    insert into public.customers (full_name, phone, email)
    values ('Test Customer', '+919999999999', 'customer@test.invalid') returning id`);

  return {
    categoryId: cat.rows[0].id,
    inactiveCategoryId: inactiveCat.rows[0].id,
    routeId: route.rows[0].id,
    fareId: fare.rows[0].id,
    customerId: customer.rows[0].id,
  };
}

export type Fixtures = Awaited<ReturnType<typeof seedFixtures>>;

let refCounter = 0;
/** Deterministic, valid booking references for tests. */
export function testReference(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let n = refCounter++;
  let body = "";
  for (let i = 0; i < 8; i++) {
    body = alphabet[n % 32] + body;
    n = Math.floor(n / 32);
  }
  return `PT-${body}`;
}

export async function insertBooking(
  tx: Pick<PGlite, "query">,
  fx: Fixtures,
): Promise<string> {
  const res = await tx.query<{ id: string }>(
    `insert into public.bookings (
       booking_reference, customer_id, contact_name, booking_kind, trip_type, route_id, route_fare_id,
       vehicle_category_id, pickup_location, destination, pickup_at, passenger_count,
       fare_snapshot, total_amount_paise, terms_version, terms_accepted_at
     ) values ($1, $2, 'Test Customer', 'cab', 'one_way', $3, $4, $5, 'Nashik Road', 'Mumbai Airport',
               now() + interval '2 days', 2, '{"total_paise":105000}', 105000, 'v1', now())
     returning id`,
    [testReference(), fx.customerId, fx.routeId, fx.fareId, fx.categoryId],
  );
  return res.rows[0].id;
}
