-- Admin intranet: lets Wilson's signed-in admin session read and update the
-- existing consult_requests table (the /admin/consults inbox uses the RLS-scoped
-- client, not the service role). Does not change RLS on/off for the table, so
-- the public form (service role) keeps working as before. Safe to re-run.

do $$
begin
  if to_regclass('public.consult_requests') is not null then
    execute 'drop policy if exists consult_requests_admin_all on consult_requests';
    execute 'create policy consult_requests_admin_all on consult_requests for all using (crm_is_admin()) with check (crm_is_admin())';
    execute 'create index if not exists consult_requests_created on consult_requests(created_at desc)';
  end if;
end $$;

-- Lookups used by the admin screens.
create index if not exists crm_documents_inbound on crm_documents(inbound_email_id);
create index if not exists crm_inbound_emails_status on crm_inbound_emails(status, received_at desc);
create index if not exists crm_messages_unread on crm_messages(family_id) where read_by_admin = false;
