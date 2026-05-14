-- ═══════════════════════════════════════════════════════════
-- 022_quote_simplify.sql
-- Wilson 2026-05-14: 견적서 100% 수기 입력 / 자동화 제거
--
-- 변경:
--   [A] 학교명 = 자유 텍스트 (master autocomplete 제거)
--   [B] 기간 = 자유 텍스트 1칸 (duration_text / "24주" "1.5년" "1학기" 등)
--   [C] 전공·코스 = 자유 텍스트
--   [D] 학비 + 장학금 + 프로모션 (각 INTERNAL 사유 메모)
--       실제 학비 = 학비 - 장학금 - 프로모션 (자동 계산)
--   [E] payment_cycle = 수동 dropdown만 유지 (안내 문구용)
--
-- 사유 (Wilson): 데이터 정확도 + Wilson 19년 노하우 / 학교마다 케이스별 표현 다름
--
-- selected_schools JSONB 신규 shape:
--   {
--     school_name, program, duration_text,
--     payment_cycle (옵션), tuition_aud,
--     scholarship_aud, promotion_aud,
--     scholarship_note (INTERNAL), promotion_note (INTERNAL)
--   }
--
-- schools 마스터 테이블 454교 = 그대로 (Phase 2 학생 진단 카드에서 활용)
-- ═══════════════════════════════════════════════════════════

-- 기존 quotes.selected_schools JSONB → 신규 shape로 backfill
-- Phase 1 시점 = 견적서 거의 없음. 있어도 안전한 변환.
UPDATE quotes
SET selected_schools = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'school_name', COALESCE(s->>'school_name', s->>'name', ''),
        'program',      COALESCE(s->>'program', ''),
        'duration_text', CASE
          WHEN s->>'duration_text' IS NOT NULL THEN s->>'duration_text'
          WHEN s->>'duration_years' IS NOT NULL AND s->>'duration_years' <> ''
            THEN (s->>'duration_years') || '년'
          ELSE ''
        END,
        'payment_cycle', s->>'payment_cycle',
        'tuition_aud', COALESCE(
          NULLIF(s->>'tuition_aud', '')::numeric,
          NULLIF(s->>'tuition_per_year_aud', '')::numeric
            * COALESCE(NULLIF(s->>'duration_years', '')::numeric, 1),
          0
        ),
        'scholarship_aud',  COALESCE(NULLIF(s->>'scholarship_aud', '')::numeric, 0),
        'promotion_aud',    COALESCE(NULLIF(s->>'promotion_aud', '')::numeric, 0),
        'scholarship_note', s->>'scholarship_note',
        'promotion_note',   s->>'promotion_note'
      )
    )
    FROM jsonb_array_elements(selected_schools) s
  ),
  '[]'::jsonb
)
WHERE selected_schools IS NOT NULL
  AND jsonb_typeof(selected_schools) = 'array';

COMMENT ON COLUMN quotes.selected_schools IS
  '학교 1~3개 (JSONB 배열). Wilson 100% 수기 입력. Shape:
   {school_name, program, duration_text, payment_cycle?, tuition_aud,
    scholarship_aud, promotion_aud, scholarship_note INTERNAL, promotion_note INTERNAL}.
   실제 학비 = tuition - scholarship - promotion (앱 레벨 자동 계산).';
