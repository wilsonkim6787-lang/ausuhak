# 🎯 PART I. 의대 도구 (ISAT 200 + MMI 40 + 5진학루트)

> **URL**: `/medical` (한국어 / 영문 사이트엔 X)
> **타겟**: 호주 의대 지망 한국 학생
> **콘텐츠**: ISAT 200문제 + MMI 40 스테이션 + 5진학루트 + 21개 의대 정보
> **응대**: Wilson 직접 (직원 위임 X)
> **결제**: 의대 ₩300,000 (사이트 공개) / 풀 컨설팅 (사이트 비공개)

## I-1. /medical 페이지 구조

```
/medical
├─ Hero (호주 의대 준비 센터)
├─ 5진학루트 비교 (5개 카드)
├─ ISAT 무료 체험 (10문제)
├─ MMI 무료 체험 (1 스테이션)
├─ 호주 의대 21개 학교 정보
├─ 결제 유도 (의대 ₩300,000)
└─ 카톡 채널 CTA (Wilson 직접 응대)
```

## I-2. 5진학루트 (자세한 설명)

### 5루트 매핑 (master_v2 또는 별도 데이터)

```
1. direct      Year 12 / IB / 수능 직접 지원
2. undergrad   호주 학사 후 Graduate Entry MD
3. graduate    학사 + MCAT (해외 의대 / 미국식)
4. converter   한국 의사 → AMC 시험
5. transfer    한국 의대 재학생 → 호주 의대 재지원
```

### 루트 1: Direct (Year 12 / IB / 수능)

```
대상: 한국 고등학생 / 검정고시 학생 / IB 학생
기간: 5~6년 (Bachelor of Medicine 학부 직진)
난이도: ⭐⭐⭐⭐⭐ (가장 어려움)

요건:
   - ATAR 99+ (호주 Year 12) 또는
   - IB 42~44+ 또는
   - 수능 / SAT 우수 점수
   - IELTS 7.0 (각 영역 7.0)
   - ISAT 또는 UCAT 응시 (학교별)
   - MMI 인터뷰 통과

운영 학교:
   - University of Adelaide (Bachelor of Medicine + Surgery)
   - Western Sydney University (Joint Program with Charles Sturt)
   - Monash University (MD Direct from Year 12)
   - University of New South Wales (UNSW Medicine)
   - University of Western Australia (UWA - Year 12 Direct)
   
   * master_v2_clean에서 정확한 21개 학교 데이터 사용

프로그램 흐름:
   Year 12 / IB 졸업
        ↓
   Bachelor of Medicine 5~6년
        ↓
   Internship 1년
        ↓
   Resident 2~3년
        ↓
   Specialist Training (선택)
        ↓
   Specialist (호주 의사 면허)
```

### 루트 2: Undergrad → Graduate Entry MD

```
대상: 호주 학사 졸업 후 MD 진학
기간: 7~8년 (학사 3년 + MD 4년)
난이도: ⭐⭐⭐⭐ (한국 학생 인기)

요건:
   - 호주 학사 (Bachelor) 졸업
   - GPA 5.5/7.0+ (학교별)
   - GAMSAT (Graduate Australian Medical School Admissions Test)
   - IELTS 7.0
   - GEMSAS 지원 (해당 학교)
   - MMI 인터뷰

운영 학교:
   - University of Sydney (USyd MD)
   - Monash University (MD Graduate Entry)
   - University of Melbourne (UMelb MD)
   - University of Queensland (UQ MD)
   - Australian National University (ANU MD)
   - Deakin University (Deakin MD)
   - Flinders University (Flinders MD)
   - Griffith University (Griffith MD)
   - University of Notre Dame (Sydney / Fremantle)
   - University of Wollongong (UoW MD)

전공 추천 (학사):
   - Bachelor of Biomedicine (UMelb / Monash)
   - Bachelor of Medical Science
   - Bachelor of Science (Biology / Chemistry)
   - 기타 GPA 높이 받을 수 있는 전공

프로그램 흐름:
   호주 학사 3년 (Bachelor of Biomedicine 등)
        ↓
   GAMSAT 응시 + GPA 5.5+
        ↓
   GEMSAS 지원 (Graduate Entry Medical School Admissions System)
        ↓
   MMI 인터뷰
        ↓
   MD 4년
        ↓
   Internship → Resident → Specialist
```

