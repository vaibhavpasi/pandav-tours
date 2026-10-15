# Pandav Tours & Travel

Website and online cab-booking system for Pandav Tours & Travel, Nashik.
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · Razorpay · Vercel.

| Doc | What's in it |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, folder structure, key decisions, security model |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, state machines, RLS, admin provisioning |
| [docs/CHECKLIST.md](docs/CHECKLIST.md) | Phase-by-phase progress and open questions for the owner |

## Requirements

- Node.js 20.9+ (developed on Node 24)
- npm 10+
- A Supabase project (free tier) — needed from Phase 2 onward
- A Razorpay account in **test mode** — needed from Phase 3 onward

Docker is **not** required. Database tests run the real migrations on PGlite (PostgreSQL in WASM).

## Local development

```bash
npm install
cp .env.example .env.local        # then fill in values (all optional in Phase 1)
npm run dev                       # http://localhost:3000
```

The public pages run without any configuration. `/admin` returns 503 until Supabase is configured.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm test` | Unit + database tests (Vitest + PGlite) |
| `npm run check` | typecheck → lint → test |
| `npm run db:types` | Regenerate types from the linked Supabase project |
| `npm run stack:local` | Local Postgres + PostgREST API with [TEST] data, no Docker (see below) |

## Local database without Docker (optional)

`scripts/local-stack/start.mjs` runs the real app against a local PostgreSQL + PostgREST that mimics Supabase's REST API. It recreates a database, applies every migration and `supabase/seed.sql` ([TEST] data), and prints the environment variables to start the app with.

1. Install or unzip PostgreSQL 15+ and start a server (`initdb`, then `pg_ctl start`).
2. Download PostgREST v12+ (on Windows it needs `libpq.dll`, which ships in PostgreSQL's `bin` folder).
3. `PG_BIN=<postgres bin folder> POSTGREST_BIN=<path to postgrest> PGPORT=<port> npm run stack:local`
4. Start the app with the printed variables (`npm run dev`).

Supabase Auth is not emulated, so `/admin` login needs a real Supabase project.

## Supabase setup

1. Create a project at <https://supabase.com> (region: **Mumbai, ap-south-1**). Create a **separate** project for staging/development and for production.
2. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up". Admins are added manually (step 6).
3. **Authentication → Policies / Passwords**: minimum length 12, require letters + digits.
4. **Project Settings → API Keys**: copy the URL, the publishable key and the secret key into `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
5. Apply the migrations:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   Do **not** run `supabase/seed.sql` against production — it contains test data only.
6. Create the first admin: **Authentication → Users → Add user** (email + strong password, auto-confirm), copy the user's UUID, then in the **SQL Editor**:
   ```sql
   insert into public.profiles (id, full_name, role) values ('<user-uuid>', 'Owner Name', 'admin');
   ```
7. Regenerate types and compare with the hand-written ones: `npm run db:types` → `src/types/database.generated.ts`.

## Environment variables

See [.env.example](.env.example) for every variable and where to find it. From Phase 2, online booking also needs `RATE_LIMIT_SALT` and `BOOKING_LINK_SECRET` (two different random 32+ character strings). Rules:

- `NEXT_PUBLIC_*` values are visible in the browser — never put secrets there.
- `SUPABASE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SMTP_PASS` are server-only (enforced by `server-only` imports).
- Live Razorpay keys are rejected unless `VERCEL_ENV=production`.
- `.env*` files are git-ignored (except `.env.example`).

Deployment, Razorpay webhook setup, domain/HTTPS and launch checklists are added in Phases 3 and 6.
