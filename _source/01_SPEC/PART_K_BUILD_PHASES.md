# 🎯 PART K. Phase 1~5 빌드 순서

> **목적**: Claude Code가 ausuhak.com을 단계별로 안전하게 빌드
> **운영자**: Wilson Kim (코딩 경험 X / Claude Max + Claude Code 사용)
> **원칙**: 각 Phase 끝나면 Wilson 검토 → OK → 다음 Phase
> **안전 장치**: 각 Phase = Vercel 미리보기 URL → Wilson 시각 검토

## K-1. Phase 별 개요

```
Phase 1 (1~2주)  핵심 골격 + 메인 페이지 + 진단 카드 7장
Phase 2 (2~3주)  운영 기능 (마이페이지 / 결제 / 카톡 알림톡)
Phase 3 (2~3주)  자동화 (모니터링 365 / 챗봇 / Failure Pattern)
Phase 4 (1~2주) 마케팅 (블로그 / 유튜브 / 카톡 광고)
Phase 5 (1~2주) AI 보조 + Toss 자동 결제

총 예상: 7~13주 (약 2~3개월)
```

## K-2. Phase 1: 핵심 골격 (1~2주)

### Phase 1 목표
```
✅ 학생이 사이트 도착 → 6변수 진단 → 카드 7장 결과 → 카톡 채널
✅ Wilson 관리자 페이지 (학생 관리만 / 견적서)
✅ 한국어 / 영문 사이트 i18n
✅ Vercel 배포 / 도메인 연결 (ausuhak.com)
```

### Phase 1 빌드 단계

```
Step 1.1: 환경 설정 (Day 1)
   ├─ Next.js 15 프로젝트 초기화
   ├─ Tailwind CSS + shadcn/ui 설치
   ├─ Pretendard / Inter / Playfair Display 폰트 설치
   ├─ Supabase 프로젝트 생성 (무료 티어)
   ├─ Vercel 프로젝트 연결 (GitHub)
   └─ 도메인 연결 (ausuhak.com)

Step 1.2: i18n 설정 (Day 1)
   ├─ next-intl 설치
   ├─ /src/messages/ko.json 작성
   ├─ /src/messages/en.json 작성
   ├─ middleware.ts 설정 (ko 디폴트 / en 영문)
   └─ /src/app/[locale]/ 라우팅 설정

Step 1.3: 디자인 토큰 (Day 1~2)
   ├─ tailwind.config.ts (Navy/Gold/Cream)
   ├─ globals.css (CSS 변수)
   ├─ shadcn/ui 컴포넌트 설치 (Button / Card / Input 등)
   └─ /src/components/ui/ 기본 컴포넌트

Step 1.4: DB 마이그레이션 (Day 2)
   ├─ /supabase/migrations/001_initial_users.sql
   ├─ /supabase/migrations/002_initial_schools.sql (master_v2_clean 임포트)
   ├─ /supabase/migrations/003_initial_students.sql (+ student_assignments)
   ├─ /supabase/migrations/004_initial_lifecycle.sql
   ├─ /supabase/migrations/005_initial_faqs.sql (FAQ 84 임포트)
   └─ /supabase/migrations/013_initial_rls.sql (RLS 정책)

Step 1.5: 메인 페이지 (Day 3~4)
   ├─ /src/app/[locale]/page.tsx (Hero + 진단 진입)
   ├─ /src/components/layout/Header.tsx
   ├─ /src/components/layout/Footer.tsx (site_settings DB 연결)
   ├─ ausuhak_main_FINAL.html 디자인 가져옴 → Next.js 컴포넌트화
   └─ Wilson 스토리 / 합격 사례 placeholder

Step 1.6: 진단 시스템 (Day 5~7)
   ├─ /src/components/diagnose/DiagnoseForm.tsx (6변수 입력)
   ├─ /src/lib/matching/scenario.ts (Step 1: 시나리오 매칭)
   ├─ /src/lib/matching/modules.ts (Step 2: 모듈 조합)
   ├─ /src/lib/matching/assemble.ts (Step 3: 카드 7장 조립)
   ├─ /src/lib/matching/blocking.ts (Step 4: 차단룰)
   ├─ /src/lib/matching/public-filter.ts (Step 5: PUBLIC 필터)
   ├─ /src/app/api/diagnose/route.ts (POST)
   └─ /src/app/[locale]/diagnose/result/[uuid]/page.tsx

Step 1.7: 카드 7장 컴포넌트 (Day 8~9)
   ├─ /src/components/cards/Card1Schools.tsx
   ├─ /src/components/cards/Card2Region.tsx
   ├─ /src/components/cards/Card3Cost.tsx
   ├─ /src/components/cards/Card4Salary.tsx
   ├─ /src/components/cards/Card5PR.tsx
   ├─ /src/components/cards/Card6English.tsx
   └─ /src/components/cards/Card7CTA.tsx (카톡 + 부가 옵션 4개)

Step 1.8: 관리자 페이지 (Day 10~12)
   ├─ /src/app/[locale]/admin/page.tsx (대시보드)
   ├─ /src/app/[locale]/admin/students/page.tsx (학생 리스트)
   ├─ /src/app/[locale]/admin/students/[id]/page.tsx (학생 상세)
   ├─ /src/app/[locale]/admin/quotes/page.tsx (견적서)
   ├─ /src/app/[locale]/admin/settings/page.tsx (사이트 설정)
   └─ Wilson Super Admin 권한 (RLS)

Step 1.9: 영문 사이트 (Day 13)
   ├─ /src/app/[locale]/page.tsx의 en 버전
   ├─ 1페이지 (회사 소개 / 학교 파트너용)
   ├─ Brochure PDF 다운로드 버튼
   └─ 한국어 / 영문 푸터 분리

Step 1.10: 배포 + 검토 (Day 14)
   ├─ Vercel 배포
   ├─ Wilson 시각 검토 (모바일 + PC)
   ├─ 모든 카드 7장 노출 검증
   ├─ 카카오 채널 진입 테스트
   └─ 영업 시간 표시 검증
```

