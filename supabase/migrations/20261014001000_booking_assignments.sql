-- Manual driver + vehicle assignment by an admin. History is preserved:
-- re-assigning marks the previous row 'replaced' rather than overwriting it.

create table public.booking_assignments (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references public.bookings (id) on delete restrict,
  driver_id    uuid not null references public.drivers (id) on delete restrict,
  vehicle_id   uuid not null references public.vehicles (id) on delete restrict,
  assigned_by  uuid references public.profiles (id) on delete set null,
  status       text not null default 'active' check (status in ('active', 'replaced', 'cancelled')),
  notes        text check (char_length(notes) <= 1000),
  assigned_at  timestamptz not null default now(),
  ended_at     timestamptz,
  constraint booking_assignments_ended_when_inactive check ((status = 'active') = (ended_at is null))
);

-- Only one active assignment per booking.
create unique index booking_assignments_one_active
  on public.booking_assignments (booking_id) where status = 'active';
create index booking_assignments_booking_idx on public.booking_assignments (booking_id, assigned_at desc);
create index booking_assignments_driver_idx on public.booking_assignments (driver_id, assigned_at desc);
create index booking_assignments_vehicle_idx on public.booking_assignments (vehicle_id);
