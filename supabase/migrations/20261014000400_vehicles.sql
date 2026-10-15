-- Two separate concepts:
--   vehicle_categories: what a customer books and what fares are priced by
--                       (e.g. "Sedan", "SUV"). Shown publicly.
--   vehicles:           the actual fleet (registration numbers) that an admin
--                       assigns to a booking. Never shown publicly.

create table public.vehicle_categories (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null check (char_length(name) between 1 and 60),
  description       text check (char_length(description) <= 500),
  example_models    text check (char_length(example_models) <= 120),
  seating_capacity  smallint not null check (seating_capacity between 1 and 60),
  luggage_capacity  smallint not null default 0 check (luggage_capacity between 0 and 30),
  image_url         text check (char_length(image_url) <= 500),
  sort_order        smallint not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index vehicle_categories_active_sort_idx
  on public.vehicle_categories (is_active, sort_order);

create trigger vehicle_categories_set_updated_at
  before update on public.vehicle_categories
  for each row execute function public.set_updated_at();

create table public.vehicles (
  id                   uuid primary key default gen_random_uuid(),
  category_id          uuid not null references public.vehicle_categories (id) on delete restrict,
  registration_number  text not null check (registration_number ~ '^[A-Z0-9 -]{4,15}$'),
  make_model           text not null check (char_length(make_model) between 1 and 80),
  colour               text check (char_length(colour) <= 30),
  is_active            boolean not null default true,
  notes                text check (char_length(notes) <= 1000),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- "MH 15 AB 1234" and "MH15AB1234" are the same vehicle.
create unique index vehicles_registration_key
  on public.vehicles (upper(replace(replace(registration_number, ' ', ''), '-', '')));
create index vehicles_category_idx on public.vehicles (category_id);

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();
