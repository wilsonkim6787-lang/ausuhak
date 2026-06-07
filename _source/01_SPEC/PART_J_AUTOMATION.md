# 🎯 PART J. 자동화 시스템

> **목적**: Wilson 1명이 950+ 학생 관리 가능하게 만드는 자동화
> **원칙**: AI는 자동화·알림·보조만 / 의사결정은 Wilson
> **Phase**: 자동화 = Phase 2~5에 점진 도입 (Phase 1은 수동 가능)

## J-1. 자동화 전체 그림

```
┌──────────────────────────────────────────────────┐
│ 자동화 영역 7개                                  │
├──────────────────────────────────────────────────┤
│ 1. 사이트 모니터링 365개 (Vercel Cron)            │
│ 2. 카톡 알림톡 자동 (Phase 2~)                   │
│ 3. 유튜브 동기화 (YouTube Data API v3)           │
│ 4. 학생 자동 케어 (Stage 정체 / Failure Pattern) │
│ 5. Wilson Alerts 자동 감지                       │
│ 6. 챗봇 자동 응답 (영업 시간 / 영업 시간 외)      │
│ 7. AI 보조 도구 (블로그 초안 / 학생 분석)         │
└──────────────────────────────────────────────────┘
```

## J-2. 사이트 모니터링 365개 (자동 갱신)

### 모니터링 대상 (호주유학생_종합사이트가이드_v2.xlsx 기반)

```
365개 사이트 = 11개 카테고리:
   1. 호주 한인사이트       29 (한인 커뮤니티)
   2. 호주 대학교           50 (학비 / 입학)
   3. 대학부속 컬리지        31 (Foundation / Pathway)
   4. 사립 컬리지·어학원    31 (ELICOS / Pathway)
   5. 호주 관광청           25 (지역 정보)
   6. 생활정보              93 (생활비 / 의료 / 안전)
   7. 연봉정보              78 (PayScale / SEEK / Glassdoor)
   8. 구직사이트            62 (Indeed / SEEK / LinkedIn)
   9. 이력서·면접           24 (이력서 / 면접 가이드)
   10. PR·취업비자          37 (DHA / Home Affairs)
   11. 실용팁               45 (호주 생활 팁)
```

### 모니터링 우선순위 (3단계)

```
🔴 Critical (6시간마다 체크)
   ├─ DHA / Home Affairs (비자 정책)
   ├─ AHPRA / ANMAC (의료 인증)
   ├─ 차단 학교 변경 감지
   └─ 정부 공식 사이트 (PR 점수 / 직업 리스트)

🟡 High (24시간마다 체크)
   ├─ 39개 대학교 학비 / 입학 요건
   ├─ Foundation / TAFE 학비
   ├─ 폐교 / 변경 감지
   └─ ELICOS 운영 47개

⚪ Normal (7일마다 체크)
   ├─ 생활정보 / 한인 사이트
   ├─ 연봉 / 구직 사이트
   └─ 실용 팁
```

### 작동 흐름

```
[Vercel Cron Job 자동 실행]
        ↓
[Critical 60개 사이트 = 6시간마다]
[High 200개 사이트 = 24시간마다]
[Normal 105개 사이트 = 7일마다]
        ↓
[각 사이트 HTML 스크래핑]
        ↓
[변경 감지 (이전 스냅샷 vs 현재)]
        ↓
[Diff 추출 → 의미 있는 변경?]
   - 학비 변경 (숫자 차이)
   - 입학 요건 변경 (IELTS 등)
   - 정책 변경 (DHA 등)
   - 폐교 / 학교명 변경
        ↓
[Wilson 알림 + 1-Click 승인 대기]
   "USyd 학비 인상 감지: $35,000 → $37,000
    [✅ 승인] [❌ 거절] [✏️ 수정]"
        ↓
[Wilson 1-Click 승인]
        ↓
[DB 업데이트 (schools / master_v2)]
        ↓
[관련 카드 캐시 무효화 (Vercel KV)]
        ↓
[다음 학생 카드 7장 = 최신 데이터 자동 반영]
```

### DB (PART D 테이블 27)

