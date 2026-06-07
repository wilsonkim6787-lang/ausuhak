# 🎯 PART H. 카드 7장 매칭 알고리즘 (자동 시나리오 매칭)

> **핵심 원칙**: AI가 즉석에서 학교 추천 X / 미리 만들어둔 시나리오 매칭만
> **데이터 소스 6가지**: internal_faqs / schools / master_v2_clean.json / students / 매칭 엔진 / monitored_sites
> **성능 목표**: 카드 7장 렌더링 < 500ms

## H-0. master_v2_clean 정비 결과 (2026-05-08 / Wilson 검수 완료)

> **정본 파일**: `ausuhak_master_v2_clean.json` (3.0 MB)
> **변경로그**: `변경로그.md`

### 정비 통계
- 전공: 1,227 → **1,235개** (+8 / 100% 검수 완료)
- 학교명: 179종 → **109종** (중복 dedup / 표준화)
- 차단룰: 39개 (변동 없음)
- Wilson Alerts: 24개 (변동 없음)
- 한국 학생 자동 장학금 (✅): 671개 행
- 금지 표현: 0개

### Wilson 19년 사실 정정 (15개 핵심)
1. ❌ UNSW 간호 3개 코스 = 제거 (UNSW 간호학과 미운영)
2. ✅ Adelaide University = UoA + UniSA 통합 (2026.01)
3. ✅ QUT Brisbane = Cat 1 도시 변경 (2024.01부터)
4. ✅ Greater Perth = Cat 2 지방 (2022~) / PR +5/+15
5. ✅ AHPRA IELTS 7.0 (각 영역) 통일 (의료직군 전체)
6. ✅ PY 회계 종료 명시 (2025.3.31 / 2026.5.1)
7. ✅ Sport Management = Business 트랙 경고 (PR 평가 직군 X)
8. ❌ Swinburne MSW (AASW) 미운영 → 6개 학교로 정정
9. ✅ O-1A Master of Nursing Practice 6개 + O-1B Bachelor (Graduate Entry) 6개 분리
10. ✅ Flinders / ACU / JCU / UTAS = Master 미운영 → Bachelor (Graduate Entry)
11. ✅ MED-UQ 5개 → school_id '006' 통합
12. ✅ NURSE-D 13개 TAFE = 번호 prefix 제거
13. ✅ ECU Motorsports = Mechanical Engineering 명시
14. ✅ 173개 행 학교명 표준화 (정식명 + 약자)
15. ✅ _majors_count 자동 재계산 / 카운트 일치

### 카드 매칭 시 필수 확인
- 모든 학교 추천 = master_v2_clean.json에서만 (옛 master_v2 사용 X)
- UNSW 간호 추천 시도 = 자동 차단 (사실 오류 룰)
- Adelaide University = 통합 학교로 처리 (UoA / UniSA 별도 X)
- AHPRA 의료직군 = IELTS 7.0 (각 영역) 통일 적용

---

## H-1. 매칭 엔진 5단계 흐름

```
[학생 6변수 입력 완료]
        ↓
[매칭 엔진 호출 → /api/diagnose]
        ↓
┌────────────────────────────────────────────────┐
│ Step 1: 시나리오 매칭                            │
│   FAQ 36개 시나리오 中 1개 선택 (룰 기반)         │
│   매칭 키 = 학력 + 영어 + 전공 (3개 핵심)        │
└────────────────────────────────────────────────┘
        ↓
┌────────────────────────────────────────────────┐
│ Step 2: 모듈 조합                                │
│   시나리오가 명시한 모듈 호출:                    │
│   - 학교 모듈 1~3개 (24개 中)                    │
│   - 지역 모듈 1개 (8개 中)                       │
│   - 전공 모듈 1개 (10개 中)                      │
│   - 비자/PR 모듈 1~3개 (5개 中)                  │
└────────────────────────────────────────────────┘
        ↓
┌────────────────────────────────────────────────┐
│ Step 3: 카드 7장 자동 조립                       │
│   각 모듈의 PUBLIC 영역만 추출 → 7장 슬롯 분배   │
│   순서 = FAQ README 정본 (학교/지역/비용/연봉/PR/영어/절차) │
└────────────────────────────────────────────────┘
        ↓
┌────────────────────────────────────────────────┐
│ Step 4: 차단룰 자동 체크                         │
│   master_v2_clean.json 차단룰 39 + Wilson Alerts 24    │
│   위반 시 → Wilson Alert + 카드 경고 표시         │
└────────────────────────────────────────────────┘
        ↓
┌────────────────────────────────────────────────┐
│ Step 5: 학생용 콘텐츠만 노출 (3중 보안)          │
│   PUBLIC 영역만 / INTERNAL·Wilson note 제외      │
└────────────────────────────────────────────────┘
        ↓
[학생 결과 페이지 카드 7장 즉시 렌더링]
   /diagnose/result/[uuid]
```

