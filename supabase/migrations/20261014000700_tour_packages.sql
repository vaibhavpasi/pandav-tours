-- Tour packages. price_paise NULL means "price on request": the package is
-- shown but can only be enquired about, not paid for online.

create table public.tour_packages (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title             text not null check (char_length(title) between 3 and 120),
  summary           text check (char_length(summary) <= 300),
  description       text check (char_length(description) <= 10000),
  highlights        text[] not null default '{}',
  itinerary         jsonb not null default '[]'::jsonb check (jsonb_typeof(itinerary) = 'array'),
  inclusions        text[] not null default '{}',
  exclusions        text[] not null default '{}',
  duration_days     smallint not null check (duration_days between 1 and 60),
  duration_nights   smallint not null check (duration_nights between 0 and 59),
  price_paise       bigint check (price_paise > 0),
  price_basis       text not null default 'per_vehicle'
                      check (price_basis in ('per_person', 'per_vehicle', 'per_group')),
  tax_rate_bps      integer not null default 0 check (tax_rate_bps between 0 and 2800),
  image_url         text check (char_length(image_url) <= 500),
  seo_title         text check (char_length(seo_title) <= 70),
  seo_description   text check (char_length(seo_description) <= 170),
  is_featured       boolean not null default false,
  sort_order        smallint not null default 0,
  is_published      boolean not null default false,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index tour_packages_published_idx on public.tour_packages (is_published, sort_order);

create trigger tour_packages_set_updated_at
  before update on public.tour_packages
  for each row execute function public.set_updated_at();
