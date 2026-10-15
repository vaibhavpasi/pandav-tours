-- Customers are guests (no login). They are identified by their mobile
-- number, normalised to E.164 (+91XXXXXXXXXX) by the application before
-- insert, so a returning customer re-uses the same row.

create table public.customers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(full_name) between 2 and 100),
  phone       text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  email       text check (
                email is null
                or (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
              ),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index customers_phone_key on public.customers (phone);
create index customers_email_idx on public.customers (lower(email));
create index customers_created_at_idx on public.customers (created_at desc);

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();
