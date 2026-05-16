-- ═══════════════════════════════════════════════════════════
-- 024_documents_storage.sql
-- documents 테이블 Storage 컬럼 추가 + Supabase Storage 버킷 student-documents
-- 사양: 5MB / PDF·JPG·PNG·DOCX / super_admin 만 (Phase 5 학생 본인 업로드는 추후)
-- ═══════════════════════════════════════════════════════════

-- 1. documents 테이블 컬럼 추가 (기존 file_url 유지 = 백워드 호환)
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS storage_path     TEXT,
  ADD COLUMN IF NOT EXISTS mime_type        TEXT,
  ADD COLUMN IF NOT EXISTS size_bytes       INTEGER,
  ADD COLUMN IF NOT EXISTS original_filename TEXT;

COMMENT ON COLUMN documents.storage_path     IS 'Supabase Storage 경로. 형식: {student_id}/{doc_type}-{timestamp}.{ext}';
COMMENT ON COLUMN documents.mime_type        IS 'MIME type (application/pdf, image/jpeg, image/png, application/vnd.openxmlformats-officedocument.wordprocessingml.document)';
COMMENT ON COLUMN documents.size_bytes       IS '업로드 파일 크기 (bytes). 5MB 제한.';
COMMENT ON COLUMN documents.original_filename IS '업로드 시점 원본 파일명 (다운로드용 표시).';

-- 2. Storage 버킷 (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS — super_admin 만 모든 권한
DROP POLICY IF EXISTS "student_documents_admin_all" ON storage.objects;
CREATE POLICY "student_documents_admin_all"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'student-documents'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    bucket_id = 'student-documents'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
