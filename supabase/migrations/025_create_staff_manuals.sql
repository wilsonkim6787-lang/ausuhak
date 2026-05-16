-- ═══════════════════════════════════════════════════════════
-- 025_create_staff_manuals.sql
-- 직원 응대 매뉴얼 테이블 (475 케이스 / Wilson 19년 노하우 / 카톡 상담 대응).
-- /staff/manuals = 직원 읽기, /admin/faqs = Wilson 편집 (super_admin 만).
-- 시드는 026_seed_staff_manuals.sql 로 분리.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS staff_manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER UNIQUE NOT NULL,
  -- 원본 파일 번호 1~524 (Wilson v6 에서 중복 50개 제거하며 비번호 발생)
  category TEXT,
  -- 카테고리 (검정고시·조기유학·고졸·한국학사·비자·생활 등) — Wilson 가 admin UI 에서 재분류
  title TEXT NOT NULL,
  -- 케이스 제목 (파일명에서 추출)
  content TEXT NOT NULL,
  -- 전체 markdown 본문
  search_text TEXT NOT NULL,
  -- 검색 정규화 (markdown 특수문자 제거)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_manuals_category ON staff_manuals(category);
CREATE INDEX IF NOT EXISTS idx_staff_manuals_number ON staff_manuals(number);
-- 검색은 ILIKE 기반으로 충분 (475 rows). 향후 gin tsvector 추가 가능.

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION trg_staff_manuals_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staff_manuals_updated_at ON staff_manuals;
CREATE TRIGGER staff_manuals_updated_at
  BEFORE UPDATE ON staff_manuals
  FOR EACH ROW EXECUTE FUNCTION trg_staff_manuals_updated_at();

-- ───────────────────────────────────────
-- RLS
-- SELECT: 직원·super_admin 모두 읽기 가능
-- INSERT/UPDATE/DELETE: super_admin (Wilson) 만
-- ───────────────────────────────────────
ALTER TABLE staff_manuals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_manuals_select" ON staff_manuals;
CREATE POLICY "staff_manuals_select" ON staff_manuals
  FOR SELECT
  USING (is_staff_or_admin());

DROP POLICY IF EXISTS "staff_manuals_all_admin" ON staff_manuals;
CREATE POLICY "staff_manuals_all_admin" ON staff_manuals
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

COMMENT ON TABLE staff_manuals IS 'Wilson 직원 응대 매뉴얼 475 케이스. /staff/manuals 직원 읽기, /admin/faqs Wilson 편집.';
