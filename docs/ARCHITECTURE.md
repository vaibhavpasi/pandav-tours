# Architecture

## Stack (pinned versions in package.json)

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack) | Cache Components + Partial Prefetching enabled (framework defaults) |
| Language | TypeScript 5.9, `strict` | TS 7 (native compiler) skipped until Next.js tooling supports it |
| Styling | Tailwind CSS 4 | Design tokens in `src/app/globals.css` (`@theme`) |
| Database / Auth | Supabase (Postgres + Auth) | Free tier; RLS on every table |
| Payments | Razorpay Standard Checkout | Phase 3; card data never touches our server |
| Validation | Zod 4, React Hook Form 7 | Same schemas on client and server |
| Tests | Vitest 5, PGlite | DB tests run real migrations without Docker |
| Hosting | Vercel (Hobby) | Node.js runtime |

No separate backend: privileged work happens in Route Handlers / Server Actions.

## Folder structure

```
src/
  app/
    (site)/            public site — shares Header/Footer/FloatingActions
      page.tsx         homepage
      …                service, booking & legal pages (Phase 2–5)
    admin/             admin dashboard — own layout, noindex (Phase 4)
    api/               route handlers: bookings, payments, webhooks (Phase 2–3)
    layout.tsx         root: fonts, metadata, ToastProvider
    not-found.tsx, error.tsx, robots.ts
  components/
    ui/                Button, Field/Input/Select/Textarea/Checkbox, Card, Badge,
                       StatusBadges, Dialog/ConfirmDialog, Toast, DataTable,
                       Skeleton/LoadingBlock, EmptyState/ErrorState, Spinner, Container
    layout/            Header, MobileNav, Footer, FloatingActions, Logo, SkipLink, Icons
  lib/
    booking/           states.ts (state machines), reference.ts (booking refs)
    supabase/          client.ts (browser), server.ts (per-request, RLS),
                       admin.ts (secret key, server-only), proxy.ts (session refresh)
    env.ts             public env (lazy, validated)
    env.server.ts      secrets (server-only, validated)
    constants.ts, phone.ts, whatsapp.ts, utils.ts
  types/database.ts    Supabase types (hand-written; regenerate with db:types)
  proxy.ts             Next 16 "proxy" (formerly middleware) — admin routes only
supabase/
  migrations/          14 ordered SQL migrations
  seed.sql             [TEST] data for local/staging only
  config.toml          local Supabase CLI config (sign-ups disabled)
tests/db/              PGlite harness + schema/RLS/state-machine tests
docs/
```

## Key decisions

1. **Money is integer paise (`bigint`)**; tax is stored in basis points (500 = 5%). No floating point anywhere in pricing.
2. **Server-side pricing only.** The browser sends route + vehicle category; the server loads the approved fare, computes the total and stores an immutable `fare_snapshot`. A database trigger blocks any later change to the price.
3. **No approved fare → enquiry.** Routes/categories without an active `route_fares` row are never priced by the app; the customer is sent to the enquiry form.
4. **Vehicle categories ≠ fleet vehicles.** Customers book a category ("Sedan"); admins assign a specific vehicle and driver.
5. **Razorpay order ≠ payment.** `payment_orders` (one per checkout) and `payments` (one per attempt). A failed attempt stays failed; a later success is a new row. Only one open order per booking (unique partial index) prevents parallel orders and double charges.
6. **State machines enforced in Postgres.** Triggers reject invalid transitions for every role — including the service-role key used by the server. The TypeScript copy in `src/lib/booking/states.ts` is tested for parity.
7. **Paid before confirmed.** The database refuses `confirmed` unless `payment_status = 'paid'`. Opening `/booking-success` can never confirm a booking.
8. **Late payments are flagged, not auto-processed.** A payment captured after the booking expired sets `needs_reconciliation`; flagged bookings cannot be assigned until an admin reinstates or refunds them.
9. **Automatic audit trail.** Every booking creation and status change writes an append-only `booking_events` row via trigger; server code adds richer events.
10. **Idempotent webhooks.** `webhook_events(gateway, event_id)` is unique; duplicate deliveries are detected on insert.
11. **Booking references** are `PT-` + 8 CSPRNG characters (32-symbol alphabet, ~10¹² space). Status lookup requires reference **and** phone and is rate-limited.
12. **Rate limiting without Redis**: a Postgres fixed-window counter (`consume_rate_limit`, callable only by the server). IPs are hashed with a secret salt before use.
13. **Contact details are configuration.** Phone/WhatsApp/email come from env vars (Phase 1) and the admin settings table (Phase 4); UI elements are hidden when a value isn't set.

## Security model

| Actor | Can do |
| --- | --- |
| Public visitor (anon key) | Read active catalogue (categories, routes, fares, published packages) and public settings. Nothing else — not even its own booking. |
| Customer | No account. All actions go through validated, rate-limited server endpoints. |
| Staff (Supabase Auth + `profiles.role='staff'`) | Read operations data; update bookings/enquiries; assign drivers; add audit events as themselves. |
| Admin (`role='admin'`) | Staff + manage fares, vehicles, drivers, packages, settings. |
| Server (secret key) | Bypasses RLS for booking creation and gateway-verified payment updates. Still bound by triggers. |

Defence in depth for `/admin`: `src/proxy.ts` (optimistic redirect, `no-store`, `noindex`) → server-side role check in every admin page/action (Phase 4) → RLS in the database.

Baseline response headers (all routes): HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. A Content-Security-Policy is added in Phase 3 alongside Razorpay.

## Next.js 16 notes for contributors

- `middleware.ts` is now **`src/proxy.ts`** (Node.js runtime).
- With Cache Components, reading `cookies()`/`headers()` must happen inside `<Suspense>`; calling `new Date()`/`Math.random()` during prerender fails the build — move it to request time or a Client Component.
- Bundled docs: `node_modules/next/dist/docs/`.
