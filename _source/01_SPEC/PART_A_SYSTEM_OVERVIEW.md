# 🎯 PART A. 시스템 전체 그림

## A-1. 사이트 전체 영역 구조

```
ausuhak.com (Vercel + Supabase) = 통합 마케팅·운영·교육·자동화 허브
│
├─ 🇰🇷 한국어 사이트 (메인 / 한국 학생·부모)
│   ├─ 🔵 공개 마케팅 영역 (학생·일반)
│   │   ├─ /                  메인 (Hero + 6변수 진단 진입)
│   │   ├─ /diagnose          카드 7장 진단 (FAQ 시나리오 매칭)
│   │   ├─ /blog              블로그 (Wilson 직접 작성)
│   │   ├─ /youtube           유튜브 (자동 동기화)
│   │   ├─ /medical           의대 페이지 (ISAT 200 + MMI 40 + 5진학루트)
│   │   ├─ /signup, /login    회원가입 / 로그인
│   │   └─ /mypage            학생 마이페이지
│   │
│   ├─ 🟢 비공개 운영 영역 (Wilson + 직원)
│   │   ├─ /admin             Wilson 관리자 (Super Admin)
│   │   └─ /staff             직원 페이지 (권한 부여된 만큼만)
│   │
│   └─ 💛 카톡 인터페이스 (학생 메인)
│       └─ pf.kakao.com/_GadTX (Wilson 카카오 채널)
│
├─ 🇬🇧 영문 사이트 (호주 학교 파트너용)
│   └─ /en                    1페이지 (회사 소개 / 단일 페이지 / 길게 스크롤)
│       Section 1: Hero
│       Section 2: About Us (Our Story)
│       Section 3: What We Do
│       Section 4: Why Partner With Us
│       Section 5: Credentials
│       Section 6: Contact
│       Section 7: Footer + Brochure PDF 다운로드
│
└─ 🔌 외부 연동
    ├─ KakaoTalk (채널 / 챗봇 / 알림톡 / 광고)
    ├─ YouTube Data API v3 (영상 자동 동기화)
    ├─ Vercel Cron Jobs (사이트 365개 자동 모니터링)
    └─ Toss Payments (Phase 5+ 자동 결제)
```

## A-2. 기술 스택

| 영역 | 도구 | 비고 |
|---|---|---|
| Frontend | **Next.js 15** (App Router) | TypeScript |
| 다국어 | **next-intl** | `/`(한국어) + `/en`(영문) 라우팅 |
| 스타일 | Tailwind CSS + shadcn/ui | Radix UI 기반 (접근성) |
| 폰트 | Pretendard / Inter / Playfair Display | next/font 로드 |
| Backend | **Supabase** | PostgreSQL + Auth + Storage + Edge Functions + Realtime |
| 배포 | **Vercel** | 무료 플랜 → 유료 (트래픽 늘면) |
| 도메인 | ausuhak.com (보유 中) | 한국 호스팅 업체 등록 |
| 카톡 | 카카오비즈니스 파트너센터 | Phase 2 (사업자 등록 후) |
| 모니터링 | Vercel Cron Jobs | 사이트 365개 자동 스크래핑 |
| 유튜브 | YouTube Data API v3 | 영상 자동 동기화 |
| SEO | Next.js sitemap + robots.txt + Schema.org | 자동 생성 |
| 결제 | Wilson 직접 (카톡 + 입금) | Phase 5+ Toss Payments 자동화 |
| 모바일 | PWA | 오프라인 캐시 + 카톡 통합 |
| 이미지 생성 | Nano Banana (Gemini 2.5 Flash Image) | 빌드 시 사용 |

## A-3. 디렉토리 구조 (Next.js 15 App Router + i18n)

