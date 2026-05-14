-- ═══════════════════════════════════════════════════════════
-- 021_living_cost_monthly.sql
-- 사양서 PART E-6 [3] 통화 분리 + 생활비 단위 변경:
--   - 기존: items.living_per_year_aud (연 단위)
--   - 신규: quotes.living_cost_aud_monthly (월 단위)
--
-- 사유 (Wilson 2026-05-14):
--   - 학생/학부모 한국 생활비랑 비교 용이 ("월 170만원" vs "연 2천만원")
--   - 자동 계산 = monthly × 12 × duration_years
--
-- 학생 PDF 표시: "$XXX/월 × 12 = AUD $XX,XXX/년"
-- ═══════════════════════════════════════════════════════════

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS living_cost_aud_monthly NUMERIC(10, 2);

COMMENT ON COLUMN quotes.living_cost_aud_monthly IS
  '월 생활비 (AUD). 학생/학부모 한국 비교 용이. 자동 계산 = monthly × 12 × duration_years.
   학생 PDF: "$XXX/월 × 12 = AUD $XX,XXX/년"';

-- ─── 기존 데이터 backfill (items.living_per_year_aud / 12) ───
UPDATE quotes
SET living_cost_aud_monthly = ROUND(((items->>'living_per_year_aud')::numeric) / 12, 2)
WHERE items ? 'living_per_year_aud'
  AND (items->>'living_per_year_aud')::numeric > 0
  AND living_cost_aud_monthly IS NULL;

-- items.living_per_year_aud 키는 deprecated (보존 / 후속 마이그레이션에서 제거 가능)
COMMENT ON COLUMN quotes.items IS
  'AUD recurring items (oshc/visa/settlement/consultation_fee/exchange_rate).
   ⚠️ items.living_per_year_aud는 DEPRECATED (021 → living_cost_aud_monthly 컬럼으로 이전).';