## H-2. Step 1: 시나리오 매칭 (룰 기반)

### 매칭 키 우선순위 (3개 핵심)

```
1순위: 학력 (education) — 가장 중요
   - 검정고시 / 고졸 / 대학재학 / 대졸 / 워홀러
   - 시나리오 카테고리 직접 매핑

2순위: 전공 (major) — 전공별 분기
   - 간호 / IT / 비즈니스 / 공학 / 요리·호텔 / 유아교육 /
     디자인 / Trade / 의료 / 미정

3순위: 영어 (english_level) — 시나리오 변형
   - 없음 / 4.0-5.0 / 5.5 / 6.0 / 6.5 / 7.0+
```

### 매칭 룰 예시 (FAQ README 36개 시나리오 中)

```
IF education='검정고시' AND english_level≥'6.0' AND major='비즈니스'
   → '01_시나리오/01_검정고시/01_명문대_IELTS6.0이상_시드니_비즈니스.md'

IF education='검정고시' AND major='간호'
   → '01_시나리오/01_검정고시/09_간호.md'
   (PR 골든 트랙)

IF education='고졸' AND major='비즈니스'
   → '01_시나리오/02_고졸/07_비즈니스.md'

IF education='대학재학' AND english_level<'5.5'
   → '01_시나리오/03_대학재학/04_어학연수_패스웨이.md'

IF education='대졸' AND major='IT'
   → '01_시나리오/04_대졸PR/02_IT석사.md'
   (대졸 80% PR 의도 가정)

IF education='대졸' AND major='회계'
   → '01_시나리오/04_대졸PR/03_회계석사_PY폐지반영.md'
   ⚠️ PY 폐지 2026.5.1 / 지방 491 트랙 강력 추천

IF education='워홀러' AND english_level≥'5.5'
   → '01_시나리오/05_워홀러/01_PR전환.md'

IF age='18미만' AND education!='검정고시'
   → '01_시나리오/06_조기유학/01_초등생_조기유학.md'
   또는 02_중학생 / 03_고등학생 (나이 세분화)

IF major='의료' (의대 학생)
   → is_medical=true 자동 분류
   → /medical 페이지로 안내 (카드 7장과 별개)
```

### 매칭 안 되는 케이스

```
IF 위 룰 中 어느 것도 매칭 X
   → 가장 가까운 시나리오 1개 선택 (학력 우선)
   → 카드 7번 (CTA)에 강력 메시지 추가:
     "정확한 진단은 1:1 상담에서 → 카톡 채널로 30분 무료"
   → Wilson Alert 발생 ('unmatched_scenario')
```

### DB 쿼리 (PostgreSQL JSONB)

```sql
-- 시나리오 매칭 (단순화)
SELECT * FROM internal_faqs
WHERE module_type = 'scenario'
  AND matching_6vars @> jsonb_build_object(
    'education', jsonb_build_array(:education),
    'major',     jsonb_build_array(:major)
  )
  AND (
    matching_6vars->'english' IS NULL OR
    matching_6vars->'english' @> jsonb_build_array(:english_level)
  )
ORDER BY 
  -- 정확히 매칭된 변수 수가 많을수록 우선
  jsonb_array_length(matching_6vars->'english') DESC NULLS LAST
LIMIT 1;
```

