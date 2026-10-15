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

## Phase 2 — Public pages, booking form, fare calculation

- [ ] Fare engine (`lib/booking/fare.ts`) + tests
- [ ] Booking widget, route/vehicle selection, passenger form (RHF + Zod)
- [ ] `POST /api/bookings` (validate → price → persist → reference), rate limited
- [ ] Enquiry flow for routes without an approved fare
- [ ] Homepage sections, service pages, cabs, packages, about, contact, FAQ, legal pages

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
