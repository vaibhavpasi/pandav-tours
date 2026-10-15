-- routes:       a bookable service (e.g. "Nashik to Mumbai, one way",
--               "Nashik local 8 hr / 80 km", "Nashik Road station transfer").
-- route_fares:  the approved price for that route in one vehicle category.
--
-- A route with no active fare for a category is NOT bookable online in that
-- category; the customer is sent to the enquiry flow instead. Prices are
-- never invented by the application.
--
-- Money is stored as integer paise (bigint). Tax is stored in basis points
-- (500 = 5.00%) so it can be applied with integer arithmetic.

create table public.routes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null check (char_length(name) between 3 and 120),
  trip_type     text not null check (
                  trip_type in ('one_way', 'round_trip', 'local', 'airport_transfer', 'railway_transfer')
                ),
  origin        text not null check (char_length(origin) between 2 and 120),
  destination   text check (char_length(destination) between 2 and 120),
  distance_km   integer check (distance_km between 1 and 5000),
  description   text check (char_length(description) <= 2000),
  is_featured   boolean not null default false,
  sort_order    smallint not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint routes_destination_required check (trip_type = 'local' or destination is not null)
);

create index routes_active_type_idx on public.routes (is_active, trip_type, sort_order);

create trigger routes_set_updated_at
  before update on public.routes
  for each row execute function public.set_updated_at();

create table public.route_fares (
  id                           uuid primary key default gen_random_uuid(),
  route_id                     uuid not null references public.routes (id) on delete restrict,
  vehicle_category_id          uuid not null references public.vehicle_categories (id) on delete restrict,

  -- Core price. base_fare covers included_km / included_hours / included_days.
  base_fare_paise              bigint not null check (base_fare_paise >= 0),
  min_fare_paise               bigint not null default 0 check (min_fare_paise >= 0),
  included_km                  integer not null default 0 check (included_km >= 0),
  included_hours               integer check (included_hours > 0),      -- local rentals
  included_days                integer not null default 1 check (included_days >= 1), -- round trips

  -- Additional charges (all explicit, all configurable).
  extra_km_rate_paise          bigint not null default 0 check (extra_km_rate_paise >= 0),
  extra_hour_rate_paise        bigint not null default 0 check (extra_hour_rate_paise >= 0),
  extra_day_rate_paise         bigint not null default 0 check (extra_day_rate_paise >= 0),
  driver_allowance_paise       bigint not null default 0 check (driver_allowance_paise >= 0), -- per day
  night_charge_paise           bigint not null default 0 check (night_charge_paise >= 0),

  -- Tolls & parking: included in fare, a fixed prepaid amount, or paid
  -- by the customer at actuals during the trip (not collected online).
  toll_parking_policy          text not null default 'payable_at_actuals'
                                 check (toll_parking_policy in ('included', 'fixed', 'payable_at_actuals')),
  toll_parking_paise           bigint not null default 0 check (toll_parking_paise >= 0),

  -- Waiting charges are payable to the driver at actuals; shown, not prepaid.
  free_waiting_minutes         integer not null default 0 check (free_waiting_minutes >= 0),
  waiting_rate_per_hour_paise  bigint not null default 0 check (waiting_rate_per_hour_paise >= 0),

  tax_rate_bps                 integer not null default 0 check (tax_rate_bps between 0 and 2800),
  notes                        text check (char_length(notes) <= 1000),
  is_active                    boolean not null default true,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now(),

  constraint route_fares_route_category_key unique (route_id, vehicle_category_id),
  constraint route_fares_toll_amount_matches_policy
    check (toll_parking_policy = 'fixed' or toll_parking_paise = 0)
);

create index route_fares_category_idx on public.route_fares (vehicle_category_id);

create trigger route_fares_set_updated_at
  before update on public.route_fares
  for each row execute function public.set_updated_at();
