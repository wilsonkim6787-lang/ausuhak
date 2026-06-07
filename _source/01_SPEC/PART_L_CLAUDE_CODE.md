# 🎯 PART L. Claude Code 명령서

> **목적**: Wilson이 Claude Code 처음 열고 그대로 복붙할 빌드 명령
> **운영자**: Wilson Kim (코딩 경험 X / Claude Max 사용 中)
> **원칙**: 1개씩 진행 / 각 Step 끝나면 Wilson 검토
> **결과물**: ausuhak.com Phase 1 라이브 (1~2주)

## L-1. 빌드 시작 전 Wilson 준비물

### 계정 가입 (한국어 안내)

```
Step 1: GitHub 가입 (필수)
   1. https://github.com 접속
   2. "Sign up" 클릭
   3. 이메일 / 비밀번호 / 사용자명 입력
   4. 이메일 인증
   ⏱️ 5분

Step 2: Vercel 가입 (필수)
   1. https://vercel.com 접속
   2. "Sign Up with GitHub" 클릭 (GitHub 계정 연결)
   3. 무료 Hobby 플랜 시작
   ⏱️ 3분

Step 3: Supabase 가입 (필수)
   1. https://supabase.com 접속
   2. "Start your project" 클릭
   3. GitHub 계정으로 로그인
   4. 무료 플랜 시작
   ⏱️ 3분

Step 4: Claude Code 설치 (필수)
   1. https://claude.ai/code 접속
   2. Mac 또는 Windows 다운로드
   3. 설치 (Wilson Mac 기준 5분)
   4. Claude Max 계정으로 로그인
   ⏱️ 10분

Step 5: 도메인 ausuhak.com 확인
   - Wilson 이미 보유 ✅
   - DNS 관리 페이지 접근 가능 확인

총 준비 시간: 약 30분
```

### 파일 준비 (다운로드 받은 것 모두)

```
바탕화면에 'ausuhak' 폴더 만들기:
   ~/Desktop/ausuhak/
        ├── ausuhak_SITE_SPEC_v2.5.md (전체 사양서)
        ├── ausuhak_master_v2_clean.json (정본 마스터 DB)
        ├── 변경로그.md (master_v2 정비 이력)
        ├── ausuhak_main_FINAL.html (디자인 가이드 / 70%)
        ├── ausuhak_medical.html (의대 콘텐츠 / ISAT 200 + MMI 40)
        ├── ausuhak_DB_v2.md (FAQ 가이드)
        ├── ausuhak_faq/ (FAQ 84개 폴더)
        └── staff_manuals/ (매뉴얼 475개 폴더)
```

## L-2. Claude Code 첫 명령어

```
[터미널 열기]
   Mac: Spotlight 검색 → "터미널" 입력 → Enter
   Windows: 시작 → "PowerShell" 입력 → Enter

[ausuhak 폴더로 이동]
   cd ~/Desktop/ausuhak

[Claude Code 시작]
   claude

[Claude Code 첫 명령어 - 그대로 복붙]
```

### 첫 명령어 (Wilson 복붙용)

