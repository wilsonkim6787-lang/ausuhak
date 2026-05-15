import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/requireStudent";

type DocRow = {
  id: string;
  doc_type: string;
  file_url: string | null;
  status: string | null;
  note: string | null;
  created_at: string;
};

// 학생이 제출해야 할 8가지 서류 (PART B-1 Stage 6)
const DOC_TYPES = [
  { key: "passport", label: "여권 사본" },
  { key: "academic", label: "학력 증명 (성적·졸업)" },
  { key: "english", label: "영어 시험 성적표 (IELTS/PTE 등)" },
  { key: "finance", label: "재정증명 (잔고증명)" },
  { key: "personal_statement", label: "Personal Statement / SOP" },
  { key: "recommendation", label: "추천서 (의대만 필수)" },
  { key: "photo", label: "여권 사진 (디지털)" },
  { key: "other", label: "기타" },
] as const;

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function MypageDocumentsPage() {
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { data } = student.id
    ? await supabase
        .from("documents")
        .select("id, doc_type, file_url, status, note, created_at")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
    : { data: [] as DocRow[] };

  const docs = (data ?? []) as DocRow[];

  // doc_type별 최신 row만 추리기
  const byType = new Map<string, DocRow>();
  for (const d of docs) {
    if (!byType.has(d.doc_type)) byType.set(d.doc_type, d);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">📁 서류 체크리스트</h1>
        <p className="mt-1 text-sm text-ink-500">
          업로드는 카톡으로 보내주시면 Wilson 또는 직원이 검토 후 여기에 표시합니다.
        </p>
      </div>

      <ul className="space-y-2">
        {DOC_TYPES.map((t) => {
          const d = byType.get(t.key);
          const status = d?.status ?? "pending";
          const ok = status === "approved" || status === "verified";

          return (
            <li
              key={t.key}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                ok
                  ? "border-success/30 bg-success/5"
                  : status === "rejected"
                  ? "border-error/30 bg-error/5"
                  : status === "submitted"
                  ? "border-gold-600/30 bg-gold-100/40"
                  : "border-cream-300 bg-white"
              }`}
            >
              <span
                className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  ok
                    ? "bg-success text-white"
                    : status === "rejected"
                    ? "bg-error text-white"
                    : status === "submitted"
                    ? "bg-gold-600 text-white"
                    : "bg-cream-300 text-ink-500"
                }`}
              >
                {ok ? "✓" : status === "rejected" ? "✗" : "·"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy-900">{t.label}</p>
                {d?.note && <p className="mt-0.5 text-xs text-ink-500">{d.note}</p>}
              </div>
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                {status}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="rounded-2xl border border-cream-300 bg-white p-5 text-sm">
        <p className="mb-3 text-ink-700">
          서류는 카톡 채널로 사진·PDF·이미지 어떤 형식이든 보내주시면 됩니다. 검토 후 검증 상태가
          이 페이지에 자동 반영됩니다.
        </p>
        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="mypage_documents"
          className="inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
        >
          💬 카톡으로 보내기
        </a>
      </div>
    </div>
  );
}
