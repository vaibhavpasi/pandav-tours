import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { STATE_MACHINES, type StateMachineName } from "@/lib/booking/states";
import {
  asRole,
  createTestDatabase,
  IDS,
  inRollback,
  insertBooking,
  seedFixtures,
  type Fixtures,
} from "./harness";

let db: PGlite;
let fx: Fixtures;

beforeAll(async () => {
  db = await createTestDatabase();
  fx = await seedFixtures(db);
});

describe("state machine parity (SQL ↔ TypeScript)", () => {
  it("is_valid_transition matches STATE_MACHINES for every pair of states", async () => {
    for (const [machine, map] of Object.entries(STATE_MACHINES) as [
      StateMachineName,
      Record<string, readonly string[]>,
    ][]) {
      const states = Object.keys(map);
      for (const from of states) {
        for (const to of states) {
          const expected = from === to || map[from].includes(to);
          const { rows } = await db.query<{ ok: boolean }>(
            "select public.is_valid_transition($1, $2, $3) as ok",
            [machine, from, to],
          );
          expect(rows[0].ok, `${machine}: ${from} -> ${to}`).toBe(expected);
        }
      }
    }
  });
});

describe("RLS: anonymous visitors", () => {
  it("can read active vehicle categories but not inactive ones", async () => {
    const rows = await asRole(db, "anon", null, async (tx) =>
      (await tx.query<{ slug: string }>("select slug from public.vehicle_categories")).rows,
    );
    expect(rows.map((r) => r.slug)).toEqual(["test-sedan"]);
  });

  it("can read active fares", async () => {
    const rows = await asRole(db, "anon", null, async (tx) =>
      (await tx.query("select id from public.route_fares")).rows,
    );
    expect(rows).toHaveLength(1);
  });

  it("sees no customers, bookings, payments, drivers or vehicles", async () => {
    await inRollback(db, async (tx) => {
      await insertBooking(tx, fx);
      await tx.exec("set local role anon");
      for (const table of [
        "customers",
        "bookings",
        "payment_orders",
        "payments",
        "refunds",
        "drivers",
        "vehicles",
        "booking_events",
        "booking_assignments",
        "enquiries",
        "webhook_events",
        "profiles",
      ]) {
        const { rows } = await tx.query(`select * from public.${table}`);
        expect(rows, table).toHaveLength(0);
      }
    });
  });

  it("cannot insert a booking or customer directly", async () => {
    await expect(
      asRole(db, "anon", null, (tx) =>
        tx.query(
          "insert into public.customers (full_name, phone) values ('Mallory', '+919000000000')",
        ),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("can read public business settings but not the internal alert email", async () => {
    const rows = await asRole(db, "anon", null, async (tx) =>
      (await tx.query<{ business_name: string }>("select business_name from public.business_settings")).rows,
    );
    expect(rows[0].business_name).toBe("Pandav Tours & Travel");

    await expect(
      asRole(db, "anon", null, (tx) => tx.query("select admin_alert_email from public.business_settings")),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot call the rate limiter directly", async () => {
    await expect(
      asRole(db, "anon", null, (tx) => tx.query("select public.consume_rate_limit('k', 1, 60)")),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("RLS: authenticated users", () => {
  it("a signed-in user without a staff profile sees no bookings", async () => {
    await inRollback(db, async (tx) => {
      await insertBooking(tx, fx);
      await tx.exec("set local role authenticated");
      await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [IDS.strangerUser]);
      const { rows } = await tx.query("select * from public.bookings");
      expect(rows).toHaveLength(0);
    });
  });

  it("staff can read bookings", async () => {
    await inRollback(db, async (tx) => {
      await insertBooking(tx, fx);
      await tx.exec("set local role authenticated");
      await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [IDS.staffUser]);
      const { rows } = await tx.query("select * from public.bookings");
      expect(rows).toHaveLength(1);
    });
  });

  it("staff cannot change fares; admin can", async () => {
    await expect(
      asRole(db, "authenticated", IDS.staffUser, (tx) =>
        tx.query(
          `insert into public.route_fares (route_id, vehicle_category_id, base_fare_paise)
           values ($1, $2, 1)`,
          [fx.routeId, fx.inactiveCategoryId],
        ),
      ),
    ).rejects.toThrow(/row-level security/);

    const updated = await asRole(db, "authenticated", IDS.staffUser, async (tx) =>
      (await tx.query("update public.route_fares set base_fare_paise = 1 returning id")).rows,
    );
    expect(updated).toHaveLength(0);

    const adminUpdated = await asRole(db, "authenticated", IDS.adminUser, async (tx) =>
      (await tx.query("update public.route_fares set base_fare_paise = 1 returning id")).rows,
    );
    expect(adminUpdated).toHaveLength(1);
  });

  it("staff cannot promote themselves", async () => {
    const rows = await asRole(db, "authenticated", IDS.staffUser, async (tx) =>
      (await tx.query("update public.profiles set role = 'admin' where id = $1 returning id", [IDS.staffUser])).rows,
    );
    expect(rows).toHaveLength(0);
  });

  it("cannot TRUNCATE tables", async () => {
    await expect(
      asRole(db, "authenticated", IDS.adminUser, (tx) => tx.query("truncate public.booking_events")),
    ).rejects.toThrow(/permission denied/);
  });

  it("staff cannot write audit events on behalf of someone else", async () => {
    await inRollback(db, async (tx) => {
      const bookingId = await insertBooking(tx, fx);
      await tx.exec("set local role authenticated");
      await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [IDS.staffUser]);
      await expect(
        tx.query(
          `insert into public.booking_events (booking_id, event_type, actor_type, performed_by)
           values ($1, 'note.added', 'system', null)`,
          [bookingId],
        ),
      ).rejects.toThrow(/row-level security/);
    });
  });
});

describe("booking lifecycle rules (enforced for every role, incl. service_role)", () => {
  it("new bookings must start pending_payment/unpaid", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const id = await insertBooking(tx, fx);
        await tx.query("update public.bookings set booking_status = 'pending_payment' where id = $1", [id]);
        await tx.query(
          `insert into public.bookings (booking_reference, customer_id, booking_kind, trip_type, route_id,
             route_fare_id, vehicle_category_id, pickup_location, pickup_at, passenger_count, fare_snapshot,
             total_amount_paise, terms_version, terms_accepted_at, booking_status, payment_status)
           values ('PT-ZZZZZZZZ', $1, 'cab', 'one_way', $2, $3, $4, 'Nashik', now(), 1, '{}', 100, 'v1', now(),
             'confirmed', 'paid')`,
          [fx.customerId, fx.routeId, fx.fareId, fx.categoryId],
        );
      }),
    ).rejects.toThrow(/must start as pending_payment/);
  });

  it("cannot confirm an unpaid booking, even as service_role", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const id = await insertBooking(tx, fx);
        await tx.exec("set local role service_role");
        await tx.query("update public.bookings set booking_status = 'confirmed' where id = $1", [id]);
      }),
    ).rejects.toThrow(/cannot be confirmed before payment/);
  });

  it("follows the happy path and writes an audit event for each change", async () => {
    const events = await inRollback(db, async (tx) => {
      const id = await insertBooking(tx, fx);
      await tx.query(
        "update public.bookings set payment_status = 'paid', booking_status = 'confirmed' where id = $1",
        [id],
      );
      await tx.query("update public.bookings set booking_status = 'assigned' where id = $1", [id]);
      await tx.query("update public.bookings set booking_status = 'in_progress' where id = $1", [id]);
      await tx.query("update public.bookings set booking_status = 'completed' where id = $1", [id]);
      return (
        await tx.query<{ event_type: string; old_status: string | null; new_status: string | null }>(
          `select event_type, old_status, new_status from public.booking_events
           where booking_id = $1 order by created_at, event_type`,
          [id],
        )
      ).rows;
    });
    expect(events.map((e) => `${e.event_type}:${e.old_status ?? ""}>${e.new_status ?? ""}`)).toEqual(
      expect.arrayContaining([
        "booking.created:>pending_payment",
        "booking.payment_status_changed:unpaid>paid",
        "booking.status_changed:pending_payment>confirmed",
        "booking.status_changed:confirmed>assigned",
        "booking.status_changed:assigned>in_progress",
        "booking.status_changed:in_progress>completed",
      ]),
    );
    expect(events).toHaveLength(6);
  });

  it("rejects skipping states (confirmed -> completed)", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const id = await insertBooking(tx, fx);
        await tx.query(
          "update public.bookings set payment_status = 'paid', booking_status = 'confirmed' where id = $1",
          [id],
        );
        await tx.query("update public.bookings set booking_status = 'completed' where id = $1", [id]);
      }),
    ).rejects.toThrow(/Invalid booking status transition: confirmed -> completed/);
  });

  it("requires a cancellation reason and stamps cancelled_at", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const id = await insertBooking(tx, fx);
        await tx.query("update public.bookings set booking_status = 'cancelled' where id = $1", [id]);
      }),
    ).rejects.toThrow(/bookings_cancel_fields/);

    const row = await inRollback(db, async (tx) => {
      const id = await insertBooking(tx, fx);
      await tx.query(
        "update public.bookings set booking_status = 'cancelled', cancellation_reason = 'customer_request' where id = $1",
        [id],
      );
      return (await tx.query<{ cancelled_at: Date | null }>("select cancelled_at from public.bookings where id = $1", [id]))
        .rows[0];
    });
    expect(row.cancelled_at).toBeInstanceOf(Date);
  });

  it("reinstates a payment-expired booking only after a late payment", async () => {
    const row = await inRollback(db, async (tx) => {
      const id = await insertBooking(tx, fx);
      await tx.query(
        "update public.bookings set booking_status = 'cancelled', cancellation_reason = 'payment_expired' where id = $1",
        [id],
      );
      await tx.query(
        "update public.bookings set payment_status = 'paid', booking_status = 'confirmed' where id = $1",
        [id],
      );
      return (
        await tx.query<{ booking_status: string; cancelled_at: Date | null; cancellation_reason: string | null }>(
          "select booking_status, cancelled_at, cancellation_reason from public.bookings where id = $1",
          [id],
        )
      ).rows[0];
    });
    expect(row).toEqual({ booking_status: "confirmed", cancelled_at: null, cancellation_reason: null });

    await expect(
      inRollback(db, async (tx) => {
        const id = await insertBooking(tx, fx);
        await tx.query(
          "update public.bookings set booking_status = 'cancelled', cancellation_reason = 'admin' where id = $1",
          [id],
        );
        await tx.query(
          "update public.bookings set payment_status = 'paid', booking_status = 'confirmed' where id = $1",
          [id],
        );
      }),
    ).rejects.toThrow(/Only bookings cancelled for payment expiry/);
  });

  it("never assigns a booking flagged for reconciliation", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const id = await insertBooking(tx, fx);
        await tx.query(
          `update public.bookings set payment_status = 'paid', booking_status = 'confirmed',
             needs_reconciliation = true, reconciliation_note = 'amount mismatch' where id = $1`,
          [id],
        );
        await tx.query("update public.bookings set booking_status = 'assigned' where id = $1", [id]);
      }),
    ).rejects.toThrow(/needs reconciliation/);
  });

  it("keeps the price snapshot immutable", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const id = await insertBooking(tx, fx);
        await tx.exec("set local role service_role");
        await tx.query("update public.bookings set total_amount_paise = 1 where id = $1", [id]);
      }),
    ).rejects.toThrow(/bookings.total_amount_paise is immutable/);
  });
});

