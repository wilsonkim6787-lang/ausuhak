-- ════════════════════════════════════════════════════════════
-- 002_FIX_00_reset_schools.sql
-- 기존 schools 58교 삭제 (master_id가 그룹 ID로 잘못 박힘)
-- 그 다음 002_FIX_01_schools_part_01.sql ~ part_11.sql 순서대로 실행
-- 다른 테이블(blocking_rules / wilson_alerts / FAQ 등) = 그대로 유지
-- ════════════════════════════════════════════════════════════

BEGIN;

-- 학교 의존 데이터 먼저 정리 (외래키 / Phase 1엔 아직 비어있을 것)
DELETE FROM school_applications;

-- schools 전체 삭제
DELETE FROM schools;

COMMIT;

-- 검증: SELECT COUNT(*) FROM schools;  → 0 이어야 함