### 전체 구조
```
ausuhak/
│
├── public/                           정적 파일
│   ├── images/                       Nano Banana 생성 이미지
│   │   ├── hero/
│   │   ├── cards/
│   │   ├── schools/                  학교별 이미지
│   │   ├── cities/                   도시별 (시드니/멜번/...)
│   │   └── majors/                   전공별
│   ├── logos/
│   │   ├── wilson-profile.jpg        실사 (Wilson 본인)
│   │   ├── ec-academy.png            자매학교 (EC 어학원)
│   │   ├── ec-online.png             자매학교 (EC 화상영어)
│   │   ├── qeac-e240.svg             QEAC 인증 배지
│   │   └── partners/                 호주 학교 파트너 (Phase 2)
│   ├── brochure/
│   │   └── ausuhak-partnership-en.pdf  영문 회사 소개서
│   ├── manifest.json                 PWA
│   ├── service-worker.js             PWA 오프라인
│   ├── robots.txt
│   └── sitemap.xml                   자동 생성
│
├── src/
│   ├── app/
│   │   ├── [locale]/                 i18n 자동 라우팅 (ko / en)
│   │   │   ├── layout.tsx            전체 레이아웃
│   │   │   │
│   │   │   ├── page.tsx              메인 (한국어 = 진단 진입 / 영문 = 회사 소개)
│   │   │   │
│   │   │   ├── (한국어 전용 페이지)  # 영문 사이트는 page.tsx 1개만
│   │   │   ├── diagnose/
│   │   │   │   └── page.tsx          카드 7장 진단
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          블로그 목록
│   │   │   │   └── [slug]/page.tsx   글 상세
│   │   │   ├── youtube/
│   │   │   │   └── page.tsx
│   │   │   ├── medical/
│   │   │   │   └── page.tsx          의대 (ISAT 200 + MMI 40 + 5루트)
│   │   │   ├── signup/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── mypage/
│   │   │   │   ├── page.tsx          학생 대시보드
│   │   │   │   ├── stage/page.tsx    13단계 시각화
│   │   │   │   ├── documents/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   ├── quote/page.tsx    견적서 보기
│   │   │   │   └── self-guide/page.tsx
│   │   │   ├── admin/                Wilson Super Admin
│   │   │   │   ├── page.tsx          아침 대시보드
│   │   │   │   ├── students/         학생 관리
│   │   │   │   ├── kanban/           학생 칸반
│   │   │   │   ├── manuals/          매뉴얼 475
│   │   │   │   ├── faqs/             내부 FAQ 84
│   │   │   │   ├── graduates/        졸업생 DB
│   │   │   │   ├── db-updates/       DB 업데이트
│   │   │   │   ├── cases/            케이스 학습
│   │   │   │   ├── payments/         결제·커미션
│   │   │   │   ├── staff/            직원 관리
│   │   │   │   ├── blog/             블로그 작성
│   │   │   │   ├── youtube/          유튜브
│   │   │   │   ├── ads/              카톡 광고
│   │   │   │   ├── medical/          의대 도구
│   │   │   │   ├── issues/           이슈 트래킹
│   │   │   │   ├── stats/            통계
│   │   │   │   └── quotes/           ⭐ 견적서 생성
│   │   │   └── staff/                직원 페이지
│   │   │       ├── page.tsx
│   │   │       ├── students/         담당 학생
│   │   │       ├── manuals/          매뉴얼 검색
│   │   │       ├── faqs/             내부 FAQ
│   │   │       ├── cases/            최신 케이스
│   │   │       └── kpi/              본인 KPI
│   │   │
│   │   ├── api/                      API Routes
│   │   │   ├── diagnose/             6변수 → 카드 7장 매칭
│   │   │   │   └── route.ts
│   │   │   ├── auth/                 Supabase Auth
│   │   │   ├── students/
│   │   │   ├── notifications/        카톡 알림 발송
│   │   │   ├── monitor/              345개 사이트 모니터링
│   │   │   ├── youtube/              유튜브 동기화
│   │   │   ├── quotes/               견적서 PDF 생성
│   │   │   └── webhooks/             결제 웹훅 등
│   │   │
│   │   └── globals.css               Tailwind + 디자인 토큰
│   │
│   ├── components/                   컴포넌트
│   │   ├── ui/                       shadcn/ui 기본
│   │   ├── layout/                   Header / Footer / Sidebar
│   │   ├── cards/                    카드 7장 컴포넌트
│   │   │   ├── Card1Schools.tsx      추천 학교 3개
│   │   │   ├── Card2Region.tsx       지역 정보
│   │   │   ├── Card3Cost.tsx         예상 비용
│   │   │   ├── Card4Salary.tsx       취업+연봉
│   │   │   ├── Card5PR.tsx           PR 로드맵
│   │   │   ├── Card6English.tsx      영어 준비 (EC 표현 X)
│   │   │   └── Card7CTA.tsx          유학 절차 + 카톡 CTA
│   │   ├── diagnose/                 진단 입력 (6변수)
│   │   ├── stage/                    StageTimeline (13단계)
│   │   ├── kanban/                   학생 칸반
│   │   ├── trust/                    신뢰 시그널 (실시간 카운터)
│   │   ├── quote/                    견적서 (관리자용)
│   │   ├── medical/                  ISAT / MMI / 5루트
│   │   └── kakao/                    KakaoButton 등
│   │
│   ├── lib/                          유틸리티
│   │   ├── supabase/                 Supabase 클라이언트
│   │   ├── matching/                 ⭐ 카드 매칭 엔진
│   │   │   ├── scenario.ts           Step 1: 시나리오 매칭
│   │   │   ├── modules.ts            Step 2: 모듈 조합
│   │   │   ├── assemble.ts           Step 3: 카드 7장 조립
│   │   │   ├── blocking.ts           Step 4: 차단룰 체크
│   │   │   └── public-filter.ts      Step 5: PUBLIC만 노출
│   │   ├── kakao/                    카카오 SDK
│   │   ├── pdf/                      견적서 PDF 생성
│   │   ├── monitor/                  사이트 모니터링
│   │   └── utils.ts
│   │
│   ├── data/                         정본 데이터 (빌드 시 임베드)
│   │   ├── master_v2.json            ⭐ 마스터 DB (학교 169 / 전공 1227)
│   │   ├── faq/                      ⭐ FAQ 84개 (5개 모듈)
│   │   │   ├── scenarios/            36개 시나리오
│   │   │   ├── schools/              24개 학교 모듈
│   │   │   ├── regions/              8개 지역 모듈
│   │   │   ├── majors/               10개 전공 모듈
│   │   │   └── visa-pr/              5개 비자/PR 모듈
│   │   ├── manuals/                  ⭐ 매뉴얼 475 (직원용)
│   │   ├── medical/                  ⭐ 의대 콘텐츠
│   │   │   ├── isat-200.json         ISAT 200문제
│   │   │   ├── mmi-40.json           MMI 40 스테이션
│   │   │   └── pathways-5.json       5진학루트
│   │   └── monitor-sites.json        365개 모니터링 사이트
│   │
│   ├── messages/                     ⭐ next-intl 번역
│   │   ├── ko.json                   한국어
│   │   └── en.json                   영문 (1페이지 분량)
│   │
│   ├── middleware.ts                 next-intl 미들웨어 + 권한 체크
│   ├── i18n.ts                       next-intl 설정
│   └── types/                        TypeScript 타입
│
├── supabase/
│   ├── migrations/                   DB 스키마 마이그레이션
│   ├── seed.sql                      초기 데이터
│   └── functions/                    Edge Functions
│
├── docs/                             빌드 문서
│   ├── ausuhak_SITE_SPEC_v2.5.md     ⭐ 이 사양서 (정본)
│   ├── BUILD_GUIDE.md                ⭐ Claude Code 빌드 가이드
│   └── CHANGELOG.md
│
├── .env.local                        환경변수 (Supabase / Vercel / Kakao)
├── next.config.js                    Next.js 설정
├── tailwind.config.ts                Tailwind 토큰
├── package.json
└── README.md
```