### 루트 3: Graduate (학사 + MCAT)

```
대상: 한국 학사 졸업자 (해외 의대 의도)
기간: 한국 학사 + MCAT 1년 + 미국/호주 의대
난이도: ⭐⭐⭐⭐⭐ (MCAT 매우 어려움)

요건:
   - 한국 학사 졸업
   - MCAT (Medical College Admission Test) 510+ 권장
   - IELTS 7.0
   - 학사 GPA 3.5/4.0+

비고:
   - 호주 = 주로 GAMSAT 사용 (MCAT 인정 학교 제한적)
   - 미국 의대 진학자가 주로 사용
   - 호주 의대 진학 = 루트 2 (GAMSAT) 권장
```

### 루트 4: Converter (한국 의사 → AMC)

```
대상: 한국 의사 면허 보유자
기간: 1~3년 (AMC 시험 + Internship)
난이도: ⭐⭐⭐⭐ (AMC 시험 매우 어려움)

요건:
   - 한국 의사 면허 (M.D. 졸업장 + 면허)
   - 한국에서 인턴 1년 + 레지던트 경력 (선호)
   - IELTS 7.0 (각 7.0) — 의료 OET도 가능
   - AMC MCQ (Multiple Choice Questions) — 1차
   - AMC Clinical Examination — 2차
   - Workplace-Based Assessment 또는 Internship

프로그램 흐름:
   한국 의사 면허 보유
        ↓
   AMC MCQ 응시 (200문제 / 컴퓨터 시험 / 통과율 30~40%)
        ↓
   AMC Clinical 응시 또는 1년 Internship in Australia
        ↓
   AHPRA Registration (호주 의사 면허)
        ↓
   호주 의사로 활동

비고:
   - AMC = Australian Medical Council
   - 한국 의사 일부 = 호주 의사 면허 받음
   - 시간 / 비용 큰 투자 / Wilson 1:1 자세한 상담 필수
```

### 루트 5: Transfer (한국 의대생 → 호주 의대 재지원)

```
대상: 한국 의대 재학생 (1~6학년)
기간: 호주 의대 처음부터 다시 4~6년
난이도: ⭐⭐⭐⭐ (학점 인정 X / 처음부터)

요건:
   - 한국 의대 재학 中 (학년 무관)
   - 호주 의대 재지원 (직접 또는 GAMSAT)
   - 학점 인정 거의 X (호주 의대 = 처음부터 다시)
   - IELTS 7.0
   - GPA 우수

비고:
   - 한국 의대 → 호주 의대 = 학점 인정 매우 제한적
   - 사실상 처음부터 다시 시작
   - Wilson 1:1 상담 필수 (학생 케이스마다 다름)
```

## I-3. ISAT 200문제 시스템

### ISAT 개요

```
ISAT (International Student Admissions Test)
   ├─ 호주 의대 입학 시험
   ├─ Critical Reasoning (CR) 100문제
   └─ Quantitative Reasoning (QR) 100문제

운영 학교:
   ├─ University of New South Wales (UNSW Medicine)
   ├─ University of Adelaide
   └─ Charles Sturt / Western Sydney (Joint Program)

문제 유형:
   - 4지선다
   - CR: 논리·비판적 사고
   - QR: 수학·통계·그래프 해석
```

### DB 구조 (PART D 테이블 24)

```sql
CREATE TABLE isat_questions (
  id                  UUID PRIMARY KEY,
  question_id         VARCHAR(20) UNIQUE,  -- 'CR-001' / 'QR-100'
  section             VARCHAR(10) CHECK (section IN ('CR', 'QR')),
  difficulty          VARCHAR(20),
  topic               VARCHAR(100),
  type                VARCHAR(50),
  passage             TEXT,
  question_text       TEXT,
  options             JSONB,             -- 4지선다
  correct_answer      INTEGER,           -- 0~3
  vocab               JSONB,             -- 단어 풀이
  explanation         TEXT,              -- 🔴 유료만
  is_free_sample      BOOLEAN,           -- 무료 10문제
  approved_by         UUID,
  created_at          TIMESTAMP
);
```

