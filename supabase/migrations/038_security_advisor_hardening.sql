-- ═══════════════════════════════════════════════════════════
-- 038_security_advisor_hardening.sql
-- Supabase Security Advisor 잔여 항목 해소 (SQL 로 고칠 수 있는 것만).
--
-- [에러] Security Definer View
--   public 스키마 뷰가 security_invoker 없이 생성됨 → 소유자(postgres) 권한으로
--   실행되어 호출자 RLS 를 우회. security_invoker=true 로 전환하면 호출자 권한으로
--   실행 → advisor 통과. 동작은 동일:
--     - internal_faqs_public  : internal_faqs RLS = SELECT USING(true) 이므로 anon 그대로 조회 OK
--     - internal_faqs_staff   : 직원/관리자 조회용 (base RLS 동일 적용)
--     - v_schools_payment_cycle_check : 디버깅 전용 집계 뷰
--
-- [경고] Function Search Path Mutable
--   SECURITY DEFINER 함수에 search_path 고정이 없으면 스키마 하이재킹 위험.
--   search_path = public, pg_catalog 로 고정 (함수 본문이 users / auth.uid() 참조 → 정상 resolve).
--   * handle_new_auth_user 는 이미 search_path 설정됨 → 제외.
--
-- 적용: Supabase SQL Editor 에 붙여넣기 (재실행 안전).
-- ═══════════════════════════════════════════════════════════

-- 1. 뷰 → security_invoker
ALTER VIEW public.internal_faqs_public          SET (security_invoker = true);
ALTER VIEW public.internal_faqs_staff           SET (security_invoker = true);
ALTER VIEW public.v_schools_payment_cycle_check SET (security_invoker = true);

-- 2. RLS 헬퍼 함수 (SECURITY DEFINER) search_path 고정
ALTER FUNCTION public.auth_role()                       SET search_path = public, pg_catalog;
ALTER FUNCTION public.is_super_admin()                  SET search_path = public, pg_catalog;
ALTER FUNCTION public.is_staff_or_admin()               SET search_path = public, pg_catalog;
ALTER FUNCTION public.is_assigned_to_student(uuid)      SET search_path = public, pg_catalog;

-- 3. updated_at 트리거 함수 search_path 고정 (now() = pg_catalog 이므로 동작 동일)
ALTER FUNCTION public.trg_staff_manuals_updated_at()    SET search_path = public, pg_catalog;
ALTER FUNCTION public.trg_offers_updated_at()           SET search_path = public, pg_catalog;
ALTER FUNCTION public.trg_monitoring_sites_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.trg_blogs_updated_at()            SET search_path = public, pg_catalog;
ALTER FUNCTION public.trg_videos_updated_at()           SET search_path = public, pg_catalog;
ALTER FUNCTION public.trg_ad_campaigns_updated_at()     SET search_path = public, pg_catalog;
