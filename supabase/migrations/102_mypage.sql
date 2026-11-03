-- MyPage (student/parent) helpers. Safe to re-run.
--
-- Families have read-only access to crm_documents and crm_messages (see 100).
-- These two SECURITY DEFINER functions let a signed-in family member do exactly
-- two narrow writes, each checked against crm_my_family():
--   1. mark a document Wilson requested (state requested/redo, direction
--      from_family) as received, after the file was uploaded to the family's
--      own folder in the private bucket crm-docs;
--   2. mark Wilson's messages in the family thread as read.


create or replace function crm_family_submit_document(p_doc uuid, p_path text, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fam uuid := crm_my_family();
  v_student uuid;
  v_state text;
  v_dir text;
  v_size bigint;
begin
  if auth.uid() is null or v_fam is null then
    raise exception 'not_family' using errcode = '42501';
  end if;

  select d.student_id, d.state, d.direction
    into v_student, v_state, v_dir
    from crm_documents d
    join crm_students s on s.id = d.student_id
   where d.id = p_doc and s.family_id = v_fam
   for update of d;
  if not found then
    raise exception 'doc_not_found' using errcode = '42501';
  end if;
  if v_dir <> 'from_family' or v_state not in ('requested', 'redo') then
    raise exception 'doc_closed';
  end if;

  -- The file must sit under <family_id>/<student_id>/ and already exist.
  if p_path is null
     or length(p_path) > 500
     or position('..' in p_path) > 0
     or left(p_path, length(v_fam::text || '/' || v_student::text || '/')) <> v_fam::text || '/' || v_student::text || '/' then
    raise exception 'bad_path';
  end if;
  select coalesce((o.metadata ->> 'size')::bigint, 0)
    into v_size
    from storage.objects o
   where o.bucket_id = 'crm-docs' and o.name = p_path;
  if not found then
    raise exception 'no_file';
  end if;
  if v_size > 15 * 1024 * 1024 then
    raise exception 'too_big';
  end if;

  update crm_documents
     set state = 'received',
         storage_path = p_path,
         file_name = left(coalesce(nullif(btrim(p_name), ''), 'file'), 200),
         source = 'upload'
   where id = p_doc;
end;
$$;

revoke all on function crm_family_submit_document(uuid, text, text) from public;
grant execute on function crm_family_submit_document(uuid, text, text) to authenticated;


create or replace function crm_family_mark_read()
returns void
language sql
security definer
set search_path = public
as $$
  update crm_messages
     set read_by_family = true
   where family_id = crm_my_family()
     and from_admin = true
     and read_by_family = false;
$$;

revoke all on function crm_family_mark_read() from public;
grant execute on function crm_family_mark_read() to authenticated;
