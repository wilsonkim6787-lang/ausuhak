-- ═══════════════════════════════════════════════════════════
-- 017_add_students_contact.sql
-- 사양서 PART D-3 확장: students.name / kakao_id / phone / email
--
-- 배경:
--   - 003_initial_students.sql 원본은 익명 진단 기반 설계 (anonymous_id + diagnose_uuid)
--   - 회원 가입 후 contact 정보 = users 테이블 참조 (students.user_id JOIN)
--   - 그러나 Wilson이 학생을 "수동 등록" (회원가입 전 / 카톡으로 받은 명함 등)할 때 contact 저장할 곳 부재
--
-- 해결:
--   - students에 직접 컬럼 추가 (스냅샷 / Wilson 입력값 기준)
--   - 학생이 나중에 가입하면 users 테이블에 별도 row 생성 + students.user_id 링크
--     (스냅샷은 그대로 보존, 학생 마이페이지는 users 기준)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE students ADD COLUMN IF NOT EXISTS name      VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS kakao_id  VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone     VARCHAR(30);
ALTER TABLE students ADD COLUMN IF NOT EXISTS email     VARCHAR(255);

-- 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_students_name     ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_kakao_id ON students(kakao_id);
CREATE INDEX IF NOT EXISTS idx_students_email    ON students(email);

COMMENT ON COLUMN students.name     IS 'Wilson 입력 스냅샷. 학생 가입 후에도 보존 (users.name과 분리).';
COMMENT ON COLUMN students.kakao_id IS '카카오 채널 user_id 또는 메모용 식별자.';
COMMENT ON COLUMN students.phone    IS 'Wilson 입력값. 변경 시 students_history 또는 audit log 권장(Phase 3).';
COMMENT ON COLUMN students.email    IS 'Wilson 입력값. users.email과 별개 (가입 시 users.email 사용).';
