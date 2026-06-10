-- ═══════════════════════════════════════════════════════════
-- 039_internal_faqs_restrict_select.sql
-- [보안] internal_faqs base 테이블의 anon/학생 노출 차단.
--
-- 문제: 기존 정책 faqs_public_select = FOR SELECT USING (true).
--       → anon 키로 base 테이블 직접 쿼리 시 internal_data·wilson_note 까지 전부 읽힘.
--       (internal_faqs_public 안전 뷰는 컬럼만 가릴 뿐, base 테이블이 열려 있어 무의미.)
--       스펙(PART_D/F): "학생은 internal_faqs 접근 X" / wilson_note 절대 노출 금지.
--
-- 사용처 감사 결과:
--   - staff 페이지  → internal_faqs_staff 뷰 (security_invoker, 038) → staff 통과 필요
--   - admin 페이지  → base internal_faqs 직접 (super_admin)
--   - 학생/공개     → base 직접 쿼리 없음 (공개 FAQ = 빌드 시 정적 import)
--   → 따라서 base SELECT 를 staff/admin 전용으로 조여도 앱 동작 영향 없음.
--
-- 조치: SELECT 정책을 is_staff_or_admin() 로 교체. write 정책(is_super_admin)은 유지.
-- 적용: Supabase SQL Editor 에 붙여넣기 (재실행 안전).
-- ═══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS faqs_public_select ON internal_faqs;

CREATE POLICY faqs_staff_select ON internal_faqs
  FOR SELECT USING (is_staff_or_admin());

-- write 정책(faqs_admin_write = is_super_admin())은 변경 없음.