## H-3. Step 2: 모듈 조합

### 시나리오의 `required_modules` 필드 (JSONB)

```json
// 시나리오 "01_검정고시/09_간호.md" 예시
{
  "schools": ["TAFE_NSW", "La_Trobe", "UniSA"],
  "regions": [],  // 학생 선택 지역 그대로
  "majors": ["간호"],
  "visa_pr": ["학생비자_500", "PR_경로_189_190_491"]
}
```

### 모듈 호출 함수 (TypeScript / Next.js API)

```typescript
// /src/lib/matching/modules.ts
async function loadModules(
  scenario: Scenario,
  studentRegion: string
): Promise<ModuleSet> {
  
  // 1. 학교 모듈 (시나리오에서 명시한 것 + 학생 지역 매칭)
  const schoolIds = scenario.required_modules.schools;
  const schools = await db.schools
    .findMany({ where: { master_id: { in: schoolIds } } });
  const schoolFAQs = await db.internal_faqs
    .findMany({ 
      where: { 
        module_type: 'school',
        faq_id: { in: schoolIds.map(id => `school_${id}`) }
      } 
    });
  
  // 2. 지역 모듈 (학생 선택 지역)
  const regionFAQ = await db.internal_faqs
    .findFirst({ 
      where: { 
        module_type: 'region',
        faq_id: `region_${studentRegion}`
      } 
    });
  
  // 3. 전공 모듈 (시나리오 명시)
  const majorFAQs = await db.internal_faqs
    .findMany({ 
      where: { 
        module_type: 'major',
        faq_id: { 
          in: scenario.required_modules.majors.map(m => `major_${m}`) 
        }
      } 
    });
  
  // 4. 비자/PR 모듈 (시나리오 명시)
  const visaPRFAQs = await db.internal_faqs
    .findMany({ 
      where: { 
        module_type: 'visa_pr',
        faq_id: { 
          in: scenario.required_modules.visa_pr.map(v => `visa_pr_${v}`) 
        }
      } 
    });
  
  return { schools, schoolFAQs, regionFAQ, majorFAQs, visaPRFAQs };
}
```

### 캐싱 전략 (성능)

```
Phase 1: 빌드 시 internal_faqs / schools 데이터 = 정적 임포트
   - /src/data/master_v2_clean.json
   - /src/data/faq/*.json
   → 빌드 시 메모리에 로드 / DB 호출 X / 즉시 응답

Phase 2 이후: DB 동적 로드 + 5분 캐시 (Vercel KV / Redis)
   - Wilson 매뉴얼·FAQ 수정 시 캐시 무효화
   - 사이트 모니터링 자동 갱신 → 캐시 자동 무효화
```

## H-4. Step 3: 카드 7장 자동 조립

### 카드별 데이터 출처 + 조립 로직

```typescript
// /src/lib/matching/assemble.ts
interface CardData {
  cardNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  icon: string;
  title: string;
  content: string;
  cta?: string;
  warnings?: string[];
}

function assembleCards(
  modules: ModuleSet,
  student: StudentInput,
  blockingResult: BlockingResult
): CardData[] {
  return [
    buildCard1_Schools(modules, student, blockingResult),
    buildCard2_Region(modules.regionFAQ, student.preferred_region),
    buildCard3_Cost(modules.schools, student.preferred_region),
    buildCard4_Salary(modules.majorFAQs, student.major),
    buildCard5_PR(modules.visaPRFAQs, student),
    buildCard6_English(modules.scenarioFAQ, student.english_level),
    buildCard7_CTA(student),
  ];
}
```

### 카드 1: 🎓 추천 학교 3개

