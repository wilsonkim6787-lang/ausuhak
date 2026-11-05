-- AusUhak new site: student management (intranet + MyPage).
-- Tables use the crm_ prefix so they live alongside the old site's tables until
-- the domain switch. Keeps: offers, blogs, consult_requests (read by the new site).
-- Safe to re-run.


-- Family link code: 8 characters (no 0/O/1/I), shown as XXXX-XXXX. Long enough
-- that it cannot be guessed.
create or replace function crm_new_code() returns text language sql volatile as $$
  select string_agg(substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, 8);
$$;

-- Families: a student and their parents share one family.
create table if not exists crm_families (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  invite_code text not null unique default crm_new_code(),
  created_at timestamptz not null default now()
);

-- Login accounts (Supabase auth users) and their role.
create table if not exists crm_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('admin', 'student', 'parent')),
  family_id uuid references crm_families(id) on delete set null,
  name text not null default '',
  phone text,
  relation text, -- 학생 / 어머니 / 아버지 / 보호자
  created_at timestamptz not null default now()
);
create index if not exists crm_profiles_family on crm_profiles(family_id);

create table if not exists crm_students (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references crm_families(id) on delete cascade,
  profile_id uuid references crm_profiles(id) on delete set null,
  name_ko text not null,
  name_en text,
  birth_date date,
  phone text,
  email text,
  kakao_id text,
  education text,           -- 검정고시 / 고3·고졸 / 대학 재학 / 대졸 / 직장인 / 초중고
  status text not null default 'active' check (status in ('lead', 'active', 'done', 'hold', 'cancelled')),
  -- Under-18 welfare (student visa)
  welfare_type text check (welfare_type in ('caaw', 'parent_590', 'relative', null)),
  form_1229_received boolean not null default false,
  under14_consent_received boolean not null default false,
  consult_request_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_students_family on crm_students(family_id);

-- A case is one service for one student: 진학 / 어학연수 / 비자 / 기타.
create table if not exists crm_cases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references crm_students(id) on delete cascade,
  service text not null check (service in ('study', 'language', 'visa', 'other')),
  title text not null,
  status text not null default 'active' check (status in ('active', 'done', 'hold', 'cancelled')),
  -- visa cases
  visa_subclass text,                 -- 500 / 600 / 485 / 590 ...
  linked_case_id uuid references crm_cases(id) on delete set null, -- visa -> study case whose CoEs it covers
  trn text,
  lodged_at date,
  granted_at date,
  expected_expiry date,
  form_956a boolean not null default false,
  oshc_until date,
  intake text,                        -- e.g. 2027-02
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_cases_student on crm_cases(student_id);

-- Enrolments inside a study/language case (packaged courses = several rows).
create table if not exists crm_enrolments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references crm_cases(id) on delete cascade,
  seq int not null default 1,
  provider text not null,
  course text not null,
  cricos_code text,
  start_date date,
  end_date date,
  offer_status text not null default 'planned' check (offer_status in ('planned', 'applied', 'conditional', 'unconditional', 'accepted', 'coe', 'withdrawn', 'rejected')),
  coe_no text,
  created_at timestamptz not null default now()
);
create index if not exists crm_enrolments_case on crm_enrolments(case_id);

-- Workflow steps per case.
create table if not exists crm_steps (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references crm_cases(id) on delete cascade,
  seq int not null,
  phase text not null default '',
  key text,
  label text not null,
  state text not null default 'todo' check (state in ('todo', 'doing', 'done', 'skip')),
  due_date date,
  done_at timestamptz,
  student_note text,                  -- shown to student/parents
  created_at timestamptz not null default now()
);
create index if not exists crm_steps_case on crm_steps(case_id, seq);

