-- Payments model mirrors Razorpay's own model:
--   payment_orders: one Razorpay Order (amount fixed server-side). A customer
--                   may make several payment attempts against one order.
--   payments:       one row per Razorpay payment (attempt), keyed by the
--                   gateway payment id. A failed attempt stays failed; a later
--                   successful attempt is a different row.
--   refunds:        one row per Razorpay refund (supports partial refunds).
--   webhook_events: every verified webhook delivery, unique per event id, so
--                   duplicate deliveries are detected and ignored.
--
-- Only minimal gateway data is stored. Card numbers / CVV never reach this
-- server (Razorpay hosted checkout collects them).

create table public.payment_orders (
  id                uuid primary key default gen_random_uuid(),
  booking_id        uuid not null references public.bookings (id) on delete restrict,
  gateway           text not null default 'razorpay' check (gateway = 'razorpay'),
  gateway_order_id  text not null unique check (char_length(gateway_order_id) between 1 and 64),
  amount_paise      bigint not null check (amount_paise > 0),
  currency          text not null default 'INR' check (currency = 'INR'),
  receipt           text not null check (char_length(receipt) <= 40),
  status            text not null default 'created' check (status in ('created', 'paid', 'expired')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index payment_orders_booking_idx on public.payment_orders (booking_id);
-- At most one open order per booking: re-opening checkout re-uses it,
-- which prevents parallel orders (and so duplicate charges).
create unique index payment_orders_one_open_per_booking
  on public.payment_orders (booking_id) where status = 'created';

create trigger payment_orders_set_updated_at
  before update on public.payment_orders
  for each row execute function public.set_updated_at();

create table public.payments (
  id                     uuid primary key default gen_random_uuid(),
  payment_order_id       uuid not null references public.payment_orders (id) on delete restrict,
  booking_id             uuid not null references public.bookings (id) on delete restrict,
  gateway_payment_id     text not null unique check (char_length(gateway_payment_id) between 1 and 64),
  amount_paise           bigint not null check (amount_paise > 0),
  amount_refunded_paise  bigint not null default 0,
  currency               text not null default 'INR' check (currency = 'INR'),
  status                 text not null check (
                           status in ('authorized', 'captured', 'failed', 'refund_pending', 'partially_refunded', 'refunded')
                         ),
  method                 text check (char_length(method) <= 30),
  signature_verified     boolean not null default false,
  error_code             text check (char_length(error_code) <= 100),
  error_description      text check (char_length(error_description) <= 500),
  gateway_response       jsonb not null default '{}'::jsonb check (jsonb_typeof(gateway_response) = 'object'),
  authorized_at          timestamptz,
  captured_at            timestamptz,
  failed_at              timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint payments_refund_within_amount
    check (amount_refunded_paise between 0 and amount_paise)
);

create index payments_booking_idx on public.payments (booking_id);
create index payments_order_idx on public.payments (payment_order_id);
create index payments_status_idx on public.payments (status);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create table public.refunds (
  id                 uuid primary key default gen_random_uuid(),
  payment_id         uuid not null references public.payments (id) on delete restrict,
  booking_id         uuid not null references public.bookings (id) on delete restrict,
  gateway_refund_id  text not null unique check (char_length(gateway_refund_id) between 1 and 64),
  amount_paise       bigint not null check (amount_paise > 0),
  status             text not null default 'pending' check (status in ('pending', 'processed', 'failed')),
  reason             text check (char_length(reason) <= 500),
  initiated_by       uuid references public.profiles (id) on delete set null,
  processed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index refunds_payment_idx on public.refunds (payment_id);
create index refunds_booking_idx on public.refunds (booking_id);

create trigger refunds_set_updated_at
  before update on public.refunds
  for each row execute function public.set_updated_at();

create table public.webhook_events (
  id                  uuid primary key default gen_random_uuid(),
  gateway             text not null default 'razorpay' check (gateway = 'razorpay'),
  event_id            text not null check (char_length(event_id) between 1 and 100),
  event_type          text not null check (char_length(event_type) between 1 and 100),
  payload             jsonb not null,
  received_at         timestamptz not null default now(),
  processed_at        timestamptz,
  processing_error    text check (char_length(processing_error) <= 2000),
  delivery_count      integer not null default 1 check (delivery_count >= 1),
  constraint webhook_events_gateway_event_key unique (gateway, event_id)
);

create index webhook_events_unprocessed_idx on public.webhook_events (received_at)
  where processed_at is null;

-- Money records are never deleted, not even by service_role.
create trigger payment_orders_prevent_delete
  before delete on public.payment_orders
  for each row execute function public.prevent_delete();
create trigger payments_prevent_delete
  before delete on public.payments
  for each row execute function public.prevent_delete();
create trigger refunds_prevent_delete
  before delete on public.refunds
  for each row execute function public.prevent_delete();
