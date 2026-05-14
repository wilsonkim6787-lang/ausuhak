-- ═══════════════════════════════════════════════════════════
-- 015_fix_auth_trigger.sql
-- 014의 handle_new_auth_user 트리거 작동 안 한 이슈 수정.
--
-- 강화 포인트:
--   1) email 비교를 lower() = lower() 로 case-insensitive
--   2) name 다단 fallback (raw_user_meta_data → split_part → 'user_xxx')
--      → 어떤 경우에도 NOT NULL 보장
--   3) ON CONFLICT (id) DO UPDATE (재실행 안전 / 누락 컬럼 backfill)
--   4) EXCEPTION 핸들러 — 트리거 실패가 auth.signup 자체를 막지 않게
--   5) 함수 명시적 public 스키마 + search_path 강화
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email TEXT;
  v_role  TEXT;
  v_name  TEXT;
BEGIN
  -- NEW.email은 보통 NOT NULL이지만 phone-only signup 대비 방어
  v_email := lower(COALESCE(NEW.email, ''));

  -- 1) role + name 결정
  IF v_email = 'wilsonkim6787@gmail.com' THEN
    v_role := 'super_admin';
    v_name := 'Wilson Kim';
  ELSE
    v_role := 'student';
    v_name := COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(v_email, '@', 1), ''),
      'user_' || substring(NEW.id::text, 1, 8)  -- 최종 fallback (절대 NULL 안 됨)
    );
  END IF;

  -- 2) public.users mirror
  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, COALESCE(NEW.email, v_email), v_name, v_role)
  ON CONFLICT (id) DO UPDATE
    SET email = COALESCE(EXCLUDED.email, public.users.email),
        name  = COALESCE(NULLIF(public.users.name, ''), EXCLUDED.name),
        role  = COALESCE(public.users.role, EXCLUDED.role);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 트리거 에러로 auth.users INSERT를 막지 않음 (signup이 깨지면 더 큰 문제).
  -- Supabase Dashboard → Logs → Postgres Logs 에서 WARNING 검색하면 보임.
  RAISE WARNING 'handle_new_auth_user error for email=% id=%: %',
    NEW.email, NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user IS
  '015 fix: case-insensitive email / name 다단 fallback / ON CONFLICT DO UPDATE / EXCEPTION 안전망.';

-- ───────────────────────────────────────
-- 트리거 재부착 (014에서 안 붙었을 가능성 대비)
-- ───────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ───────────────────────────────────────
-- 기존 auth.users 중 public.users에 mirror 안 된 행 일괄 backfill
-- (014 backfill이 Wilson 이메일만 처리했음 → 015는 모든 누락 행 처리)
-- ───────────────────────────────────────
INSERT INTO public.users (id, email, name, role)
SELECT
  au.id,
  au.email,
  CASE
    WHEN lower(au.email) = 'wilsonkim6787@gmail.com' THEN 'Wilson Kim'
    ELSE COALESCE(
      NULLIF(trim(au.raw_user_meta_data->>'name'), ''),
      NULLIF(trim(au.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(lower(au.email), '@', 1), ''),
      'user_' || substring(au.id::text, 1, 8)
    )
  END AS name,
  CASE
    WHEN lower(au.email) = 'wilsonkim6787@gmail.com' THEN 'super_admin'
    ELSE 'student'
  END AS role
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────
-- 검증용 헬퍼 뷰 (Wilson이 트리거 작동 확인용)
-- ───────────────────────────────────────
CREATE OR REPLACE VIEW public.v_auth_mirror_check AS
SELECT
  au.id,
  au.email,
  au.created_at AS auth_created,
  pu.id IS NOT NULL AS mirrored,
  pu.name,
  pu.role
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
ORDER BY au.created_at DESC;

COMMENT ON VIEW public.v_auth_mirror_check IS
  '디버깅 / SELECT * FROM v_auth_mirror_check; → mirrored=false 행 있으면 트리거 실패.';
