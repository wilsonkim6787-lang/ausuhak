-- ═══════════════════════════════════════════════════════════
-- 003_initial_students.sql
-- 사양서 PART D-3: students + student_assignments (1:N 다중 담당)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS students (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 익명 학생 추적 (회원가입 전)
  anonymous_id          VARCHAR(100),
  diagnose_uuid         VARCHAR(100) UNIQUE,                -- 24시간 유효 결과 페이지 ID

  -- 6변수 (FAQ 84 매칭 키 / PART 0-7)
  age                   INTEGER,
  age_range             VARCHAR(20),
  -- '18미만' / '18-24' / '25-32' / '33-39' / '40+'
  education             VARCHAR(20),
  -- '검정고시' / '고졸' / '대학재학' / '대졸' / '워홀러'
  english_level         VARCHAR(20),
  -- '없음' / '4.0-5.0' / '5.5' / '6.0' / '6.5' / '7.0+'
  preferred_region      VARCHAR(30),
  -- '시드니' / '멜번' / '브리즈번' / '골드코스트' / '퍼스' /
  -- '애들레이드' / '호바트' / '캔버라' / '추천받기'
  major                 VARCHAR(30),
  -- '간호' / 'IT' / '비즈니스' / '공학' / '요리·호텔' /
  -- '유아교육' / '디자인' / 'Trade' / '의료' / '미정'
  budget_range          VARCHAR(20),
  -- '$25-35K' / '$35-50K' / '$50-65K' / '$65-80K' / '$80K+'

  -- 의대 분류 (PART B-4)
  is_medical            BOOLEAN DEFAULT false,
  medical_pathway       VARCHAR(30),
  -- 'direct' / 'undergrad' / 'graduate' / 'converter' / 'transfer'

  -- Stage 진행 (PART B-1: 12단계 통일 / 의대도 동일)
  current_stage         INTEGER DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 12),
  graduated_at          TIMESTAMP,

  -- Lead Status (PART B-3: CRM 7단계)
  lead_status           VARCHAR(20) DEFAULT 'lead',
  -- 'lead' / 'contacted' / 'pro' / 'contract' / 'visa' / 'onsite' / 'pr'

  -- Wilson Alerts (학생 적용된 ALERT-001~024)
  wilson_alerts         TEXT[],

  -- 카드 7장 결과 캐시 (24시간 유효)
  card_result           JSONB,
  scenario_matched      VARCHAR(100),                       -- FAQ 시나리오 ID

  -- 진입 경로 (PART F-1: 4가지 루트)
  source                VARCHAR(50),
  -- 'web_diagnose' / 'kakao_direct' / 'medical_page' / 'partner_referral'
  partner_ref           VARCHAR(50),                        -- ?ref=partnerXX

  -- 의대 패키지 권한
  medical_package_access  BOOLEAN DEFAULT false,
  medical_package_paid_at TIMESTAMP,

  -- 결과 발송 추적 (부가 옵션 4가지)
  result_sent_kakao_at  TIMESTAMP,
  result_sent_email_at  TIMESTAMP,

  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_diagnose_uuid ON students(diagnose_uuid);
CREATE INDEX IF NOT EXISTS idx_students_stage ON students(current_stage);
CREATE INDEX IF NOT EXISTS idx_students_lead_status ON students(lead_status);
CREATE INDEX IF NOT EXISTS idx_students_medical ON students(is_medical) WHERE is_medical = true;
CREATE INDEX IF NOT EXISTS idx_students_anonymous ON students(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_students_source ON students(source);

COMMENT ON TABLE students IS 'PART B/F: 학생 라이프사이클 12단계 + Lead Status 7단계 / 의대 학생도 동일 (is_medical flag)';

-- 학생-직원 1:N 다중 담당 (PART C-2.5)
CREATE TABLE IF NOT EXISTS student_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
  staff_id      UUID REFERENCES users(id),
  role          VARCHAR(20) NOT NULL CHECK (role IN ('primary', 'shared', 'observer')),
  assigned_by   UUID REFERENCES users(id),          -- Wilson
  assigned_at   TIMESTAMP DEFAULT NOW(),
  released_at   TIMESTAMP,                          -- NULL = 활성
  note          TEXT
);

-- 학생 1명에 active primary는 1명만
CREATE UNIQUE INDEX IF NOT EXISTS uniq_primary_per_student
  ON student_assignments(student_id)
  WHERE role = 'primary' AND released_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assignment_staff ON student_assignments(staff_id) WHERE released_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assignment_student ON student_assignments(student_id) WHERE released_at IS NULL;

COMMENT ON TABLE student_assignments IS 'PART C-2.5: 학생 1 = 담당 직원 여러 명 (primary 1 + shared N + observer N)';
