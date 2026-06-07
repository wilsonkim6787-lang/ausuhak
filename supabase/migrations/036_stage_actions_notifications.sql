-- ═══════════════════════════════════════════════════════════
-- 036_stage_actions_notifications.sql
-- /admin 통합 명령창: 단계 변경 → 마이페이지 즉시 반영 → (B) 카톡 수동 발송 대기 알림.
-- 발송 순서 보장: DB 갱신 성공 후에만 notifications 행 생성.
-- 발송 방식 B(수동) → 나중에 A(알림톡)/C(이메일)로 채널만 교체.
-- 적용: Supabase SQL Editor 에 그대로 붙여넣기 (DDL + seed, 소용량 / 재실행 안전).
-- ═══════════════════════════════════════════════════════════

-- 1. 단계 액션 카탈로그 (명령창 드롭다운 = 이 목록 / 문구는 Wilson 이 채움)
CREATE TABLE IF NOT EXISTS stage_actions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_key          VARCHAR(40) NOT NULL UNIQUE,
  label              VARCHAR(120) NOT NULL,          -- 명령창 표시 이름 (예: "비자 신청 완료")
  target_substep     VARCHAR(40),                    -- 완료 처리할 sub-step (progress.ts 키 / current_stage 산출)
  mypage_text        TEXT,                           -- 마이페이지 안내 문구
  kakao_message      TEXT,                           -- 카톡 발송 문구 ({name} 치환)
  required_documents JSONB NOT NULL DEFAULT '[]',    -- 학생에게 요청할 doc_type 배열
  sort_order         INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE stage_actions IS
  '/admin 명령창 단계 액션. 문구(mypage_text/kakao_message)·required_documents 는 Wilson 이 채움.';

-- 2. 알림 큐/이력 (B = kakao_manual 대기 → Wilson 수동 발송 후 sent)
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  channel     VARCHAR(20) NOT NULL DEFAULT 'kakao_manual',  -- kakao_manual | kakao_alimtalk | email
  stage_key   VARCHAR(40),
  message     TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'sent', 'failed')),
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  sent_at     TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notif_status ON notifications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_student ON notifications(student_id);

-- 3. seed (틀 — 문구는 Wilson 이 Supabase Table Editor 또는 명령창에서 수정)
INSERT INTO stage_actions (stage_key, label, target_substep, mypage_text, kakao_message, sort_order) VALUES
  ('quote_sent',     '견적서 발송',    'c_quote',  '견적서를 보내드렸습니다. 마이페이지에서 확인해 주세요.',   '[윌슨유학] 견적서가 준비되었습니다. 마이페이지에서 확인하세요.', 10),
  ('apply_done',     '학교 지원 완료',  'a_submit', '학교 지원이 접수되었습니다. 결과를 기다려 주세요.',       '[윌슨유학] 학교 지원이 접수되었습니다. 마이페이지에서 확인하세요.', 20),
  ('offer_received', 'Offer 수령',     'o_offer',  'Offer Letter가 도착했습니다. 마이페이지에서 확인해 주세요.', '[윌슨유학] Offer Letter가 도착했습니다. 마이페이지에서 확인하세요.', 30),
  ('coe_issued',     'CoE 발급',       'o_coe',    '입학허가서(CoE)가 발급되었습니다.',                     '[윌슨유학] 입학허가서(CoE)가 발급되었습니다. 마이페이지에서 확인하세요.', 40),
  ('visa_submitted', '비자 신청 완료',  'v_submit', '비자 신청이 접수되었습니다. 결과 대기 중입니다.',         '[윌슨유학] 비자 신청이 접수되었습니다. 마이페이지에서 확인하세요.', 50),
  ('visa_granted',   '비자 승인',      'v_grant',  '비자가 승인되었습니다. 축하합니다!',                    '[윌슨유학] 비자가 승인되었습니다. 출국 준비를 시작하세요.', 60),
  ('departed',       '호주 도착',      'd_arrive', '호주 도착을 확인했습니다.',                            '[윌슨유학] 호주 도착을 확인했습니다. 도움이 필요하면 언제든 연락하세요.', 70)
ON CONFLICT (stage_key) DO NOTHING;

-- 4. RLS (admin 전용 — 명령창 액션은 service role 로 접근하지만 안전망)
ALTER TABLE stage_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS stage_actions_admin ON stage_actions;
CREATE POLICY stage_actions_admin ON stage_actions
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS notifications_admin ON notifications;
CREATE POLICY notifications_admin ON notifications
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
