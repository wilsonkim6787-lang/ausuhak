-- ═══════════════════════════════════════════════════════════
-- 037_drop_auth_mirror_view.sql
-- [보안] Supabase Advisor "auth_users_exposed" (Critical) 해소.
--
-- 문제: 015_fix_auth_trigger.sql 에서 만든 디버깅용 뷰 public.v_auth_mirror_check 가
--       auth.users(id·email·created_at) 를 public 스키마로 노출.
--       public 뷰는 PostgREST API 로 접근 가능 + 뷰는 기본적으로 소유자(postgres)
--       권한으로 실행되어 auth.users RLS 를 우회 → anon key 만으로 전체 이메일 조회 가능.
--
-- 조치: 뷰 삭제. 트리거 작동 확인은 Supabase SQL Editor 에서 직접 쿼리하면 됨
--       (SQL Editor 는 어차피 postgres 권한이라 public 뷰 불필요).
-- 적용: Supabase SQL Editor 에 붙여넣기 (재실행 안전).
-- ═══════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.v_auth_mirror_check;
