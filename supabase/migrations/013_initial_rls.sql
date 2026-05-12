-- ═══════════════════════════════════════════════════════════
-- 013_initial_rls.sql
-- 사양서 PART 0-4 / PART D-9 / PART M-5: 3중 보안 Layer 1 (DB RLS)
-- 학생/직원/Wilson Super Admin 권한 차등
-- ═══════════════════════════════════════════════════════════

-- ───────────────────────────────────────
-- 모든 테이블 RLS 활성화
-- ───────────────────────────────────────
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocking_rules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilson_alerts_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE students            ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_cases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_deadlines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_faqs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings       ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────
-- 헬퍼 함수: 현재 사용자의 role 확인
-- ───────────────────────────────────────
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'staff'))
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_assigned_to_student(target_student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM student_assignments
    WHERE staff_id = auth.uid()
      AND student_id = target_student_id
      AND released_at IS NULL
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ───────────────────────────────────────
-- users
-- ───────────────────────────────────────
CREATE POLICY users_self_select ON users
  FOR SELECT USING (id = auth.uid() OR is_super_admin());

CREATE POLICY users_admin_all ON users
  FOR ALL USING (is_super_admin());

-- ───────────────────────────────────────
-- staff_permissions (Wilson만 관리 / 직원은 본인 권한만 SELECT)
-- ───────────────────────────────────────
CREATE POLICY staff_perms_self_select ON staff_permissions
  FOR SELECT USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY staff_perms_admin_all ON staff_permissions
  FOR ALL USING (is_super_admin());

-- ───────────────────────────────────────
-- schools / blocking_rules / wilson_alerts_rules
-- 학교 데이터 = 학생 카드 7장에 필요 → 누구나 SELECT OK
-- 단 차단룰/Alert는 내부 데이터라 직원+Wilson만
-- ───────────────────────────────────────
CREATE POLICY schools_public_select ON schools
  FOR SELECT USING (true);

CREATE POLICY schools_admin_write ON schools
  FOR ALL USING (is_super_admin());

CREATE POLICY blocking_rules_staff_select ON blocking_rules
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY blocking_rules_admin_write ON blocking_rules
  FOR ALL USING (is_super_admin());

CREATE POLICY wilson_alerts_staff_select ON wilson_alerts_rules
  FOR SELECT USING (is_staff_or_admin());

CREATE POLICY wilson_alerts_admin_write ON wilson_alerts_rules
  FOR ALL USING (is_super_admin());

-- ───────────────────────────────────────
-- students (PART D-9)
-- ───────────────────────────────────────
CREATE POLICY students_self_select ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY students_assigned_select ON students
  FOR SELECT USING (is_assigned_to_student(id));

CREATE POLICY students_admin_select ON students
  FOR SELECT USING (is_super_admin());

CREATE POLICY students_admin_all ON students
  FOR ALL USING (is_super_admin());

CREATE POLICY students_assigned_update ON students
  FOR UPDATE USING (is_assigned_to_student(id));

-- 익명 진단 (회원가입 X) = anon 키로 INSERT 가능
CREATE POLICY students_anonymous_insert ON students
  FOR INSERT WITH CHECK (user_id IS NULL);

-- ───────────────────────────────────────
-- student_assignments (Wilson만 부여)
-- ───────────────────────────────────────
CREATE POLICY assignments_staff_select ON student_assignments
  FOR SELECT USING (staff_id = auth.uid() OR is_super_admin());

CREATE POLICY assignments_admin_all ON student_assignments
  FOR ALL USING (is_super_admin());

-- ───────────────────────────────────────
-- consultations (담당 직원 + Wilson)
-- ───────────────────────────────────────
CREATE POLICY consultations_assigned_select ON consultations
  FOR SELECT USING (is_assigned_to_student(student_id) OR is_super_admin());

CREATE POLICY consultations_assigned_write ON consultations
  FOR ALL USING (is_assigned_to_student(student_id) OR is_super_admin());

-- ───────────────────────────────────────
-- student_notes (PART 0-4: 학생 절대 X / Wilson 전용 메모는 직원도 X)
-- ───────────────────────────────────────
-- 🟡 shared 메모 = 담당 직원 + Wilson
CREATE POLICY notes_shared_select ON student_notes
  FOR SELECT USING (
    visibility = 'shared_with_assigned'
    AND (is_assigned_to_student(student_id) OR is_super_admin())
  );

-- 🔴 wilson_only 메모 = Wilson만
CREATE POLICY notes_wilson_only_select ON student_notes
  FOR SELECT USING (
    visibility = 'wilson_only' AND is_super_admin()
  );

-- INSERT: 직원은 shared만 작성 가능 / Wilson은 둘 다
CREATE POLICY notes_staff_insert_shared ON student_notes
  FOR INSERT WITH CHECK (
    visibility = 'shared_with_assigned'
    AND is_assigned_to_student(student_id)
  );

CREATE POLICY notes_admin_insert_any ON student_notes
  FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY notes_admin_all ON student_notes
  FOR ALL USING (is_super_admin());

-- ───────────────────────────────────────
-- school_applications / documents / payments / visa_cases / critical_deadlines
-- 학생 본인 + 담당 직원 + Wilson
-- ───────────────────────────────────────
CREATE POLICY apps_student_select ON school_applications
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR is_assigned_to_student(student_id)
    OR is_super_admin()
  );
