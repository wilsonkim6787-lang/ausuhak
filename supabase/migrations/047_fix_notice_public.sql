-- ═══════════════════════════════════════════════════════════
-- 047_fix_notice_public.sql
-- 메인 공지 팝업 버그 수정.
--  - 증상: 어드민에서 공지를 저장/활성화해도 방문자에게 팝업이 안 뜸.
--  - 원인: notice_* 행이 is_public=false 로 저장돼 있었음.
--    홈페이지는 anon(비로그인) 클라이언트로 읽고, RLS(settings_public_select,
--    013_initial_rls.sql)가 is_public=true 행만 허용하므로 조회 결과가 항상 0건.
--  - 조치: 기존 notice 행을 is_public=true 로 승격 (writer 코드도 true 로 수정됨).
-- ═══════════════════════════════════════════════════════════

UPDATE site_settings
SET is_public = true
WHERE category = 'notice';