describe("payments integrity", () => {
  async function insertOrderAndPayment(tx: Pick<PGlite, "query">, status: string) {
    const bookingId = await insertBooking(tx, fx);
    const order = await tx.query<{ id: string }>(
      `insert into public.payment_orders (booking_id, gateway_order_id, amount_paise, receipt)
       values ($1, 'order_' || substr(md5(random()::text), 1, 14), 105000, 'PT-TEST') returning id`,
      [bookingId],
    );
    const payment = await tx.query<{ id: string }>(
      `insert into public.payments (payment_order_id, booking_id, gateway_payment_id, amount_paise, status)
       values ($1, $2, 'pay_' || substr(md5(random()::text), 1, 14), 105000, $3) returning id`,
      [order.rows[0].id, bookingId, status],
    );
    return { bookingId, orderId: order.rows[0].id, paymentId: payment.rows[0].id };
  }

  it("a failed payment can never become captured", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const { paymentId } = await insertOrderAndPayment(tx, "failed");
        await tx.exec("set local role service_role");
        await tx.query("update public.payments set status = 'captured' where id = $1", [paymentId]);
      }),
    ).rejects.toThrow(/Invalid payment status transition: failed -> captured/);
  });

  it("captured payments cannot be deleted, even by service_role", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const { paymentId } = await insertOrderAndPayment(tx, "captured");
        await tx.exec("set local role service_role");
        await tx.query("delete from public.payments where id = $1", [paymentId]);
      }),
    ).rejects.toThrow(/cannot be deleted/);
  });

  it("allows only one open order per booking", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const { bookingId } = await insertOrderAndPayment(tx, "captured");
        await tx.query(
          `insert into public.payment_orders (booking_id, gateway_order_id, amount_paise, receipt)
           values ($1, 'order_second', 105000, 'PT-TEST')`,
          [bookingId],
        );
      }),
    ).rejects.toThrow(/payment_orders_one_open_per_booking/);
  });

  it("refunds cannot exceed the payment amount", async () => {
    await expect(
      inRollback(db, async (tx) => {
        const { paymentId } = await insertOrderAndPayment(tx, "captured");
        await tx.query(
          "update public.payments set status = 'refunded', amount_refunded_paise = 105001 where id = $1",
          [paymentId],
        );
      }),
    ).rejects.toThrow(/payments_refund_within_amount/);
  });

  it("duplicate webhook deliveries are rejected by the unique event id", async () => {
    await expect(
      inRollback(db, async (tx) => {
        for (let i = 0; i < 2; i++) {
          await tx.query(
            `insert into public.webhook_events (event_id, event_type, payload)
             values ('evt_dup', 'payment.captured', '{}')`,
          );
        }
      }),
    ).rejects.toThrow(/webhook_events_gateway_event_key/);
  });

  it("the audit log is append-only", async () => {
    await expect(
      inRollback(db, async (tx) => {
        await insertBooking(tx, fx);
        await tx.exec("set local role service_role");
        await tx.query("update public.booking_events set event_type = 'tampered'");
      }),
    ).rejects.toThrow(/append-only/);
  });
});

describe("rate limiter", () => {
  it("allows up to the limit within a window, then blocks", async () => {
    const results = await asRole(db, "service_role", null, async (tx) => {
      const out: boolean[] = [];
      for (let i = 0; i < 3; i++) {
        const { rows } = await tx.query<{ ok: boolean }>(
          "select public.consume_rate_limit('test:ip-hash', 2, 60) as ok",
        );
        out.push(rows[0].ok);
      }
      return out;
    });
    expect(results).toEqual([true, true, false]);
  });
});
