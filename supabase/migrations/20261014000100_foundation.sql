-- Foundation: shared helpers used by every later migration.
-- gen_random_uuid() is built into PostgreSQL 13+, so no extension is required.

-- Keeps updated_at current on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Generic guard for tables whose rows must never be deleted
-- (payments, refunds, audit events). Applies to service_role too,
-- because triggers are not bypassed by RLS-exempt roles.
create or replace function public.prevent_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Rows in %.% cannot be deleted', tg_table_schema, tg_table_name
    using errcode = 'restrict_violation';
end;
$$;

-- Schema for internal tables that must never be exposed through the
-- Supabase Data API (PostgREST only exposes schemas listed in its config).
create schema if not exists private;
revoke all on schema private from public;