## A-4. i18n 라우팅 정책

```
한국어 (기본 / 메인)
   ausuhak.com               ← /ko/page.tsx 자동 (URL 노출 X)
   ausuhak.com/diagnose
   ausuhak.com/medical
   ausuhak.com/admin
   ...

영문 (학교 파트너용 / 1페이지)
   ausuhak.com/en            ← /en/page.tsx (1페이지만)
```

### 핵심 규칙
- 한국어 = 디폴트 / URL에 `/ko/` 안 붙임
- 영문 = `/en/` 명시적 / 1페이지만 (`/en/diagnose` 같은 하위 X)
- 한국어 → 영문 전환 = 푸터 작은 링크만 ("English / For Partners")
- 영문 → 한국어 전환 = 푸터 ("한국어 / Korean Site")

### 영문 사이트는 한국어 사이트 일부 컴포넌트 재사용 X
- 학생 진단 카드 / 마이페이지 / 결제 / 카톡 = 영문에 임포트 X
- 영문은 회사 소개 컴포넌트만 (`<EnAbout />`, `<EnContact />` 등)

## A-5. 환경변수 (.env.local)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 카카오
NEXT_PUBLIC_KAKAO_CHANNEL_URL=https://pf.kakao.com/_GadTX
NEXT_PUBLIC_KAKAO_APP_KEY=
KAKAO_REST_API_KEY=
KAKAO_BIZ_TALK_API_KEY=          # Phase 2

# YouTube
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=

# Vercel Cron
CRON_SECRET=

# Toss Payments (Phase 5+)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://ausuhak.com
NEXT_PUBLIC_SITE_NAME=ausuhak.com
```

## A-6. 월 운영 비용

| Phase | 학생 수 | 월 비용 | 비고 |
|---|---|---|---|
| Phase 1 | ~50명 | 0~5천원 | Vercel/Supabase 무료 티어 |
| Phase 2 | ~200명 | 1~3만원 | 알림톡 메시지 비용 |
| Phase 3 | ~500명 | 5~50만원 | 광고 시작 (예산에 따라) |

### 고정 비용
- 도메인: 연 2만원 (이미 보유)
- Vercel: 무료 → Pro $20/월 (트래픽 늘면)
- Supabase: 무료 → Pro $25/월 (DB 늘면)
- 카카오 비즈메시지: Phase 2 (월 1.5만원~)
- 알림톡: 메시지당 8~13원

---

# ✅ PART A 끝
