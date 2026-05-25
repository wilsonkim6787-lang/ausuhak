-- ═══════════════════════════════════════════════════════════
-- 032_add_student_photo.sql
-- 학생 식별용 사진 (admin 칸반·리스트·상세 / mypage 헤더 표시).
-- - Storage bucket public (UUID 파일명으로 URL guess 불가)
-- - Wilson 만 업로드 / 학생 본인은 자기 row 의 photo_path 만 SELECT
-- ═══════════════════════════════════════════════════════════

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS photo_path TEXT;

COMMENT ON COLUMN students.photo_path IS
  '학생 식별 사진 (super_admin 업로드 / admin·mypage 표시). Storage path.';

-- ───────────────────────────────────────
-- Storage bucket (public read = admin·mypage 즉시 표시용 / UUID filename)
-- ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS — SELECT 자유 (public bucket) / 변경은 super_admin 만
DROP POLICY IF EXISTS "student_photos_admin_write" ON storage.objects;
CREATE POLICY "student_photos_admin_write"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'student-photos'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    bucket_id = 'student-photos'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );
