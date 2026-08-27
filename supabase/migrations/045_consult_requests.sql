-- ═══════════════════════════════════════════════════════════
-- 045_consult_requests.sql
-- 상담 신청 접수함 — 공개 /consult 폼 접수 → /admin/consults 에서 처리.
-- INSERT 는 서버 액션(service role) 전용이라 익명 정책 불필요.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS consult_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,               -- 전화번호 또는 카카오톡 ID
  topic       VARCHAR(30),                 -- 관심 분야 (어학연수/TAFE/대학 등)
  message     TEXT,                        -- 문의 내용 (선택)
  source      VARCHAR(30) DEFAULT 'web',   -- 'web' / 'cost' 등 유입 경로
  status      VARCHAR(20) NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'contacted', 'closed')),
  admin_memo  TEXT,                        -- 처리 메모 (내부용)
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consult_requests_status_created
  ON consult_requests(status, created_at DESC);

CREATE OR REPLACE FUNCTION trg_consult_requests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS consult_requests_updated_at ON consult_requests;
CREATE TRIGGER consult_requests_updated_at
  BEFORE UPDATE ON consult_requests
  FOR EACH ROW EXECUTE FUNCTION trg_consult_requests_updated_at();

-- RLS: 조회·처리 = 직원 이상 / 삭제 = super_admin / 공개 INSERT 정책 없음(service role 전용)
ALTER TABLE consult_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS consult_requests_staff_select ON consult_requests;
CREATE POLICY consult_requests_staff_select ON consult_requests
  FOR SELECT USING (is_staff_or_admin());

DROP POLICY IF EXISTS consult_requests_staff_update ON consult_requests;
CREATE POLICY consult_requests_staff_update ON consult_requests
  FOR UPDATE USING (is_staff_or_admin());

DROP POLICY IF EXISTS consult_requests_admin_delete ON consult_requests;
CREATE POLICY consult_requests_admin_delete ON consult_requests
  FOR DELETE USING (is_super_admin());

COMMENT ON TABLE consult_requests IS '공개 상담 신청 접수함 — /consult 폼 → /admin/consults';