```sql
CREATE TABLE monitored_sites (
  id              UUID PRIMARY KEY,
  name            VARCHAR(255),
  url             TEXT,
  category        VARCHAR(50),
  priority        VARCHAR(20),         -- critical / high / normal
  check_frequency INTEGER,             -- 시간 단위
  last_checked_at TIMESTAMP,
  last_changed_at TIMESTAMP,
  change_log      JSONB DEFAULT '[]',
  is_active       BOOLEAN DEFAULT true
);

CREATE TABLE site_change_alerts (
  id              UUID PRIMARY KEY,
  site_id         UUID REFERENCES monitored_sites(id),
  detected_at     TIMESTAMP,
  change_type     VARCHAR(30),          -- 'tuition' / 'policy' / 'closure'
  before_value    TEXT,
  after_value     TEXT,
  diff_summary    TEXT,
  
  status          VARCHAR(20),          -- 'pending' / 'approved' / 'rejected'
  approved_by     UUID,
  approved_at     TIMESTAMP,
  
  applied_to_db   BOOLEAN DEFAULT false,
  applied_at      TIMESTAMP
);
```

### Vercel Cron 설정 예시

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/monitor-critical",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/monitor-high",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/monitor-normal",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

### Phase 별 도입

```
Phase 1: 수동 (Wilson이 가끔 사이트 확인)
Phase 2: Critical 60개만 자동 (6시간마다)
Phase 3: High 200개 추가 (24시간마다)
Phase 4: Normal 105개 추가 (7일마다)
Phase 5: AI 자동 변경 분석 (Wilson 1-Click 승인 → 의미 있는 변경만)
```

## J-3. 카톡 알림톡 자동 (Phase 2~)

### 카카오 비즈니스 파트너센터 연동

```
[Wilson 사업자 등록증 + 카카오 비즈니스 파트너 가입]
        ↓
[알림톡 템플릿 등록 (카카오 승인 필요)]
   - 약 1~2주 승인
   - 메시지 템플릿 = 변경 X
        ↓
[API 연동 → notifications 테이블 활용]
        ↓
[자동 발송 트리거]
```

### 알림톡 템플릿 (사전 등록 필요)

```
1. [신규 학생 환영]
   "안녕하세요 {{학생이름}}님!
    카드 7장 진단 결과 확인하세요 → ausuhak.com/diagnose/result/{{uuid}}
    30분 무료 상담 가능합니다."

2. [결제 확인]
   "{{학생이름}}님 PRO ₩50,000 결제 확인되었습니다.
    1:1 상담 일정 잡으세요 → ausuhak.com/mypage"

3. [Stage 8 Offer 도착]
   "🎉 {{학생이름}}님 합격 통지!
    {{학교명}} - {{전공}} 합격하셨습니다.
    Offer Letter 다운로드 → ausuhak.com/mypage/offers"

4. [Critical Deadline D-7]
   "{{학생이름}}님 마감일 임박:
    {{마감항목}} - {{D-N}}일 남음
    빠른 진행 필요 → ausuhak.com/mypage"

5. [Stage 12 호주 도착 체크인]
   "{{학생이름}}님 호주 도착 N개월 체크인
    학업 / 알바 / 생활 어떠세요?
    답장 주시면 Wilson이 응대 드립니다."

6. [영업 시간 외 자동 응답]
   "안녕하세요 ausuhak입니다 🇦🇺
    영업 시간: 평일 10:00 ~ 18:00
    다음 영업일 답변 드리겠습니다."

7. [학생 진단 결과 발송]
   "{{학생이름}}님 카드 7장 진단 결과:
    ausuhak.com/diagnose/result/{{uuid}}
    더 자세한 분석은 1:1 상담에서!"
```

### 발송 로직

