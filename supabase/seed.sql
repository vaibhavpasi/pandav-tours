-- ============================================================================
--  TEST DATA ONLY — DO NOT LOAD INTO PRODUCTION.
--
--  Every name is prefixed "[TEST]" and every slug "test-". The prices are
--  arbitrary round numbers for exercising fare calculation and checkout in
--  Razorpay TEST mode. They are NOT Pandav Tours & Travel's fares.
--  Real vehicle categories, routes and approved fares are entered by the
--  owner through /admin (Phase 4).
--
--  Loaded automatically by `supabase db reset` (local stack) only.
-- ============================================================================

insert into public.vehicle_categories (slug, name, description, example_models, seating_capacity, luggage_capacity, sort_order)
values
  ('test-sedan', '[TEST] Sedan', 'Test category for development.', 'Test model', 4, 2, 1),
  ('test-suv',   '[TEST] SUV',   'Test category for development.', 'Test model', 6, 3, 2)
on conflict (slug) do nothing;

insert into public.routes (slug, name, trip_type, origin, destination, distance_km, sort_order)
values
  ('test-one-way',  '[TEST] Nashik to Test City (one way)', 'one_way',          'Nashik', 'Test City',  170, 1),
  ('test-round',    '[TEST] Nashik to Test City (round)',   'round_trip',       'Nashik', 'Test City',  340, 2),
  ('test-local-8h', '[TEST] Nashik local 8 hr / 80 km',     'local',            'Nashik', null,          80, 3),
  ('test-station',  '[TEST] Nashik Road station transfer',  'railway_transfer', 'Nashik', 'Test Station', 15, 4)
on conflict (slug) do nothing;

-- One fare per route for the sedan; the SUV deliberately has a fare only on
-- the one-way route, so the "no approved fare → enquiry" path can be tested.
insert into public.route_fares (
  route_id, vehicle_category_id, base_fare_paise, included_km, included_hours, included_days,
  extra_km_rate_paise, extra_hour_rate_paise, driver_allowance_paise, tax_rate_bps, notes
)
select r.id, c.id, v.base, v.km, v.hours, v.days, v.extra_km, v.extra_hour, v.allowance, 500, '[TEST] fare'
from (values
  ('test-one-way',  'test-sedan', 100000, 170, null::int, 1, 1000, 0,     0),
  ('test-one-way',  'test-suv',   150000, 170, null::int, 1, 1500, 0,     0),
  ('test-round',    'test-sedan', 180000, 340, null::int, 1, 1000, 0, 30000),
  ('test-local-8h', 'test-sedan',  50000,  80, 8,         1, 1000, 10000, 0),
  ('test-station',  'test-sedan',  20000,  15, null::int, 1, 1000, 0,     0)
) as v(route_slug, category_slug, base, km, hours, days, extra_km, extra_hour, allowance)
join public.routes r on r.slug = v.route_slug
join public.vehicle_categories c on c.slug = v.category_slug
on conflict (route_id, vehicle_category_id) do nothing;

insert into public.tour_packages (
  slug, title, summary, duration_days, duration_nights, price_paise, price_basis, is_published, published_at
)
values
  ('test-priced-package',   '[TEST] Priced package',   'Test package with a fixed price.',       2, 1, 500000, 'per_vehicle', true, now()),
  ('test-enquiry-package',  '[TEST] Enquiry package',  'Test package without a price (enquiry).', 3, 2, null,   'per_vehicle', true, now())
on conflict (slug) do nothing;
