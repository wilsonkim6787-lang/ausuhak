-- ═══════════════════════════════════════════════════════════
-- 048_create_gallery.sql
-- 갤러리(합격증 등) — 메인 WilsonStory 갤러리 + /admin/gallery 관리.
--  - 증상: 코드(src/app/[locale]/admin/gallery/*, 홈페이지 WilsonStory)가
--    'gallery' 테이블과 'gallery' 스토리지 버킷을 참조하는데, 이를 생성하는
--    마이그레이션이 없었음(콘솔에서 수기 생성돼 있었을 가능성) → 새 환경/리셋 시
--    "relation does not exist" / "Bucket not found" 로 조용히 빈 갤러리가 됨.
--  - 조치: offers(029)와 동일한 패턴으로 테이블·버킷·RLS 정본화. IF NOT EXISTS라
--    이미 존재하면 안전하게 건너뜀(운영 데이터 보존).
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path TEXT,
  -- Supabase Storage('gallery' 버킷) 경로 (예: "gallery-1724800000000.jpg")
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_status_order
  ON gallery(status, display_order, created_at DESC);

CREATE OR REPLACE FUNCTION trg_gallery_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gallery_updated_at ON gallery;
CREATE TRIGGER gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION trg_gallery_updated_at();

-- ───────────────────────────────────────
-- Storage 버킷 (public read = 메인 페이지 익명 노출용)
-- ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────
-- RLS
-- SELECT: 익명도 published 만 조회
-- INSERT/UPDATE/DELETE: super_admin (Wilson) 만
-- ───────────────────────────────────────
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_anon_published_select" ON gallery;
CREATE POLICY "gallery_anon_published_select"
  ON gallery FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "gallery_admin_all" ON gallery;
CREATE POLICY "gallery_admin_all"
  ON gallery FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Storage 정책 — public 버킷이라 SELECT 자유. INSERT/UPDATE/DELETE 만 정책 필요.
DROP POLICY IF EXISTS "gallery_storage_admin_write" ON storage.objects;
CREATE POLICY "gallery_storage_admin_write"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'gallery'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    bucket_id = 'gallery'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

COMMENT ON TABLE gallery IS '메인 WilsonStory 갤러리. /admin/gallery Wilson 관리.';
