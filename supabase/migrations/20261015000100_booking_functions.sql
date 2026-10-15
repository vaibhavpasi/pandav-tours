-- Phase 2: atomic booking / enquiry creation and status lookup.
--
-- These functions are called only by the server (service_role) AFTER input
-- validation and server-side fare calculation. They re-check the catalogue
-- inside the same transaction as defence in depth.

-- Contact details exactly as entered for this booking/enquiry. The shared
-- customers row is keyed by phone and is NOT overwritten by later anonymous
-- submissions, so nobody can change another customer's stored name/email by
-- typing their phone number.
alter table public.bookings
  add column contact_name  text not null check (char_length(contact_name) between 2 and 100),
  add column contact_email text check (char_length(contact_email) <= 254);

alter table public.enquiries
  add column contact_name  text not null check (char_length(contact_name) between 2 and 100),
  add column contact_email text check (char_length(contact_email) <= 254);

-- Customer upsert shared by bookings and enquiries. Existing details are
-- kept; only a missing email is filled in.
create or replace function public.upsert_customer(p_name text, p_phone text, p_email text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.customers as c (full_name, phone, email)
  values (p_name, p_phone, p_email)
  on conflict (phone) do update
    set email = coalesce(c.email, excluded.email),
        updated_at = now()
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.create_booking(
  p_booking_reference     text,
  p_contact_name          text,
  p_contact_phone         text,
  p_contact_email         text,
  p_booking_kind          text,
  p_trip_type             text,
  p_route_id              uuid,
  p_route_fare_id         uuid,
  p_vehicle_category_id   uuid,
  p_package_id            uuid,
  p_pickup_location       text,
  p_destination           text,
  p_pickup_at             timestamptz,
  p_return_at             timestamptz,
  p_passenger_count       integer,
  p_special_instructions  text,
  p_fare_snapshot         jsonb,
  p_total_amount_paise    bigint,
  p_terms_version         text,
  p_payment_window_minutes integer
)
returns table (booking_id uuid, payment_expires_at timestamptz)
language plpgsql
set search_path = ''
as $$
declare
  v_customer_id uuid;
  v_booking_id uuid;
  v_expires timestamptz;
  v_seats integer;
begin
  if p_booking_kind = 'cab' then
    -- Fare must be active, match the route and category, and both must be active.
    select c.seating_capacity into v_seats
    from public.route_fares f
    join public.routes r on r.id = f.route_id
    join public.vehicle_categories c on c.id = f.vehicle_category_id
    where f.id = p_route_fare_id
      and f.route_id = p_route_id
      and f.vehicle_category_id = p_vehicle_category_id
      and r.trip_type = p_trip_type
      and f.is_active and r.is_active and c.is_active;

    if v_seats is null then
      raise exception 'Fare is not available for this route and vehicle' using errcode = 'check_violation';
    end if;
    if p_passenger_count > v_seats then
      raise exception 'Too many passengers for this vehicle' using errcode = 'check_violation';
    end if;
  elsif p_booking_kind = 'package' then
    if not exists (
      select 1 from public.tour_packages p
      where p.id = p_package_id and p.is_published and p.price_paise is not null
    ) then
      raise exception 'Package is not available for online booking' using errcode = 'check_violation';
    end if;
  end if;

  if p_terms_version is distinct from (select s.terms_version from public.business_settings s where s.id = 1) then
    raise exception 'Terms have changed; please review and accept them again' using errcode = 'check_violation';
  end if;

  v_customer_id := public.upsert_customer(p_contact_name, p_contact_phone, p_contact_email);
  v_expires := now() + make_interval(mins => p_payment_window_minutes);

  insert into public.bookings (
    booking_reference, customer_id, contact_name, contact_email,
    booking_kind, trip_type, route_id, route_fare_id, vehicle_category_id, package_id,
    pickup_location, destination, pickup_at, return_at, passenger_count, special_instructions,
    fare_snapshot, total_amount_paise, terms_version, terms_accepted_at, payment_expires_at
  ) values (
    p_booking_reference, v_customer_id, p_contact_name, p_contact_email,
    p_booking_kind, p_trip_type, p_route_id, p_route_fare_id, p_vehicle_category_id, p_package_id,
    p_pickup_location, p_destination, p_pickup_at, p_return_at, p_passenger_count, p_special_instructions,
    p_fare_snapshot, p_total_amount_paise, p_terms_version, now(), v_expires
  )
  returning id into v_booking_id;

  return query select v_booking_id, v_expires;
end;
$$;

create or replace function public.create_enquiry(
  p_contact_name         text,
  p_contact_phone        text,
  p_contact_email        text,
  p_enquiry_type         text,
  p_route_id             uuid,
  p_vehicle_category_id  uuid,
  p_package_id           uuid,
  p_pickup_location      text,
  p_destination          text,
  p_travel_date          date,
  p_passenger_count      integer,
  p_message              text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_customer_id uuid;
  v_id uuid;
begin
  v_customer_id := public.upsert_customer(p_contact_name, p_contact_phone, p_contact_email);

  insert into public.enquiries (
    customer_id, contact_name, contact_email, enquiry_type, route_id, vehicle_category_id,
    package_id, pickup_location, destination, travel_date, passenger_count, message
  ) values (
    v_customer_id, p_contact_name, p_contact_email, p_enquiry_type, p_route_id, p_vehicle_category_id,
    p_package_id, p_pickup_location, p_destination, p_travel_date, p_passenger_count, p_message
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Customer self-service lookup: requires BOTH the reference and the phone
-- number on the booking, and returns only non-sensitive trip fields.
create or replace function public.lookup_booking_status(p_booking_reference text, p_phone text)
returns table (
  booking_reference  text,
  booking_status     text,
  payment_status     text,
  trip_type          text,
  route_name         text,
  package_title      text,
  vehicle_category   text,
  pickup_at          timestamptz,
  return_at          timestamptz,
  total_amount_paise bigint,
  payment_expires_at timestamptz
)
language sql
stable
set search_path = ''
as $$
  select b.booking_reference, b.booking_status, b.payment_status, b.trip_type,
         r.name, p.title, c.name, b.pickup_at, b.return_at, b.total_amount_paise,
         b.payment_expires_at
  from public.bookings b
  join public.customers cu on cu.id = b.customer_id
  left join public.routes r on r.id = b.route_id
  left join public.tour_packages p on p.id = b.package_id
  left join public.vehicle_categories c on c.id = b.vehicle_category_id
  where b.booking_reference = p_booking_reference
    and cu.phone = p_phone;
$$;

-- Server-only.
revoke all on function public.upsert_customer(text, text, text) from public, anon, authenticated;
revoke all on function public.create_booking(text, text, text, text, text, text, uuid, uuid, uuid, uuid, text, text, timestamptz, timestamptz, integer, text, jsonb, bigint, text, integer) from public, anon, authenticated;
revoke all on function public.create_enquiry(text, text, text, text, uuid, uuid, uuid, text, text, date, integer, text) from public, anon, authenticated;
revoke all on function public.lookup_booking_status(text, text) from public, anon, authenticated;
grant execute on function public.upsert_customer(text, text, text) to service_role;
grant execute on function public.create_booking(text, text, text, text, text, text, uuid, uuid, uuid, uuid, text, text, timestamptz, timestamptz, integer, text, jsonb, bigint, text, integer) to service_role;
grant execute on function public.create_enquiry(text, text, text, text, uuid, uuid, uuid, text, text, date, integer, text) to service_role;
grant execute on function public.lookup_booking_status(text, text) to service_role;
