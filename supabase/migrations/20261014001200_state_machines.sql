-- Database-enforced state machines and immutability rules.
-- These triggers apply to every role, including service_role, so a bug or a
-- leaked key in application code still cannot:
--   * confirm a booking that has not been paid,
--   * move a failed payment to captured,
--   * rewrite a booking's price after it was created,
--   * change any status without an audit event.
--
-- The transition table below is mirrored in src/lib/booking/states.ts and a
-- test asserts the two are identical.

create or replace function public.is_valid_transition(p_machine text, p_from text, p_to text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_from = p_to
    or (p_machine, p_from, p_to) in (
      values
        -- booking_status
        ('booking', 'pending_payment', 'confirmed'),
        ('booking', 'pending_payment', 'cancelled'),
        ('booking', 'confirmed',       'assigned'),
        ('booking', 'confirmed',       'cancelled'),
        ('booking', 'assigned',        'confirmed'),   -- driver unassigned
        ('booking', 'assigned',        'in_progress'),
        ('booking', 'assigned',        'cancelled'),
        ('booking', 'in_progress',     'completed'),
        ('booking', 'cancelled',       'confirmed'),   -- reinstate after late payment (guarded below)

        -- bookings.payment_status (summary)
        ('booking_payment', 'unpaid',             'paid'),
        ('booking_payment', 'paid',               'refund_pending'),
        ('booking_payment', 'paid',               'partially_refunded'),
        ('booking_payment', 'paid',               'refunded'),
        ('booking_payment', 'refund_pending',     'paid'),          -- refund failed
        ('booking_payment', 'refund_pending',     'partially_refunded'),
        ('booking_payment', 'refund_pending',     'refunded'),
        ('booking_payment', 'partially_refunded', 'refund_pending'),
        ('booking_payment', 'partially_refunded', 'refunded'),

        -- payments.status (one gateway payment attempt)
        ('payment', 'authorized',         'captured'),
        ('payment', 'authorized',         'failed'),
        ('payment', 'authorized',         'refunded'),             -- uncaptured auth auto-refunded by gateway
        ('payment', 'captured',           'refund_pending'),
        ('payment', 'captured',           'partially_refunded'),
        ('payment', 'captured',           'refunded'),
        ('payment', 'refund_pending',     'captured'),             -- refund failed
        ('payment', 'refund_pending',     'partially_refunded'),
        ('payment', 'refund_pending',     'refunded'),
        ('payment', 'partially_refunded', 'refund_pending'),
        ('payment', 'partially_refunded', 'refunded'),

        -- payment_orders.status
        ('payment_order', 'created', 'paid'),
        ('payment_order', 'created', 'expired'),
        ('payment_order', 'expired', 'paid'),                       -- late payment; booking gets flagged

        -- refunds.status
        ('refund', 'pending', 'processed'),
        ('refund', 'pending', 'failed')
    );
$$;

-- Raises a uniform error when a column that must never change is changed.
create or replace function public.assert_unchanged(p_table text, p_column text, p_changed boolean)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_changed then
    raise exception '%.% is immutable', p_table, p_column using errcode = 'check_violation';
  end if;
end;
$$;

-- ---------------------------------------------------------------- bookings
create or replace function public.bookings_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.assert_unchanged('bookings', 'booking_reference', new.booking_reference is distinct from old.booking_reference);
  perform public.assert_unchanged('bookings', 'customer_id', new.customer_id is distinct from old.customer_id);
  perform public.assert_unchanged('bookings', 'booking_kind', new.booking_kind is distinct from old.booking_kind);
  perform public.assert_unchanged('bookings', 'fare_snapshot', new.fare_snapshot is distinct from old.fare_snapshot);
  perform public.assert_unchanged('bookings', 'total_amount_paise', new.total_amount_paise is distinct from old.total_amount_paise);
  perform public.assert_unchanged('bookings', 'currency', new.currency is distinct from old.currency);
  perform public.assert_unchanged('bookings', 'terms_version', new.terms_version is distinct from old.terms_version);
  perform public.assert_unchanged('bookings', 'terms_accepted_at', new.terms_accepted_at is distinct from old.terms_accepted_at);
  perform public.assert_unchanged('bookings', 'created_at', new.created_at is distinct from old.created_at);

  if not public.is_valid_transition('booking', old.booking_status, new.booking_status) then
    raise exception 'Invalid booking status transition: % -> %', old.booking_status, new.booking_status
      using errcode = 'check_violation';
  end if;

  if not public.is_valid_transition('booking_payment', old.payment_status, new.payment_status) then
    raise exception 'Invalid booking payment status transition: % -> %', old.payment_status, new.payment_status
      using errcode = 'check_violation';
  end if;

  -- A booking can only become confirmed once it has been paid.
  if new.booking_status = 'confirmed' and old.booking_status in ('pending_payment', 'cancelled')
     and new.payment_status <> 'paid' then
    raise exception 'Booking cannot be confirmed before payment is captured'
      using errcode = 'check_violation';
  end if;

  -- Reinstating a cancelled booking is only for bookings that expired before
  -- a late payment arrived; it must be an explicit reconciliation action.
  if old.booking_status = 'cancelled' and new.booking_status = 'confirmed' then
    if old.cancellation_reason is distinct from 'payment_expired' then
      raise exception 'Only bookings cancelled for payment expiry can be reinstated'
        using errcode = 'check_violation';
    end if;
    new.cancelled_at := null;
    new.cancellation_reason := null;
  end if;

  -- Flagged bookings are never assigned until an admin resolves them.
  if new.booking_status = 'assigned' and old.booking_status <> 'assigned' and new.needs_reconciliation then
    raise exception 'Booking needs reconciliation and cannot be assigned'
      using errcode = 'check_violation';
  end if;

  if new.booking_status = 'cancelled' and old.booking_status <> 'cancelled' and new.cancelled_at is null then
    new.cancelled_at := now();
  end if;

  return new;
end;
$$;

create trigger bookings_guard_update
  before update on public.bookings
  for each row execute function public.bookings_guard_update();

-- New bookings always start unpaid and awaiting payment.
create or replace function public.bookings_guard_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.booking_status <> 'pending_payment' or new.payment_status <> 'unpaid' then
    raise exception 'New bookings must start as pending_payment / unpaid'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger bookings_guard_insert
  before insert on public.bookings
  for each row execute function public.bookings_guard_insert();

-- Automatic audit trail for creation and every status change.
create or replace function public.bookings_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select p.id from public.profiles p where p.id = auth.uid());
  v_actor_type text := case when v_actor_id is null then 'system' else 'admin' end;
