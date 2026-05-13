// Wilson 검수 정정 (master_v2_clean.json 보정 layer)
// 정본 데이터가 학교에 코스를 잘못 listing 한 케이스를 매칭 엔진 레벨에서 silent 차단.
// 차후 master_v2_clean.json이 갱신되면 해당 entry를 제거.

// 학교 × 전공 미운영 (학교 이름 정확히 일치 필요)
// 키 = School.name (master_v2_clean 정본 학교명)
// 값 = 미운영 전공 (DiagnoseInput.major 값)
export const SCHOOL_MAJOR_EXCLUSIONS: Record<string, string[]> = {
  "UNSW Sydney": ["간호"],                   // PART H-0: UNSW 간호 미운영
  "Macquarie University": ["간호"],          // Wilson 검수 2026-05-13: Macquarie 간호학 미운영
};

export function isSchoolMajorExcluded(schoolName: string, major: string): boolean {
  const banned = SCHOOL_MAJOR_EXCLUSIONS[schoolName];
  return banned ? banned.includes(major) : false;
}

// 학교 × 지역 명시적 매핑 (campus 데이터 누락된 multi-campus 학교 보정)
// master_v2_clean.json이 campus를 'None' / '확인필요'로 둔 경우, 여기서 본 캠퍼스 region을 박음.
// 키 = School.name (정본) / 값 = DiagnoseInput.preferred_region 값들
export const SCHOOL_REGIONS: Record<string, string[]> = {
  "Australian Catholic University (ACU)": ["시드니", "멜번", "브리즈번", "캔버라"], // North Sydney + Strathfield + Melbourne + Brisbane + Canberra + Ballarat
};

export function getSchoolRegionsOverride(schoolName: string): string[] | null {
  return SCHOOL_REGIONS[schoolName] ?? null;
}

