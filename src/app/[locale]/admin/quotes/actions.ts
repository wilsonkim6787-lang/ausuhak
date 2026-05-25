"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logActivity } from "@/lib/audit/log";

export type QuoteActionState = { ok?: boolean; error?: string; id?: string };

// 학교별 정보 (selected_schools JSONB) — 022: 100% Wilson 수기 입력
// step_type 추가 (어학연수/컬리지/대학/직접추가) — 동적 단계 쌓기 지원.
export type SelectedSchool = {
  step_type?: string;             // "어학연수" / "컬리지" / "대학" / "직접" / null (옛 데이터)
  school_name: string;
  program: string;
  duration_text: string;          // 자유 텍스트 "24주" / "1.5년" / "1학기"
  payment_cycle: string | null;   // 안내 문구용 / 수동 선택만
  tuition_aud: number;
  scholarship_aud: number;
  promotion_aud: number;
  scholarship_note: string | null;  // ⚠️ INTERNAL — 학생 노출 X
  promotion_note: string | null;    // ⚠️ INTERNAL — 학생 노출 X
};

// items JSONB = AUD 항목 (학교 공통) + 환율 + 1:1 상담비
// PART E-6 [3]: KRW 항목 = 항공권 / 1:1 상담비 / 수속비
// → 항공권·수속비는 quotes 컬럼 / 1:1 상담비는 items JSONB
// 021: living_cost = items에서 분리 → quotes.living_cost_aud_monthly 컬럼
export type QuoteItems = {
  region: string | null;
  oshc_per_year_aud: number;
  visa_500_aud: number;
  settlement_aud: number;
  consultation_fee_krw: number;       // 1:1 화상 상담비 (was wilson_fee_krw)
  exchange_rate_krw_per_aud: number;
};

// 견적 입력값 전체 (parse 결과)
type ParsedQuote = {
  student_id: string;
  quote_type: "consultation" | "enrollment";
  selected_schools: SelectedSchool[];
  items: QuoteItems;
  living_cost_aud_monthly: number;     // 021: 월 단위 컬럼 분리
  airfare_krw: number;
  processing_fee_krw: number;
  processing_fee_reason: string | null;
  accommodation_aud: number;
  accommodation_type: string | null;
  pickup_aud: number;
  pickup_type: string | null;
  exchange_rate_date: string | null;  // ISO date
  note: string | null;
  total_aud: number | null;
  total_krw: number | null;
  error?: string;
};

const EMPTY_ITEMS: QuoteItems = {
  region: null,
  oshc_per_year_aud: 700,
  visa_500_aud: 2000,
  settlement_aud: 3000,
  consultation_fee_krw: 50000,
  exchange_rate_krw_per_aud: 920,
};