-- Fees per case. kind=commission is never shown to families.
create table if not exists crm_fees (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references crm_cases(id) on delete cascade,
  label text not null,
  kind text not null default 'charge' check (kind in ('charge', 'payment', 'commission', 'external')),
  amount numeric(12, 2) not null default 0,
  currency text not null default 'KRW' check (currency in ('KRW', 'AUD', 'USD', 'PHP')),
  due_date date,
  paid_at date,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists crm_fees_case on crm_fees(case_id);

-- Wilson-only notes. student_id null = the general memo pad.
create table if not exists crm_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references crm_students(id) on delete cascade,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_notes_student on crm_notes(student_id, created_at desc);

-- Documents requested from / sent to the family.
create table if not exists crm_documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references crm_students(id) on delete cascade,
  case_id uuid references crm_cases(id) on delete set null,
  direction text not null default 'from_family' check (direction in ('from_family', 'to_family')),
  label text not null,
  state text not null default 'requested' check (state in ('requested', 'received', 'reviewing', 'ok', 'redo')),
  due_date date,
  storage_path text,                  -- bucket crm-docs
  file_name text,
  source text not null default 'upload' check (source in ('upload', 'email', 'admin')),
  inbound_email_id uuid,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_documents_student on crm_documents(student_id);

-- Message thread per family ("AusUhak 메시지").
create table if not exists crm_messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references crm_families(id) on delete cascade,
  author_id uuid references crm_profiles(id) on delete set null,
  from_admin boolean not null default false,
  body text not null check (length(body) between 1 and 4000),
  read_by_admin boolean not null default false,
  read_by_family boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists crm_messages_family on crm_messages(family_id, created_at);

-- Emails pulled from ausuhak@gmail.com that carry documents.
create table if not exists crm_inbound_emails (
  id uuid primary key default gen_random_uuid(),
  gmail_id text not null unique,
  thread_id text,
  from_addr text,
  subject text,
  snippet text,
  received_at timestamptz,
  attachments jsonb not null default '[]'::jsonb,
  matched_student_id uuid references crm_students(id) on delete set null,
  match_reason text,
  status text not null default 'new' check (status in ('new', 'filed', 'ignored')),
  created_at timestamptz not null default now()
);

-- Consult requests from the public site (existing table): extra columns for the CRM.
alter table if exists consult_requests add column if not exists student_id uuid;

-- ---------- helpers ----------
create or replace function crm_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from crm_profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function crm_my_family() returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from crm_profiles where id = auth.uid();
$$;

create or replace function crm_touch() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

do $$ declare t text; begin
  foreach t in array array['crm_students', 'crm_cases', 'crm_notes', 'crm_documents'] loop
    execute format('drop trigger if exists %I_touch on %I', t, t);
    execute format('create trigger %I_touch before update on %I for each row execute function crm_touch()', t, t);
  end loop;
end $$;

-- ---------- row level security ----------
alter table crm_families enable row level security;
alter table crm_profiles enable row level security;
alter table crm_students enable row level security;
alter table crm_cases enable row level security;
alter table crm_enrolments enable row level security;
alter table crm_steps enable row level security;
alter table crm_fees enable row level security;
alter table crm_notes enable row level security;
alter table crm_documents enable row level security;
alter table crm_messages enable row level security;
alter table crm_inbound_emails enable row level security;

-- Admin: everything.
do $$ declare t text; begin
  foreach t in array array['crm_families','crm_profiles','crm_students','crm_cases','crm_enrolments','crm_steps','crm_fees','crm_notes','crm_documents','crm_messages','crm_inbound_emails'] loop
    execute format('drop policy if exists %I on %I', t || '_admin_all', t);
    execute format('create policy %I on %I for all using (crm_is_admin()) with check (crm_is_admin())', t || '_admin_all', t);
  end loop;
end $$;

-- Families: read own family; own profile read/update (role and family are changed server-side only).
drop policy if exists crm_families_own on crm_families;
create policy crm_families_own on crm_families for select using (id = crm_my_family());

drop policy if exists crm_profiles_family_read on crm_profiles;
create policy crm_profiles_family_read on crm_profiles for select using (id = auth.uid() or family_id = crm_my_family());

drop policy if exists crm_students_family_read on crm_students;
create policy crm_students_family_read on crm_students for select using (family_id = crm_my_family());

drop policy if exists crm_cases_family_read on crm_cases;
create policy crm_cases_family_read on crm_cases for select
  using (exists (select 1 from crm_students s where s.id = student_id and s.family_id = crm_my_family()));

drop policy if exists crm_enrolments_family_read on crm_enrolments;
create policy crm_enrolments_family_read on crm_enrolments for select
  using (exists (select 1 from crm_cases c join crm_students s on s.id = c.student_id where c.id = case_id and s.family_id = crm_my_family()));

drop policy if exists crm_steps_family_read on crm_steps;
create policy crm_steps_family_read on crm_steps for select
  using (exists (select 1 from crm_cases c join crm_students s on s.id = c.student_id where c.id = case_id and s.family_id = crm_my_family()));

-- Fees: families never see commission rows.
drop policy if exists crm_fees_family_read on crm_fees;
create policy crm_fees_family_read on crm_fees for select
  using (kind <> 'commission' and exists (select 1 from crm_cases c join crm_students s on s.id = c.student_id where c.id = case_id and s.family_id = crm_my_family()));

-- Notes: admin only (no family policy).

drop policy if exists crm_documents_family_read on crm_documents;
create policy crm_documents_family_read on crm_documents for select
  using (exists (select 1 from crm_students s where s.id = student_id and s.family_id = crm_my_family()));

drop policy if exists crm_messages_family_read on crm_messages;
create policy crm_messages_family_read on crm_messages for select using (family_id = crm_my_family());
drop policy if exists crm_messages_family_insert on crm_messages;
create policy crm_messages_family_insert on crm_messages for insert
  with check (family_id = crm_my_family() and from_admin = false and author_id = auth.uid());

-- ---------- storage ----------
insert into storage.buckets (id, name, public) values ('crm-docs', 'crm-docs', false)
  on conflict (id) do nothing;

-- Paths: <family_id>/<student_id>/<file>. Families read/upload in their own folder.
drop policy if exists crm_docs_admin on storage.objects;
create policy crm_docs_admin on storage.objects for all
  using (bucket_id = 'crm-docs' and crm_is_admin()) with check (bucket_id = 'crm-docs' and crm_is_admin());
drop policy if exists crm_docs_family_read on storage.objects;
create policy crm_docs_family_read on storage.objects for select
  using (bucket_id = 'crm-docs' and (storage.foldername(name))[1] = crm_my_family()::text);
drop policy if exists crm_docs_family_insert on storage.objects;
create policy crm_docs_family_insert on storage.objects for insert
  with check (bucket_id = 'crm-docs' and (storage.foldername(name))[1] = crm_my_family()::text);

-- ---------- Wilson's admin account ----------
insert into crm_profiles (id, role, name)
select id, 'admin', 'Wilson' from auth.users where lower(email) = 'wilsonkim6787@gmail.com'
on conflict (id) do update set role = 'admin';