```
데이터 소스:
   ├─ schools (학교 마스터)
   ├─ internal_faqs.school_*.card_text
   └─ master_v2_clean.blocking_rules (차단 학교 제외)

조립 로직:
   1. scenario.required_modules.schools 3개 학교 ID 가져옴
   2. 각 학교의 internal_faqs.card_text 추출 (200자)
   3. blocking_rules 위반 학교 = 제외 (차단 표시)
   4. ANMAC 인증 등 필수 체크 (간호일 경우)

출력 예시:
   "🎓 추천 학교 3곳:
    1. UTS - Master of Nursing
       ⭐ ANMAC 인증 / IELTS 7.0 (각 7.0)
    2. La Trobe - Master of Nursing
       ⭐ Trade-friendly / 입학 너그러움
    3. UniSA - Master of Nursing
       ⭐ 지방 +5점 / PR 빠름
    
    → 자세한 학비·기간·합격률은 1:1 상담에서"

⚠️ 절대 X:
   - 학교 자세한 설명 (1:1 상담 유도)
   - 외부 학교 사이트 URL (Ausuhak 안에 잡아두기)
   - "1순위 / 2순위" ranking
   - 차단 학교 추천
```

### 카드 2: 🏙️ 지역 정보

```
데이터 소스:
   ├─ internal_faqs.region_*.card_text
   ├─ master_v2_clean.cities (생활비 / 한인 커뮤니티)
   └─ monitored_sites (한인 29 + 관광 25 + 생활 93)

조립 로직:
   1. 학생 선택 지역 1개 → region_FAQ 호출
   2. master_v2 생활비 데이터 추가
   3. monitored_sites 출처 사이트명 표시 (URL X)

출력 예시:
   "🏙️ 시드니 정보:
    호주 최대 도시 (인구 540만)
    IT·금융·간호 일자리 풍부
    한인 커뮤니티 큰 편 (Strathfield 등)
    생활비: 월 $2,000~2,500 (1인 기준)
    단점: 학비·생활비 가장 높음
    
    → 다른 도시 비교 = 1:1 상담"

지역 선택 = "추천받기"인 경우:
   학생 6변수 + 시나리오 기반으로 Wilson 추천
   - 간호 PR → 애들레이드 (지방 +5점)
   - IT → 시드니 (일자리)
   - 검정고시 명문대 → 시드니 (USyd/UNSW)
```

### 카드 3: 💰 예상 비용

```
데이터 소스:
   ├─ schools.tuition_2026 (학교별 학비)
   ├─ master_v2_clean.cities.living_cost (지역별 생활비)
   ├─ monitored_sites (생활비 출처 / 자동 갱신)
   └─ master_v2_clean.policy.visa_500_fee = $2,000

조립 로직:
   1. 추천 학교 3개 中 1개 (또는 평균) 학비 계산
   2. 학생 지역 생활비 × 학습 기간 (시나리오 명시)
   3. 학생비자 500 ($2,000) + OSHC ($700/년)
   4. 한화 환산 (실시간 환율 / 기본 920원/AUD)
   5. 알바비 차감 절대 X (표현만 "알바로 일부 충당 가능")

출력 예시:
   "💰 예상 비용 (시드니 / Master Nursing 2년):
    학비:        AUD $35,000 × 2 = $70,000
    생활비:      AUD $25,000 × 2 = $50,000
    학생비자 500: AUD $2,000 (1회)
    OSHC:        AUD $1,400 (2년)
    합계:        AUD ~$123,400 (₩113,500,000)
    
    → 알바로 용돈/생활비 일부 충당 가능
    → 정확한 학교별 비교 = 1:1 상담 후 견적서"

❌ 절대 X:
   - 알바비 차감 (수치 X / 표현만)
   - "PR 후 회수 가능" 미래 추측
   - 학교 자세한 학비 비교표 (견적서로 유도)
```

### 카드 4: 💼 취업 + 연봉

