-- ═══════════════════════════════════════════════════════════
-- 046_cleanup_and_messages.sql
-- ① DB 정리: 코드가 읽지 않는 룰 테이블 2개 제거
--    - blocking_rules      : 매칭 차단 룰 — 앱 코드 미참조 (0곳)
--    - wilson_alerts_rules : 알럿 룰 — 앱 코드 미참조 (0곳),
--      케어/알럿 룰은 src/lib/care/rules.ts 상수(CARE_RULES)로 정본화됨
-- ② 학생↔관리자 메시지: student_messages 신설 (마이페이지·학생상세 소통 채널)
-- ═══════════════════════════════════════════════════════════

-- ① 정리
DROP TABLE IF EXISTS blocking_rules;
DROP TABLE IF EXISTS wilson_alerts_rules;

-- ② 학생 메시지
CREATE TABLE IF NOT EXISTS student_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_role  VARCHAR(10) NOT NULL CHECK (sender_role IN ('student', 'staff')),
  sender_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  body         TEXT NOT NULL,
  read_at      TIMESTAMP,                 -- 상대편이 읽은 시각 (NULL = 미읽음)
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_messages_thread
  ON student_messages(student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_student_messages_unread
  ON student_messages(student_id, sender_role) WHERE read_at IS NULL;

-- RLS: 직원 이상만 직접 접근. 학생 마이페이지는 서버(service role) 경유라 정책 불필요.
ALTER TABLE student_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_messages_staff_all ON student_messages;
CREATE POLICY student_messages_staff_all ON student_messages
  FOR ALL USING (is_staff_or_admin());

COMMENT ON TABLE student_messages IS '학생↔관리자 1:1 메시지 — /mypage/notifications(학생) · /admin/students/[id]/messages(관리자)';
