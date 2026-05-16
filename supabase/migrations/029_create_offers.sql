-- ═══════════════════════════════════════════════════════════
-- 029_create_offers.sql
-- 합격증 갤러리 — 메인 페이지 OfferShowcase + /admin/offers Wilson 관리.
-- Storage 버킷 'offers' (public read / super_admin write).
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school TEXT NOT NULL,
  program TEXT,
  year INTEGER,
  student_alias TEXT,
  -- 마스킹 표현 (예: "K.J.Y" / "검정고시 / 19세 / W학생")
  image_path TEXT,
  -- Supabase Storage 경로 (예: "USyd-Nursing-2025-abc123.jpg")
  note TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_status_order
  ON offers(status, display_order, year DESC);

CREATE OR REPLACE FUNCTION trg_offers_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS offers_updated_at ON offers;
CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION trg_offers_updated_at();

-- ───────────────────────────────────────
-- Storage 버킷 (public read = 메인 페이지 익명 노출용)
-- ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('offers', 'offers', true)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────
-- RLS
-- SELECT: 익명도 published 만 조회
-- INSERT/UPDATE/DELETE: super_admin (Wilson) 만
-- ───────────────────────────────────────
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offers_anon_published_select" ON offers;
CREATE POLICY "offers_anon_published_select"
  ON offers FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "offers_admin_all" ON offers;
CREATE POLICY "offers_admin_all"
  ON offers FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Storage 정책 — public 버킷이라 SELECT 자유. INSERT/UPDATE/DELETE 만 정책 필요.
DROP POLICY IF EXISTS "offers_storage_admin_write" ON storage.objects;
CREATE POLICY "offers_storage_admin_write"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'offers'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    bucket_id = 'offers'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

COMMENT ON TABLE offers IS '합격증 갤러리. 메인 OfferShowcase + /admin/offers Wilson 관리.';