begin
  if tg_op = 'INSERT' then
    insert into public.booking_events (booking_id, event_type, new_status, actor_type, performed_by)
    values (new.id, 'booking.created', new.booking_status, v_actor_type, v_actor_id);
    return new;
  end if;

  if new.booking_status is distinct from old.booking_status then
    insert into public.booking_events (booking_id, event_type, old_status, new_status, actor_type, performed_by, metadata)
    values (new.id, 'booking.status_changed', old.booking_status, new.booking_status, v_actor_type, v_actor_id,
            jsonb_strip_nulls(jsonb_build_object('cancellation_reason', new.cancellation_reason)));
  end if;

  if new.payment_status is distinct from old.payment_status then
    insert into public.booking_events (booking_id, event_type, old_status, new_status, actor_type, performed_by)
    values (new.id, 'booking.payment_status_changed', old.payment_status, new.payment_status, v_actor_type, v_actor_id);
  end if;

  if new.needs_reconciliation is distinct from old.needs_reconciliation then
    insert into public.booking_events (booking_id, event_type, actor_type, performed_by, metadata)
    values (new.id,
            case when new.needs_reconciliation then 'reconciliation.flagged' else 'reconciliation.resolved' end,
            v_actor_type, v_actor_id,
            jsonb_strip_nulls(jsonb_build_object('note', new.reconciliation_note)));
  end if;

  return new;
end;
$$;

revoke all on function public.bookings_audit() from public;

create trigger bookings_audit
  after insert or update on public.bookings
  for each row execute function public.bookings_audit();

-- ---------------------------------------------------------- payment_orders
create or replace function public.payment_orders_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.assert_unchanged('payment_orders', 'booking_id', new.booking_id is distinct from old.booking_id);
  perform public.assert_unchanged('payment_orders', 'gateway_order_id', new.gateway_order_id is distinct from old.gateway_order_id);
  perform public.assert_unchanged('payment_orders', 'amount_paise', new.amount_paise is distinct from old.amount_paise);
  perform public.assert_unchanged('payment_orders', 'currency', new.currency is distinct from old.currency);

  if not public.is_valid_transition('payment_order', old.status, new.status) then
    raise exception 'Invalid payment order status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger payment_orders_guard_update
  before update on public.payment_orders
  for each row execute function public.payment_orders_guard_update();

-- ---------------------------------------------------------------- payments
create or replace function public.payments_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.assert_unchanged('payments', 'payment_order_id', new.payment_order_id is distinct from old.payment_order_id);
  perform public.assert_unchanged('payments', 'booking_id', new.booking_id is distinct from old.booking_id);
  perform public.assert_unchanged('payments', 'gateway_payment_id', new.gateway_payment_id is distinct from old.gateway_payment_id);
  perform public.assert_unchanged('payments', 'amount_paise', new.amount_paise is distinct from old.amount_paise);
  perform public.assert_unchanged('payments', 'currency', new.currency is distinct from old.currency);

  if not public.is_valid_transition('payment', old.status, new.status) then
    raise exception 'Invalid payment status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  if new.amount_refunded_paise < old.amount_refunded_paise then
    raise exception 'payments.amount_refunded_paise cannot decrease'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger payments_guard_update
  before update on public.payments
  for each row execute function public.payments_guard_update();

-- ----------------------------------------------------------------- refunds
create or replace function public.refunds_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform public.assert_unchanged('refunds', 'payment_id', new.payment_id is distinct from old.payment_id);
  perform public.assert_unchanged('refunds', 'booking_id', new.booking_id is distinct from old.booking_id);
  perform public.assert_unchanged('refunds', 'gateway_refund_id', new.gateway_refund_id is distinct from old.gateway_refund_id);
  perform public.assert_unchanged('refunds', 'amount_paise', new.amount_paise is distinct from old.amount_paise);

  if not public.is_valid_transition('refund', old.status, new.status) then
    raise exception 'Invalid refund status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger refunds_guard_update
  before update on public.refunds
  for each row execute function public.refunds_guard_update();
