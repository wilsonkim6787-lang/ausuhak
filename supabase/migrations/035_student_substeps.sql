-- ═══════════════════════════════════════════════════════════
-- 035_student_substeps.sql
-- 진행 모델 = 5 phase × 19 sub-step (학생 표시 / admin·담당직원 제어 공용).
-- 기존 Stage 12 (students.current_stage) 는 그대로 유지 + sub-step 에서 파생/백필.
-- 데이터 손실 없음: 기존 current_stage 기준으로 sub-step 상태 백필.
-- 적용: Supabase SQL Editor 에 그대로 붙여넣기 (DDL 포함, 소용량).
-- ═══════════════════════════════════════════════════════════

-- 1. sub-step 상태 테이블
CREATE TABLE IF NOT EXISTS student_substeps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  substep_key  VARCHAR(40) NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('done', 'in_progress', 'pending')),
  updated_by   UUID REFERENCES users(id),
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, substep_key)
);

CREATE INDEX IF NOT EXISTS idx_substeps_student ON student_substeps(student_id);

COMMENT ON TABLE student_substeps IS
  '진행 모델 sub-step 상태. catalog = src/lib/progress.ts PHASES. current_stage 에서 파생/백필.';

-- 2. documents 에 sub-step 링크 (특정 sub-step 에 서류 첨부)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS substep_key VARCHAR(40);
CREATE INDEX IF NOT EXISTS idx_docs_substep ON documents(substep_key);

-- 3. 백필 — catalog (substep_key, stage_num) 기준으로 기존 학생 전원 19행 생성
WITH catalog(substep_key, stage_num) AS (
  VALUES
    ('c_kakao', 1), ('c_signup', 2), ('c_payment', 2), ('c_quote', 3),
    ('a_select', 4), ('a_english', 5), ('a_docs', 6), ('a_submit', 7),
    ('o_offer', 8), ('o_tuition', 9), ('o_coe', 9),
    ('v_prep', 10), ('v_form', 10), ('v_submit', 10), ('v_grant', 10),
    ('d_ticket', 11), ('d_insurance', 11), ('d_prep', 11), ('d_arrive', 12)
)
INSERT INTO student_substeps (student_id, substep_key, status)
SELECT
  s.id,
  c.substep_key,
  CASE
    WHEN c.stage_num < s.current_stage THEN 'done'
    WHEN c.stage_num = s.current_stage THEN 'in_progress'
    ELSE 'pending'
  END
FROM students s
CROSS JOIN catalog c
ON CONFLICT (student_id, substep_key) DO NOTHING;

-- 4. 기존 서류 → sub-step 링크 (학생 제출 서류는 '지원 서류 수집' = a_docs 기본)
UPDATE documents
SET substep_key = 'a_docs'
WHERE substep_key IS NULL
  AND doc_type IN (
    'passport', 'transcript', 'english_score', 'financial',
    'gs_statement', 'recommendation', 'personal_statement', 'other'
  );

-- 5. RLS
ALTER TABLE student_substeps ENABLE ROW LEVEL SECURITY;

-- 학생 본인: SELECT (마이페이지 표시용)
DROP POLICY IF EXISTS substeps_student_select ON student_substeps;
CREATE POLICY substeps_student_select ON student_substeps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students st
      WHERE st.id = student_substeps.student_id
        AND st.user_id = auth.uid()
    )
  );

-- super_admin: ALL
DROP POLICY IF EXISTS substeps_admin_all ON student_substeps;
CREATE POLICY substeps_admin_all ON student_substeps
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 담당 직원(primary/shared/observer): SELECT
DROP POLICY IF EXISTS substeps_staff_select ON student_substeps;
CREATE POLICY substeps_staff_select ON student_substeps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM student_assignments sa
      WHERE sa.student_id = student_substeps.student_id
        AND sa.staff_id = auth.uid()
        AND sa.released_at IS NULL
    )
  );

-- 담당 직원(primary/shared): UPDATE (observer 제외)
DROP POLICY IF EXISTS substeps_staff_update ON student_substeps;
CREATE POLICY substeps_staff_update ON student_substeps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM student_assignments sa
      WHERE sa.student_id = student_substeps.student_id
        AND sa.staff_id = auth.uid()
        AND sa.released_at IS NULL
        AND sa.role IN ('primary', 'shared')
    )
  );
