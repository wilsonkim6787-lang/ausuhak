# 🎯 PART D. DB 스키마 (Supabase 27개 테이블)

> **데이터베이스**: Supabase PostgreSQL
> **마이그레이션**: `/supabase/migrations/`
> **RLS (Row Level Security)**: 모든 테이블 활성화 (3중 보안 1차 계층)

## D-0. master_v2_clean 정본 사용 (2026-05-08 정비 완료)

> **정본 파일**: `ausuhak_master_v2_clean.json` (3.0 MB / Wilson 검수 완료)
> **위치**: `/src/data/master_v2_clean.json` (코드 임베드)
> **백업**: `ausuhak_master_v2.json` (옛 원본 / 사용 X)

### 정본 통계
- 전공 (majors.all_majors): **1,235개** (이전 1,227 → +8)
- 학교명 (school_name) 종류: **109개** (이전 179 → 표준화)
- 학교 카테고리: 39 universities + 8 Foundation + 47 ELICOS (운영) + 18 ELICOS (폐교) + 8주 TAFE + 22 Diploma + 10 사립 + 21 18세 미만 + 223 신규 + 15+5 HSP + 13 Operations
- 차단룰: 39개 / Wilson Alerts: 24개

### schools 테이블 임포트 시 룰
- master_id = master_v2_clean의 school_id 매핑
- school_name = 표준화된 정식명 (UNSW / USyd / UMelb / Adelaide University 등)
- 옛 별칭 (UoA / UniSA / 뉴사우스웨일스 대학교 등) = 별도 컬럼 alternate_names로 보존
- UNSW 간호 = master_v2_clean에 없음 (3개 모두 제거됨 / 자동 검증)
- Adelaide University = UoA + UniSA 통합 (2026.01) / 별도 row X

### 빌드 시 자동 검증
- master_v2_clean.json 카운트 일치 확인 (학교 109 / 전공 1,235)
- UNSW 간호 매칭 시도 발견 = 빌드 거부
- 옛 master_v2.json 참조 발견 = 빌드 거부

---

## D-1. 테이블 목록 (27개)

```
[사용자·권한·담당]
1. users                  회원 통합
2. staff_permissions      직원 권한 (Wilson 부여)
3. student_assignments    학생-직원 다중 담당 (1:N) ⭐ 신규

[학생 라이프사이클]
4. students               학생 상세 (12단계)
5. consultations          상담 기록 (공식)
6. student_notes          학생 메모장 (일상 / 학생 절대 X)
7. school_applications    다중 학교 지원
8. documents              서류
9. payments               결제
10. visa_cases            비자
11. critical_deadlines    학생 마감일 자동 추적
12. quotes                견적서 ⭐ 신규

[학교·콘텐츠 마스터]
13. schools               학교 마스터 (master_v2_clean 동기화 (정비 완료 정본))
14. internal_faqs         학생 카드용 FAQ 84 (4필드 분리 / 학생 차단)
15. staff_manuals         직원 매뉴얼 475
16. graduates             졸업생

[관리·운영]
17. commissions           커미션 자동
18. notifications         카톡 알림 큐
19. update_logs           DB 업데이트 이력
20. activity_logs         직원 활동 추적
21. issues                이슈·컴플레인 트래킹

[콘텐츠 마케팅]
22. blog_posts            블로그
23. youtube_videos        유튜브 동기화

[의대 도구]
24. isat_questions        ISAT 200문제
25. mmi_scenarios         MMI 40 스테이션
26. medical_tools_progress 학생 진행 추적

[자동화·설정]
27. monitored_sites       사이트 모니터링 365개
28. site_settings         사이트 정보 (푸터 / 영업시간 등) ⭐ 신규
29. branches              지사 정보 최대 3개 ⭐ 신규 (016)
```

> **카운트**: 27개 + 28번 site_settings + 29번 branches = 29개. 단, 28·29번은 설정 테이블이라 운영 데이터 27개로 카운트.

---

## D-2. 사용자·권한·담당 (테이블 1~3)

### 1. users (회원 통합)
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE,
  name          VARCHAR(100) NOT NULL,
  kakao_id      VARCHAR(100),
  phone         VARCHAR(30),
  role          VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'staff', 'student')),
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'left')),
  created_at    TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45)
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kakao ON users(kakao_id);
CREATE INDEX idx_users_email ON users(email);
```

### 2. staff_permissions (직원 권한 / Wilson 부여)
```sql
CREATE TABLE staff_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_key  VARCHAR(50) NOT NULL,
  -- 'view_all_students' / 'edit_student_info' / 'check_documents' /
  -- 'upload_offer' / 'confirm_payment' / 'write_shared_memo' /
  -- 'view_manuals' / 'edit_manuals' / 'view_internal_faqs' /
  -- 'edit_internal_faqs' / 'write_blog' / 'publish_blog' /
  -- 'send_kakao_alert' / 'create_quote' / 'view_stats' /
  -- 'manage_other_staff_permissions'
  value           BOOLEAN DEFAULT false,
  granted_by      UUID REFERENCES users(id),
  granted_at      TIMESTAMP DEFAULT NOW(),
  revoked_at      TIMESTAMP,
  note            TEXT,
  UNIQUE(user_id, permission_key)
);
```

### 3. student_assignments (학생-직원 다중 담당) ⭐ 신규
```sql
CREATE TABLE student_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
  staff_id      UUID REFERENCES users(id),
  role          VARCHAR(20) NOT NULL CHECK (role IN ('primary', 'shared', 'observer')),
  assigned_by   UUID REFERENCES users(id),  -- Wilson
  assigned_at   TIMESTAMP DEFAULT NOW(),
  released_at   TIMESTAMP,
  note          TEXT
);