function parseQuotePayload(formData: FormData): ParsedQuote {
  const empty: ParsedQuote = {
    student_id: "", quote_type: "consultation", selected_schools: [], items: EMPTY_ITEMS,
    living_cost_aud_monthly: 0,
    airfare_krw: 0, processing_fee_krw: 0, processing_fee_reason: null,
    accommodation_aud: 0, accommodation_type: null, pickup_aud: 0, pickup_type: null,
    exchange_rate_date: null, note: null, total_aud: null, total_krw: null,
  };

  const student_id = String(formData.get("student_id") ?? "");
  if (!student_id) return { ...empty, error: "학생을 선택해주세요." };

  const quote_type = String(formData.get("quote_type") ?? "consultation") as
    | "consultation" | "enrollment";

  // 동적 학교 슬롯: schools_json (client 에서 JSON.stringify 로 전달)
  // 호환: 옛 school{i}_xxx 폼 필드도 fallback 으로 읽음.
  const selected_schools: SelectedSchool[] = [];
  const schoolsJsonRaw = formData.get("schools_json");
  if (typeof schoolsJsonRaw === "string" && schoolsJsonRaw.trim()) {
    try {
      const parsed = JSON.parse(schoolsJsonRaw) as unknown;
      if (Array.isArray(parsed)) {
        for (const raw of parsed) {
          if (!raw || typeof raw !== "object") continue;
          const r = raw as Record<string, unknown>;
          const school_name = String(r.school_name ?? "").trim();
          if (!school_name) continue;
          selected_schools.push({
            step_type:        typeof r.step_type === "string" ? r.step_type : undefined,
            school_name,
            program:          String(r.program ?? "").trim(),
            duration_text:    String(r.duration_text ?? "").trim(),
            payment_cycle:    typeof r.payment_cycle === "string" && r.payment_cycle.trim()
                                ? r.payment_cycle : null,
            tuition_aud:      Number(r.tuition_aud) || 0,
            scholarship_aud:  Number(r.scholarship_aud) || 0,
            promotion_aud:    Number(r.promotion_aud) || 0,
            scholarship_note: typeof r.scholarship_note === "string" && r.scholarship_note.trim()
                                ? r.scholarship_note : null,
            promotion_note:   typeof r.promotion_note === "string" && r.promotion_note.trim()
                                ? r.promotion_note : null,
          });
        }
      }
    } catch {
      // fallback to legacy slot parse below
    }
  }
  // fallback (옛 폼 호환)
  if (selected_schools.length === 0) {
    for (let i = 0; i < 10; i++) {
      const school_name = String(formData.get(`school${i}_name`) ?? "").trim();
      if (!school_name) continue;
      selected_schools.push({
        school_name,
        program:          String(formData.get(`school${i}_program`) ?? "").trim(),
        duration_text:    String(formData.get(`school${i}_duration_text`) ?? "").trim(),
        payment_cycle:    String(formData.get(`school${i}_cycle`) ?? "").trim() || null,
        tuition_aud:      parseFloat(String(formData.get(`school${i}_tuition`) ?? "0")) || 0,
        scholarship_aud:  parseFloat(String(formData.get(`school${i}_scholarship`) ?? "0")) || 0,
        promotion_aud:    parseFloat(String(formData.get(`school${i}_promotion`) ?? "0")) || 0,
        scholarship_note: String(formData.get(`school${i}_scholarship_note`) ?? "").trim() || null,
        promotion_note:   String(formData.get(`school${i}_promotion_note`) ?? "").trim() || null,
      });
    }
  }
  if (selected_schools.length === 0) {
    return { ...empty, student_id, quote_type, error: "최소 1개 학교를 입력해주세요." };
  }

  const fx = parseFloat(String(formData.get("exchange_rate") ?? "920")) || 920;
  // 021: living은 월 단위 form field → quotes 컬럼으로 분리
  const livingMonthly = parseFloat(String(formData.get("living_monthly") ?? "0")) || 0;
  const items: QuoteItems = {
    region: (String(formData.get("region") ?? "").trim()) || null,
    oshc_per_year_aud:        parseFloat(String(formData.get("oshc") ?? "700"))           || 0,
    visa_500_aud:             parseFloat(String(formData.get("visa") ?? "2000"))          || 0,
    settlement_aud:           parseFloat(String(formData.get("settlement") ?? "3000"))    || 0,
    consultation_fee_krw:     parseFloat(String(formData.get("consultation_fee") ?? "0")) || 0,
    exchange_rate_krw_per_aud: fx,
  };

  const accommodation_aud = parseFloat(String(formData.get("accommodation") ?? "0")) || 0;
  const accommodation_type = (String(formData.get("accommodation_type") ?? "").trim()) || null;
  const pickup_aud = parseFloat(String(formData.get("pickup") ?? "0")) || 0;
  const pickup_type = (String(formData.get("pickup_type") ?? "").trim()) || null;
  const airfare_krw = parseFloat(String(formData.get("airfare_krw") ?? "0")) || 0;
  const processing_fee_krw = parseFloat(String(formData.get("processing_fee_krw") ?? "0")) || 0;
  const processing_fee_reason = (String(formData.get("processing_fee_reason") ?? "").trim()) || null;
  const exchange_rate_date = (String(formData.get("exchange_rate_date") ?? "").trim()) || null;

  // 022: 첫 학교 기준 1년 추정 총액 (참고용 / 학생 PDF는 학교별로 따로 표시)
  //  - 학비 = Wilson 입력 total (장학금·프로모션 차감)
  //  - 기타 항목 = 1년 기준 (생활비×12, OSHC×1, 숙소×52, visa/정착/픽업 1회)
  //  - duration_text는 표시용 (계산 X)
  const first = selected_schools[0];
  const tuitionActual    = first.tuition_aud - first.scholarship_aud - first.promotion_aud;
  const livingYearly     = livingMonthly * 12;
  const accomYearly      = accommodation_aud * 52;
  const oneTimeAud       = items.visa_500_aud + items.settlement_aud + pickup_aud;
  const schoolTotalAud   = tuitionActual + livingYearly + items.oshc_per_year_aud + accomYearly + oneTimeAud;
  const krwAdditions     = airfare_krw + items.consultation_fee_krw + processing_fee_krw;
  const total_krw        = Math.round(schoolTotalAud * fx + krwAdditions);
  const total_aud        = Math.round(schoolTotalAud);

  return {
    student_id, quote_type, selected_schools, items,
    living_cost_aud_monthly: livingMonthly,
    airfare_krw, processing_fee_krw, processing_fee_reason,
    accommodation_aud, accommodation_type, pickup_aud, pickup_type,
    exchange_rate_date, note: (String(formData.get("note") ?? "").trim()) || null,
    total_aud, total_krw,
  };
}