```
데이터 소스:
   ├─ internal_faqs.major_*.card_text
   ├─ master_v2_clean.salaries (PayScale/SEEK/Glassdoor 데이터)
   └─ monitored_sites (연봉 78개 + 구직 62개 출처)

조립 로직:
   1. 학생 전공 → major_FAQ 호출
   2. master_v2 직군별 연봉 데이터 (시작/5년차)
   3. 출처 사이트명 표시 (PayScale, SEEK Salary Guide, Glassdoor)
   4. URL 직접 링크 X

출력 예시:
   "💼 Registered Nurse 취업·연봉 (시드니):
    시작 연봉: AUD $70,000~85,000
    5년차:    AUD $90,000~110,000
    분야 다양: 종합병원 / 클리닉 / 노인복지 / 정신건강
    
    * 출처: PayScale, SEEK Salary Guide, Glassdoor
      (자동 갱신 中)
    
    → 분야별 자세한 연봉 = 1:1 상담"

⚠️ 절대 X:
   - "100% 취업 보장"
   - 연봉 사이트 URL 직접 링크
   - 통계 출처 없는 추측 수치
```

### 카드 5: 🛂 PR 로드맵

```
데이터 소스:
   ├─ internal_faqs.visa_pr_*.card_text
   ├─ master_v2_clean.pr_points (점수 시스템)
   └─ monitored_sites (PR·취업비자 37개 출처)

조립 로직:
   1. 학생 6변수 → PR 적합성 점수 자동 계산
      - 나이 (25-32 = 30점)
      - 영어 (7.0 = 10점 / 8.0 = 20점)
      - 학력 (학사 15점 / 석사 15점)
      - 지방 +5점 (학생 지역 시나리오에 따라)
   2. 권장 PR 트랙 (189/190/491) 자동 선택
   3. 단계별 로드맵 표시

출력 예시 (간호 / 시드니):
   "🛂 PR 로드맵 (간호 = 골든 트랙 ⭐):
    1단계: Master of Nursing 졸업 (AHPRA RN 면허)
    2단계: 485 졸업비자 (학사·석사 2년)
    3단계: 1년 RN 경력
    4단계: PR 신청
            - 189 (점수 90+ / 자유)
            - 190 (주정부 +5점 / 2년 거주)
            - 491 (지방 +15점 / 5년 → 영주권)
    
    학생 예상 점수: 65~80점 (시드니 거주 시)
    
    ⭐ 시드니는 190 까다로움 → 애들레이드 191 추천
    → 정밀 점수 계산 + 트랙 선택 = 1:1 상담"

⚠️ 절대 X:
   - "PR 100% 보장"
   - 정부 정책 추측 (master_v2_clean 정본만)
   - 점수 부풀리기 (학생 실제 점수만)
```

### 카드 6: 🇬🇧 영어 준비

```
데이터 소스:
   ├─ internal_faqs.scenario_*.card_text (영어 목표)
   ├─ master_v2_clean.english_requirements (직군별 IELTS)
   └─ monitored_sites (사립 컬리지·어학원 31)

조립 로직:
   1. 학생 현재 영어 + 전공 → 목표 IELTS 자동 계산
   2. 도달 기간 추정 (학생 현재 vs 목표 차이)
   3. ELICOS Direct Entry 가능 여부 (간호는 X)

출력 예시 (현재 6.5 / 간호):
   "🇬🇧 영어 준비:
    현재: IELTS 6.5
    목표: IELTS 7.0 (각 영역 7.0) ⭐ 간호 절대 기준
    
    ⚠️ 간호는 ELICOS Direct Entry 면제 X
    
    권장:
     - IELTS 7.0 도달까지 2~4개월 추가 학습
     - Speaking·Writing 각 7.0이 가장 어려움
     - 일반 영어 학원 / IELTS 전문 학원 / 자율 학습
    
    → Wilson 학습 가이드 = 1:1 상담"

❌ 절대 X (Wilson EC 어학원 표현):
   - "Wilson EC 어학원 추천"
   - 자매 학교 특정 추천
   - (EC = 푸터 자매학교 로고만)
```