```typescript
// /src/lib/kakao/alimtalk.ts
async function sendAlimtalk(
  studentId: string,
  templateCode: string,
  variables: Record<string, string>
) {
  // 1. 학생 카톡 ID 조회
  const student = await db.students.findFirst({ where: { id: studentId } });
  if (!student.kakao_id) return null;
  
  // 2. notifications 테이블 INSERT
  const notif = await db.notifications.insert({
    student_id: studentId,
    event_type: templateCode,
    channel: 'kakao_alimtalk',
    status: 'pending',
    message_template: templateCode,
    variables: variables
  });
  
  // 3. 카카오 비즈니스 API 호출
  try {
    const response = await fetch(KAKAO_BIZ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KAKAO_BIZ_TOKEN}` },
      body: JSON.stringify({
        sender_key: KAKAO_SENDER_KEY,
        template_code: templateCode,
        recipient: student.kakao_id,
        variables: variables
      })
    });
    
    // 4. 발송 결과 업데이트
    if (response.ok) {
      await db.notifications.update({
        where: { id: notif.id },
        data: { status: 'sent', sent_at: new Date() }
      });
    } else {
      throw new Error('Alimtalk failed');
    }
  } catch (error) {
    await db.notifications.update({
      where: { id: notif.id },
      data: { 
        status: 'failed',
        error_message: error.message
      }
    });
    
    // Wilson 알림 (실패 시)
    notifyWilson(`Alimtalk failed: ${student.name}`);
  }
}
```

### 발송 비용

```
알림톡 (사업자 메시지): 8~13원/건
일반 친구톡: 무료
SMS (긴급): 30~50원/건

월 예상:
   Phase 2 (50명): 월 1~2만원
   Phase 3 (200명): 월 5~10만원
   Phase 5 (500명): 월 15~30만원
```

### 발송 ON/OFF 토글 (학생별)

```
학생 마이페이지:
   [💬 알림 설정]
   ☑️ Stage 진행 알림
   ☑️ 마감일 알림 (D-7 / D-3 / D-1)
   ☑️ 결제 / 영수증 알림
   ☑️ 합격 / 비자 / 출국 알림
   ☐ Wilson 직접 메시지만 받기 (자동 알림 OFF)
```

## J-4. 유튜브 동기화 (YouTube Data API v3)

### Wilson 채널 자동 동기화

```
[Wilson YouTube 채널]
        ↓ (24시간마다 Vercel Cron)
[YouTube Data API v3 호출]
   ├─ 채널 영상 목록 가져옴
   ├─ 신규 영상 감지
   ├─ 메타데이터 추출 (제목 / 설명 / 썸네일 / 조회수)
   └─ 카테고리 자동 분류 (Wilson 검토)
        ↓
[youtube_videos 테이블 INSERT/UPDATE]
        ↓
[/youtube 페이지 자동 노출]
```

### DB (PART D 테이블 23)

```sql
CREATE TABLE youtube_videos (
  id                  UUID PRIMARY KEY,
  youtube_video_id    VARCHAR(50) UNIQUE,
  title               VARCHAR(500),
  description         TEXT,
  thumbnail_url       TEXT,
  duration            INTEGER,
  published_at        TIMESTAMP,
  view_count          INTEGER,
  
  category            VARCHAR(50),
  -- '간호' / 'IT' / '비자' / '생활' / 'Q&A' / '후기'
  related_card_ids    INTEGER[],
  
  is_featured         BOOLEAN,
  is_visible          BOOLEAN DEFAULT true,
  
  last_synced_at      TIMESTAMP DEFAULT NOW()
);
```

### 카테고리 자동 분류 (Wilson 검토)

```typescript
// /src/lib/youtube/categorize.ts
function autoCategorize(video: YouTubeVideo): string {
  const title = video.title.toLowerCase();
  const desc = video.description.toLowerCase();
  
  if (title.includes('간호') || desc.includes('간호')) return '간호';
  if (title.includes('it') || title.includes('개발')) return 'IT';
  if (title.includes('비자') || title.includes('500')) return '비자';
  if (title.includes('생활') || title.includes('호주')) return '생활';
  if (title.includes('q&a') || title.includes('질문')) return 'Q&A';
  if (title.includes('후기') || title.includes('합격')) return '후기';
  
  return '기타';
}
```

### Wilson 1-Click 카테고리 변경

```
Wilson 관리자 페이지 → 📺 유튜브:
   ├─ 신규 영상 자동 감지
   ├─ 카테고리 자동 분류 (AI)
   ├─ Wilson 검토 → 카테고리 수정 가능
   └─ related_card_ids 연결 (학생 카드와 연관)
