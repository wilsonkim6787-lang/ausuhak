-- ═══════════════════════════════════════════════════════════
-- 019_school_payment_cycle.sql
-- 사양서 PART E-6 [7]: 학교별 학비 결제 주기 (알림 표시만 / 계산 X)
--
-- 목적: 학생/학부모가 "한번에 다 내야 하나?" 헷갈리지 않게 견적서에 안내 문구.
-- ⚠️ 학비 계산 로직은 그대로 (연 단위). 분할 결제 시뮬레이션 X.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS payment_cycle VARCHAR(20);

ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_payment_cycle_check;
ALTER TABLE schools ADD CONSTRAINT schools_payment_cycle_check
  CHECK (payment_cycle IS NULL
         OR payment_cycle IN ('lump_sum', 'split_2_3', 'semester', 'quarterly'));

COMMENT ON COLUMN schools.payment_cycle IS
  'lump_sum (어학원 일시불 / CoE 발급용) / split_2_3 (Foundation·사립직업 2~3회) / semester (대학·TAFE 학기당 연 2회) / quarterly (조기유학 분기별 연 4회)';

-- ───────────────────────────────────────
-- 109교 backfill: schools.type 기반 자동 매핑 (수동 X)
--
-- 매핑 룰:
--   어학원 / 어학연수             → lump_sum
--   Foundation / 사립 직업학교    → split_2_3
--   TAFE / 대학 / 대학원 / 의대   → semester
--   조기유학 (Year 7-12)          → quarterly
-- ───────────────────────────────────────
UPDATE schools SET payment_cycle = CASE
  WHEN type IN ('elicos', 'elicos_closed', 'hsp_private_elicos') THEN 'lump_sum'
  WHEN type IN ('foundation', 'foundation_course')               THEN 'split_2_3'
  WHEN type IN ('vocational_private', 'cat30_new')               THEN 'split_2_3'
  WHEN type IN ('tafe', 'diploma_verified')                      THEN 'semester'
  WHEN type IN ('university')                                    THEN 'semester'
  WHEN type IN ('under18', 'hsp_government')                     THEN 'quarterly'
  ELSE 'semester'  -- operations_verified 등 분류 안 된 타입 = 가장 흔한 학기당
END
WHERE payment_cycle IS NULL;

CREATE INDEX IF NOT EXISTS idx_schools_payment_cycle ON schools(payment_cycle);

-- ───────────────────────────────────────
-- 검증: 모든 학교에 payment_cycle 부여됐는지 확인용 뷰
-- ───────────────────────────────────────
CREATE OR REPLACE VIEW v_schools_payment_cycle_check AS
SELECT
  type,
  payment_cycle,
  COUNT(*) AS school_count
FROM schools
GROUP BY type, payment_cycle
ORDER BY type;

COMMENT ON VIEW v_schools_payment_cycle_check IS
  '디버깅: SELECT * FROM v_schools_payment_cycle_check; → 모든 type에 cycle 매핑됐는지 확인';