### 카드 7: 📋 유학 절차 + 학생비자 (CTA)

```
데이터 소스:
   ├─ internal_faqs.visa_pr_학생비자_500.card_text
   ├─ internal_faqs.visa_pr_GS_답변_가이드.card_text
   └─ master_v2_clean.policy (정부 정책)

조립 로직:
   1. 진행 12단계 요약
   2. 학생비자 500 ($2,000) + GS 4질문 안내
   3. 카톡 채널 CTA (메인)
   4. 부가 옵션 4개 (📤 카톡 / 📧 이메일 / 🔖 마이페이지 / 🔗 공유)

출력 예시:
   "📋 유학 절차 + 학생비자 500:
    
    진행 12단계:
     1. 카톡 30분 무료 상담
     2. 결제 (PRO ₩50K / 풀 컨설팅)
     3. 1:1 상담 (2시간) + 견적서
     4~7. 학교 선정·지원·서류
     8. Offer ⭐
     9~10. 송금 + 학생비자 500 ($2,000)
     11~12. 출국 + 호주 도착
    
    ⭐ 학생비자 500 GS Statement (2024.3 변경):
     4가지 정형 질문에 답해야 함 (각 150단어)
     → Wilson이 직접 작성 도움 (1:1 상담)
    
    ───────────────────
    
    💬 [카톡 채널로 1:1 상담 (30분 무료)]
        pf.kakao.com/_GadTX
    
    📤 [카톡으로 결과 받기]
    📧 [이메일로 받기]
    🔖 [마이페이지에 저장]
    🔗 [링크 공유]
    
    ⏰ 평일 10:00~18:00 / 영업시간 외 = 챗봇"
```

## H-5. Step 4: 차단룰 자동 체크

### master_v2_clean.json 차단룰 39개 + Wilson Alerts 24개

```typescript
// /src/lib/matching/blocking.ts
interface BlockingResult {
  blockedSchools: BlockedItem[];
  wilsonAlerts: WilsonAlert[];
  hardBlocks: HardBlock[];  // 절대 차단 (8개)
}

function checkBlockingRules(
  student: StudentInput,
  recommendedSchools: School[]
): BlockingResult {
  
  const blocked = [];
  const alerts = [];
  
  // 1. 하드 차단 (8개) - 절대 추천 X
  for (const rule of master_v2_clean.hard_blocks) {
    if (rule.matches(student, recommendedSchools)) {
      hardBlocks.push(rule);
    }
  }
  
  // 예시:
  // - SELC English (학교) = 검정고시 학생에게 절대 추천 X
  // - ANMAC 미인증 학교 = 간호 학생에게 절대 추천 X
  // - 폐쇄된 ELICOS 18개 = 모든 학생 X
  
  // 2. 소프트 차단 (39개) - 경고 표시
  for (const rule of master_v2_clean.blocking_rules) {
    if (rule.matches(student, recommendedSchools)) {
      blocked.push(rule);
    }
  }
  
  // 예시:
  // - ACU + 한국 학생 30%+ = BLOCK-019 차단
  // - 학생비자 거절률 높은 국가 출신 = 추가 GS 강화 필요
  
  // 3. Wilson Alerts (24개) - 패턴 감지
  for (const alert of master_v2_clean.wilson_alerts) {
    if (alert.matches(student)) {
      alerts.push(alert);
    }
  }
  
  // 예시:
  // - 검정고시 부모 IELTS 6.0 환상 ↑
  // - 대졸 IT 회계 PR 의도 (PY 폐지 영향)
  // - 워홀러 비자 만료 임박
  // - 간호 IELTS 6.5 (7.0 미달)
  
  return { blockedSchools: blocked, wilsonAlerts: alerts, hardBlocks };
}
```

### 차단 시 카드 표시

