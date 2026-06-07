# 🎯 PART C. 권한 시스템 (Super Admin 모델)

## C-1. 핵심 원칙

```
✅ Super Admin = Wilson 1명 (영구 / 유일)
✅ 모든 권한 = Wilson이 가지고 있고, 다른 사람에게 직접 부여
✅ 직급 X (Manager / Consultant / Intern 같은 고정 직급 폐기)
✅ 권한 = 체크박스로 항목별 ON/OFF
✅ Wilson이 언제든 권한 변경/철회
✅ 직원 무제한 추가 가능 (정원 X)
```

### 절대 금지
- ❌ Wilson 외 다른 사용자에게 Super Admin 부여 X
- ❌ 직급 시스템 (Manager / Consultant / Intern) 부활 X
- ❌ 직원 leaderboard / 경쟁 표시 X
- ❌ Lead Score 등급 학생/직원에게 노출 X

## C-2. 권한 구조 (3계층)

### 🔴 Super Admin = Wilson 영구 / 1명

```
Wilson만 가능한 권한 (다른 사람 부여 X):
   ✅ 모든 학생 데이터 보기·수정
   ✅ 다른 사용자 권한 변경 (유일)
   ✅ 시스템 설정 변경 (사이트 정보 / 가격 / 영업시간 등)
   ✅ 🔴 Wilson 전용 메모 작성·열람
   ✅ 🟡 모든 직원의 공유 메모 열람
   ✅ 결제 확인·취소
   ✅ 직원 추가·삭제·휴가 등록
   ✅ DB 업데이트 1-click 승인
   ✅ 사이트 모니터링 변경 승인
   ✅ 의대 학생 직접 응대 (위임 X)
   ✅ Wilson Alerts 모든 케이스 확인
```

### 🟢 직원 = 가변 / 무제한 추가

Wilson이 [직원 추가] 클릭 → 이름·이메일 입력 → 체크박스로 권한 부여:

```
□ 학생 보기
   ○ 전체 학생 (Wilson 위임 / 매우 신중)
   ○ 본인 담당만 (기본값)
   
□ 학생 정보 수정
□ 서류 체크 (받음 / 검증)
□ Offer Letter 업로드
□ 결제 확인 (Wilson 위임 / 매우 신중)

□ 학생 메모 작성
   ○ 🟡 공유 메모 (Wilson + 담당 직원 본인)
   ○ 🔴 Wilson 전용 메모 = 작성 불가 (Wilson만)

□ 학생 메모 보기
   ○ 🟡 본인 담당 학생의 공유 메모만
   ○ 🔴 Wilson 전용 메모 = 절대 X

□ 매뉴얼 475 보기
□ 매뉴얼 475 수정 (Wilson 위임)
□ 내부 FAQ 84 보기
□ 내부 FAQ 84 수정 (Wilson 위임)
□ 블로그 글 작성 (Wilson 위임)
□ 블로그 글 발행 (Wilson 위임)
□ 카톡 알림톡 발송 (본인 담당 학생만)
□ 견적서 작성 (Wilson 위임)
□ 통계 보기 (본인 담당 학생만)
□ 다른 직원 권한 관리 (Wilson 위임 / 매우 신중)
```

### 🔵 학생 = 자동 / 본인 데이터만

```
✅ 본인 마이페이지만 접근
✅ 본인 서류 업로드
✅ 본인 결제 내역 조회
✅ 본인 견적서 보기·다운로드
✅ 본인 Stage 진행 시각화
✅ 셀프 가이드 (4개 영역)
✅ 카톡 채널 진입

❌ 절대 접근 X:
   - internal_faqs.internal_data
   - internal_faqs.wilson_note
   - student_notes 테이블 (전체)
   - staff_manuals 테이블 (전체)
   - 다른 학생 데이터
   - admin / staff URL
   - isat_questions.wilson_model_answer
   - mmi_scenarios.wilson_model_answer
```

## C-2.5. 학생-직원 다중 담당 시스템 (1:N)

> **핵심 원칙**: 학생 1명 = 담당 직원 여러 명 가능.
> Wilson이 상담했어도 일상 케어는 분야 전문 직원과 공유.

### 담당 역할 3종