```
호주유학(ausuhak.com) 사이트를 빌드해줘.

[내 정보]
- Wilson Kim (호주유학 19년 / 950명+ / QEAC E240)
- 카카오 채널: https://pf.kakao.com/_GadTX
- 도메인: ausuhak.com (보유 中)
- 코딩 경험: 없음 (초보자 안내 부탁)
- Claude Max + Claude Code 사용 中

[첨부 파일 - 이 폴더 안에 있음]
1. ausuhak_SITE_SPEC_v2.5.md (사양서 / 정본)
2. ausuhak_master_v2_clean.json (마스터 DB / 학교·전공·차단룰)
3. 변경로그.md (master_v2 정비 이력 참고)
4. ausuhak_main_FINAL.html (디자인 가이드 / 70%)
5. ausuhak_medical.html (의대 콘텐츠 / ISAT 200 + MMI 40)
6. ausuhak_DB_v2.md (FAQ 가이드)
7. ausuhak_faq/ (FAQ 84개)
8. staff_manuals/ (매뉴얼 475개)

[작업 요청]

1. 모든 파일 정독 (대충 X)
   - 사양서 v2.5 = 정본
   - 절대 원칙 PART 0-1 ~ 0-15 숙지
   - master_v2_clean = 학교 / 전공 / 차단룰 정본

2. Phase 1 작업 계획 정리
   - PART K 빌드 순서 따라
   - Step 1.1 ~ Step 1.10 단계
   - 각 Step 시간 예상

3. 계정 가입 안내 (한국어)
   - 이미 GitHub / Vercel / Supabase 가입 완료
   - 도메인 ausuhak.com 보유
   - Claude Max + Claude Code 설치 완료

4. Phase 1 시작 전 확인
   - 빠진 거 / 의문점 짚어줘
   - 사양서 정독 결과 보고

[원칙 - 절대 준수]
✅ PART 0 콘텐츠 절대 금지 사항 위반 X
✅ 학생 internal_data / wilson_note 절대 노출 X
✅ 3중 보안 (DB / API / UI) 모두 적용
✅ master_v2_clean = 정본 (다른 데이터 X)
✅ 카드 7장 = FAQ README 정본 순서 (학교/지역/비용/연봉/PR/영어/절차)
✅ 학생 지역 우선 (시드니 선택 = 시드니 학교만)
✅ 1개씩 진행 (배치 5개+ 금지)
✅ 각 Step 끝나면 Wilson 검토 요청
✅ Vercel 미리보기 URL 즉시 생성

[금지]
❌ 임의 데이터 추가 (UNSW 간호 같은 사실 오류)
❌ "1순위 / 추천" ranking 표현
❌ Wilson EC 어학원 = 카드/FAQ에 X (푸터 자매학교만)
❌ 알바비 차감 = 빼기 (표현만)
❌ "삼촌" 표현 = Wilson 스토리만 (Hero / 카드 등 X)
❌ "Ausuhak" 대문자 / "호주 유학" 띄어쓰기

먼저 사양서 정독 + Phase 1 작업 계획 정리해서 보여줘.
정독 결과 보고 OK면 Step 1.1부터 시작.
```

## L-3. Phase 1 진행 가이드

### Step 1.1 시작 시 Claude Code에 명령

```
사양서 정독 끝났으면 Step 1.1 환경 설정 진행해줘.

순서:
1. Next.js 15 프로젝트 초기화 (TypeScript + App Router)
2. Tailwind CSS + shadcn/ui 설치
3. 폰트 설치 (Pretendard / Inter / Playfair Display)
4. Supabase 프로젝트 생성 (Wilson에게 가이드 안내)
5. Vercel 프로젝트 연결 (GitHub 통해)
6. 도메인 ausuhak.com 연결

[Wilson 작업 필요 시]
- 어디 클릭하는지 단계별 한국어 캡처 안내
- 환경변수 (.env.local) 어떻게 입력하는지 안내

[안전 장치]
- 모든 Step 끝나면 git commit
- 미리보기 URL 즉시 생성 (Vercel Preview)
- Wilson 시각 검토 요청

진행해줘.
```

### Step 별 진행

```
Step 1.1 → OK → Step 1.2 → OK → ... → Step 1.10

각 Step 끝날 때마다:
1. Claude Code: "Step 1.X 완료. 미리보기 URL: https://ausuhak-preview.vercel.app"
2. Wilson: 시각 검토 (모바일 + PC)
3. Wilson 피드백:
   - "OK 다음 Step"
   - "여기 좀 바꿔줘"
   - "다시 해줘"
4. Claude Code 즉시 반영 또는 다음 Step
```

## L-4. Wilson 시각 검토 체크리스트 (각 Step)

