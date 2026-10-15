-- Single-row business settings editable from /admin/settings.
-- Secrets (Razorpay keys, SMTP password) are NEVER stored here; they live in
-- environment variables only.

create table public.business_settings (
  id                          smallint primary key default 1 check (id = 1),
  business_name               text not null default 'Pandav Tours & Travel'
                                check (char_length(business_name) between 2 and 100),
  tagline                     text check (char_length(tagline) <= 160),
  phone                       text check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  whatsapp_number             text check (whatsapp_number ~ '^\+[1-9][0-9]{7,14}$'),
  public_email                text check (char_length(public_email) <= 254),
  address                     text check (char_length(address) <= 500),
  service_area                text check (char_length(service_area) <= 500),
  -- Staff-only fields below are excluded from the anon column grant.
  admin_alert_email           text check (char_length(admin_alert_email) <= 254),
  timezone                    text not null default 'Asia/Kolkata',
  currency                    text not null default 'INR' check (currency = 'INR'),
  payment_window_minutes      integer not null default 30 check (payment_window_minutes between 10 and 1440),
  min_booking_lead_minutes    integer not null default 120 check (min_booking_lead_minutes between 0 and 10080),
  max_booking_advance_days    integer not null default 90 check (max_booking_advance_days between 1 and 365),
  night_charge_start          time not null default '22:00',
  night_charge_end            time not null default '06:00',
  terms_version               text not null default 'draft' check (char_length(terms_version) between 1 and 40),
  cancellation_policy_summary text check (char_length(cancellation_policy_summary) <= 2000),
  updated_at                  timestamptz not null default now(),
  updated_by                  uuid references public.profiles (id) on delete set null
);

insert into public.business_settings (id) values (1) on conflict (id) do nothing;

create trigger business_settings_set_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();

create trigger business_settings_prevent_delete
  before delete on public.business_settings
  for each row execute function public.prevent_delete();

-- Fixed-window rate limiting backed by Postgres, so no paid Redis is needed.
-- Keys are built by the server from a hashed client IP + endpoint name;
-- raw IP addresses are never stored.
create table private.rate_limits (
  key           text not null check (char_length(key) <= 200),
  window_start  timestamptz not null,
  hits          integer not null default 1,
  primary key (key, window_start)
);

create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_hits integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit parameters' using errcode = 'invalid_parameter_value';
  end if;

  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into private.rate_limits as r (key, window_start)
  values (p_key, v_window)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;

  -- Opportunistic cleanup of expired windows (~1% of calls).
  if random() < 0.01 then
    delete from private.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

-- Only the server (service_role) may call this.
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