```
🔵 주담당 (primary)
   - 1명만 (한 학생당 1명)
   - 카톡 알림 1차 책임
   - Stage 변경 권한
   - 견적서 작성 가능 (Wilson 위임 시)

🟢 공유 담당 (shared)
   - 여러 명 가능 (제한 없음 / Wilson 결정)
   - 학생 케어 공유
   - 🟡 공유 메모 작성·열람
   - Stage 변경 가능
   - 카톡 알림 발송 가능

⚪ 관찰 담당 (observer)
   - 신입 직원 학습용
   - 학생 데이터 보기만 (수정 X)
   - 메모 작성 X (보기만)
   - 카톡 발송 X
```

### Wilson Super Admin = 모든 학생 자동 접근
- 별도 담당 부여 불필요
- Wilson은 항상 모든 학생 데이터 + 🔴 전용 메모 + 🟡 공유 메모 다 보임

### 권한 부여 흐름

```
[Wilson 관리자 페이지 → 학생 상세 → "담당 추가"]
        ↓
   ┌──────────────────────────────────┐
   │ 직원 선택: [드롭다운]              │
   │ 역할: ○ 주담당 ○ 공유 ○ 관찰     │
   │ 부여 사유: [텍스트]                │
   │ [저장]                           │
   └──────────────────────────────────┘
        ↓
student_assignments 테이블 INSERT
        ↓
해당 직원 페이지에 학생 자동 노출
```

### 권한 매트릭스 (담당 역할별)

| 항목 | Wilson | 주담당 | 공유 담당 | 관찰 담당 | 미담당 |
|---|---|---|---|---|---|
| 학생 정보 보기 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 6변수 / Stage 보기 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 서류 / 결제 보기 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 🟡 공유 메모 작성 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 🟡 공유 메모 보기 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 🔴 Wilson 전용 메모 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 카톡 알림 발송 | ✅ | ✅ | ✅ | ❌ | ❌ |
| Stage 변경 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 견적서 작성 | ✅ | ✅ (위임 시) | ❌ | ❌ | ❌ |

### 케이스별 활용 예시

```
케이스 1: Wilson 상담 + 직원 A 케어 공유 (가장 흔한 패턴)
   - Wilson = (Super Admin / 자동 접근)
   - 직원 A (간호 전문) = 공유 담당 추가
   → 둘 다 학생 데이터 + 🟡 메모 보임
   → Wilson 전용 🔴 메모는 Wilson만

케이스 2: 직원 메인 / Wilson 옵저버
   - 직원 A = 주담당
   - Wilson = (Super Admin / 자동 접근)
   → Wilson은 항상 모든 학생 자동 접근

케이스 3: 의대 학생
   - Wilson = (Super Admin / 자동 접근)
   - 의대 카톡 1차 응대는 Wilson 직접 (위임 X)
   - 직원 = 공유 담당 추가 가능 (Wilson 결정 시 / 학습용)

케이스 4: 신입 직원 온보딩
   - 시니어 직원 B = 주담당
   - 신입 직원 C = 관찰 담당 (메모 작성 X / 보기만)
   → 신입은 보면서 학습 / 시니어가 실제 응대
```

### 담당 변경 / 해제

```
[Wilson 관리자 페이지 → 학생 상세 → 담당 직원 리스트]
   - 주담당 변경 (다른 직원으로)
   - 공유 담당 추가 / 제거
   - 관찰 담당 → 공유 담당 승격 (신입 학습 완료 시)
   - 담당 해제 = released_at = 현재 시간 (활동 로그 보존)
```

### DB 구조 (PART D 27번째 테이블)

```sql
CREATE TABLE student_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
  staff_id      UUID REFERENCES users(id),
  role          VARCHAR(20) NOT NULL CHECK (role IN ('primary', 'shared', 'observer')),
  assigned_by   UUID REFERENCES users(id),  -- Wilson
  assigned_at   TIMESTAMP DEFAULT NOW(),
  released_at   TIMESTAMP,                  -- NULL = 활성
  note          TEXT
);

-- 학생 1명에 주담당은 1명만 (active 상태)
CREATE UNIQUE INDEX uniq_primary_per_student 
  ON student_assignments(student_id) 
  WHERE role = 'primary' AND released_at IS NULL;
```

---

## C-3. 학생 자동 분배 룰 (4단계)

```
[신규 학생 카톡 진입]
        ↓
[챗봇 6변수 수집]
        ↓
[자동 분배 룰 4단계 실행]
```

