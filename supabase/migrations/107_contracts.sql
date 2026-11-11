-- Study-abroad service contracts (유학 수속 계약서) and the record of who agreed.
-- One row per contract version sent to a family. Safe to re-run.
--
-- Writes: the admin (RLS admin policy) creates and cancels contracts and records
-- consent received by KakaoTalk or email. A family member's own agreement is
-- written only by server code with the service role, after it has checked the
-- signer (see src/lib/crm/contract-actions.ts). Families can read their own
-- sent or agreed contracts and nothing else.

create table if not exists crm_contracts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references crm_students(id) on delete cascade,
  family_id uuid not null references crm_families(id) on delete cascade,
  kind text not null default 'study' check (kind in ('study')),
  version integer not null default 1,
  status text not null default 'sent' check (status in ('sent', 'agreed', 'cancelled')),
  signer_role text not null check (signer_role in ('student', 'parent')),
  total_amount integer not null default 0 check (total_amount >= 0),
  -- Everything the signer saw: parties, scope, fees, terms version, the clauses
  -- that differ from the standard terms and the statements they ticked.
  snapshot jsonb not null,
  sent_at timestamptz not null default now(),
  agreed_at timestamptz,
  agreed_by uuid references auth.users(id) on delete set null,
  agreed_name text,
  agreed_relation text,
  agreed_ip text,
  agreed_ua text,
  channel text check (channel in ('site', 'kakao', 'email')),
  evidence_path text,
  evidence_note text,
  created_at timestamptz not null default now()
);
create index if not exists crm_contracts_student on crm_contracts(student_id, created_at desc);
create index if not exists crm_contracts_family on crm_contracts(family_id, status);

alter table crm_contracts enable row level security;

drop policy if exists crm_contracts_admin_all on crm_contracts;
create policy crm_contracts_admin_all on crm_contracts for all
  using (crm_is_admin()) with check (crm_is_admin());

drop policy if exists crm_contracts_family_read on crm_contracts;
create policy crm_contracts_family_read on crm_contracts for select
  to authenticated
  using (family_id = crm_my_family() and status in ('sent', 'agreed'));

grant select, insert, update, delete on crm_contracts to authenticated;
grant all on crm_contracts to service_role;