```

### 카드 7장 연관 영상

```
학생 카드 7장 결과 페이지:
   카드 1 (학교) → 학교 관련 영상 1개 자동 추천
   카드 5 (PR) → PR 트랙 관련 영상 1개
   카드 7 (CTA) → "더 보기 → /youtube" 링크
```

## J-5. 학생 자동 케어 (Stage 정체 / Failure Pattern)

### 정체 감지 자동 트리거

```
Vercel Cron Job (6시간마다):
   ↓
[모든 학생 데이터 분석]
   ↓
[정체 감지 룰 7개]
```

### 정체 감지 룰 7개

```
1. 학생 5일+ 활동 X
   → Wilson 알림
   
2. 마이페이지 1주+ 미접속
   → 학생 카톡 자동:
     "○○님 잘 지내시죠? 진행 상황 어떠세요?"
   
3. 서류 업로드 3일+ 지연
   → 학생 카톡 자동:
     "{{서류명}} 업로드 부탁드려요. D-N일 남음"
   
4. 결제 후 5일+ 다음 액션 X
   → Wilson 알림 (1:1 상담 일정 안 잡힘)
   
5. 비자 신청 후 30일+
   → 학생 자동:
     "비자 심사 평균 4~8주, 안심하세요. 결과 받으면 알려드려요."
   
6. Stage 정체 (같은 Stage 14일+)
   → Wilson 긴급 알림
   
7. 호주 도착 후 6개월
   → Failure Pattern 6개 자동 체크
   → Wilson 알림 (위험 패턴 감지 시)
```

### Failure Pattern 6개 자동 감지

```
호주 도착 후 6개월 체크인:
   학생 카톡 자동:
     "{{학생이름}}님 호주 6개월 어떠세요?
      6가지 짧은 질문 보내드릴게요."
   
   ┌─ 질문 1: "부모님과 통화 자주 하세요?"
   ├─ 질문 2: "알바 시간 일주일에 몇 시간?"
   ├─ 질문 3: "영어 일상 대화 OK?"
   ├─ 질문 4: "용돈 / 생활비 OK?"
   ├─ 질문 5: "Wilson 권장 사항 따르고 계세요?"
   └─ 질문 6: "한인 친구 vs 호주 친구 비율?"

학생 답변 → AI 자동 분석 → 패턴 매칭:
   - Pattern 1 (부모-자녀 갈등) → "통화 안 함" + "스트레스"
   - Pattern 2 (알바 과몰입) → "20시간+/주"
   - Pattern 3 (영어 부족) → "일상 대화 어려움"
   - Pattern 4 (여가 과몰입) → "용돈 부족" + "여가 많음"
   - Pattern 5 (Wilson 평가 불신) → "권장 안 따름"
   - Pattern 6 (한인 의존) → "한인 친구 90%+"

위험 감지 시:
   → Wilson 폰 알림 ⚠️
   → student_notes에 wilson_only 메모 자동 생성
   → Wilson이 1:1 응대 (학생에게 직접 X / 추가 질문)
```

## J-6. AI 보조 도구 (Phase 5+)

### 1. 블로그 초안 자동 생성

```
Wilson 명령:
   "이번 주 주제: 검정고시 학생 USyd Foundation 합격 사례"
        ↓
[AI 블로그 초안 생성]
   - master_v2 학교 데이터
   - FAQ 84 시나리오
   - Wilson 매뉴얼 475 케이스
        ↓
[Wilson 검토 → 1-Click 발행]
```

### 2. 학생 답변 추천 (카톡 응대 보조)

```
[학생 카톡 메시지 도착]
   "ANMAC 미인증 학교가 뭐야?"
        ↓
[AI 자동 검색]
   - internal_faqs (관련 FAQ 3개)
   - master_v2 (차단 학교 리스트)
   - staff_manuals (관련 매뉴얼 5개)
        ↓
[Wilson에게 답변 추천 (관리자 페이지)]
   "추천 답변:
    'ANMAC = Australian Nursing and Midwifery Accreditation Council...'
    [✅ 사용] [✏️ 수정] [❌ 직접 작성]"
        ↓