### 무료 체험 (10문제) — 사이트 노출

```
무료 학생:
   ├─ ISAT 10문제 (CR 5 + QR 5)
   ├─ 4지선다 풀이
   ├─ 정답·해설 = 노출 (간단)
   └─ vocab = 노출
   
체험 후:
   ├─ "200문제 전체 + 자세한 해설 = 의대 ₩300,000"
   └─ 카톡 채널 CTA
```

### 유료 학생 (200문제 전체)

```
의대 ₩300,000 결제 후:
   ├─ ISAT 200문제 전체 (CR 100 + QR 100)
   ├─ 정답·자세한 해설
   ├─ vocab + 학습 가이드
   ├─ AI 채점 (학생 진행률 자동 추적)
   ├─ Wilson 직접 피드백 (오답 분석)
   └─ 학생 진행률 → medical_tools_progress 테이블 저장
```

### 화면 구성

```
[/medical/isat]

┌──────────────────────────────────────────────────┐
│  🎯 ISAT 200문제                                 │
│  ─────────────────                                │
│  CR (Critical Reasoning): 100문제                │
│  QR (Quantitative Reasoning): 100문제            │
│                                                  │
│  무료 학생: 10문제                                │
│  유료 학생 (의대 ₩300,000): 200문제 전체           │
│                                                  │
│  [무료 체험 시작] [의대 패키지 결제]              │
└──────────────────────────────────────────────────┘
        ↓ (학생이 시작 클릭)
┌──────────────────────────────────────────────────┐
│  Question 1 of 10 (무료) / 1 of 200 (유료)      │
│  ─────────────────                                │
│  Section: Critical Reasoning                     │
│  Difficulty: Medium                              │
│  Topic: Logical Inference                        │
│                                                  │
│  [Passage]                                       │
│  ...                                             │
│                                                  │
│  [Question]                                      │
│  ...                                             │
│                                                  │
│  ○ A. ...                                       │
│  ○ B. ...                                       │
│  ○ C. ...                                       │
│  ○ D. ...                                       │
│                                                  │
│  [Previous] [Skip] [Submit Answer]               │
└──────────────────────────────────────────────────┘
        ↓ (Submit)
┌──────────────────────────────────────────────────┐
│  ✅ 정답: B                                       │
│  ─────────────────                                │
│  해설: ...                                       │
│  Vocab: ...                                      │
│                                                  │
│  진행률: 1/10 (또는 1/200)                        │
│                                                  │
│  [Next Question]                                 │
└──────────────────────────────────────────────────┘
        ↓ (10문제 끝나면 - 무료 학생)
┌──────────────────────────────────────────────────┐
│  🎯 무료 체험 완료!                              │
│  점수: 7/10 (70%)                                │
│                                                  │
│  CR: 4/5  QR: 3/5                                │
│  약점 영역: Quantitative                          │
│                                                  │
│  ⭐ 200문제 전체 + Wilson 피드백:                  │
│  의대 패키지 ₩300,000                             │
│                                                  │
│  [💬 카톡 채널로 문의 (Wilson 직접)]              │
│  [💳 의대 패키지 결제]                            │
└──────────────────────────────────────────────────┘
```

### 학생 진행률 추적 (medical_tools_progress)

```sql
CREATE TABLE medical_tools_progress (
  id                    UUID PRIMARY KEY,
  student_id            UUID,
  tool_type             VARCHAR(20),  -- 'isat' / 'mmi'
  question_or_station   VARCHAR(50),  -- 'CR-001' / 'mmi-1'
  student_answer        TEXT,
  ai_score              INTEGER,
  wilson_feedback       TEXT,         -- 유료만
  attempt_number        INTEGER,
  time_spent_seconds    INTEGER,
  completed_at          TIMESTAMP
);
```

### Wilson 피드백 (유료 학생)

