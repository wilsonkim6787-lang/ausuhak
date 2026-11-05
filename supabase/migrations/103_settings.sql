-- Key/value settings only Wilson (admin) can read or write. Holds the Gmail refresh token.
create table if not exists crm_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table crm_settings enable row level security;
drop policy if exists crm_settings_admin_all on crm_settings;
create policy crm_settings_admin_all on crm_settings for all using (crm_is_admin()) with check (crm_is_admin());
