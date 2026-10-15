-- Append-only audit log for bookings. Status changes are logged
-- automatically by trigger (so nothing can change a status silently);
-- server code adds richer events (payment verified, driver assigned,
-- notification sent, etc.).

create table public.booking_events (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references public.bookings (id) on delete restrict,
  event_type    text not null check (event_type ~ '^[a-z][a-z_.]{2,59}$'),
  old_status    text,
  new_status    text,
  actor_type    text not null check (actor_type in ('system', 'admin', 'customer', 'gateway')),
  performed_by  uuid references public.profiles (id) on delete set null,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at    timestamptz not null default now()
);

create index booking_events_booking_idx on public.booking_events (booking_id, created_at);
create index booking_events_type_idx on public.booking_events (event_type, created_at desc);

create or replace function public.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'booking_events is append-only'
    using errcode = 'restrict_violation';
end;
$$;

create trigger booking_events_no_update
  before update on public.booking_events
  for each row execute function public.prevent_audit_mutation();
create trigger booking_events_no_delete
  before delete on public.booking_events
  for each row execute function public.prevent_audit_mutation();