```
[학생이 ISAT 1문제 풀고 오답]
        ↓
[AI 자동 채점 + 학생에게 즉시 노출]
   "정답: B / 학생 답: C"
        ↓
[Wilson 알림 = 학생 약점 영역]
   "학생 #001: QR 그래프 해석 약점 (3문제 연속 오답)"
        ↓
[Wilson 1-Click 피드백 작성]
   "그래프 해석 = X축 단위 먼저 확인 / Y축 비례..."
        ↓
[학생 화면에 Wilson 피드백 추가]
```

## I-4. MMI 40 스테이션 시스템

### MMI 개요

```
MMI (Multiple Mini Interview)
   ├─ 호주 의대 인터뷰 형식
   ├─ 1분 준비 + 4분 답변 (5분/스테이션)
   └─ 5~10개 스테이션 통과

평가 영역 (5개):
   ├─ Ethics (윤리 딜레마)         8 스테이션
   ├─ Communication (의사소통)      8 스테이션
   ├─ Teamwork (팀워크)            8 스테이션
   ├─ Motivation (의대 동기)         6 스테이션
   └─ Social (사회 이슈)           10 스테이션
```

### DB 구조 (PART D 테이블 25)

```sql
CREATE TABLE mmi_scenarios (
  id                  UUID PRIMARY KEY,
  station_id          INTEGER UNIQUE,    -- 1~40
  category            VARCHAR(30),
  -- 'ethics' / 'communication' / 'teamwork' / 'motivation' / 'social'
  category_label      VARCHAR(50),
  difficulty          VARCHAR(20),
  title               VARCHAR(255),
  scenario_text       TEXT,
  time_limit_seconds  INTEGER DEFAULT 240,    -- 4분
  prep_time_seconds   INTEGER DEFAULT 60,     -- 1분
  evaluation_criteria JSONB,
  -- {ethical: 30, empathy: 30, logic: 20, alternatives: 20}
  wilson_model_answer TEXT,           -- 🔴 유료만
  ai_scoring_rubric   JSONB,
  is_free_sample      BOOLEAN,         -- 무료 1 스테이션
  approved_by         UUID,
  created_at          TIMESTAMP
);
```

### 무료 체험 (1 스테이션) — 사이트 노출

```
무료 학생:
   ├─ MMI 1 스테이션 (예: "친구의 부정행위" 윤리 딜레마)
   ├─ 1분 준비 + 4분 답변 (타이머)
   ├─ 학생 답변 = 텍스트 / 음성 녹음
   ├─ 평가 기준 = 노출 (간단)
   └─ 모범답안 구조 = 간단 노출
   
체험 후:
   ├─ "40 스테이션 + Wilson 모범답안 = 의대 ₩300,000"
   └─ 카톡 채널 CTA
```

### 유료 학생 (40 스테이션 전체)

```
의대 ₩300,000 결제 후:
   ├─ MMI 40 스테이션 전체
   ├─ Wilson 모범답안 (자세한 답변 구조)
   ├─ 평가 기준 자세한 설명
   ├─ AI 채점 (학생 답변 분석)
   ├─ Wilson 1:1 인터뷰 모의 (영상 / 옵션)
   └─ 학생 진행률 → medical_tools_progress 저장
```

### 화면 구성