### Phase 1 완료 기준 (Wilson 검토)

```
✅ 학생 진단 폼 6변수 작동
✅ 카드 7장 결과 페이지 노출
✅ 카드 1 학교 추천 = 학생 지역 우선 + master_v2_clean 정본
✅ UNSW 간호 같은 사실 오류 = 자동 차단
✅ 카드 7번 = 카톡 채널 (pf.kakao.com/_GadTX)
✅ 부가 옵션 4개 (📤 카톡 / 📧 이메일 / 🔖 마이페이지 / 🔗 공유)
✅ Wilson 관리자 페이지 (학생 관리 + 견적서)
✅ 영문 사이트 /en (1페이지)
✅ 모바일 + PC 둘 다 작동
✅ 영업 시간 표시 (평일 10:00~18:00)
```

## K-3. Phase 2: 운영 기능 (2~3주)

### Phase 2 목표
```
✅ 학생 마이페이지 (Stage 12 시각화)
✅ 회원가입 / 로그인 (결제 시 자동)
✅ 결제 시스템 (수동 / Wilson 카톡 입금 안내)
✅ 견적서 PDF 자동 생성
✅ 카톡 알림톡 (Phase 2 사업자 등록 후)
✅ 직원 페이지 (담당 학생만 / 권한별)
✅ 의대 페이지 /medical (5루트 + ISAT/MMI 무료 체험)
```

### Phase 2 빌드 단계