function buildDbPayload(parsed: ParsedQuote, userId: string) {
  return {
    student_id: parsed.student_id,
    quote_type: parsed.quote_type,
    selected_schools: parsed.selected_schools,
    items: parsed.items,
    living_cost_aud_monthly: parsed.living_cost_aud_monthly,  // 021
    airfare_krw: parsed.airfare_krw,
    processing_fee_krw: parsed.processing_fee_krw,
    processing_fee_reason: parsed.processing_fee_reason,
    accommodation_aud: parsed.accommodation_aud,
    accommodation_type: parsed.accommodation_type,
    pickup_aud: parsed.pickup_aud,
    pickup_type: parsed.pickup_type,
    exchange_rate_date: parsed.exchange_rate_date,
    total_aud: parsed.total_aud,
    total_krw: parsed.total_krw,
    note: parsed.note,
    policy_snapshot: { saved_at: new Date().toISOString(), user_id: userId },
  };
}

export async function createQuoteAction(
  _prev: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const parsed = parseQuotePayload(formData);
  if (parsed.error) return { error: parsed.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      ...buildDbPayload(parsed, user.id),
      created_by: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { error: `저장 실패: ${error.message}` };

  await logActivity({
    action_type: "create_quote",
    target_table: "quotes",
    target_id: data.id,
    details: {
      student_id: parsed.student_id,
      quote_type: parsed.quote_type,
      school_count: parsed.selected_schools.length,
      total_aud: parsed.total_aud,
      total_krw: parsed.total_krw,
    },
  });

  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${data.id}`);
}

export async function updateQuoteAction(
  _prev: QuoteActionState,
  formData: FormData,
): Promise<QuoteActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const quoteId = String(formData.get("quote_id") ?? "");
  if (!quoteId) return { error: "quote_id 누락." };

  const parsed = parseQuotePayload(formData);
  if (parsed.error) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({
      ...buildDbPayload(parsed, user.id),
      updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) return { error: `저장 실패: ${error.message}` };

  await logActivity({
    action_type: "update_quote",
    target_table: "quotes",
    target_id: quoteId,
    details: {
      student_id: parsed.student_id,
      quote_type: parsed.quote_type,
      school_count: parsed.selected_schools.length,
      total_aud: parsed.total_aud,
      total_krw: parsed.total_krw,
    },
  });

  revalidatePath(`/admin/quotes/${quoteId}`);
  revalidatePath("/admin/quotes");
  return { ok: true };
}
