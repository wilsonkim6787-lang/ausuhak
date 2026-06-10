-- ═══════════════════════════════════════════════════════════
-- 040_revoke_unused_definer_execute.sql
-- [보안] 안전하게 회수 가능한 SECURITY DEFINER 함수 EXECUTE 권한 회수.
--
-- 대상(회수해도 동작 영향 없음):
--   - auth_role()            : 정의만 있고 RLS 정책·앱 어디서도 미사용 (dead helper)
--   - handle_new_auth_user() : auth.users INSERT 트리거 전용. 트리거는 호출자 EXECUTE
--                              권한과 무관하게 작동 → RPC 노출만 제거.
--
-- 회수 안 하는 함수(공개/로그인 경로 RLS 정책에서 호출 → 회수 시 페이지 깨짐):
--   - is_super_admin / is_staff_or_admin / is_assigned_to_student
--     (예: site_settings SELECT 정책이 anon 에게서 is_super_admin() 호출)
--   → 이들의 "Can Execute" 경고는 의도된 설계로 수용.
--
-- 적용: Supabase SQL Editor 에 붙여넣기 (재실행 안전).
-- ═══════════════════════════════════════════════════════════

REVOKE EXECUTE ON FUNCTION public.auth_role()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