```
Step 2.1: Supabase Auth (Day 1~2)
   ├─ Supabase Auth 설정
   ├─ 카카오 OAuth 연동 (선택)
   ├─ 이메일 회원가입 / 로그인
   ├─ 결제 시 자동 회원가입 트리거
   └─ /src/app/[locale]/signup, /login

Step 2.2: 마이페이지 (Day 3~5)
   ├─ /src/app/[locale]/mypage/page.tsx (Stage 12 시각화)
   ├─ /src/app/[locale]/mypage/cards/page.tsx (카드 7장 다시 보기)
   ├─ /src/app/[locale]/mypage/quote/page.tsx (견적서 보기)
   ├─ /src/app/[locale]/mypage/documents/page.tsx
   ├─ /src/app/[locale]/mypage/payments/page.tsx
   ├─ /src/app/[locale]/mypage/self-guide/page.tsx (4영역)
   └─ /src/components/stage/StageTimeline.tsx

Step 2.3: 결제 시스템 (Day 6~8)
   ├─ /src/app/[locale]/admin/payments/page.tsx
   ├─ /src/app/api/payments/route.ts
   ├─ payments 테이블 작업
   ├─ Wilson 입금 확인 → confirmed 자동 회원가입
   └─ 영수증 PDF 생성

Step 2.4: 견적서 PDF (Day 9~10)
   ├─ /src/lib/pdf/quote-generator.ts
   ├─ 학교 1~3개 선택 + 자동 항목 8개
   ├─ Wilson 1-Click 수정
   ├─ Snapshot 보존 (정책 변경 영향 X)
   └─ 학생 카톡 발송 + 마이페이지 저장

Step 2.5: 카톡 알림톡 (Day 11~14 / Wilson 사업자 등록 후)
   ├─ 카카오 비즈니스 파트너센터 가입 (Wilson)
   ├─ 알림톡 템플릿 7개 등록 (1~2주 카카오 승인)
   ├─ /src/lib/kakao/alimtalk.ts
   ├─ /src/app/api/notifications/route.ts
   └─ Stage 자동 알림 (Stage 2 / 3 / 8 / 9 / 10 / 11)

Step 2.6: 직원 페이지 (Day 15~17)
   ├─ /src/app/[locale]/staff/page.tsx
   ├─ /src/app/[locale]/staff/students/page.tsx (담당만)
   ├─ /src/app/[locale]/staff/manuals/page.tsx (475 검색)
   ├─ /src/app/[locale]/staff/faqs/page.tsx (84 검색)
   ├─ /src/app/[locale]/staff/cases/page.tsx (케이스 학습)
   └─ student_assignments 테이블 활용 (1:N 다중 담당)

Step 2.7: 의대 페이지 (Day 18~21)
   ├─ /src/app/[locale]/medical/page.tsx (5루트 + 정보)
   ├─ /src/app/[locale]/medical/isat/page.tsx (ISAT 10/200)
   ├─ /src/app/[locale]/medical/mmi/page.tsx (MMI 1/40)
   ├─ ausuhak_medical.html → 데이터 임포트 (isat_questions / mmi_scenarios)
   └─ 의대 학생 자동 분류 (is_medical = true)
```

### Phase 2 완료 기준

```
✅ 학생 회원가입 (결제 시 자동)
✅ 마이페이지 Stage 12 시각화
✅ 결제 → 자동 회원가입 + 마이페이지 활성화
✅ 견적서 PDF 자동 생성 (학교 1~3개)
✅ 카톡 알림톡 자동 발송 (핵심 7개)
✅ 직원 페이지 (담당 학생만)
✅ 의대 페이지 (5루트 + 무료 체험)
✅ 풀 컨설팅 / 의대 ₩300,000 결제 가능
```

## K-4. Phase 3: 자동화 (2~3주)

### Phase 3 목표
```
✅ 사이트 모니터링 365개 (Critical / High / Normal)
✅ 학생 자동 케어 (정체 감지 / Failure Pattern)
✅ Wilson Alerts 자동 감지
✅ 챗봇 24시간 자동 응답
✅ 유튜브 동기화 (Wilson 채널)
✅ 자동화 활동 로그
```

### Phase 3 빌드 단계

```
Step 3.1: 사이트 모니터링 (Day 1~5)
   ├─ /src/lib/monitor/scrape.ts
   ├─ /src/app/api/cron/monitor-critical/route.ts (6시간)
   ├─ /src/app/api/cron/monitor-high/route.ts (24시간)
   ├─ /src/app/api/cron/monitor-normal/route.ts (7일)
   ├─ vercel.json crons 설정
   ├─ 365개 사이트 monitored_sites 테이블 임포트
   └─ /src/app/[locale]/admin/db-updates/page.tsx (Wilson 1-Click 승인)

Step 3.2: 학생 자동 케어 (Day 6~9)
   ├─ /src/app/api/cron/student-care/route.ts
   ├─ 정체 감지 7개 룰
   ├─ Failure Pattern 6개 자동 감지 (호주 도착 6개월 후)
   ├─ Wilson Alerts 자동 발생 (24개)
   └─ 학생 카톡 자동 / Wilson 알림

Step 3.3: 챗봇 자동 응답 (Day 10~12)
   ├─ 카카오 챗봇 빌더 (카카오 i 오픈빌더)
   ├─ 6변수 자동 수집 (영업 시간 / 영업 시간 외 분기)
   ├─ 진단 결과 페이지 링크 자동 발송
   └─ Wilson 폰 알림

Step 3.4: 유튜브 동기화 (Day 13~15)
   ├─ /src/lib/youtube/sync.ts
   ├─ /src/app/api/cron/youtube-sync/route.ts (24시간)
   ├─ Wilson 채널 영상 자동 동기화
   ├─ 카테고리 자동 분류 (Wilson 검토)
   └─ /src/app/[locale]/youtube/page.tsx

Step 3.5: 활동 로그 + 보안 (Day 16~21)
   ├─ activity_logs 자동 기록
   ├─ 무단 접근 자동 차단 + Wilson 알림
   ├─ RLS 정책 강화
   ├─ 권한 위반 자동 감지
   └─ Wilson 검토 대시보드
```

