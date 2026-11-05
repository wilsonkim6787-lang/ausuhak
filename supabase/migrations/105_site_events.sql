-- Website conversion tracking: clicks on consult buttons, form starts and form submits.
create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('click', 'form_start', 'form_submit')),
  label text,
  href text,
  section text,
  page text
);
create index if not exists site_events_created_idx on public.site_events (created_at desc);
alter table public.site_events enable row level security;
drop policy if exists site_events_admin_read on public.site_events;
create policy site_events_admin_read on public.site_events for select using (public.crm_is_admin());
