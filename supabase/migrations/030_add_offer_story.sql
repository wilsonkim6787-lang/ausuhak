-- ═══════════════════════════════════════════════════════════
-- 030_add_offer_story.sql
-- offers 에 story (학생 후기·합격 과정 markdown 본문) 컬럼 추가.
-- /offers/[id] 페이지에 marked 렌더링.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS story TEXT;

COMMENT ON COLUMN offers.story IS '학생 후기·합격 과정 (markdown). /offers/[id] 페이지에 marked 렌더링.';