```
[/medical/mmi]

┌──────────────────────────────────────────────────┐
│  🎤 MMI 40 스테이션                              │
│  ─────────────────                                │
│  무료 학생: 1 스테이션                            │
│  유료 학생: 40 스테이션 전체                      │
│                                                  │
│  카테고리:                                        │
│   ⚖️ 윤리 딜레마: 8                              │
│   💬 의사소통: 8                                 │
│   🤝 팀워크: 8                                   │
│   🎯 의대 동기: 6                                │
│   🌍 사회 이슈: 10                               │
│                                                  │
│  [무료 체험 시작] [의대 패키지 결제]              │
└──────────────────────────────────────────────────┘
        ↓ (학생이 시작 클릭)
┌──────────────────────────────────────────────────┐
│  ⏰ 1분 준비 시간                                 │
│  ─────────────────                                │
│  Station 1: ⚖️ 친구의 부정행위                    │
│                                                  │
│  Scenario:                                       │
│  "의대 동기 친구가 중요한 시험에서                │
│   컨닝을 도와달라고 부탁합니다.                    │
│   친구는 가정 형편이 어려워..."                   │
│                                                  │
│  당신은 어떻게 대처하시겠습니까?                   │
│  그리고 그 이유는 무엇입니까?                      │
│                                                  │
│  [⏱️ 60초 카운트다운]                             │
│  → 1분 후 자동으로 답변 시간 시작                 │
└──────────────────────────────────────────────────┘
        ↓ (1분 후)
┌──────────────────────────────────────────────────┐
│  🎤 4분 답변 시간                                 │
│  ─────────────────                                │
│  ⏱️ 04:00 카운트다운                              │
│                                                  │
│  [텍스트 입력] 또는 [🎙️ 음성 녹음]               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 답변 입력...                                │ │
│  │                                            │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [Submit Answer]                                 │
└──────────────────────────────────────────────────┘
        ↓ (Submit / 4분 종료)
┌──────────────────────────────────────────────────┐
│  ✅ 답변 완료                                     │
│  ─────────────────                                │
│  학생 답변: ...                                  │
│                                                  │
│  평가 기준:                                       │
│   - 윤리적 판단 (30%)                             │
│   - 공감력 (30%)                                  │
│   - 논리적 설명 (20%)                             │
│   - 대안 제시 (20%)                               │
│                                                  │
│  AI 점수: 75/100                                 │
│                                                  │
│  Wilson 모범답안 (유료만):                        │
│  "① 공감 표현: 친구의 어려운 상황에 깊이 공감... │
│   ② 원칙 입장: 하지만 컨닝은 분명히 거절...      │
│   ③ 대안 제시: 대신 친구를 다른 방법으로 돕고..." │
│                                                  │
│  [다음 스테이션] [의대 패키지 결제]               │
└──────────────────────────────────────────────────┘
```

## I-5. 호주 의대 21개 학교 정보

### 정보 노출 (무료 / 누구나)

```
[/medical 페이지 안에]

호주 의대 21개 학교:
   ├─ Group of Eight (G8) MD: 7~8개
   │   - University of Sydney
   │   - University of Melbourne
   │   - Monash University
   │   - University of Queensland
   │   - University of Adelaide
   │   - Australian National University
   │   - University of Western Australia
   │   - University of New South Wales (UNSW)
   ├─ Non-G8 MD: 10~13개
   │   - Deakin / Flinders / Griffith / Notre Dame /
   │     Wollongong / Newcastle / Tasmania 등
   └─ Direct from Year 12: 2~3개
       - Adelaide / Western Sydney / UWA

학교별 정보 (master_v2_clean에서):
   - Bachelor / Graduate Entry MD 형태
   - ATAR / GPA / IELTS 요건
   - ISAT / GAMSAT 요구 여부
   - MMI 인터뷰 형식
   - 학비 (2026)
   - 위치 (시드니/멜번/...)
   - 정원 / 한국 학생 비율
```

### 학교 카드 (UI)

```
┌──────────────────────────────────────────────────┐
│  🏥 University of Sydney - MD (Graduate Entry)   │
│  ─────────────────                                │
│  형태: Graduate Entry MD (4년)                    │
│  요건:                                            │
│   - 학사 GPA 5.5/7.0+                            │
│   - GAMSAT 60+                                    │
│   - IELTS 7.0 (각 영역 7.0)                       │
│   - GEMSAS 지원                                   │
│   - MMI 인터뷰                                    │
│                                                  │
│  학비: AUD ~$83,000/년                            │
│  위치: Sydney NSW                                  │
│                                                  │
│  → 자세한 분석은 1:1 상담에서                     │
└──────────────────────────────────────────────────┘
```

## I-6. 결제 흐름 (의대 ₩300,000)