[Wilson 1-Click 발송]
```

### 3. 학생 진단 카드 미세 조정

```
AI가 학생 카톡 대화 분석:
   - 학생 진짜 의도 (PR vs 학업 vs 도피)
   - 학생 영어 실제 수준 (시험 점수와 다름)
   - 학생 가족 상황 (부모 갈등 의심)
        ↓
[Wilson 전용 메모 (wilson_only)에 AI 분석 자동 추가]
   "AI 분석: 학생 메시지 톤 분석 결과
    - PR 의도 강함 (점수 80%)
    - 영어 자신감 낮음 (실제 수준 5.5 추정)
    - 가족 갈등 의심 (Pattern 1)"
        ↓
[Wilson 검토 → 1:1 응대 시 활용]
```

## J-7. 챗봇 자동 응답 (이미 PART F에 박힘)

```
영업 시간 (평일 10:00~18:00):
   ├─ 챗봇 인사 + 6변수 질문
   ├─ 학생 답변 → DB INSERT
   ├─ 진단 결과 페이지 링크 발송
   └─ Wilson 폰 알림 (분배 룰 4단계)

영업 시간 외:
   ├─ 챗봇 자동 응답 (다음 영업일 안내)
   ├─ 학생 6변수 받음 (24시간 가능)
   └─ Wilson 알림 = 다음 영업일 아침 대시보드
```

## J-8. 자동화 ON/OFF (Wilson 제어)

```
관리자 페이지 → ⚙️ 사이트 설정 → 자동화:

✅ 활성화 (기본):
   - 사이트 모니터링 365개
   - 학생 자동 케어 (정체 감지)
   - 카톡 알림톡 (Stage 8 Offer 등)
   - 유튜브 동기화 (24시간)

⚙️ 옵션 (Wilson 결정):
   ☐ AI 블로그 초안 (Phase 5+)
   ☐ AI 답변 추천 (Phase 5+)
   ☐ AI 학생 분석 (Phase 5+)
   
🔴 비활성화 (Wilson 위임 X):
   - AI 자동 학생 카드 추천 (학생 안전)
   - AI 자동 답변 발송 (Wilson 검토 필수)
   - AI 자동 결제 / 환불
```

## J-9. 자동화 활동 로그

```
모든 자동화 행동 = activity_logs 자동 기록:
   - cron_executed (Cron Job 실행)
   - kakao_sent (알림톡 발송)
   - youtube_synced (유튜브 동기화)
   - student_alert_triggered (정체 감지)
   - failure_pattern_detected (위험 패턴)
   - ai_recommendation (AI 추천 사용)

Wilson 관리자 페이지 → 📈 통계 → 자동화:
   - 일일 알림톡 발송 수
   - 정체 감지 발생률
   - AI 추천 사용률
   - 자동화 실패 건수
```

## J-10. Phase 별 자동화 도입

```
Phase 1 (1~2주): 수동 우선
   ├─ 사이트 모니터링: Wilson 가끔 확인
   ├─ 카톡: Wilson 직접 응대
   ├─ 유튜브: Wilson 직접 업로드
   └─ 학생 케어: Wilson 직접

Phase 2 (2~3주): 핵심 자동화
   ├─ 사이트 모니터링: Critical 60개 자동
   ├─ 카톡 알림톡: 핵심 7개 템플릿
   ├─ 유튜브 동기화: 자동
   └─ 학생 자동 케어: 정체 감지

Phase 3 (2~3주): 확장 자동화
   ├─ 사이트 모니터링: High 200개 추가
   ├─ 카톡 알림톡: 모든 Stage 알림
   ├─ Failure Pattern 6개 자동 감지
   └─ 챗봇 24시간 자동 응답

Phase 4 (1~2주): 마케팅 자동화
   ├─ 사이트 모니터링: Normal 105개 추가
   ├─ 카톡 광고 자동 (타겟팅)
   └─ 학생 추천 시스템 (졸업생 → 후배)

Phase 5 (1~2주): AI 보조
   ├─ AI 블로그 초안
   ├─ AI 답변 추천 (Wilson 검토)
   ├─ AI 학생 분석 (wilson_only 메모)
   └─ Toss Payments 자동 결제
```

---

# ✅ PART J 끝
