-- ═══════════════════════════════════════════════════════════
-- 002_initial_schools.sql
-- 사양서 PART D-4: schools (학교 마스터)
-- 정본: master_v2_clean.json (109교 / 1,235전공 / 차단 39 / Alert 24)
-- 실제 데이터 임포트는 별도 파일 (002_data_schools_import.sql)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS schools (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id           VARCHAR(50) UNIQUE,           -- master_v2_clean.json 매핑
  name                VARCHAR(255) NOT NULL,
  alternate_names     TEXT[],                       -- "UNSW / 뉴사우스웨일스 대학교" 등 별칭
  type                VARCHAR(30),
  -- 'university' / 'foundation' / 'foundation_course' / 'elicos' /
  -- 'elicos_closed' / 'tafe' / 'diploma_verified' / 'vocational_private' /
  -- 'under18' / 'cat30_new' / 'hsp_private_elicos' / 'hsp_government' /
  -- 'operations_verified'
  city                VARCHAR(50),
  state               VARCHAR(20),
  campus              VARCHAR(255),
  cricos_code         VARCHAR(50),

  -- 인증
  anmac_certified     BOOLEAN,
  qs_ranking          INTEGER,
  founded             INTEGER,
  operator            VARCHAR(255),

  -- 학비 / 코스 정보 (master_v2_clean 정본 / 전공 별 데이터)
  programs            JSONB,
  -- [{major_id, major_name, level, tuition_2026, ielts, duration, pr_category, pr_grade, scholarships:[]}, ...]
  scholarships        JSONB,                        -- 학교 자체 장학금 리스트
  blocking_rules      TEXT[],                       -- 적용되는 차단룰 ID
  wilson_alerts       TEXT[],                       -- 적용되는 Wilson Alert ID

  -- 정책 변경 추적
  last_verified_at    TIMESTAMP,
  official_url        TEXT,

  -- 모니터링 (Phase 3)
  monitor_priority    VARCHAR(20),                  -- 'critical' / 'high' / 'normal'

  status              VARCHAR(20) DEFAULT 'active', -- 'active' / 'closed' / 'verify_needed'

  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_master ON schools(master_id);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_city ON schools(city);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_anmac ON schools(anmac_certified) WHERE anmac_certified = true;

COMMENT ON TABLE schools IS 'PART D-4: master_v2_clean.json 정본 동기화 (2026-05-08 Wilson 검수). UNSW 간호 미운영 / Adelaide University = UoA+UniSA 통합 / AHPRA IELTS 7.0 통일';

-- 차단룰 (39개) - 학교/전공 매칭 시 자동 차단
CREATE TABLE IF NOT EXISTS blocking_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id         VARCHAR(50) UNIQUE NOT NULL,     -- 'BLOCK-001' ~ 'BLOCK-039'
  severity        VARCHAR(20) NOT NULL,            -- 'hard' (절대 차단) / 'soft' (경고)
  category        VARCHAR(50),                     -- 'school_closed' / 'anmac_uncertified' 등
  title           VARCHAR(255),
  description     TEXT,
  conditions      JSONB,                           -- 매칭 조건 (학력/전공/IELTS 등)
  action          VARCHAR(50),                     -- 'exclude' / 'warn' / 'alternate'
  alternate_ids   TEXT[],                          -- 대체 학교 master_id
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocking_rules_active ON blocking_rules(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_blocking_rules_severity ON blocking_rules(severity);

COMMENT ON TABLE blocking_rules IS 'PART H-5: master_v2_clean.json 차단룰 39개 (hard 8 + soft 31)';

-- Wilson Alerts (24개) - 학생 위험 패턴 감지
CREATE TABLE IF NOT EXISTS wilson_alerts_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id        VARCHAR(50) UNIQUE NOT NULL,     -- 'ALERT-001' ~ 'ALERT-024'
  title           VARCHAR(255),
  wilson_quote    TEXT,                            -- Wilson 19년 인용
  principle       TEXT,
  wilson_truth    TEXT,
  applies_to      TEXT,                            -- 적용 학생 케이스
  marketing_application TEXT,
  conditions      JSONB,                           -- 트리거 조건
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wilson_alerts_active ON wilson_alerts_rules(active) WHERE active = true;

COMMENT ON TABLE wilson_alerts_rules IS 'PART J-2 / PART H-5: 학생 6변수 + 메모 패턴 → 자동 Alert (Wilson만 노출)';
