// POST /api/diagnose — 6변수 입력 → 매칭 → uuid 반환
// Phase 1 = stateless (uuid = base64url of input). Phase 2 = supabase students 테이블 연동.

import { NextResponse, type NextRequest } from "next/server";
import { matchDiagnose, type DiagnoseInput } from "@/lib/matching";
import { encodeInput } from "@/lib/matching/token";

const VALID_EDUCATION = ["검정고시", "고졸", "대학재학", "대졸", "워홀러"];
const VALID_ENGLISH = ["없음", "4.0-5.0", "5.5", "6.0", "6.5", "7.0+"];
const VALID_REGION = ["시드니", "멜번", "브리즈번", "골드코스트", "퍼스", "애들레이드", "호바트", "캔버라", "추천받기"];
const VALID_MAJOR = ["간호", "IT", "비즈니스", "공학", "요리·호텔", "유아교육", "디자인", "Trade", "의료", "미정"];
const VALID_BUDGET = ["$25-35K", "$35-50K", "$50-65K", "$65-80K", "$80K+"];

function validate(body: unknown): { ok: true; input: DiagnoseInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const age = typeof b.age === "number" ? b.age : parseInt(String(b.age), 10);
  if (!Number.isFinite(age) || age < 14 || age > 70) return { ok: false, error: "Invalid age" };
  if (typeof b.education !== "string" || !VALID_EDUCATION.includes(b.education)) return { ok: false, error: "Invalid education" };
  if (typeof b.english_level !== "string" || !VALID_ENGLISH.includes(b.english_level)) return { ok: false, error: "Invalid english_level" };
  if (typeof b.preferred_region !== "string" || !VALID_REGION.includes(b.preferred_region)) return { ok: false, error: "Invalid preferred_region" };
  if (typeof b.major !== "string" || !VALID_MAJOR.includes(b.major)) return { ok: false, error: "Invalid major" };
  if (typeof b.budget_range !== "string" || !VALID_BUDGET.includes(b.budget_range)) return { ok: false, error: "Invalid budget_range" };
  return {
    ok: true,
    input: {
      age,
      education: b.education as DiagnoseInput["education"],
      english_level: b.english_level as DiagnoseInput["english_level"],
      preferred_region: b.preferred_region as DiagnoseInput["preferred_region"],
      major: b.major as DiagnoseInput["major"],
      budget_range: b.budget_range as DiagnoseInput["budget_range"],
    },
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const v = validate(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  // 검증된 입력만으로 매칭 실행 (에러 시 클라이언트 UX 위해 빈 결과로 fallback X / 그대로 throw)
  matchDiagnose(v.input); // 입력 검증 + 매칭이 throw 안 함을 한 번 검증
  const uuid = encodeInput(v.input);
  return NextResponse.json({ uuid }, { status: 200 });
}