```
하드 차단 (학생 노출 X / Wilson Alert만):
   카드 1 (학교)에서 자동 제외
   Wilson 관리자 페이지에 Alert 표시:
     "학생 #001 검정고시 → SELC 검색 中 / 자동 차단"

소프트 차단 (경고 표시):
   카드 1 (학교)에 ⚠️ 경고 박스:
     "이 학교는 한국 학생 비율 30% 이상입니다.
      한국식 환경에서 학습 시 영어 향상 X 가능성 ↑
      → 1:1 상담에서 다른 옵션 안내 받으세요"

Wilson Alerts (관리자 페이지만 / 학생 X):
   학생 상세 페이지 상단에 표시:
     "🚨 Wilson Alert 1건: 간호 IELTS 6.5 (목표 7.0 미달)"
```

## H-6. Step 5: 학생용 콘텐츠만 노출

### 3중 보안 체크 (DB 단계 / API 단계 / UI 단계)

```typescript
// /src/lib/matching/public-filter.ts
function filterPublicOnly(faqEntry: InternalFAQ): PublicCard {
  return {
    card_text: faqEntry.card_text,  // ✅ 학생 OK
    
    // ❌ 절대 노출 X
    // internal_data: faqEntry.internal_data,  → DB 단계 SELECT 안 함
    // wilson_note: faqEntry.wilson_note,      → DB 단계 SELECT 안 함
  };
}
```

### DB 단계 (RLS / SELECT 컬럼 제한)

```sql
-- 학생 (role='student')은 internal_data / wilson_note SELECT 불가
CREATE POLICY internal_faqs_student ON internal_faqs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'student')
  )
  WITH CHECK (false);  -- 학생은 INSERT/UPDATE 절대 X

-- 학생 API 호출 시 자동으로 SELECT 컬럼 제한
-- (Supabase 클라이언트에서 .select('card_text') 만 사용)
```

### API 단계 (`/api/diagnose`)

```typescript
// 학생 호출 시 절대 internal_data / wilson_note 응답 X
return NextResponse.json({
  cards: cards.map(c => ({
    cardNumber: c.cardNumber,
    icon: c.icon,
    title: c.title,
    content: c.content,  // ✅ card_text만
    warnings: c.warnings,
    // ❌ internal_data, wilson_note 절대 응답 X
  })),
  warnings: blockingResult.blockedSchools.filter(b => b.show_to_student),
  // wilsonAlerts는 학생에게 응답 X
});
```

### UI 단계 (학생 컴포넌트 import 제외)

```typescript
// /src/components/cards/Card1Schools.tsx
// = 학생 컴포넌트
// = internal_data / wilson_note 필드 import 자체 X

// /src/components/admin/StudentDetail.tsx
// = 관리자 컴포넌트
// = internal_data / wilson_note 필드 import OK
```

## H-7. 성능 최적화

### 카드 7장 렌더링 < 500ms 목표

```
빌드 시 (Phase 1):
   ├─ master_v2_clean.json (학교명 109 (표준화) / 전공 1,235 / 차단룰 39 / Wilson Alerts 24) = 코드 임베드
   ├─ FAQ 84 = JSON 임포트 (DB X)
   └─ 정적 매칭 함수 = 즉시 호출

Phase 2 이후 (DB 동적 로드):
   ├─ Vercel KV / Redis 캐시 (5분)
   ├─ 시나리오 매칭 결과 캐시 (학생 6변수 → 시나리오 ID)
   └─ 모듈 로드 결과 캐시 (시나리오 ID → 모듈 데이터)
```

### 캐시 무효화

```
- Wilson 매뉴얼·FAQ 수정 → 관련 시나리오 캐시 무효화
- 사이트 모니터링 자동 갱신 → schools 캐시 무효화
- master_v2_clean 정책 변경 → 전체 캐시 무효화
```

## H-8. 에러 처리

### 매칭 실패 케이스