### 1단계: 분야 매칭

```
의대 학생 (is_medical=true)
   → Wilson 직접 (위임 X)
   → 직원 자동 분배 X

일반 학생:
   ├─ 간호 → 직원 A (전문)
   ├─ IT → 직원 B (전문)
   ├─ 비즈니스 → 직원 C (전문)
   ├─ 공학 → 직원 D (전문)
   ├─ 요리·호텔 → 직원 E (전문)
   ├─ 유아교육 → 직원 F (전문)
   ├─ 디자인 → 직원 G (전문)
   ├─ Trade → 직원 H (전문)
   ├─ 의료 (의대 아닌 약대 / 사회복지 등) → Wilson 또는 직원
   └─ 미정 → Wilson 직접 (학생 의도 파악 필요)
```

### 2단계: 부하 체크

```
직원별 동시 응대 학생 수 추적
   - 각 직원 정원 (기본 15명 / Wilson 조정 가능)
   - 정원 초과 시 → 다른 직원으로 자동 분배
   - 동시 응대 中 (3명+) → 다른 직원으로 자동 분배
```

### 3단계: 휴가 체크

```
직원 휴가 등록 (Wilson 관리자 페이지)
   - 휴가 시작·종료일 입력
   - 휴가 中 = 자동 회피
   - 임시 담당 = Wilson (또는 다른 직원)
```

### 4단계: Wilson Alert 체크

```
Wilson Alert 자동 발생 케이스:
   - 학생 6변수 + master_v2 차단룰 위반
   - 학생 메모에 위험 키워드 (가족 갈등 / 정신건강 등)
   - Stage 정체 14일+
   - Failure Pattern 6개 中 1개 감지

→ Alert 있는 학생 = Wilson 직접 (위임 X)
→ 일반 학생 (Alert 없음) = 직원 자동 분배
```

### 파트너 추적

```
URL 파라미터: ?ref=partnerXX
   ↓
해당 파트너 담당 직원으로 자동 배정
   ↓
커미션 자동 계산 (commissions 테이블)
```

## C-4. Wilson 알림 분배 시스템

```
[학생 카톡 메시지 도착]
        ↓
[챗봇 6변수 자동 수집]
        ↓
[Wilson 폰 알림 (즉시)]
   ├─ 신규 학생 / Wilson Alert N개
   ├─ 학생 6변수 + 카드 결과 첨부
   └─ [내가 응대] / [직원에게 위임] / [무응답=자동 위임]
        ↓
   ┌────────────────────────────────────┐
   │ Wilson 선택:                        │
   │                                    │
   │ A) [내가 응대]                      │
   │    → Wilson 직접                    │
   │                                    │
   │ B) [직원에게 위임]                  │
   │    → 자동 분배 (4단계 룰 실행)      │
   │                                    │
   │ C) [무응답 5분]                     │
   │    → 자동으로 직원 분배              │
   │    (Wilson 바쁘다고 판단)            │
   └────────────────────────────────────┘
        ↓
[직원 폰 알림 / 학생 응대 시작]
        ↓
[Wilson 활동 로그 기록]
```

### 영업 시간 외 (평일 18:00 이후 / 주말 / 공휴일)
```
- 챗봇 자동 응대 (6변수 수집)
- "다음 영업일 10시 이후 답변 드립니다"
- Wilson 알림 = 다음 영업일 아침 대시보드에 표시 (즉시 알림 X)
```

## C-5. 직원 활동 로그 (감사 추적)

```
모든 직원 행동 = 자동 기록 (activity_logs 테이블)
   ├─ user_id (누가)
   ├─ action_type (무엇)
   ├─ target_table (어디에)
   ├─ target_id (어떤 레코드)
   ├─ details (JSON)
   ├─ ip_address
   ├─ user_agent
   └─ created_at

Wilson 언제든 검토 가능 (관리자 페이지 → 직원 관리 → 활동 로그)
```

### 로그 분리
- `update_logs` = 데이터 변경 추적 (DB 업데이트 이력)
- `activity_logs` = 직원 행동 추적 (누가 무엇을 봤는지)

## C-6. 직원 인수인계 시스템

