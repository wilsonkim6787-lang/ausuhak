-- ═══════════════════════════════════════════════════════════
-- 016_add_branches.sql
-- 사양서 PART D-29 / PART E-16: 지사 정보 (최대 3개)
--
-- 별도 테이블 분리 사유:
--   1) site_settings에 24+ 행으로 쪼개면 key 네이밍 복잡
--      (branch1_name, branch1_name_en, branch1_address, ...)
--   2) "활성 지사 N개" 쿼리가 깔끔: WHERE name IS NOT NULL ORDER BY sort_order
--   3) 미래 확장 (4번째 지사 / 지사별 사진 / 담당자) 시 컬럼만 추가
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS branches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(20) UNIQUE NOT NULL,  -- 'branch_1' / 'branch_2' / 'branch_3'
  sort_order        INT NOT NULL DEFAULT 0,        -- 표시 순서

  name              VARCHAR(100),                  -- 한글 지사명 (NULL/빈문자 = 비활성)
  name_en           VARCHAR(100),
  address           TEXT,
  address_en        TEXT,
  phone             VARCHAR(30),
  email             VARCHAR(255),
  business_hours    VARCHAR(100),                  -- 예: '평일 10:00 ~ 18:00 (AEST)'
  business_hours_en VARCHAR(100),

  updated_by        UUID REFERENCES users(id),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_sort ON branches(sort_order);

COMMENT ON TABLE branches IS 'PART E-16: 지사 정보 최대 3개. name NULL/빈문자 = 비활성(푸터 노출 X).';
COMMENT ON COLUMN branches.slug IS 'branch_1, branch_2, branch_3 고정 (UI는 slug로 인덱싱)';

-- 초기 3 row (모두 비활성 상태로 시작 / Wilson이 admin에서 채움)
INSERT INTO branches (slug, sort_order, name, name_en) VALUES
  ('branch_1', 1, NULL, NULL),
  ('branch_2', 2, NULL, NULL),
  ('branch_3', 3, NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ───────────────────────────────────────
-- RLS: 푸터/Contact 페이지에서 anon도 SELECT (활성 지사 표시용)
--      WRITE는 super_admin만 (3중 보안 Layer 1)
-- ───────────────────────────────────────
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY branches_public_select ON branches
  FOR SELECT USING (true);

CREATE POLICY branches_admin_write ON branches
  FOR ALL USING (is_super_admin());