### Phase 3 완료 기준

```
✅ 사이트 365개 자동 모니터링
✅ Wilson 1-Click 승인 시스템 작동
✅ 학생 정체 감지 → 자동 알림
✅ Failure Pattern 자동 감지
✅ 챗봇 24시간 자동 응답
✅ 유튜브 자동 동기화
✅ 모든 활동 로그 자동 기록
```

## K-5. Phase 4: 마케팅 (1~2주)

### Phase 4 목표
```
✅ 블로그 시스템 (Wilson 직접 작성)
✅ 카톡 광고 캠페인 (타겟팅)
✅ 학생 추천 시스템 (?ref=)
✅ 졸업생 후기 슬라이드
✅ SEO 최적화
```

### Phase 4 빌드 단계

```
Step 4.1: 블로그 (Day 1~4)
   ├─ /src/app/[locale]/blog/page.tsx
   ├─ /src/app/[locale]/blog/[slug]/page.tsx
   ├─ /src/app/[locale]/admin/blog/page.tsx
   ├─ MDX 또는 마크다운 에디터
   ├─ SEO 자동 (Schema.org / sitemap.xml)
   └─ 카테고리 / 태그 / 검색

Step 4.2: 카톡 광고 (Day 5~7)
   ├─ /src/app/[locale]/admin/ads/page.tsx
   ├─ 카카오 비즈니스 광고 API 연동
   ├─ 타겟팅 (학력 / 분야 / 지역)
   ├─ 전환율 추적 (Lead → ... → PR)
   └─ ROI 대시보드

Step 4.3: 파트너 추천 (Day 8~10)
   ├─ ?ref=partnerXX URL 파라미터 추적
   ├─ partner_ref → students 테이블
   ├─ commissions 자동 계산
   └─ 파트너별 대시보드

Step 4.4: 졸업생 후기 (Day 11~14)
   ├─ /src/app/[locale]/admin/graduates/page.tsx
   ├─ 후기 요청 자동 발송
   ├─ Wilson 승인 후 메인 슬라이드 노출
   └─ PR 추적 (Lead Status: PR)
```

### Phase 4 완료 기준

```
✅ 블로그 발행 + SEO 최적화
✅ 카톡 광고 캠페인 작동
✅ 파트너 추천 추적
✅ 졸업생 후기 메인 노출
```

## K-6. Phase 5: AI 보조 + 자동 결제 (1~2주)

### Phase 5 목표
```
✅ Toss Payments 자동 결제
✅ AI 블로그 초안
✅ AI 답변 추천 (Wilson 검토)
✅ AI 학생 분석 (wilson_only 메모)
✅ Phase 1~4 누적 자동화 강화
```

### Phase 5 빌드 단계

```
Step 5.1: Toss Payments (Day 1~3)
   ├─ Toss Payments 가맹점 등록 (Wilson)
   ├─ /src/lib/toss/payment.ts
   ├─ /src/app/api/payments/toss-webhook/route.ts
   ├─ PRO ₩50,000 / 의대 ₩300,000 자동 결제
   └─ 자동 회원가입 + 마이페이지 즉시 활성화

Step 5.2: AI 블로그 초안 (Day 4~6)
   ├─ /src/lib/ai/blog-draft.ts (Anthropic API)
   ├─ Wilson 명령 → AI 초안 생성
   ├─ master_v2 + FAQ 84 + 매뉴얼 475 데이터 활용
   └─ Wilson 1-Click 검토 / 발행

Step 5.3: AI 답변 추천 (Day 7~10)
   ├─ /src/lib/ai/answer-recommend.ts
   ├─ 학생 카톡 메시지 분석 → FAQ / 매뉴얼 검색
   ├─ Wilson 관리자 페이지에 답변 추천
   └─ Wilson 1-Click 사용 / 수정 / 직접 작성

Step 5.4: AI 학생 분석 (Day 11~14)
   ├─ /src/lib/ai/student-analysis.ts
   ├─ 학생 카톡 대화 분석 (의도 / 영어 수준 / 가족)
   ├─ student_notes (wilson_only) 자동 추가
   └─ Wilson 검토용 인사이트
```

### Phase 5 완료 기준

