-- ═══════════════════════════════════════════════════════════
-- 018_quotes_v2_full.sql
-- 사양서 PART E-6 v2 통합 (Wilson 견적서 비즈니스 룰 7가지):
--   [2] 견적서 2종: consultation / enrollment
--   [3] 통화 분리: AUD vs KRW (필드명 변경 포함)
--   [4] 환율 기준일 자동 기록
--   [5] 숙소비 (AUD / 주당 / 타입)
--   [6] 픽업비 (AUD / 옵션 / 타입)
--   ※ KRW 항목 = 항공권 / 1:1 상담비 / 수속비
-- ⚠️ INTERNAL ONLY 컬럼은 학생 PDF / 학생 마이페이지에 절대 노출 금지.
-- ═══════════════════════════════════════════════════════════

-- ─── [2] 견적서 종류 ──────────────────────────────────────
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS quote_type VARCHAR(20) NOT NULL DEFAULT 'consultation';

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_quote_type_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_quote_type_check
  CHECK (quote_type IN ('consultation', 'enrollment'));

COMMENT ON COLUMN quotes.quote_type IS
  'consultation = 상담 견적서 (Phase 1 / 5년 전체 큰 그림) / enrollment = 수속 견적서 (Phase 2 / 실제 입금 일정)';

-- ─── [4] 환율 기준일 (Wilson 수동 입력 / 7일 유효) ─────────
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS exchange_rate_date DATE;

COMMENT ON COLUMN quotes.exchange_rate_date IS
  '환율 입력 시점. 학생 PDF 상단 "환율 기준일 YYYY.MM.DD / 견적 유효 7일"';

-- ─── [3] KRW 항목 (한국 입장 결제) ────────────────────────
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS airfare_krw NUMERIC(12, 0) DEFAULT 0;

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS processing_fee_krw NUMERIC(12, 0) DEFAULT 0;

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS processing_fee_reason TEXT;

COMMENT ON COLUMN quotes.airfare_krw IS '항공권 왕복 (KRW). 한국 결제';
COMMENT ON COLUMN quotes.processing_fee_krw IS
  '별도 수속비 (KRW). 기본 0. 학생에겐 "사전 안내" 표현만 (이유는 노출 X)';
COMMENT ON COLUMN quotes.processing_fee_reason IS
  '⚠️ INTERNAL ONLY. 학생 PDF / 마이페이지 노출 절대 금지. Wilson 내부 메모용.';

-- ─── [5] 숙소비 (AUD / 주당) ──────────────────────────────
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS accommodation_aud NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS accommodation_type TEXT;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_accommodation_type_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_accommodation_type_check
  CHECK (accommodation_type IS NULL
         OR accommodation_type IN ('homestay', 'dormitory', 'sharehouse', 'none'));

COMMENT ON COLUMN quotes.accommodation_aud IS
  '주당 숙소비 (AUD). 학생 PDF: "$XXX/주". 계산 = weekly_rate × 52 × duration_years (Phase 1 단순화).';
COMMENT ON COLUMN quotes.accommodation_type IS
  'homestay (홈스테이 $300-400) / dormitory (학교 기숙사 $250-500) / sharehouse (쉐어하우스 $200-350) / none';

-- ─── [6] 픽업비 (AUD / 1회) ───────────────────────────────
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS pickup_aud NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS pickup_type TEXT;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_pickup_type_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_pickup_type_check
  CHECK (pickup_type IS NULL OR pickup_type IN ('none', 'school', 'private'));

COMMENT ON COLUMN quotes.pickup_aud IS '학교 픽업 1회성 (AUD). 기본 0';
COMMENT ON COLUMN quotes.pickup_type IS
  'none (픽업 없음) / school (학교 픽업 $150-200) / private (사설 픽업)';
