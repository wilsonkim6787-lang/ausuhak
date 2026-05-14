-- ═══════════════════════════════════════════════════════════
-- 014_auth_user_mirror.sql
-- 사양서 PART C-1: Supabase Auth (auth.users) → public.users mirror
-- Wilson 이메일 = 자동 super_admin / 외 이메일 = student
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
BEGIN
  IF NEW.email = 'wilsonkim6787@gmail.com' THEN
    v_role := 'super_admin';
    v_name := 'Wilson Kim';
  ELSE
    v_role := 'student';
    v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  END IF;

  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, NEW.email, v_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

COMMENT ON FUNCTION handle_new_auth_user IS 'PART C-1: Wilson email → super_admin / 외 → student. last_login은 앱 레벨에서 갱신.';

-- ───────────────────────────────────────
-- 기존 Wilson auth.users 행이 이미 있는 경우 backfill
-- (마이그레이션 실행 시점에 Wilson이 이미 가입했다면 trigger가 안 돌므로 명시 처리)
-- ───────────────────────────────────────
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Wilson Kim', 'super_admin'
FROM auth.users
WHERE email = 'wilsonkim6787@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', name = 'Wilson Kim';
