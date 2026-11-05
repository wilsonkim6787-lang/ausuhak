-- Paid medical mock sets (ISAT / UCAT ANZ), one row per order. Written only by server code (service role).
create table if not exists public.mock_orders (
  order_id    text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  exam        text not null check (exam in ('isat', 'ucat')),
  mock_id     text not null,
  amount      integer not null check (amount > 0),
  status      text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled')),
  payment_key text,
  method      text,
  fail_reason text,
  created_at  timestamptz not null default now(),
  paid_at     timestamptz
);

create index if not exists mock_orders_user_idx on public.mock_orders (user_id, status);

alter table public.mock_orders enable row level security;

-- Buyers see their own orders; admins see all. No insert/update policies: only the service role writes.
drop policy if exists mock_orders_read on public.mock_orders;
create policy mock_orders_read on public.mock_orders for select
  using (user_id = auth.uid() or exists (select 1 from public.crm_profiles p where p.id = auth.uid() and p.role = 'admin'));