### 정기 (매주 월요일)
```
시스템 자동 작업:
   - 각 학생 메모 30일 요약
   - 각 학생 진행 상태 요약
   - 직원 간 학생 정보 공유 (관련 직원만)
   - Wilson 주간 리포트 발송
```

### 돌발 (직원 갑작스런 부재)
```
[Wilson 관리자 페이지]
   ↓
[직원 관리 → 임시 담당 변경] 클릭
   ↓
시스템 자동 작업:
   - 최근 30일 🟡 공유 메모 자동 요약
   - 진행 액션 / 다음 마감일 추출
   - 새 담당 직원에게 자동 전달
   - 학생 카톡 자동 메시지:
     "○○ 직원 휴가 / △△ 직원이 도와드려요"
```

### 직원 퇴사
```
[Wilson 관리자 페이지]
   ↓
[직원 관리 → 학생 일괄 재배정] 클릭
   ↓
시스템 자동 작업:
   - 학생 → 다른 직원 분배 (부하·분야 고려)
   - 학생 카톡 자동 안내
   - 퇴사 직원 활동 로그 = 영구 보존 (삭제 X)
   - 퇴사 직원 계정 비활성화 (logs는 보존)
```

## C-7. 신입 직원 자동 온보딩

```
[Wilson 직원 추가 → 온보딩 플로우 자동 시작]

Day 1 (온보딩 가이드):
   ✅ 매뉴얼 핵심 20개 읽기 (자동 추천)
   ✅ Wilson 6 Failure Patterns 학습
   ✅ 콘텐츠 원칙 0-1 ~ 0-15 숙지
   ✅ FAQ 84개 中 본인 담당 분야 시나리오 학습

Week 1:
   ✅ 학생 1~2명 배정 (관찰 모드)
   ✅ Wilson 또는 시니어 직원 응대 옆에서 학습
   ✅ 모의 케이스 5개 → AI 채점

Week 2:
   ✅ 학생 3~5명 배정 (지원 모드)
   ✅ Wilson 검토 후 응대

Month 2:
   ✅ 정상 운영 (정원 15명까지)
   ✅ 본인 담당 학생만 보기 (기본값)

진행 추적:
   - 매뉴얼 학습 진도 (Wilson 대시보드)
   - 모의 케이스 점수
   - 첫 학생 응대 평가
```

## C-8. 직원 KPI 대시보드 (Wilson만 / 직원에게 노출 X)

```
직원별 추적 지표:
   - 매뉴얼 학습 진도 (475개 中 N개)
   - 카톡 응답 평균 시간
   - 학생 만족도 (NPS / 학생 평가)
   - 실수 횟수 (활동 로그 분석)
   - 새 케이스 학습 수 (케이스 학습 센터)
   - 본인 담당 학생 Stage 진행 속도
```

### 절대 원칙
- ❌ 직원 leaderboard 표시 X (협업 원칙)
- ❌ 직원에게 본인 KPI 외 다른 직원 KPI 노출 X
- ❌ 경쟁 / 순위 표시 X
- ✅ Wilson만 전체 직원 KPI 비교 가능
- ✅ 직원 본인은 본인 KPI만 볼 수 있음 (선택 권한)

## C-9. 권한 변경 추적

```
모든 권한 변경 = staff_permissions 테이블에 기록
   ├─ id
   ├─ user_id (대상 직원)
   ├─ permission_key (권한 항목)
   ├─ value (true/false)
   ├─ granted_by (Wilson UUID / 권한 부여자)
   ├─ granted_at (timestamp)
   └─ revoked_at (timestamp / NULL이면 활성)

Wilson 관리자 페이지에서 언제든 검토:
   - 누가 어떤 권한을 언제 받았는지
   - 누가 어떤 권한을 언제 철회했는지
   - 권한 부여 사유 (선택 메모)
```

## C-10. 권한 위반 자동 감지

```
시스템 자동 감지 + Wilson 알림:
   - 직원이 본인 담당 외 학생 데이터 접근 시도
   - 직원이 🔴 Wilson 전용 메모 접근 시도
   - 직원이 internal_data / wilson_note 필드 API 호출
   - 학생이 admin / staff URL 접근 시도
   - 비정상 다량 데이터 다운로드 (excel export 등)

→ Wilson에게 즉시 카톡 알림
→ 해당 액션 자동 차단
→ activity_logs에 위반 기록
```

---

# ✅ PART C 끝