```
모바일 검토 (먼저):
   ☐ 320px 가장 작은 화면에서 깨짐 X
   ☐ 모든 글자 16px 이상 (읽기 쉬움)
   ☐ 모든 버튼 44px 이상 (터치 쉬움)
   ☐ 가로 스크롤 X
   ☐ 카톡 채널 진입 = 1초 (kakaotalk:// 딥링크)

PC 검토:
   ☐ 1280px 이상에서 늘어짐 X
   ☐ 사이드바 + 메인 레이아웃
   ☐ 키보드 네비게이션 (Tab 작동)

디자인:
   ☐ Navy + Gold + Cream 컬러
   ☐ 폰트: Pretendard (한글) + Playfair (영문 디스플레이)
   ☐ 부드러운 그림자 / 둥근 모서리
   ☐ 톤: "전문가 + 따뜻한 신뢰" (Warm Trust)

콘텐츠:
   ☐ "삼촌" 표현 = Wilson 스토리에만
   ☐ 알바비 차감 X
   ☐ "1순위 / 추천" 없음
   ☐ Wilson EC 어학원 = 카드 X (푸터만)
   ☐ 카카오 채널 = pf.kakao.com/_GadTX
   ☐ 영업 시간 = 평일 10:00 ~ 18:00

기능:
   ☐ 진단 폼 6변수 작동
   ☐ 카드 7장 결과 노출 (지역 우선)
   ☐ 부가 옵션 4개 (📤 / 📧 / 🔖 / 🔗)
   ☐ 학생 internal_data 노출 X (검증)
```

## L-5. Phase 1 빌드 중 자주 쓸 명령어

### 학생 카드 7장 검증

```
학생 6변수 입력 → 카드 7장 결과 검증해줘.

테스트 케이스:
1. 검정고시 / 영어없음 / 간호 / 시드니
2. 검정고시 / IELTS 6.0 / 비즈니스 / 시드니
3. 대졸 / IELTS 7.0 / IT / 멜번
4. 워홀러 / IELTS 5.5 / 요리 / 호바트
5. 18미만 / 검정고시 / 미정 / 추천받기

각 케이스마다:
   - 시나리오 매칭 결과
   - 카드 1 추천 학교 3개 (지역 우선!)
   - 카드 5 PR 로드맵 (지역 맞춤!)
   - 차단 학교 자동 제외 검증
   - master_v2_clean 정본 사용 검증

UNSW 간호 같은 사실 오류 = 자동 차단 검증.
```

### Wilson 디자인 피드백

```
미리보기 URL 봤는데:
- [구체적 부분] 톤이 너무 친근함
- [구체적 부분] 색상이 진해짐
- [구체적 부분] 모바일에서 글자 작음

수정해줘.
```

### 빌드 중 막히면

```
[에러 메시지] 발생했어. 어떻게 해결해?

[Wilson 환경]
- Mac / Windows
- 어떤 단계에서
- 정확한 에러 메시지
```

## L-6. Phase 1 끝난 후 다음 단계

### Phase 1 완료 검증

```
Phase 1 끝났어.

[검증 요청]
1. 모든 페이지 모바일 + PC 작동
2. 학생 진단 6변수 → 카드 7장 작동
3. 카톡 채널 진입 작동
4. Wilson 관리자 페이지 작동
5. 영문 사이트 /en 작동
6. 도메인 ausuhak.com 연결 완료

[Wilson 검토 후]
OK → Phase 2 시작
NO → 수정 필요 부분 수정

검증 결과 보고해줘.
```

### Phase 2 시작 명령어

```
Phase 2 시작해줘.

[Phase 1 → Phase 2 전제]
- ausuhak.com Phase 1 라이브 中
- Wilson 사업자 등록증 발급 진행 中 (1~2주)
- 카카오 비즈니스 파트너센터 가입 진행 中

[Phase 2 작업 - PART K-3 따라]
Step 2.1 ~ Step 2.7

순서:
1. Supabase Auth (회원가입 / 로그인)
2. 마이페이지 (Stage 12 시각화)
3. 결제 시스템 (수동 / Wilson 입금 안내)
4. 견적서 PDF 자동 생성
5. 카톡 알림톡 (사업자 등록 후)
6. 직원 페이지
7. 의대 페이지

각 Step 끝나면 Wilson 검토 요청.
진행해.
```

## L-7. 빌드 중 안전 장치

### Git 커밋 / 롤백

```
모든 Step 끝나면:
   git commit -m "Phase 1 - Step 1.X complete"
   git tag phase-1-step-X

문제 발생 시:
   Wilson: "이전 Step으로 롤백해줘"
   Claude Code: git revert + Vercel 재배포
```

### 백업