```typescript
// 시나리오 매칭 안 되는 경우
if (!scenario) {
  return {
    cards: getFallbackCards(student),  // 기본 카드 7장
    error: 'unmatched_scenario',
    cta: '카톡 1:1 상담으로 정확한 진단 받으세요',
    wilsonAlertCreated: true,
  };
}

// 차단 학교만 매칭된 경우 (모든 학교 차단)
if (recommendedSchools.length === 0) {
  return {
    cards: getEmergencyCards(student),  // 카톡 강조 카드 7장
    error: 'all_schools_blocked',
    wilsonAlertCreated: true,
  };
}

// API 타임아웃 (3초+)
if (timeout) {
  return {
    cards: getMinimalCards(student),  // 최소 정보 카드
    error: 'timeout',
    retryable: true,
  };
}
```

## H-9. 매칭 결과 저장 (학생별 / 24시간 유효)

```typescript
// /api/diagnose POST
{
  // 1. 학생 6변수 받음
  // 2. 매칭 엔진 5단계 실행
  // 3. 카드 7장 생성
  // 4. 결과 저장:
  
  // students 테이블 INSERT
  await db.students.insert({
    anonymous_id: generateUUID(),
    age_range: input.age_range,
    education: input.education,
    english_level: input.english_level,
    preferred_region: input.preferred_region,
    major: input.major,
    budget_range: input.budget_range,
    is_medical: (input.major === '의료'),
    
    // 매칭 결과 캐시
    scenario_matched: scenario.faq_id,
    card_result: cards,  // JSONB
    diagnose_uuid: uuid,
    
    // 추적
    source: input.source,  // 'web_diagnose' / 'kakao_direct' / ...
    partner_ref: input.ref,
    
    // Wilson Alerts
    wilson_alerts: blockingResult.wilsonAlerts.map(a => a.id),
  });
  
  return {
    diagnose_uuid: uuid,
    redirect_to: `/diagnose/result/${uuid}`,
  };
}
```

## H-10. 결과 페이지 (`/diagnose/result/[uuid]`)

```typescript
// /src/app/[locale]/diagnose/result/[uuid]/page.tsx
export default async function DiagnoseResult({ params }) {
  const student = await db.students
    .findFirst({ where: { diagnose_uuid: params.uuid } });
  
  if (!student) {
    return <NotFound />;
  }
  
  // 24시간 만료 체크
  const expiresAt = student.created_at + 24*60*60*1000;
  if (Date.now() > expiresAt && !student.user_id) {
    return <Expired />;  // 새 진단 권유
  }
  
  // 회원가입 학생은 영구 (마이페이지에서 접근)
  return <CardSet cards={student.card_result} />;
}
```

## H-11. 테스트 케이스 (Phase 1 빌드 검증)

```
Test 1: 검정고시 + 영어없음 + 간호 + 시드니
   기대 시나리오: 01_검정고시/09_간호.md
   기대 카드 1: ANMAC 인증 학교 3곳
   기대 카드 6: IELTS 7.0 목표 (간호 절대 기준)

Test 2: 대졸 + IELTS 7.0 + IT + 시드니
   기대 시나리오: 04_대졸PR/02_IT석사.md
   기대 카드 5: 189 / 190 / 491 PR 트랙
   기대 카드 4: PayScale + SEEK 출처

Test 3: 워홀러 + IELTS 5.5 + 요리 + 호바트
   기대 시나리오: 05_워홀러/03_요리Trade.md
   기대 카드 1: TAFE 호바트 (지방 +5)
   기대 카드 5: 491 트랙 (지방)

Test 4: 매칭 실패 케이스
   학생 6변수: 18미만 + 검정고시 + 의료
   → 시나리오 매칭 안 됨 (의대는 별도 페이지)
   → 카드 7번 = 의대 페이지 안내 + 카톡 CTA

Test 5: 차단 학교 케이스
   학생 6변수: 검정고시 + 5.5 + 비즈니스 + 시드니
   학생이 SELC 검색 中
   → 카드 1에서 SELC 자동 제외
   → Wilson Alert 발생
```

---

# ✅ PART H 끝
