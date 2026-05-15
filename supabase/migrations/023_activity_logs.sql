-- ═══════════════════════════════════════════════════════════
-- 023_activity_logs.sql
-- 사양서 PART D #20 / PART K Step 3.5: 직원·시스템 활동 추적.
-- 무단 접근 / 권한 위반 / 데이터 변경 / 로그인 등 모든 보안 관련 이벤트 기록.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  -- NULL = 비로그인 / 익명 접근 시도

  action_type     VARCHAR(50) NOT NULL,
  -- 인증: 'login' / 'logout' / 'signup' / 'password_recovery'
  -- 조회: 'view_student' / 'view_quote' / 'view_payment'
  -- 변경: 'create_payment' / 'confirm_payment' / 'refund_payment' /
  --      'create_quote' / 'update_quote' / 'update_student' /
  --      'upload_document' / 'verify_document'
  -- 보안: 'unauthorized_access' / 'role_mismatch' / 'rls_denied'
  -- 자동화: 'cron_run' / 'sync_youtube' / 'monitor_site' (Phase 3)

  target_table    VARCHAR(50),
  -- 'students' / 'quotes' / 'payments' / 'documents' / 'users'
  target_id       UUID,
  -- 대상 row id (있을 경우)

  details         JSONB DEFAULT '{}'::jsonb,
  -- {before, after, reason, path, ...} 자유 구조

  ip_address      VARCHAR(45),
  user_agent      TEXT,

  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user    ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action  ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_target  ON activity_logs(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);

COMMENT ON TABLE activity_logs IS
  'PART D #20 / PART K 3.5: 권한 위반 + 데이터 변경 + 로그인 등 보안 활동 자동 기록.';

-- ───────────────────────────────────────
-- RLS
-- - SELECT = Wilson만 (보안 감사용)
-- - INSERT = 누구나 (auth gate에서 unauthorized_access 기록 허용 / anon 키 사용 가능)
-- - UPDATE / DELETE = X (로그 변조 방지)
-- ───────────────────────────────────────
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activity_logs_admin_select ON activity_logs;
CREATE POLICY activity_logs_admin_select ON activity_logs
  FOR SELECT USING (is_super_admin());

DROP POLICY IF EXISTS activity_logs_any_insert ON activity_logs;
CREATE POLICY activity_logs_any_insert ON activity_logs
  FOR INSERT WITH CHECK (true);
-- UPDATE / DELETE 정책 없음 = 차단 (super_admin 포함 / Wilson도 변조 X)