-- 한 학생당 active 주담당은 1명만
CREATE UNIQUE INDEX uniq_primary_per_student 
  ON student_assignments(student_id) 
  WHERE role = 'primary' AND released_at IS NULL;

CREATE INDEX idx_assignment_staff ON student_assignments(staff_id) WHERE released_at IS NULL;
CREATE INDEX idx_assignment_student ON student_assignments(student_id) WHERE released_at IS NULL;
```

---

## D-3. 학생 라이프사이클 (테이블 4~12)

### 4. students (학생 상세 / 12단계)
```sql
CREATE TABLE students (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 익명 학생 추적 (회원가입 전)
  anonymous_id          VARCHAR(100),

  -- Wilson 입력 스냅샷 (017 마이그레이션 / 학생 가입 후에도 보존, users.* 와 분리)
  name                  VARCHAR(100),
  kakao_id              VARCHAR(100),
  phone                 VARCHAR(30),
  email                 VARCHAR(255),

  -- 6변수 (FAQ 84 매칭 키)
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
  
  -- 의대 분류
  is_medical            BOOLEAN DEFAULT false,
  medical_pathway       VARCHAR(30),
  -- 'direct' / 'undergrad' / 'graduate' / 'converter' / 'transfer'
  
  -- Stage 진행 (12단계 통일)
  current_stage         INTEGER DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 12),
  graduated_at          TIMESTAMP,
  
  -- Lead Status (CRM)
  lead_status           VARCHAR(20) DEFAULT 'lead',
  -- 'lead' / 'contacted' / 'pro' / 'contract' / 'visa' / 'onsite' / 'pr'
  
  -- Wilson Alerts
  wilson_alerts         TEXT[],
  
  -- 카드 7장 결과 (캐시)
  card_result           JSONB,
  scenario_matched      VARCHAR(100),
  
  -- 파트너 추적
  partner_ref           VARCHAR(50),
  
  -- 의대 패키지 권한
  medical_package_access  BOOLEAN DEFAULT false,
  medical_package_paid_at TIMESTAMP,
  
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_students_stage ON students(current_stage);
CREATE INDEX idx_students_lead_status ON students(lead_status);
CREATE INDEX idx_students_medical ON students(is_medical) WHERE is_medical = true;
CREATE INDEX idx_students_anonymous ON students(anonymous_id);
```

### 5. consultations (상담 기록 / 공식)
```sql
CREATE TABLE consultations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
  consulted_by        UUID REFERENCES users(id),
  consultation_date   TIMESTAMP NOT NULL,
  type                VARCHAR(30),
  -- 'kakao_30min' / 'pro_2hour_zoom' / 'pro_2hour_offline' /
  -- 'full_consulting' / 'medical_isat_mmi'
  duration_minutes    INTEGER,
  summary             TEXT,
  wilson_notes        TEXT,        -- 🔴 Wilson 전용
  next_action         TEXT,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consultations_student ON consultations(student_id);
CREATE INDEX idx_consultations_date ON consultations(consultation_date);
```

### 6. student_notes (학생 메모장 / 일상 / 학생 절대 X)
```sql
CREATE TABLE student_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES users(id),
  
  -- 가시성 (3중 보안 핵심)
  visibility  VARCHAR(30) NOT NULL CHECK (visibility IN ('wilson_only', 'shared_with_assigned')),
  -- 'wilson_only' = 🔴 Wilson만
  -- 'shared_with_assigned' = 🟡 주담당 + 공유 담당 + Wilson
  
  content     TEXT NOT NULL,
  tags        TEXT[],
  -- '상담' / '위험' / '성격' / '가족' / '기타'
  ai_alerts   TEXT[],
  -- AI 자동 감지 (Failure Pattern 등)
  
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  hidden_at   TIMESTAMP  -- 숨김만 / 삭제 X (감사 추적)
);

CREATE INDEX idx_notes_student ON student_notes(student_id);
CREATE INDEX idx_notes_visibility ON student_notes(visibility);
CREATE INDEX idx_notes_author ON student_notes(author_id);
```

### 7. school_applications (다중 학교 지원)
```sql
CREATE TABLE school_applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
  school_id           UUID REFERENCES schools(id),
  program             VARCHAR(255),
  status              VARCHAR(30),
  -- 'preparing' / 'applied' / 'offer_received' / 'accepted' /
  -- 'rejected' / 'withdrawn'
  applied_at          TIMESTAMP,
  offer_received_at   TIMESTAMP,
  offer_letter_url    TEXT,
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_apps_student ON school_applications(student_id);
CREATE INDEX idx_apps_school ON school_applications(school_id);
```

### 8. documents (서류)
```sql
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  doc_type    VARCHAR(50) NOT NULL,
  -- 'passport' / 'transcript' / 'english_score' / 'financial' /
  -- 'gs_statement' / 'recommendation' / 'personal_statement' / 'other'
  file_url    TEXT,
  uploaded_by UUID REFERENCES users(id),
  status      VARCHAR(20) DEFAULT 'pending',
  -- 'pending' / 'received' / 'verified' / 'rejected'
  checked_by  UUID REFERENCES users(id),
  note        TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_docs_student ON documents(student_id);
