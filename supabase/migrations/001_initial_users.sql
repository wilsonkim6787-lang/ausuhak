-- ═══════════════════════════════════════════════════════════
-- 001_initial_users.sql
-- 사양서 PART D-2: users + staff_permissions
-- 3개 role: super_admin (Wilson) / staff (직원) / student (학생)
-- ═══════════════════════════════════════════════════════════

-- 사용자 (회원 통합)
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE,
  name          VARCHAR(100) NOT NULL,
  kakao_id      VARCHAR(100),
  phone         VARCHAR(30),
  role          VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'staff', 'student')),
  status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'left')),
  created_at    TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kakao ON users(kakao_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

COMMENT ON TABLE users IS 'PART C-1: Super Admin = Wilson 1명 (영구 / 유일) / staff 무제한 / student 자동';
COMMENT ON COLUMN users.role IS 'super_admin / staff / student';

-- 직원 권한 (Wilson 부여 / 체크박스 17개)
CREATE TABLE IF NOT EXISTS staff_permissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_key  VARCHAR(50) NOT NULL,
  -- view_all_students / edit_student_info / check_documents / upload_offer /
  -- confirm_payment / write_shared_memo / view_manuals / edit_manuals /
  -- view_internal_faqs / edit_internal_faqs / write_blog / publish_blog /
  -- send_kakao_alert / create_quote / view_stats / manage_other_staff_permissions
  value           BOOLEAN DEFAULT false,
  granted_by      UUID REFERENCES users(id),
  granted_at      TIMESTAMP DEFAULT NOW(),
  revoked_at      TIMESTAMP,
  note            TEXT,
  UNIQUE(user_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_staff_perms_user ON staff_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_perms_key ON staff_permissions(permission_key);

COMMENT ON TABLE staff_permissions IS 'PART C-2: Wilson이 부여 / value=true 활성 / revoked_at NOT NULL = 철회';
