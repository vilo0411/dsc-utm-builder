-- DSC UTM Builder: shared storage on Supabase.
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run (idempotent).
-- No login: the anon key may read and write. Every change is copied to audit_log so it can be restored.

-- ===== Catalog: one row per collection (accounts, landings, slots, ...) =====
create table if not exists public.catalog (
  key        text primary key,
  rows       jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- ===== Link library: every link created or copied in the tool =====
create table if not exists public.links (
  id         uuid primary key default gen_random_uuid(),
  url        text not null unique,
  short_url  text,
  label      text,
  kind       text not null default 'post' check (kind in ('post', 'fixed')),
  status     text not null default 'active' check (status in ('active', 'replace', 'retired')),
  source     text,
  medium     text,
  campaign   text,
  content    text,
  product    text,
  account_m  text,
  position   text,
  landing_id text,
  title      text,
  fields     jsonb,            -- builder form state, used to reopen the link in "Tạo link"
  placed_at  text,             -- where the link was posted (post URL, "Bio TikTok"...)
  note       text,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists links_created_at_idx on public.links (created_at desc);

-- ===== Quick templates: saved combinations of builder choices =====
create table if not exists public.templates (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  fields     jsonb not null,
  use_count  integer not null default 0,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ===== Audit log: before/after of every insert, update, delete =====
create table if not exists public.audit_log (
  id      bigserial primary key,
  tbl     text not null,
  row_key text,
  before  jsonb,
  after   jsonb,
  by      text,
  at      timestamptz not null default now()
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);

-- Keep updated_at fresh on every update
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists catalog_touch on public.catalog;
create trigger catalog_touch before update on public.catalog for each row execute function public.touch_updated_at();
drop trigger if exists links_touch on public.links;
create trigger links_touch before update on public.links for each row execute function public.touch_updated_at();
drop trigger if exists templates_touch on public.templates;
create trigger templates_touch before update on public.templates for each row execute function public.touch_updated_at();

-- Copy every change into audit_log. Runs as owner so anon cannot write audit_log directly.
create or replace function public.audit_row() returns trigger language plpgsql security definer set search_path = public as $$
declare
  k text;
  who text;
begin
  if tg_table_name = 'catalog' then
    k := coalesce(new.key, old.key);
  else
    k := coalesce(new.id, old.id)::text;
  end if;
  if tg_op = 'DELETE' then
    who := null;
  else
    who := to_jsonb(new) ->> 'updated_by';
    if who is null then who := to_jsonb(new) ->> 'created_by'; end if;
  end if;
  insert into public.audit_log (tbl, row_key, before, after, by)
  values (
    tg_table_name, k,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end,
    who
  );
  return coalesce(new, old);
end $$;

drop trigger if exists catalog_audit on public.catalog;
create trigger catalog_audit after insert or update or delete on public.catalog for each row execute function public.audit_row();
drop trigger if exists links_audit on public.links;
create trigger links_audit after insert or update or delete on public.links for each row execute function public.audit_row();
drop trigger if exists templates_audit on public.templates;
create trigger templates_audit after insert or update or delete on public.templates for each row execute function public.audit_row();

-- Save a link without overwriting who created it or its status. Copying the same URL again
-- only fills empty fields, refreshes the short link and brings a soft-deleted link back.
create or replace function public.save_link(rec jsonb) returns public.links language plpgsql as $$
declare
  r public.links;
begin
  insert into public.links (url, short_url, label, kind, source, medium, campaign, content, product,
    account_m, position, landing_id, title, fields, created_by, updated_by)
  values (
    rec ->> 'url', rec ->> 'short_url', rec ->> 'label', coalesce(rec ->> 'kind', 'post'),
    rec ->> 'source', rec ->> 'medium', rec ->> 'campaign', rec ->> 'content', rec ->> 'product',
    rec ->> 'account_m', rec ->> 'position', rec ->> 'landing_id', rec ->> 'title', rec -> 'fields',
    rec ->> 'by', rec ->> 'by')
  on conflict (url) do update set
    short_url  = coalesce(excluded.short_url, links.short_url),
    label      = coalesce(links.label, excluded.label),
    source     = coalesce(links.source, excluded.source),
    medium     = coalesce(links.medium, excluded.medium),
    campaign   = coalesce(links.campaign, excluded.campaign),
    content    = coalesce(links.content, excluded.content),
    product    = coalesce(links.product, excluded.product),
    account_m  = coalesce(links.account_m, excluded.account_m),
    position   = coalesce(links.position, excluded.position),
    landing_id = coalesce(links.landing_id, excluded.landing_id),
    title      = coalesce(links.title, excluded.title),
    fields     = coalesce(links.fields, excluded.fields),
    kind       = case when excluded.kind = 'fixed' then 'fixed' else links.kind end,
    deleted_at = null,
    updated_by = coalesce(excluded.updated_by, links.updated_by)
  returning * into r;
  return r;
end $$;

-- ===== Row level security: open to anon (no login), no hard delete =====
alter table public.catalog   enable row level security;
alter table public.links     enable row level security;
alter table public.templates enable row level security;
alter table public.audit_log enable row level security;

do $$
declare t text;
begin
  foreach t in array array['catalog', 'links', 'templates'] loop
    execute format('drop policy if exists anon_select on public.%I', t);
    execute format('drop policy if exists anon_insert on public.%I', t);
    execute format('drop policy if exists anon_update on public.%I', t);
    execute format('create policy anon_select on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy anon_insert on public.%I for insert to anon, authenticated with check (true)', t);
    execute format('create policy anon_update on public.%I for update to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

drop policy if exists anon_select on public.audit_log;
create policy anon_select on public.audit_log for select to anon, authenticated using (true);

grant select, insert, update on public.catalog, public.links, public.templates to anon, authenticated;
grant select on public.audit_log to anon, authenticated;
grant execute on function public.save_link(jsonb) to anon, authenticated;

-- =====================================================================================
-- Hardening (no login): the anon key is public on GitHub Pages, so the database itself
-- refuses anything that could hurt the team: links to non-DSC sites, foreign short links,
-- oversized payloads, unknown catalog keys, and edits to columns the tool never changes.
-- =====================================================================================

-- A DSC page: http(s) on dsc.com.vn or any subdomain, max 2000 chars
create or replace function public.dsc_url_ok(u text) returns boolean language sql immutable as $$
  select u is not null and length(u) <= 2000
    and u ~* '^https?://([a-z0-9-]+\.)*dsc\.com\.vn(:[0-9]+)?([/?#]|$)'
$$;
-- Short links only from the shorteners the tool uses
create or replace function public.short_url_ok(u text) returns boolean language sql immutable as $$
  select u is null or u ~ '^https://(is|v)\.gd/[A-Za-z0-9_-]{1,40}$'
$$;
-- Catalog rows: known collection, JSON array, bounded size; landing URLs and hosts must be DSC
create or replace function public.catalog_ok(k text, r jsonb) returns boolean language sql immutable as $$
  select k in ('accounts', 'positions', 'landings', 'products', 'prefixes', 'routes', 'slots', 'campaigns',
               'hosts', 'groups', 'formats', 'hubs', 'conversions', 'steps')
    and jsonb_typeof(r) = 'array'
    and pg_column_size(r) < 300000
    and (k <> 'landings' or not exists (
      select 1 from jsonb_array_elements(r) e where not public.dsc_url_ok(e ->> 'url')))
    and (k <> 'hosts' or not exists (
      select 1 from jsonb_array_elements(r) e where not coalesce(lower(e ->> 'host') ~ '^([a-z0-9-]+\.)*dsc\.com\.vn$', false)))
$$;

alter table public.catalog drop constraint if exists catalog_valid;
alter table public.catalog add constraint catalog_valid check (public.catalog_ok(key, rows) and length(coalesce(updated_by, '')) <= 80);

alter table public.links drop constraint if exists links_valid;
alter table public.links add constraint links_valid check (
  public.dsc_url_ok(url) and public.short_url_ok(short_url)
  and length(coalesce(label, '')) <= 300 and length(coalesce(title, '')) <= 300
  and length(coalesce(note, '')) <= 1000 and length(coalesce(placed_at, '')) <= 1000
  and length(coalesce(created_by, '')) <= 80 and length(coalesce(updated_by, '')) <= 80
  and length(concat(source, medium, campaign, content, product, account_m, position, landing_id)) <= 1000
  and (fields is null or pg_column_size(fields) < 8000));

alter table public.templates drop constraint if exists templates_valid;
alter table public.templates add constraint templates_valid check (
  length(name) between 1 and 120
  and pg_column_size(fields) < 8000
  and (coalesce(fields ->> 'landing_url', '') = '' or public.dsc_url_ok(fields ->> 'landing_url')));

-- save_link runs as owner, so anon needs no INSERT on links at all
alter function public.save_link(jsonb) security definer set search_path = public;

-- Column-level privileges: anon may only touch what the tool edits.
-- Supabase grants ALL on new public tables by default, so start from nothing and add back.
revoke all on public.catalog, public.links, public.templates, public.audit_log from anon, authenticated;
revoke all on sequence public.audit_log_id_seq from anon, authenticated;
grant select on public.catalog, public.links, public.templates, public.audit_log to anon, authenticated;
grant insert (key, rows, updated_by), update (key, rows, updated_by) on public.catalog to anon, authenticated;
grant update (status, placed_at, note, deleted_at, updated_by) on public.links to anon, authenticated;
grant insert (name, fields, created_by, updated_by), update (name, use_count, deleted_at, updated_by) on public.templates to anon, authenticated;