CREATE INDEX idx_docs_status ON documents(status);
```

### 9. payments (결제)
```sql
CREATE TABLE payments (
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

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 10. visa_cases (비자)
```sql
CREATE TABLE visa_cases (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
  visa_subclass       VARCHAR(20) NOT NULL,
  -- '500' (학생비자) / '485' (졸업) / '189' / '190' / '491' / '186'
  status              VARCHAR(30),
  -- 'preparing' / 'submitted' / 'granted' / 'refused' / 'withdrawn'
  submitted_at        TIMESTAMP,
  granted_at          TIMESTAMP,
  visa_grant_letter_url TEXT,
  refusal_reason      TEXT,
  note                TEXT,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visa_student ON visa_cases(student_id);
CREATE INDEX idx_visa_status ON visa_cases(status);
```

### 11. critical_deadlines (학생 마감일 자동 추적)
```sql
CREATE TABLE critical_deadlines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  deadline_type   VARCHAR(30) NOT NULL,
  -- 'offer_acceptance' / 'tuition' / 'visa' / 'coe' / 'oshc' /
  -- 'isat_test' / 'mmi_interview' / 'gamsat' / 'departure'
  deadline_date   DATE NOT NULL,
  status          VARCHAR(20) DEFAULT 'upcoming',
  -- 'upcoming' / 'd-7' / 'd-3' / 'd-1' / 'd-day' / 'expired' / 'completed'
  auto_alert_sent JSONB DEFAULT '[]',
  -- [{type: 'd-7', sent_at: '...'}, ...]
  wilson_notified BOOLEAN DEFAULT false,
  note            TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deadlines_student ON critical_deadlines(student_id);
CREATE INDEX idx_deadlines_date ON critical_deadlines(deadline_date);
CREATE INDEX idx_deadlines_status ON critical_deadlines(status);
```

### 12. quotes (견적서) ⭐ 신규
```sql
CREATE TABLE quotes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES students(id) ON DELETE CASCADE,
  created_by        UUID REFERENCES users(id),
  
  -- 학교 1~3개 선택
  selected_schools  JSONB NOT NULL,
  -- [{school_id, program, tuition_per_year, duration_years}, ...]
  
  -- 자동 항목 8개
  items             JSONB NOT NULL,
  -- {
  --   tuition: {school_id: amount},
  --   living: {city, monthly, yearly},
  --   visa_500_fee: 2000,
  --   oshc: {yearly},
  --   flight: {one_way, round_trip},
  --   settlement: {deposit, books, furniture},
  --   wilson_fee_credit: 50000,  // 진학 시 100% 차감 표시
  --   exchange_rate: 920  // 실시간
  -- }
  
  total_aud         DECIMAL(12, 2),
  total_krw         INTEGER,
  
  status            VARCHAR(20) DEFAULT 'draft',
  -- 'draft' / 'sent' / 'accepted' / 'expired'
  
  pdf_url           TEXT,
  sent_at           TIMESTAMP,
  
  -- snapshot 보존 (정책 변경 시 영향 X)
  policy_snapshot   JSONB,
  
  note              TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quotes_student ON quotes(student_id);
CREATE INDEX idx_quotes_status ON quotes(status);
```

---

## D-4. 학교·콘텐츠 마스터 (테이블 13~16)

### 13. schools (학교 마스터 / master_v2_clean 동기화 (정비 완료 정본))
```sql
CREATE TABLE schools (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id           VARCHAR(50) UNIQUE,  -- master_v2_clean.json 매핑
  name                VARCHAR(255) NOT NULL,
  type                VARCHAR(30),
  -- 'university' / 'foundation' / 'elicos' / 'tafe' /
  -- 'private_college' / 'diploma' / 'vocational' / 'under18' / 'closed'
  city                VARCHAR(50),
  state               VARCHAR(20),
  cricos_code         VARCHAR(50),
  
  -- 인증
  anmac_certified     BOOLEAN,    -- 간호 학생용
  
  -- 학비 (현재 / snapshot은 update_logs에)
  tuition_2026        JSONB,
  -- {bachelor: 30000, master: 35000, diploma: 20000}
  
  -- master_v2_clean 정본 데이터 (1,235 전공 / 109 표준화 학교명)
  programs            JSONB,
  blocking_rules      TEXT[],
  
  -- 정책 변경 추적
  last_verified_at    TIMESTAMP,
  official_url        TEXT,
  
  -- 모니터링
  monitor_priority    VARCHAR(20),
  -- 'critical' (6h) / 'high' (24h) / 'normal' (7d)
  
  status              VARCHAR(20) DEFAULT 'active',
  -- 'active' / 'closed' / 'verify_needed'
  
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schools_type ON schools(type);
CREATE INDEX idx_schools_city ON schools(city);
CREATE INDEX idx_schools_status ON schools(status);
```

### 14. internal_faqs (학생 카드용 FAQ 84 / 4필드 분리)
```sql
CREATE TABLE internal_faqs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id              VARCHAR(100) UNIQUE,
  -- 'scenario_01_검정고시_명문대' / 'school_USyd' / 'region_시드니' 등
  
  module_type         VARCHAR(30) NOT NULL,
  -- 'scenario' / 'school' / 'region' / 'major' / 'visa_pr'
  
  category            VARCHAR(50),
  -- '검정고시' / '고졸' / 'G8' / '시드니' / '간호' / '학생비자_500' 등
  
  question            VARCHAR(500),
  
  -- 4필드 분리 (3중 보안 핵심)
  card_text           TEXT,        -- ✅ 학생 카드용 / 친근 톤 / 학생 OK
  internal_data       TEXT,        -- 🔴 직원 전용 / 학생 절대 X
  wilson_note         TEXT,        -- 🔴🔴 Wilson 전용 / 직원도 X
  
  -- 매칭 메타데이터
  matching_keywords   TEXT[],
  matching_cards      INTEGER[],   -- [1,3,5] = 카드 1, 3, 5에 사용
  matching_6vars      JSONB,
  -- {education: ['검정고시'], major: ['간호'], english: ['7.0+']}
  
  -- 시나리오 모듈 호출 (시나리오 타입만)
  required_modules    JSONB,
  -- {schools: [...], regions: [...], majors: [...], visa_pr: [...]}
  
  last_updated_at     TIMESTAMP,
  source_file         VARCHAR(255),
  -- '01_시나리오/01_검정고시/09_간호.md' 등
  
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faqs_module ON internal_faqs(module_type);
CREATE INDEX idx_faqs_category ON internal_faqs(category);
CREATE INDEX idx_faqs_faq_id ON internal_faqs(faq_id);
```

### 15. staff_manuals (직원 매뉴얼 475)
```sql
CREATE TABLE staff_manuals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_number   INTEGER UNIQUE,  -- #001 ~ #475
  title           VARCHAR(500) NOT NULL,
  case_summary    TEXT,
  categories      TEXT[],
  -- '검정고시' / '간호' / '시드니' / 'PR' / 'TAFE' 등
  keywords        TEXT[],
  
  content_md      TEXT NOT NULL,   -- 원본 마크다운 보존
  
  source_file     VARCHAR(255),    -- 'manual_001_검정고시_간호_시드니.md'
  created_at      TIMESTAMP DEFAULT NOW(),
  last_updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_manuals_number ON staff_manuals(manual_number);
CREATE INDEX idx_manuals_categories ON staff_manuals USING GIN(categories);
CREATE INDEX idx_manuals_keywords ON staff_manuals USING GIN(keywords);
```

### 16. graduates (졸업생)
```sql
CREATE TABLE graduates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id),
  final_school        VARCHAR(255),
  final_program       VARCHAR(255),
  graduated_at        DATE,
  
  -- PR 추적
  pr_status           VARCHAR(30),
  -- 'studying' / '485_visa' / 'sponsored' / '189_independent' /
  -- '190_state' / '491_regional' / 'pr_granted' / 'returned_korea'
  pr_granted_at       DATE,
  pr_subclass         VARCHAR(20),
  
  -- 후기·동의
  testimonial         TEXT,
  contact_consent     BOOLEAN DEFAULT false,
  display_consent     BOOLEAN DEFAULT false,  -- 사이트 메인 후기 슬라이드
  
  -- 연락 유지
  current_email       VARCHAR(255),
  current_kakao       VARCHAR(100),
  
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grads_pr_status ON graduates(pr_status);
```

---

## D-5. 관리·운영 (테이블 17~21)

### 17. commissions (커미션 자동)
```sql
CREATE TABLE commissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
  school_id           UUID REFERENCES schools(id),
  amount_aud          DECIMAL(10, 2),
  commission_rate     DECIMAL(5, 2),       -- 0.10 = 10%
  calculated_amount   DECIMAL(10, 2),
  status              VARCHAR(20),
  -- 'pending' / 'invoiced' / 'received'
  received_at         TIMESTAMP,
  counselor_id        UUID REFERENCES users(id),
  partner_ref         VARCHAR(50),
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commissions_student ON commissions(student_id);
CREATE INDEX idx_commissions_status ON commissions(status);
```

### 18. notifications (카톡 알림 큐)
```sql
CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID REFERENCES students(id) ON DELETE CASCADE,
  stage               INTEGER,
  event_type          VARCHAR(50),
  -- 'stage_3_quote_sent' / 'stage_8_offer_received' / 'd-7_deadline' 등
  message_template    TEXT,
  channel             VARCHAR(30) NOT NULL,
  -- 'kakao_alimtalk' / 'kakao_friend' / 'manual' / 'email' / 'sms'
  status              VARCHAR(20) DEFAULT 'pending',
  -- 'pending' / 'sent' / 'failed' / 'delivered' / 'read'
  sent_by             UUID REFERENCES users(id),
  sent_at             TIMESTAMP,
  error_message       TEXT,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifs_student ON notifications(student_id);
CREATE INDEX idx_notifs_status ON notifications(status);
```

### 19. update_logs (DB 업데이트 이력)
```sql
CREATE TABLE update_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name      VARCHAR(50) NOT NULL,
  record_id       UUID NOT NULL,
  field_changed   VARCHAR(100),
  old_value       JSONB,
  new_value       JSONB,
  source          VARCHAR(50),
  -- 'wilson_upload' / 'auto_monitor' / 'wilson_manual' / 'case_input' / 'student_action'
  source_url      TEXT,
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_table ON update_logs(table_name, record_id);
CREATE INDEX idx_logs_created ON update_logs(created_at DESC);
```

### 20. activity_logs (직원 활동 추적)
```sql
CREATE TABLE activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  action_type     VARCHAR(50) NOT NULL,
  -- 'view_student' / 'edit_note' / 'send_kakao' / 'create_quote' /
  -- 'unauthorized_access' / 'login' / 'export_data'
  target_table    VARCHAR(50),
  target_id       UUID,
  details         JSONB,
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_action ON activity_logs(action_type);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
```

### 21. issues (이슈·컴플레인 트래킹)
```sql
CREATE TABLE issues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID REFERENCES students(id),
  reported_by     UUID REFERENCES users(id),
  category        VARCHAR(30) NOT NULL,
  -- 'visa_rejection' / 'refund' / 'staff' / 'tech' / 'payment' / 'school'
  severity        VARCHAR(20) NOT NULL,
  -- 'low' / 'medium' / 'high' / 'critical'
  status          VARCHAR(20) DEFAULT 'open',
  -- 'open' / 'in_progress' / 'resolved' / 'closed'
  description     TEXT NOT NULL,
  assigned_to     UUID REFERENCES users(id),
  deadline        TIMESTAMP,
  resolved_at     TIMESTAMP,
  resolution_note TEXT,
  
  -- 학습 자산화
  learning_added_to_manual BOOLEAN DEFAULT false,
  manual_id       UUID REFERENCES staff_manuals(id),
  
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_student ON issues(student_id);
```

---

## D-6. 콘텐츠 마케팅 (테이블 22~23)

### 22. blog_posts (블로그)
```sql
CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(255) UNIQUE NOT NULL,
  title           VARCHAR(500) NOT NULL,
  content_md      TEXT NOT NULL,
  excerpt         TEXT,
  cover_image     TEXT,
  
  author_id       UUID REFERENCES users(id),
  category        VARCHAR(50),
  -- '간호' / 'IT' / '비자' / '생활' / '학교' / '후기' / '기타'
  tags            TEXT[],
  
  status          VARCHAR(20) DEFAULT 'draft',
  -- 'draft' / 'published' / 'scheduled' / 'archived'
  published_at    TIMESTAMP,
  scheduled_at    TIMESTAMP,
  
  -- 통계
  views           INTEGER DEFAULT 0,
  likes           INTEGER DEFAULT 0,
  
  -- SEO
  seo_title       VARCHAR(255),
  seo_description TEXT,
  seo_keywords    TEXT[],
  
  -- 연관
  youtube_embed_id  VARCHAR(100),
  related_card_ids  INTEGER[],
  related_faq_ids   UUID[],
  
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_status ON blog_posts(status);
CREATE INDEX idx_blog_category ON blog_posts(category);
CREATE INDEX idx_blog_published ON blog_posts(published_at DESC);
```

### 23. youtube_videos (유튜브 동기화)
```sql
CREATE TABLE youtube_videos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_video_id    VARCHAR(50) UNIQUE NOT NULL,
  title               VARCHAR(500),
  description         TEXT,
  thumbnail_url       TEXT,
  duration            INTEGER,    -- 초 단위
  published_at        TIMESTAMP,
  view_count          INTEGER,
  
  -- Wilson 분류
  category            VARCHAR(50),
  -- '간호' / 'IT' / '비자' / '생활' / 'Q&A' / '후기'
  related_card_ids    INTEGER[],
  
  -- 노출 제어
  is_featured         BOOLEAN DEFAULT false,
  is_visible          BOOLEAN DEFAULT true,
  
  last_synced_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_youtube_video_id ON youtube_videos(youtube_video_id);
CREATE INDEX idx_youtube_category ON youtube_videos(category);
```

---

## D-7. 의대 도구 (테이블 24~26)

### 24. isat_questions (ISAT 200문제)
```sql
CREATE TABLE isat_questions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id         VARCHAR(20) UNIQUE NOT NULL,
  -- 'CR-001' ~ 'CR-100' / 'QR-001' ~ 'QR-100'
  section             VARCHAR(10) NOT NULL,
  -- 'CR' (Critical Reasoning) / 'QR' (Quantitative Reasoning)
  difficulty          VARCHAR(20),
  -- 'easy' / 'medium' / 'hard'
  topic               VARCHAR(100),
  type                VARCHAR(50),
  
  passage             TEXT,
  question_text       TEXT NOT NULL,
  options             JSONB NOT NULL,    -- 4지선다
  correct_answer      INTEGER NOT NULL,  -- 0~3
  
  vocab               JSONB,             -- 단어 풀이
  explanation         TEXT,              -- 🔴 유료 학생만
  
  is_free_sample      BOOLEAN DEFAULT false,  -- 무료 10문제
  
  source_file         VARCHAR(255),
  approved_by         UUID REFERENCES users(id),
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_isat_section ON isat_questions(section);
CREATE INDEX idx_isat_free ON isat_questions(is_free_sample);
```

### 25. mmi_scenarios (MMI 40 스테이션)
```sql
CREATE TABLE mmi_scenarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id          INTEGER UNIQUE NOT NULL,    -- 1 ~ 40
  category            VARCHAR(30) NOT NULL,
  -- 'ethics' (8) / 'communication' (8) / 'teamwork' (8) /
  -- 'motivation' (6) / 'social' (10)
  category_label      VARCHAR(50),
  difficulty          VARCHAR(20),
  
  title               VARCHAR(255),
  scenario_text       TEXT NOT NULL,
  time_limit_seconds  INTEGER DEFAULT 240,        -- 4분
  prep_time_seconds   INTEGER DEFAULT 60,         -- 1분
  
  evaluation_criteria JSONB,
  -- {ethical: 30, empathy: 30, logic: 20, alternatives: 20}
  
  wilson_model_answer TEXT,           -- 🔴 유료 학생만
  ai_scoring_rubric   JSONB,
  
  is_free_sample      BOOLEAN DEFAULT false,  -- 무료 1 스테이션
  
  approved_by         UUID REFERENCES users(id),
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mmi_category ON mmi_scenarios(category);
CREATE INDEX idx_mmi_free ON mmi_scenarios(is_free_sample);
```

### 26. medical_tools_progress (학생 진행 추적)
```sql
CREATE TABLE medical_tools_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID REFERENCES students(id) ON DELETE CASCADE,
  tool_type             VARCHAR(20) NOT NULL,
  -- 'isat' / 'mmi'
  question_or_station   VARCHAR(50),
  -- 'CR-001' / 'QR-050' / 'mmi-1' 등
  
  student_answer        TEXT,
  ai_score              INTEGER,
  wilson_feedback       TEXT,           -- 유료만
  
  attempt_number        INTEGER DEFAULT 1,
  time_spent_seconds    INTEGER,
  completed_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_progress_student ON medical_tools_progress(student_id);
CREATE INDEX idx_progress_tool ON medical_tools_progress(tool_type);
```

---

## D-8. 자동화·설정 (테이블 27~28)

### 27. monitored_sites (사이트 모니터링 365개)
```sql
CREATE TABLE monitored_sites (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  url                 TEXT NOT NULL,
  category            VARCHAR(50),
  -- '학교' / '정책' / '은행' / '구직' / '한인' / '관광' / '의료' /
  -- '연봉' / '이력서·면접' / 'PR·취업비자' / '실용팁' / '생활'
  
  priority            VARCHAR(20) NOT NULL,
  -- 'critical' (6h) / 'high' (24h) / 'normal' (7d)
  check_frequency     INTEGER NOT NULL,  -- 시간 단위
  
  last_checked_at     TIMESTAMP,
  last_changed_at     TIMESTAMP,
  change_log          JSONB DEFAULT '[]',
  -- [{detected_at, change_summary, approved_by, approved_at}, ...]
  
  is_active           BOOLEAN DEFAULT true,
  notes               TEXT,
  
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_monitor_priority ON monitored_sites(priority);
CREATE INDEX idx_monitor_category ON monitored_sites(category);
CREATE INDEX idx_monitor_active ON monitored_sites(is_active) WHERE is_active = true;
```

### 28. site_settings (사이트 정보 / 푸터·영업시간 등) ⭐ 신규
```sql
CREATE TABLE site_settings (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(50) UNIQUE NOT NULL,
  value       TEXT,
  value_en    TEXT,                    -- 영문 사이트용
  category    VARCHAR(30),
  -- 'company' / 'contact' / 'business' / 'kakao' / 'pricing' / 'legal'
  is_public   BOOLEAN DEFAULT true,    -- 푸터 노출 여부
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 초기 데이터 (Wilson이 관리자 페이지에서 직접 입력)
INSERT INTO site_settings (key, value, value_en, category) VALUES
  ('company_name',     '[입력 필요]',         '[Enter]', 'company'),
  ('business_number',  '[입력 필요]',         '[Enter]', 'company'),
  ('representative',   'Wilson Kim',         'Wilson Kim (QEAC E240)', 'company'),
  ('address',          '[입력 필요]',         '[Enter]', 'contact'),
  ('phone',            '[입력 필요]',         '[Enter]', 'contact'),
  ('email',            '[입력 필요]',         '[Enter]', 'contact'),
  ('email_partnership', NULL,                'partnership@ausuhak.com', 'contact'),
  ('kakao_channel_url', 'https://pf.kakao.com/_GadTX', NULL, 'kakao'),
  ('business_hours',   '평일 10:00 ~ 18:00 (KST)', 'Mon-Fri 10:00-18:00 KST', 'business'),
  ('holidays',         '주말 / 공휴일 휴무',   'Closed weekends & public holidays', 'business'),
  ('price_pro',        '50000',              '50000', 'pricing'),
  ('price_medical',    '300000',             '300000', 'pricing');
```

### 29. branches (지사 정보 최대 3개) ⭐ 신규 (016)
```sql
CREATE TABLE branches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(20) UNIQUE NOT NULL,   -- 'branch_1' / 'branch_2' / 'branch_3'
  sort_order        INT NOT NULL DEFAULT 0,         -- 표시 순서
  name              VARCHAR(100),                   -- 한글 지사명 (NULL/빈문자 = 비활성)
  name_en           VARCHAR(100),
  address           TEXT,
  address_en        TEXT,
  phone             VARCHAR(30),
  email             VARCHAR(255),
  business_hours    VARCHAR(100),                   -- 예: '평일 10:00 ~ 18:00 (AEST)'
  business_hours_en VARCHAR(100),
  updated_by        UUID REFERENCES users(id),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- 초기 3 row (모두 비활성으로 시작 → admin에서 채움)
INSERT INTO branches (slug, sort_order) VALUES
  ('branch_1', 1),
  ('branch_2', 2),
  ('branch_3', 3);

-- RLS: 푸터/Contact 페이지에서 anon도 SELECT (활성 지사 표시용)
--      WRITE는 super_admin만
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY branches_public_select ON branches FOR SELECT USING (true);
CREATE POLICY branches_admin_write  ON branches FOR ALL    USING (is_super_admin());
```

> **별도 테이블 분리 사유**: site_settings에 24+ 행으로 쪼개면 key 네이밍이 복잡하고 (`branch1_name`, `branch1_name_en`, ...) "활성 지사 N개" 쿼리도 어려움. 별도 테이블이면 `SELECT * FROM branches WHERE name IS NOT NULL ORDER BY sort_order` 한 줄.

> **활성 판단**: `name` 컬럼 NULL/빈문자 = 비활성 (푸터/Contact 노출 X). 별도 `is_active` 컬럼 없음 — 단순화.

---

## D-9. RLS (Row Level Security) 정책 (3중 보안 1차)

### 학생 (role='student')
```sql
-- 본인 데이터만
CREATE POLICY students_own_data ON students
  FOR SELECT USING (user_id = auth.uid());

-- 본인 결제만
CREATE POLICY payments_own ON payments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- 본인 견적서만
CREATE POLICY quotes_own ON quotes
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- 학생은 internal_faqs / staff_manuals / student_notes 접근 X
-- (RLS로 차단)

-- ISAT/MMI = 유료 학생만 explanation / wilson_model_answer
-- (앱 레벨 + RLS 둘 다)
```

### 직원 (role='staff')
```sql
-- 담당 학생만 보기 (student_assignments 통해)
CREATE POLICY students_assigned ON students
  FOR SELECT USING (
    id IN (
      SELECT student_id FROM student_assignments 
      WHERE staff_id = auth.uid() 
        AND released_at IS NULL
    )
  );

-- 🔴 Wilson 전용 메모는 직원 절대 X
CREATE POLICY notes_staff_view ON student_notes
  FOR SELECT USING (
    visibility = 'shared_with_assigned' AND
    student_id IN (
      SELECT student_id FROM student_assignments 
      WHERE staff_id = auth.uid() 
        AND released_at IS NULL
        AND role IN ('primary', 'shared')
    )
  );
```

### Wilson Super Admin (role='super_admin')
```sql
-- 모든 데이터 접근 (모든 RLS 정책 우회)
CREATE POLICY super_admin_all ON students
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin')
  );
```

---

## D-10. 마이그레이션 순서 (Phase 1 빌드)

```
001_initial_users.sql           users + staff_permissions
002_initial_schools.sql          schools (master_v2_clean 임포트 (정비 완료 정본))
003_initial_students.sql         students + student_assignments
004_initial_lifecycle.sql        consultations + notes + applications +
                                 documents + payments + visa_cases +
                                 critical_deadlines + quotes
005_initial_faqs.sql             internal_faqs (FAQ 84 임포트)
006_initial_manuals.sql          staff_manuals (매뉴얼 475 임포트)
007_initial_graduates.sql        graduates
008_initial_ops.sql              commissions + notifications +
                                 update_logs + activity_logs + issues
009_initial_content.sql          blog_posts + youtube_videos
010_initial_medical.sql          isat_questions + mmi_scenarios +
                                 medical_tools_progress
011_initial_automation.sql       monitored_sites (365 임포트)
012_initial_settings.sql         site_settings
013_initial_rls.sql              모든 RLS 정책 활성화
014_auth_user_mirror.sql         auth.users → public.users 트리거
015_fix_auth_trigger.sql         014 트리거 강화 (case-insensitive / name fallback)
016_add_branches.sql             branches 테이블 (지사 최대 3개) ⭐
017_add_students_contact.sql     students.name/kakao_id/phone/email 컬럼 추가 ⭐
018_quotes_v2_full.sql           견적서 v2 (quote_type / 통화 분리 / 숙소·픽업 / 환율 기준일) ⭐
019_school_payment_cycle.sql     schools.payment_cycle 컬럼 추가 (initial backfill) ⭐
020_fix_schools_import.sql       schools 전체 재import (454교 / 14 카테고리 정확 매핑) ⭐⭐
```

> **020 배경**: 002_data_schools_seed.sql는 majors→unique school_name 방식이라 107교만 import + 모두 type='university'. master_v2_clean.json은 14개 카테고리 / 454교 (elicos_closed / under18 / cat30 / hsp 포함). 020은 카테고리 직접 순회로 type / payment_cycle / status 정확 매핑.

## D-4.2. schools v2 (020) 추가 컬럼 + ALTER

```sql
-- 컬럼 사이즈 확장 (1차 실행 시 master_id 50자 초과 7교 발견 → 200으로 확장)
ALTER TABLE schools ALTER COLUMN master_id  TYPE VARCHAR(200);
ALTER TABLE schools ALTER COLUMN city       TYPE VARCHAR(100);

-- 신규 컬럼
master_category   VARCHAR(50)  -- 원본 14개 카테고리 (universities_39, elicos_closed_18 등)
internal_notes    JSONB        -- ⚠️ INTERNAL ONLY. wilson_note, _is_avoid, _flag 등 학생 노출 X
```

> **컬럼 사이즈 운영 룰**: 학교명·과정명·도시명 = VARCHAR(50) 빡빡함. 향후 master_id 슬러그·도시 full name 대비 100~200으로 유지. CRICOS는 8-12자 / 충분.

### 14개 카테고리 매핑 (020)

| master_category | type | payment_cycle | status | 카운트 |
|---|---|---|---|---|
| universities_39 | university | semester | active | 39 |
| foundation_8 | foundation | split_2_3 | active | 8 |
| foundation_courses_32 | foundation | split_2_3 | active | 32 |
| elicos_operating_47 | elicos | lump_sum | active | 47 |
| elicos_closed_18 | elicos | lump_sum | **closed** | 18 |
| tafe_8_states | tafe | semester | active | 8 |
| diploma_verified_22 | diploma | semester | active | 22 |
| vocational_private_10 | vocational_private | split_2_3 | active | 10 |
| under18_schools_21 | under18 | quarterly | active | 21 |
| under18_public_6states | under18 | quarterly | active | 6 |
| cat30_new_223 | vocational_private | split_2_3 | **verify_needed** | 223 |
| hsp_private_elicos_15 | elicos | lump_sum | active | 15 |
| hsp_government_5 | under18 | quarterly | active | 5 |
| operations_verified_13 | (SKIP / 학교 아닌 운영 검증 노트) | - | - | - |
| **합계** | — | — | — | **454** |

> **검증 쿼리**: `SELECT * FROM v_schools_payment_cycle_check;` → 13개 master_category row × 정확 카운트 확인.

## D-29.1. quotes v2 (018) 추가 컬럼

```sql
-- 견적서 종류 (사양서 [2])
quote_type           VARCHAR(20) NOT NULL DEFAULT 'consultation'
                     CHECK (quote_type IN ('consultation', 'enrollment'))

-- 환율 기준일 (사양서 [4])
exchange_rate_date   DATE                       -- Wilson 수동 입력 시 오늘 자동 기록

-- KRW 항목 (사양서 [3])
airfare_krw          NUMERIC(12, 0) DEFAULT 0   -- 항공권 왕복
processing_fee_krw   NUMERIC(12, 0) DEFAULT 0   -- 별도 수속비 (기본 0)
processing_fee_reason TEXT                       -- ⚠️ INTERNAL ONLY / 학생 노출 절대 X

-- 숙소비 (사양서 [5])
accommodation_aud    NUMERIC(10, 2) DEFAULT 0   -- 주당 AUD
accommodation_type   TEXT CHECK (... IN ('homestay','dormitory','sharehouse','none'))

-- 픽업비 (사양서 [6])
pickup_aud           NUMERIC(10, 2) DEFAULT 0
pickup_type          TEXT CHECK (... IN ('none','school','private'))
```

> **items JSONB 잔존 필드**: `region` / `living_per_year_aud` / `oshc_per_year_aud` / `visa_500_aud` / `settlement_aud` / `consultation_fee_krw` / `exchange_rate_krw_per_aud`. 나머지 항목들은 quotes 컬럼으로 승격.

> **selected_schools JSONB shape (v2)**: `[{name, program, duration_years, tuition_per_year_aud, payment_cycle}, ...]` — payment_cycle은 학교 master에서 자동 매칭되거나 Wilson 직접 선택.

## D-4.1. schools v2 (019) 추가 컬럼

```sql
payment_cycle  VARCHAR(20) CHECK (... IN ('lump_sum','split_2_3','semester','quarterly'))
```

- 109교 backfill = `schools.type` 기반 자동 매핑 (PART E-6 [7] 매핑 표 참조)
- 학생/관리자 표시는 PART E-6 [7]의 안내 문구 사용

---

# ✅ PART D 끝
