-- Drivers are managed by admins only and never exposed publicly.
-- Licence numbers are personal data: visible to staff only (see RLS).

create table public.drivers (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null check (char_length(full_name) between 2 and 100),
  phone            text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  license_number   text check (char_length(license_number) <= 30),
  license_expiry   date,
  is_active        boolean not null default true,
  notes            text check (char_length(notes) <= 1000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index drivers_phone_key on public.drivers (phone);
create index drivers_active_idx on public.drivers (is_active);

create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function public.set_updated_at();
