-- ═══════════════════════════════════════════════════════════
-- 005_initial_faqs.sql
-- 사양서 PART D-4: internal_faqs (학생 카드용 FAQ 84)
-- 4필드 분리 (3중 보안 핵심): card_text / internal_data / wilson_note + 매칭 메타
-- 데이터 임포트는 별도 파일 (005_data_faqs_import.sql)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS internal_faqs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id              VARCHAR(100) UNIQUE NOT NULL,
  -- 'scenario_01_검정고시_명문대' / 'school_USyd' / 'region_시드니' /
  -- 'major_간호' / 'visa_pr_학생비자_500' 등

  module_type         VARCHAR(30) NOT NULL CHECK (module_type IN ('scenario', 'school', 'region', 'major', 'visa_pr')),
  category            VARCHAR(50),
  -- '검정고시' / '고졸' / 'G8' / '시드니' / '간호' / '학생비자_500' 등

  question            VARCHAR(500),

  -- 4필드 분리 (3중 보안 / RLS로 학생/직원 접근 차등)
  card_text           TEXT,                                 -- ✅ 학생 카드용 / 친근 톤
  internal_data       TEXT,                                 -- 🔴 직원 전용 / 학생 절대 X
  wilson_note         TEXT,                                 -- 🔴🔴 Wilson 전용 / 직원도 X

  -- 매칭 메타 (Step 1.4 매칭 엔진이 사용)
  matching_keywords   TEXT[],
  matching_cards      INTEGER[],                            -- [1,3,5] = 카드 1, 3, 5에 사용
  matching_6vars      JSONB,
  -- {education: ['검정고시'], major: ['간호'], english: ['7.0+']}

  -- 시나리오 모듈 호출 (module_type='scenario'만)
  required_modules    JSONB,
  -- {schools: [...], regions: [...], majors: [...], visa_pr: [...]}

  last_updated_at     TIMESTAMP,
  source_file         VARCHAR(255),                         -- '01_시나리오/01_검정고시/09_간호.md' 등

  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_faq_id ON internal_faqs(faq_id);
CREATE INDEX IF NOT EXISTS idx_faqs_module ON internal_faqs(module_type);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON internal_faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_keywords ON internal_faqs USING GIN(matching_keywords);
CREATE INDEX IF NOT EXISTS idx_faqs_6vars ON internal_faqs USING GIN(matching_6vars);

COMMENT ON TABLE internal_faqs IS 'PART D-4 / PART H: 84개 FAQ / 5개 모듈 (시나리오 36 + 학교 24 + 지역 8 + 전공 10 + 비자/PR 5) / 4필드 분리 = 학생/직원/Wilson 차등 노출';
COMMENT ON COLUMN internal_faqs.card_text IS '학생 카드 7장 노출 가능 (PUBLIC)';
COMMENT ON COLUMN internal_faqs.internal_data IS '직원 페이지 노출 (INTERNAL / 학생 RLS 차단)';
COMMENT ON COLUMN internal_faqs.wilson_note IS 'Wilson 전용 (직원도 RLS 차단)';
