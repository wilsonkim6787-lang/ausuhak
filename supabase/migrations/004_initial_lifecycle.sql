-- ═══════════════════════════════════════════════════════════
-- 004_initial_lifecycle.sql
-- 사양서 PART D-3: 학생 라이프사이클 보조 8개 테이블
-- consultations / student_notes / school_applications / documents /
-- payments / visa_cases / critical_deadlines / quotes
-- ═══════════════════════════════════════════════════════════

-- 상담 기록 (공식)
CREATE TABLE IF NOT EXISTS consultations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
  consulted_by        UUID REFERENCES users(id),
  consultation_date   TIMESTAMP NOT NULL,
  type                VARCHAR(30),
  -- 'kakao_30min' / 'pro_2hour_zoom' / 'pro_2hour_offline' / 'full_consulting' / 'medical_isat_mmi'
  duration_minutes    INTEGER,
  summary             TEXT,
  wilson_notes        TEXT,                                 -- 🔴 Wilson 전용 (RLS로 차단)
  next_action         TEXT,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);

-- 학생 메모장 (PART C-2.5 visibility 분리 / 3중 보안 핵심)
CREATE TABLE IF NOT EXISTS student_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES users(id),

  visibility  VARCHAR(30) NOT NULL CHECK (visibility IN ('wilson_only', 'shared_with_assigned')),
  -- 'wilson_only'         = 🔴 Wilson만
  -- 'shared_with_assigned' = 🟡 주담당 + 공유 담당 + Wilson

  content     TEXT NOT NULL,
  tags        TEXT[],                                       -- '상담' / '위험' / '성격' / '가족' / '기타'
  ai_alerts   TEXT[],                                       -- AI 자동 감지 (Failure Pattern 등)

  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  hidden_at   TIMESTAMP                                     -- 숨김만 / 삭제 X (감사 추적)
);

CREATE INDEX IF NOT EXISTS idx_notes_student ON student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_notes_visibility ON student_notes(visibility);
CREATE INDEX IF NOT EXISTS idx_notes_author ON student_notes(author_id);

COMMENT ON TABLE student_notes IS 'PART 0-4: 학생 절대 접근 X (RLS Layer 1)';

-- 다중 학교 지원
CREATE TABLE IF NOT EXISTS school_applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
  school_id           UUID REFERENCES schools(id),
  program             VARCHAR(255),
  status              VARCHAR(30),
  -- 'preparing' / 'applied' / 'offer_received' / 'accepted' / 'rejected' / 'withdrawn'
  applied_at          TIMESTAMP,
  offer_received_at   TIMESTAMP,
  offer_letter_url    TEXT,
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apps_student ON school_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_apps_school ON school_applications(school_id);

-- 서류
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  doc_type    VARCHAR(50) NOT NULL,
  -- 'passport' / 'transcript' / 'english_score' / 'financial' / 'gs_statement' /
  -- 'recommendation' / 'personal_statement' / 'other'
  file_url    TEXT,
  uploaded_by UUID REFERENCES users(id),
  status      VARCHAR(20) DEFAULT 'pending',
  -- 'pending' / 'received' / 'verified' / 'rejected'
  checked_by  UUID REFERENCES users(id),
  note        TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_student ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_docs_status ON documents(status);

-- 결제
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  payment_type    VARCHAR(30) NOT NULL,
  -- 'pro_50k' / 'medical_300k' / 'full_consulting'
  amount_krw      INTEGER,
  amount_aud      DECIMAL(10, 2),
  status          VARCHAR(20) DEFAULT 'pending',
  -- 'pending' / 'confirmed' / 'refunded' / 'cancelled'
  confirmed_by    UUID REFERENCES users(id),
  confirmed_at    TIMESTAMP,
  refund_amount   INTEGER,
  refund_reason   TEXT,
  note            TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 비자
CREATE TABLE IF NOT EXISTS visa_cases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID REFERENCES students(id) ON DELETE CASCADE,
  visa_subclass         VARCHAR(20) NOT NULL,
  -- '500' (학생) / '485' (졸업) / '189' / '190' / '491' / '186'
  status                VARCHAR(30),
  -- 'preparing' / 'submitted' / 'granted' / 'refused' / 'withdrawn'
  submitted_at          TIMESTAMP,
  granted_at            TIMESTAMP,
  visa_grant_letter_url TEXT,
  refusal_reason        TEXT,
  note                  TEXT,
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visa_student ON visa_cases(student_id);
CREATE INDEX IF NOT EXISTS idx_visa_status ON visa_cases(status);

-- Critical Deadlines (자동 추적)
CREATE TABLE IF NOT EXISTS critical_deadlines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  deadline_type   VARCHAR(30) NOT NULL,
  -- 'offer_acceptance' / 'tuition' / 'visa' / 'coe' / 'oshc' /
  -- 'isat_test' / 'mmi_interview' / 'gamsat' / 'departure'
  deadline_date   DATE NOT NULL,
  status          VARCHAR(20) DEFAULT 'upcoming',
  -- 'upcoming' / 'd-7' / 'd-3' / 'd-1' / 'd-day' / 'expired' / 'completed'
  auto_alert_sent JSONB DEFAULT '[]',
  wilson_notified BOOLEAN DEFAULT false,
  note            TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deadlines_student ON critical_deadlines(student_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON critical_deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON critical_deadlines(status);

-- 견적서 (PART E-6 핵심 / Wilson 관리자만 생성)
CREATE TABLE IF NOT EXISTS quotes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES students(id) ON DELETE CASCADE,
  created_by        UUID REFERENCES users(id),

  selected_schools  JSONB NOT NULL,                         -- 학교 1~3개
  items             JSONB NOT NULL,                         -- 자동 항목 8개

  total_aud         DECIMAL(12, 2),
  total_krw         INTEGER,

  status            VARCHAR(20) DEFAULT 'draft',
  -- 'draft' / 'sent' / 'accepted' / 'expired'

  pdf_url           TEXT,
  sent_at           TIMESTAMP,

  policy_snapshot   JSONB,                                  -- 정책 변경 영향 X (PART 0-15)

  note              TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_student ON quotes(student_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

COMMENT ON TABLE quotes IS 'PART 0-15 / PART E-6: Wilson만 생성 / 학교 1~3개 / 알바비 차감 X / Snapshot 보존';