```
[학생이 무료 체험 / 5루트 / 21개 학교 봄]
        ↓
[관심 高 → 카톡 채널 CTA 클릭 또는 결제]
        ↓
[Stage 1: 카톡 1차 상담 30분 무료 (Wilson 직접)]
   ├─ 학생 학력 / Year 12 / IB / 수능 / 한국 학사 확인
   ├─ 5진학루트 中 학생 맞는 1~2개 안내
   └─ 의대 패키지 ₩300,000 또는 풀 컨설팅 권유
        ↓
[Stage 2: 결제 (의대 ₩300,000 또는 풀 컨설팅)]
   ├─ Phase 1~4: Wilson 카톡 입금 안내 (수동)
   └─ Phase 5+: Toss Payments 자동
        ↓
[자동 회원가입 + 의대 패키지 권한 활성화]
   - students.medical_package_access = true
   - students.medical_package_paid_at = NOW()
        ↓
[학생 마이페이지에서 의대 콘텐츠 풀 액세스]
   ├─ ISAT 200문제 전체
   ├─ MMI 40 스테이션 전체
   ├─ Wilson 모범답안 / 피드백
   └─ 진행률 추적
```

## I-7. Wilson 직접 응대 (위임 X)

```
의대 학생 자동 분류 룰:
   IF 학생 6변수.전공 = "의료"
      OR 진입 경로 = /medical
      OR 카톡에 "의대" 키워드
   → is_medical = true
   → Wilson 직접 응대 (직원 위임 X)
        ↓
[Wilson 폰 알림]
   "신규 의대 학생 ○○님
    - 학력: 검정고시 / 고졸 / 대졸 / 한국 학사 / 한국 의사
    - 5루트 中: direct / undergrad / graduate / converter / transfer
    - 무료 체험: ISAT 7/10 (QR 약점) / MMI 1 (점수 75)
    - [응대 시작]"
        ↓
[Wilson 직접 카톡 응대]
   ├─ 학생 학력 분석
   ├─ 5루트 中 1~2개 추천
   ├─ ATAR / GAMSAT / IELTS 요건 확인
   └─ 의대 패키지 또는 풀 컨설팅 결정
```

## I-8. 의대 학생 Stage (일반 학생과 동일 / Stage 7만 복잡)

```
Stage 1: 카톡 1차 상담 30분 (무료 / Wilson 직접)
Stage 2: 결제 (의대 ₩300,000 / 풀 컨설팅)
Stage 3: 1:1 상담 + ISAT/MMI 학습 시작 + 견적서
Stage 4: 학교 선정 + 다중 지원 (3~5개 의대)
Stage 5: 영어 준비 (IELTS 7.0+ 의대 표준)
Stage 6: 서류 수집 + Personal Statement
Stage 7: 학교 지원 (Application + ISAT + MMI + GAMSAT) ⭐ 의대만 복잡
Stage 8: Offer Letter (MMI 인터뷰 통과 후)
Stage 9: 학비 송금 + CoE
Stage 10: 학생비자 500
Stage 11: 출국 준비
Stage 12: 호주 도착 + 임상 실습 + 시험 시즌 체크인
   ↓
🎓 졸업생 DB (호주 의사 / AHPRA Registration)
```

## I-9. /medical 보안 (3중 보안)

```
✅ 누구나 (무료):
   - 5진학루트 자세한 설명
   - 21개 의대 학교 정보
   - ISAT 10문제 (무료 체험)
   - MMI 1 스테이션 (무료 체험)
   - Wilson 19년 의대 케이스

❌ 무료 학생 X:
   - ISAT 200문제 전체
   - MMI 40 스테이션 전체
   - Wilson 모범답안 (전체)
   - Wilson 1:1 피드백
   - 인터뷰 모의

✅ 유료 학생 (의대 ₩300,000) OK:
   - 위 모든 것
   - 학생 마이페이지에서 영구 액세스

✅ 풀 컨설팅 학생 OK:
   - 위 모든 것
   - + Wilson 직접 모의 인터뷰
   - + 의대 ₩300,000 = 100% 차감
```

## I-10. ISAT/MMI 데이터 정본 = ausuhak_medical.html

```
빌드 시:
   ├─ /home/claude/work/ausuhak_medical.html
   │   - ISAT 200문제 (CR 100 + QR 100)
   │   - MMI 40 스테이션 (5 카테고리 × 6~10)
   │   - Wilson 모범답안
   └─ Claude Code가 isat_questions / mmi_scenarios 테이블에 임포트
        ↓
   DB 정본 = isat_questions + mmi_scenarios
        ↓
   사이트 빌드 시 임포트 1회 (마이그레이션 008)
```

---

# ✅ PART I 끝