```
✅ Toss Payments 자동 결제
✅ AI 블로그 초안 생성 (Wilson 검토 후 발행)
✅ AI 답변 추천 (Wilson 검토 후 발송)
✅ AI 학생 분석 (Wilson 전용 메모)
✅ ausuhak.com = 완성된 통합 플랫폼
```

## K-7. Phase 별 안전 장치

### 각 Phase 끝나면 Wilson 검토

```
[Phase N 완료]
        ↓
[Vercel 미리보기 URL 생성]
   예: https://ausuhak-phase-1.vercel.app
        ↓
[Wilson 시각 검토 (모바일 + PC)]
   ├─ 모든 페이지 노출 확인
   ├─ 카드 7장 결과 검증
   ├─ 카톡 채널 작동
   ├─ 영업 시간 표시
   ├─ 디자인 (Navy/Gold/Cream)
   └─ 톤 가드 (전문가 톤)
        ↓
[Wilson 피드백]
   ├─ 수정 필요 → Claude Code 즉시 반영
   └─ OK → 다음 Phase 진행
```

### 롤백 안전 장치

```
모든 변경 = Git 커밋 단위
   ├─ Phase 1 커밋 = 태그 'phase-1-complete'
   ├─ Phase 2 커밋 = 태그 'phase-2-complete'
   └─ ...

문제 발생 시:
   ├─ Vercel 이전 배포로 1-Click 롤백
   └─ Git 태그 시점으로 복원
```

## K-8. 빌드 비용 (Phase 별)

| Phase | 학생 수 | 도메인 | Vercel | Supabase | 카톡 | AI | 합계 |
|---|---|---|---|---|---|---|---|
| 1 | ~50 | 2만/연 | 무료 | 무료 | 0 | 0 | **0~5천원/월** |
| 2 | ~200 | (동일) | 무료 | 무료 | 1~2만 | 0 | **1~3만원/월** |
| 3 | ~500 | (동일) | 20$ | 25$ | 3~5만 | 0 | **5~15만원/월** |
| 4 | ~500+ | (동일) | 20$ | 25$ | 5~10만 | 0 | **10~50만원/월 (광고)** |
| 5 | ~1000+ | (동일) | 20$ | 25$ | 10~20만 | 5~10만 | **20~70만원/월** |

```
* 광고 = 옵션 (Wilson 결정)
* AI = Anthropic API 사용량
* 졸업생 늘면 = 후기 슬라이드 / 자동 추천 = 신규 학생 ↑
```

## K-9. Phase 빌드 시 Wilson 작업

### Phase 1 시작 전 Wilson 준비
```
✅ Vercel 계정 (이메일 가입)
✅ GitHub 계정 (Wilson 본인)
✅ Supabase 계정 (이메일)
✅ 도메인 ausuhak.com (이미 보유)
✅ Claude Max 구독 (이미 사용)
✅ Claude Code 설치 (Mac/Windows)
```

### Phase 1 진행 중 Wilson 작업
```
1. Claude Code에 사양서 v2.5 + 정본 데이터 전달
2. Phase 1 빌드 시작 명령
3. 각 Step 끝나면 Wilson 검토
4. 디자인 / 톤 / 콘텐츠 피드백
5. site_settings 회사 정보 입력 (Phase 1 끝나기 전)
```

### Phase 2 시작 전 Wilson 준비
```
✅ 사업자 등록증 발급 (한국 사업자)
✅ 카카오 비즈니스 파트너센터 가입
✅ 알림톡 템플릿 사전 신청 (1~2주 승인)
✅ 정착비 / 학교 학비 데이터 검증
```

### Phase 5 시작 전 Wilson 준비
```
✅ Toss Payments 가맹점 등록 (사업자 등록 후)
✅ Anthropic API Key 발급 (AI 보조용)
✅ 카톡 광고 예산 결정
```

## K-10. 1순위 Phase = Phase 1

```
Phase 1만 완성되어도:
   ✅ ausuhak.com 라이브
   ✅ 학생 진단 + 카드 7장 + 카톡 상담 작동
   ✅ Wilson 학생 관리 + 견적서 가능
   ✅ 학생 50명까지 운영 가능 (수동 관리)

Phase 2~5 = 점진 추가
   - 학생 늘어나면 자동화 추가
   - Wilson 부담 ↓
   - 매출 ↑

→ Phase 1만 끝나도 = 사이트 시작 OK
→ Phase 2~5 = Wilson 시간 / 예산에 따라 점진
```

---

# ✅ PART K 끝
