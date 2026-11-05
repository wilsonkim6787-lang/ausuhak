-- AI interview practice: one row per AI call, used for the free allowance (3 graded answers per account).
create table if not exists public.crm_ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('grade', 'question')),
  created_at timestamptz not null default now()
);
create index if not exists crm_ai_usage_user_idx on public.crm_ai_usage (user_id, kind, created_at);

alter table public.crm_ai_usage enable row level security;

-- Users can see their own usage; admins see all. Writes happen only through the service role.
drop policy if exists crm_ai_usage_select on public.crm_ai_usage;
create policy crm_ai_usage_select on public.crm_ai_usage
  for select using (user_id = auth.uid() or public.crm_is_admin());
