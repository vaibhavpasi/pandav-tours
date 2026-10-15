# Implementation checklist

## Phase 1 — Repository, design system, layout, database ✅

- [x] Next.js 16 + TypeScript strict + Tailwind 4 scaffold, pinned dependencies
- [x] Design tokens (contrast-verified) and fonts (Poppins headings, Inter body)
- [x] UI components: Button/ButtonLink, Field/Input/Select/Textarea/Checkbox, Card, Badge + status badges, Dialog/ConfirmDialog, Toast, DataTable (responsive), Skeleton, Empty/Error states, Spinner, Container
- [x] Layout: Header, MobileNav, Footer, FloatingActions (call/WhatsApp), SkipLink, placeholder Logo
- [x] 14 migrations: schema, state-machine triggers, audit trail, RLS, rate limiter
- [x] Supabase clients (browser / server / secret) and admin proxy (fails closed)
- [x] Validated env config (public + server-only); `.env.example`
- [x] Security headers, robots rules, 404 + error pages
- [x] Tests: 60 passing (migrations, RLS, transitions, immutability, parity, references, phone, env)
- [x] Docs: README, ARCHITECTURE, DATABASE

## Phase 2 — Public pages, booking form, fare calculation ✅

- [x] Fare engine (`lib/booking/fare.ts`): integer paise, itemised lines, tax round-half-up, night charge, round-trip days in IST, at-actuals charges listed not priced
- [x] Booking widget (homepage) → 3-step booking form (trip → vehicle with server quotes → details), RHF + Zod
- [x] Package booking (fixed price) and enquiry flow (no approved fare / price on request / hotel / flight-train)
- [x] APIs: `POST /api/fare/quote`, `/api/bookings`, `/api/enquiries`, `/api/bookings/status` — same-origin + JSON-only (CSRF), size limit, rate limited (hashed IP), safe errors
- [x] Price-change protection: server recomputes; mismatch → 409 and re-quote, never a silent charge
- [x] Signed 7-day checkout links (HMAC); status lookup needs reference + phone
- [x] DB functions `create_booking` / `create_enquiry` / `lookup_booking_status` (server-only, re-validate in-transaction)
- [x] Pages: home (all sections in brief order), book-cab, cabs, local/outstation/airport/railway, tour packages + detail, about, contact, FAQ, 3 draft legal pages, checkout (summary), booking status
- [x] Tests: 146 unit/DB tests; browser E2E against real PostgreSQL 17 + PostgREST (see summary in commit)
- [x] All public pages checked at 360px: no horizontal scroll, unique titles/canonicals, noindex on transactional pages

Known gaps carried forward:
- Checkout shows "online payment is being set up" until Phase 3.
- Status lookup cannot resume payment yet (Phase 3 returns a fresh checkout link).
- Legal pages are drafts with "[to be confirmed]" items (owner/lawyer).
- Unpaid bookings are not yet expired automatically (Phase 3 reconciliation job).

## Phase 3 — Payments

- [ ] Create/reuse Razorpay order, Standard Checkout, signature verification
- [ ] Webhook handler (raw-body signature check, idempotent), reconciliation job
- [ ] Success / failed / status pages; CSP

## Phase 4 — Admin

- [ ] Login, server-side role checks, dashboard, bookings, assignments, CRUD, CSV export, settings

## Phase 5 — WhatsApp, email, SEO, analytics

## Phase 6 — E2E tests, security review, staging, launch

## Needed from the owner (not invented)

- [ ] Logo files from the visiting-card artwork (SVG or high-res PNG)
- [ ] Verified business phone and WhatsApp numbers, public email
- [ ] Vehicle categories actually offered (name, seats, luggage, example models, photos)
- [ ] Approved fares per route and category, incl. driver allowance, tolls policy, night charges, waiting charges, GST rate
- [ ] Tour packages (itinerary, inclusions, price or "on request")
- [ ] Cancellation/refund policy, terms, privacy contact, business address (if it should be public)
- [ ] Travel photography you own or have licensed
- [ ] Supabase and Razorpay accounts (test mode first)