CREATE POLICY apps_assigned_write ON school_applications
  FOR ALL USING (is_assigned_to_student(student_id) OR is_super_admin());

CREATE POLICY docs_student_select ON documents
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR is_assigned_to_student(student_id)
    OR is_super_admin()
  );
CREATE POLICY docs_assigned_write ON documents
  FOR ALL USING (is_assigned_to_student(student_id) OR is_super_admin());

CREATE POLICY payments_student_select ON payments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR is_assigned_to_student(student_id)
    OR is_super_admin()
  );
CREATE POLICY payments_admin_write ON payments
  FOR ALL USING (is_super_admin());  -- Wilson만 결제 확인

CREATE POLICY visa_student_select ON visa_cases
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR is_assigned_to_student(student_id)
    OR is_super_admin()
  );
CREATE POLICY visa_assigned_write ON visa_cases
  FOR ALL USING (is_assigned_to_student(student_id) OR is_super_admin());

CREATE POLICY deadlines_student_select ON critical_deadlines
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR is_assigned_to_student(student_id)
    OR is_super_admin()
  );
CREATE POLICY deadlines_assigned_write ON critical_deadlines
  FOR ALL USING (is_assigned_to_student(student_id) OR is_super_admin());

-- ───────────────────────────────────────
-- quotes (PART 0-15: Wilson만 생성 / 학생은 본인 견적서만 SELECT)
-- ───────────────────────────────────────
CREATE POLICY quotes_student_select ON quotes
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
    OR is_super_admin()
  );
CREATE POLICY quotes_admin_write ON quotes
  FOR ALL USING (is_super_admin());

-- ───────────────────────────────────────
-- internal_faqs (PART 0-4 / PART M-5 핵심 / 4필드 분리)
-- 모든 role이 SELECT 가능하지만, 학생은 card_text만 (앱 레벨 + 컬럼 SELECT 제어)
-- DB 레벨에선 row 전체 접근. 컬럼 노출 제어는 API/View 레벨에서 (Step 1.5 매칭 엔진)
-- ───────────────────────────────────────
CREATE POLICY faqs_public_select ON internal_faqs
  FOR SELECT USING (true);

CREATE POLICY faqs_admin_write ON internal_faqs
  FOR ALL USING (is_super_admin());

-- 학생용 안전 뷰 (card_text만 / internal_data + wilson_note 제외)
CREATE OR REPLACE VIEW internal_faqs_public AS
SELECT
  id, faq_id, module_type, category, question,
  card_text,
  matching_keywords, matching_cards, matching_6vars, required_modules,
  last_updated_at, source_file, created_at
FROM internal_faqs;

GRANT SELECT ON internal_faqs_public TO anon, authenticated;

COMMENT ON VIEW internal_faqs_public IS 'PART 0-4 / PART M-5 Layer 1: 학생이 호출할 때는 이 뷰만 사용 → internal_data / wilson_note 노출 X';

-- 직원용 뷰 (wilson_note 제외)
CREATE OR REPLACE VIEW internal_faqs_staff AS
SELECT
  id, faq_id, module_type, category, question,
  card_text, internal_data,
  matching_keywords, matching_cards, matching_6vars, required_modules,
  last_updated_at, source_file, created_at
FROM internal_faqs;

COMMENT ON VIEW internal_faqs_staff IS '직원 페이지용 / wilson_note는 Wilson 전용';

-- ───────────────────────────────────────
-- site_settings (PART E-16 / public=true는 누구나 SELECT)
-- ───────────────────────────────────────
CREATE POLICY settings_public_select ON site_settings
  FOR SELECT USING (is_public = true OR is_super_admin());

CREATE POLICY settings_admin_write ON site_settings
  FOR ALL USING (is_super_admin());
