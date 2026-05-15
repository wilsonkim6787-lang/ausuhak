import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/requireStudent";

type QuoteRow = {
  id: string;
  status: string | null;
  quote_type: "consultation" | "enrollment" | null;
  total_aud: number | null;
  total_krw: number | null;
  selected_schools: { name: string }[] | null;
  created_at: string;
};

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

function fmtKRW(n: number | null) {
  if (n == null) return null;
  return "₩" + n.toLocaleString("ko-KR");
}
function fmtAUD(n: number | null) {
  if (n == null) return null;
  return "A$" + n.toLocaleString("en-AU");
}

export default async function MypageQuotePage() {
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { data } = student.id
    ? await supabase
        .from("quotes")
        .select(
          "id, status, quote_type, total_aud, total_krw, selected_schools, created_at",
        )
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] as QuoteRow[] };

  const quotes = (data ?? []) as QuoteRow[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">📋 견적서</h1>
        <p className="mt-1 text-sm text-ink-500">
          Wilson이 1:1 상담 후 작성한 견적서를 여기서 확인하실 수 있습니다.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-cream-300 bg-white p-6 text-sm">
          <p className="mb-3 text-ink-700">
            아직 발행된 견적서가 없습니다. Stage 3 (1:1 상담) 단계에서 Wilson이 직접 학교 1~3개를 선정해
            견적서를 보내드립니다.
          </p>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="mypage_quote_empty"
            className="inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
          >
            💬 1:1 상담 예약 (카톡)
          </a>
        </div>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-base font-semibold text-navy-900">
                  {q.quote_type === "enrollment" ? "유학 등록 견적" : "컨설팅 견적"}
                </p>
                <p className="text-xs text-ink-500">
                  {new Date(q.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>

              {q.selected_schools && q.selected_schools.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {q.selected_schools.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-full bg-cream-100 px-2.5 py-1 text-xs text-navy-700"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                {q.total_aud != null && (
                  <span className="text-ink-700">
                    {fmtAUD(q.total_aud)}{" "}
                    <span className="text-xs text-ink-500">AUD</span>
                  </span>
                )}
                {q.total_krw != null && (
                  <span className="font-semibold text-navy-900">{fmtKRW(q.total_krw)}</span>
                )}
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    q.status === "confirmed"
                      ? "bg-success/15 text-success"
                      : q.status === "sent"
                      ? "bg-gold-100 text-gold-600"
                      : "bg-cream-300 text-ink-700"
                  }`}
                >
                  {q.status ?? "draft"}
                </span>
              </div>

              {/* PDF 다운로드는 Step 2.4에서 추가 */}
              <p className="mt-3 text-xs text-ink-500">
                * PDF 다운로드는 곧 추가됩니다. 지금은 카톡으로 받으신 견적서를 참고해주세요.
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
