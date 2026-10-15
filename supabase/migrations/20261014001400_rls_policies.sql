-- Row Level Security.
--
-- Access model:
--   anon (public website):  read-only access to the active catalogue
--                           (vehicle categories, routes, fares, published
--                           packages, public business settings). NOTHING else.
--   authenticated staff:    read operational data; update bookings/enquiries;
--                           create assignments and audit events.
--   authenticated admin:    staff rights + manage catalogue, fleet, drivers,
--                           settings.
--   service_role (server):  bypasses RLS. Used only in server code for
--                           booking creation and gateway-verified payment
--                           updates. Still bound by the triggers.
--
-- Customers have no accounts, so they never query tables directly. Booking
-- status lookup goes through a rate-limited server endpoint that requires
-- both the booking reference and the phone number.
--
-- `(select fn())` lets Postgres evaluate the role check once per statement.

alter table public.profiles            enable row level security;
alter table public.customers           enable row level security;
alter table public.vehicle_categories  enable row level security;
alter table public.vehicles            enable row level security;
alter table public.drivers             enable row level security;
alter table public.routes              enable row level security;
alter table public.route_fares         enable row level security;
alter table public.tour_packages       enable row level security;
alter table public.bookings            enable row level security;
alter table public.enquiries           enable row level security;
alter table public.payment_orders      enable row level security;
alter table public.payments            enable row level security;
alter table public.refunds             enable row level security;
alter table public.webhook_events      enable row level security;
alter table public.booking_assignments enable row level security;
alter table public.booking_events      enable row level security;
alter table public.business_settings   enable row level security;

-- ------------------------------------------------------------- profiles
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
-- No insert/update/delete policies: profiles are provisioned via SQL by the
-- project owner, so a staff member cannot promote themselves.

-- ------------------------------------------------------------ customers
create policy customers_staff_select on public.customers
  for select to authenticated using ((select public.is_staff()));
create policy customers_staff_update on public.customers
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- -------------------------------------------------- public catalogue
create policy vehicle_categories_public_select on public.vehicle_categories
  for select to anon, authenticated
  using (is_active or (select public.is_staff()));
create policy vehicle_categories_admin_insert on public.vehicle_categories
  for insert to authenticated with check ((select public.is_admin()));
create policy vehicle_categories_admin_update on public.vehicle_categories
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy routes_public_select on public.routes
  for select to anon, authenticated
  using (is_active or (select public.is_staff()));
create policy routes_admin_insert on public.routes
  for insert to authenticated with check ((select public.is_admin()));
create policy routes_admin_update on public.routes
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy route_fares_public_select on public.route_fares
  for select to anon, authenticated
  using (
    (
      is_active
      and exists (select 1 from public.routes r where r.id = route_id and r.is_active)
      and exists (select 1 from public.vehicle_categories c where c.id = vehicle_category_id and c.is_active)
    )
    or (select public.is_staff())
  );
create policy route_fares_admin_insert on public.route_fares
  for insert to authenticated with check ((select public.is_admin()));
create policy route_fares_admin_update on public.route_fares
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy tour_packages_public_select on public.tour_packages
  for select to anon, authenticated
  using (is_published or (select public.is_staff()));
create policy tour_packages_admin_insert on public.tour_packages
  for insert to authenticated with check ((select public.is_admin()));
create policy tour_packages_admin_update on public.tour_packages
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- --------------------------------------------------- fleet & drivers
create policy vehicles_staff_select on public.vehicles
  for select to authenticated using ((select public.is_staff()));
create policy vehicles_admin_insert on public.vehicles
  for insert to authenticated with check ((select public.is_admin()));
create policy vehicles_admin_update on public.vehicles
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy drivers_staff_select on public.drivers
  for select to authenticated using ((select public.is_staff()));
create policy drivers_admin_insert on public.drivers
  for insert to authenticated with check ((select public.is_admin()));
create policy drivers_admin_update on public.drivers
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ------------------------------------------------ bookings & enquiries
-- Bookings are created only by the server (service_role) after validation
-- and server-side fare calculation, so there is no insert policy.
create policy bookings_staff_select on public.bookings
  for select to authenticated using ((select public.is_staff()));
create policy bookings_staff_update on public.bookings
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy enquiries_staff_select on public.enquiries
  for select to authenticated using ((select public.is_staff()));
create policy enquiries_staff_update on public.enquiries
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- ------------------------------------------------------------ payments
-- Read-only for staff. All writes come from gateway-verified server code.
create policy payment_orders_staff_select on public.payment_orders
  for select to authenticated using ((select public.is_staff()));
create policy payments_staff_select on public.payments
  for select to authenticated using ((select public.is_staff()));
create policy refunds_staff_select on public.refunds
  for select to authenticated using ((select public.is_staff()));
create policy webhook_events_admin_select on public.webhook_events
  for select to authenticated using ((select public.is_admin()));

-- ------------------------------------------- assignments & audit events
create policy booking_assignments_staff_select on public.booking_assignments
  for select to authenticated using ((select public.is_staff()));
create policy booking_assignments_staff_insert on public.booking_assignments
  for insert to authenticated
  with check ((select public.is_staff()) and assigned_by = (select auth.uid()));
create policy booking_assignments_staff_update on public.booking_assignments
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy booking_events_staff_select on public.booking_events
  for select to authenticated using ((select public.is_staff()));
create policy booking_events_staff_insert on public.booking_events
  for insert to authenticated
  with check (
    (select public.is_staff())
    and actor_type = 'admin'
    and performed_by = (select auth.uid())
  );

-- --------------------------------------------------- business settings
create policy business_settings_public_select on public.business_settings
  for select to anon, authenticated using (true);
create policy business_settings_admin_update on public.business_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Column-level restriction: the public may read contact details and booking
-- rules, but not the internal alert email or audit fields.
revoke select on public.business_settings from anon;
grant select (
  id, business_name, tagline, phone, whatsapp_number, public_email, address,
  service_area, timezone, currency, payment_window_minutes,
  min_booking_lead_minutes, max_booking_advance_days, night_charge_start,
  night_charge_end, terms_version, cancellation_policy_summary
) on public.business_settings to anon;

-- Anonymous users never write anything directly.
revoke insert, update, delete, truncate on all tables in schema public from anon;
-- TRUNCATE bypasses both RLS and row-level delete triggers; no client role
-- may use it.
revoke truncate on all tables in schema public from authenticated;