```
중요 시점마다 자동 백업:
   - Phase 1 완료 시 → 'phase-1-complete' 태그
   - Phase 2 완료 시 → 'phase-2-complete' 태그
   - 배포 시 → 자동 백업 (Vercel 30일 보관)

문제 발생 시:
   "phase-1-complete 시점으로 돌려줘"
```

### Wilson 개입 필요 시

```
Claude Code가 막히면:
   "Wilson 도움 필요"
   - Supabase 환경변수 입력 필요
   - 카카오 API Key 발급
   - 도메인 DNS 설정
   - 사업자 등록증 정보
```

## L-8. Wilson 자주 묻는 질문 (FAQ)

```
Q1: 빌드 中 멈춰도 되나요?
A: 됩니다. Claude Code 종료 후 재시작 가능.
   Git 커밋된 부분 = 이어서 진행.

Q2: 코드 잘 모르는데 어떻게 검토?
A: 시각 검토만 OK. Vercel 미리보기 URL 보고:
   - 디자인 OK?
   - 톤 OK?
   - 작동 OK?
   - 모바일 OK?

Q3: 빌드 후 수정 가능?
A: 네. Claude Code에 "[부분] 바꿔줘" 명령 = 즉시 반영.

Q4: 에러 나면?
A: 에러 메시지 그대로 Claude Code에 복붙.
   "이 에러 났어 어떻게 해?"

Q5: 시간 얼마 걸려?
A: Phase 1 = 1~2주 (Wilson 매일 검토 시).
   Wilson 바쁘면 = 1개월.

Q6: 비용?
A: Phase 1 = 0~5천원/월
   - 도메인: 연 2만원 (이미 보유)
   - Vercel: 무료
   - Supabase: 무료
   - Claude Max: 이미 사용 中

Q7: master_v2 데이터 변경 시?
A: master_v2_clean.json 수정 → Claude Code에 업로드
   "master_v2 업데이트했어. DB 반영해줘"

Q8: 카톡 알림톡 = 언제부터?
A: Phase 2 (사업자 등록 후 1~2주 카카오 승인).

Q9: 모바일 앱 만들 수 있어?
A: Phase 1 = PWA (웹앱) 완성. 홈 화면 추가 가능.
   네이티브 앱 = 추후 (필요 시).

Q10: 다른 사람도 관리자 페이지 쓸 수 있어?
A: 네. Wilson이 직원 추가 → 권한 부여
   체크박스 17개로 세부 권한 설정.
```

## L-9. Wilson 결제 / 운영 안내

```
Phase 1 라이브 後:

학생 결제 흐름 (Phase 1~4 = 수동):
   1. 학생 카톡 채널 진입
   2. 30분 무료 상담
   3. PRO ₩50,000 결제 결정
   4. Wilson 카톡으로 입금 안내:
      "카카오뱅크 ○○○○ Wilson Kim
       메모: [학생 이름]"
   5. 학생 입금
   6. Wilson 입금 확인 (관리자 페이지 → 결제 → 확인 클릭)
   7. 자동 회원가입 + 마이페이지 활성화
   8. 1:1 상담 일정 잡음 (2시간 / 줌 또는 방문)

Wilson 일상 운영:
   - 아침 대시보드 = 우선순위 한눈에
   - 학생 카톡 응대 = 30분 무료
   - 1:1 상담 (PRO 2시간 / 의대 / 풀)
   - 견적서 작성 (학생 결정 후)
   - Stage 추적 + 알림 발송
```

## L-10. 응급 상황 대응

```
🚨 사이트 다운 시:
   - Vercel Status 확인: vercel-status.com
   - Vercel 이전 배포로 1-Click 롤백
   - "이전 배포로 돌려줘" Claude Code 명령

🚨 학생 데이터 사고:
   - Supabase 자동 백업 (7일 보관)
   - Wilson 1-Click 복원

🚨 보안 이슈:
   - activity_logs에서 무단 접근 자동 감지
   - Wilson 폰 알림 → 즉시 차단
   - Supabase RLS 정책 활성

🚨 Wilson 부재 (휴가 등):
   - 직원 자동 분배 (4단계 룰)
   - 임시 담당 = 24시간 자동
   - 학생 케어 = 영업 시간 외 챗봇
```

---

# ✅ PART L 끝
