import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { asRole, createTestDatabase, inRollback, seedFixtures, testReference, type Fixtures } from "./harness";

let db: PGlite;
let fx: Fixtures;

beforeAll(async () => {
  db = await createTestDatabase();
  fx = await seedFixtures(db);
});

type Overrides = Partial<{
  name: string;
  phone: string;
  email: string | null;
  fareId: string;
  categoryId: string;
  tripType: string;
  passengers: number;
  terms: string;
}>;

function createBookingSql(o: Overrides = {}) {
  return {
    sql: `select * from public.create_booking(
      $1, $2, $3, $4, 'cab', $5, $6, $7, $8, null,
      'Nashik Road', 'Mumbai', now() + interval '1 day', null, $9, null,
      '{"engine":"test"}', 105000, $10, 30)`,
    params: [
      testReference(),
      o.name ?? "Asha Patil",
      o.phone ?? "+919800000001",
      o.email === undefined ? "asha@test.invalid" : o.email,
      o.tripType ?? "one_way",
      fx.routeId,
      o.fareId ?? fx.fareId,
      o.categoryId ?? fx.categoryId,
      o.passengers ?? 2,
      o.terms ?? "draft",
    ],
  };
}

describe("create_booking", () => {
  it("creates customer + booking atomically with a payment deadline", async () => {
    const result = await inRollback(db, async (tx) => {
      const q = createBookingSql();
      const created = await tx.query<{ booking_id: string; payment_expires_at: Date }>(q.sql, q.params);
      const booking = await tx.query<{ booking_status: string; contact_name: string; expires_in_min: number }>(
        `select booking_status, contact_name,
                round(extract(epoch from payment_expires_at - created_at) / 60)::int as expires_in_min
         from public.bookings where id = $1`,
        [created.rows[0].booking_id],
      );
      return booking.rows[0];
    });
    expect(result).toEqual({ booking_status: "pending_payment", contact_name: "Asha Patil", expires_in_min: 30 });
  });

  it("does not let a later submission overwrite an existing customer's details", async () => {
    const customer = await inRollback(db, async (tx) => {
      const first = createBookingSql({ name: "Real Owner", phone: "+919800000002", email: null });
      await tx.query(first.sql, first.params);
      const second = createBookingSql({ name: "Impostor", phone: "+919800000002", email: "evil@test.invalid" });
      await tx.query(second.sql, second.params);
      const second2 = createBookingSql({ name: "Impostor", phone: "+919800000002", email: "other@test.invalid" });
      await tx.query(second2.sql, second2.params);
      return (
        await tx.query<{ full_name: string; email: string | null; n: number }>(
          `select full_name, email, (select count(*)::int from public.customers where phone = '+919800000002') as n
           from public.customers where phone = '+919800000002'`,
        )
      ).rows[0];
    });
    // Name is kept; a missing email is filled once, then not replaced.
    expect(customer).toEqual({ full_name: "Real Owner", email: "evil@test.invalid", n: 1 });
  });

  it("rejects a fare that does not belong to the route/category", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const q = createBookingSql({ categoryId: fx.inactiveCategoryId });
        await tx.query(q.sql, q.params);
      }),
    ).rejects.toThrow(/Fare is not available/);
  });

  it("rejects a mismatched trip type", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const q = createBookingSql({ tripType: "round_trip" });
        await tx.query(q.sql, q.params);
      }),
    ).rejects.toThrow(/Fare is not available/);
  });

  it("rejects an inactive fare", async () => {
    await expect(
      inRollback(db, async (tx) => {
        await tx.query("update public.route_fares set is_active = false where id = $1", [fx.fareId]);
        const q = createBookingSql();
        await tx.query(q.sql, q.params);
      }),
    ).rejects.toThrow(/Fare is not available/);
  });

  it("rejects more passengers than the vehicle seats", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const q = createBookingSql({ passengers: 5 });
        await tx.query(q.sql, q.params);
      }),
    ).rejects.toThrow(/Too many passengers/);
  });

  it("rejects stale terms acceptance", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const q = createBookingSql({ terms: "old-version" });
        await tx.query(q.sql, q.params);
      }),
    ).rejects.toThrow(/Terms have changed/);
  });

  it("is not callable by anonymous or signed-in clients", async () => {
    const q = createBookingSql();
    await expect(asRole(db, "anon", null, (tx) => tx.query(q.sql, q.params))).rejects.toThrow(/permission denied/);
    await expect(asRole(db, "authenticated", null, (tx) => tx.query(q.sql, q.params))).rejects.toThrow(
      /permission denied/,
    );
  });

  it("is callable by service_role", async () => {
    const q = createBookingSql({ phone: "+919800000009" });
    const rows = await asRole(db, "service_role", null, async (tx) => (await tx.query(q.sql, q.params)).rows);
    expect(rows).toHaveLength(1);
  });
});

describe("lookup_booking_status", () => {
  it("requires the matching phone number", async () => {
    const result = await inRollback(db, async (tx) => {
      const q = createBookingSql({ phone: "+919800000003" });
      await tx.query(q.sql, q.params);
      const reference = q.params[0] as string;
      const ok = await tx.query("select * from public.lookup_booking_status($1, $2)", [reference, "+919800000003"]);
      const wrongPhone = await tx.query("select * from public.lookup_booking_status($1, $2)", [
        reference,
        "+919800000004",
      ]);
      return { ok: ok.rows.length, wrongPhone: wrongPhone.rows.length };
    });
    expect(result).toEqual({ ok: 1, wrongPhone: 0 });
  });

  it("is not callable by anonymous clients", async () => {
    await expect(
      asRole(db, "anon", null, (tx) => tx.query("select * from public.lookup_booking_status('PT-AAAAAAAA', '+919800000003')")),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("create_enquiry", () => {
  it("stores the enquiry with a contact snapshot", async () => {
    const row = await inRollback(db, async (tx) => {
      const id = await tx.query<{ id: string }>(
        `select public.create_enquiry('Ravi K', '+919800000005', null, 'cab', $1, null, null,
           'Nashik', 'Shirdi', current_date + 3, 4, 'Need an SUV') as id`,
        [fx.routeId],
      );
      return (
        await tx.query<{ contact_name: string; status: string }>(
          "select contact_name, status from public.enquiries where id = $1",
          [id.rows[0].id],
        )
      ).rows[0];
    });
    expect(row).toEqual({ contact_name: "Ravi K", status: "new" });
  });
});
