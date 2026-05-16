-- ═══════════════════════════════════════════════════════════
-- 031_create_monitoring_sites.sql
-- Wilson 정리 자료 사이트 모음 (xlsx v2 / 12 시트 · 345 사이트).
-- /admin/sites = staff·super_admin 읽기, super_admin CRUD (현 라운드는 import 만).
-- 시드는 scripts/apply_monitoring_sites.py 로 REST API 업서트.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS monitoring_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet TEXT NOT NULL,
  -- 원본 시트 이름 (예: "1.호주 한인사이트")
  section TEXT,
  -- 시트 내부 섹션 (예: "▣ 종합 한인 커뮤니티" / "▣ Group of Eight (G8)")
  category TEXT,
  -- 첫 컬럼 카테고리 태그 (예: "종합 커뮤니티" / "NSW" / "485")
  name TEXT NOT NULL,
  -- 사이트명
  url TEXT NOT NULL,
  -- 사이트 URL
  description TEXT,
  -- 한 줄 설명
  search_text TEXT NOT NULL,
  -- ILIKE 검색용 정규화 (name + description + category + section)
  display_order INTEGER DEFAULT 0,
  -- xlsx 행 순서 보존
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (sheet, name, url)
);

CREATE INDEX IF NOT EXISTS idx_monitoring_sites_sheet ON monitoring_sites(sheet, display_order);
CREATE INDEX IF NOT EXISTS idx_monitoring_sites_category ON monitoring_sites(category);

CREATE OR REPLACE FUNCTION trg_monitoring_sites_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS monitoring_sites_updated_at ON monitoring_sites;
CREATE TRIGGER monitoring_sites_updated_at
  BEFORE UPDATE ON monitoring_sites
  FOR EACH ROW EXECUTE FUNCTION trg_monitoring_sites_updated_at();

-- ───────────────────────────────────────
-- RLS
-- SELECT: staff·super_admin (학생 노출 X — 직원 응대 자료 출처)
-- ALL: super_admin (Wilson) 만
-- ───────────────────────────────────────
ALTER TABLE monitoring_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "monitoring_sites_select" ON monitoring_sites;
CREATE POLICY "monitoring_sites_select" ON monitoring_sites
  FOR SELECT
  USING (is_staff_or_admin());

DROP POLICY IF EXISTS "monitoring_sites_all_admin" ON monitoring_sites;
CREATE POLICY "monitoring_sites_all_admin" ON monitoring_sites
  FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

COMMENT ON TABLE monitoring_sites IS 'Wilson 정리 자료 사이트 모음 (xlsx v2 / 12 시트). FAQ·매뉴얼 출처 검증 + 직원 카톡 응대 자료.';
