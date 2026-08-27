// 📁 서류 — 이민성(ImmiAccount) 스타일 체크리스트.
// 필요한 서류가 절차별로 보이고, 각 서류는 제출 필요 → 검토 중 → 승인 흐름으로 표시.
// 학생이 직접 업로드 (재업로드 가능), 보완 요청 사유 노출, 받은 서류(오퍼·CoE 등) 다운로드.
// doc_type 은 src/lib/progress.ts STUDENT_DOC_TYPES 정본과 통일 (기존 키 불일치 버그 수정).

import { requireStudent } from "@/lib/auth/requireStudent";
import { createAdminClient } from "@/lib/supabase/admin";
import UploadRow from "./UploadRow";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";
const BUCKET = "student-documents";

type DocRow = {
  id: string;
  doc_type: string;
  file_url: string | null;
  storage_path: string | null;
  original_filename: string | null;
  status: string | null;
  note: string | null;
  created_at: string;
};

// 제출 서류 정의 (정본 doc_type + 학생용 안내문)
const STUDENT_DOCS: {
  key: string;
  label: string;
  desc: string;
  optional?: boolean;
  medicalOnly?: boolean;
}[] = [
  { key: "passport", label: "여권 사본", desc: "사진면 전체가 선명하게 보이도록 스캔 또는 촬영" },
  { key: "transcript", label: "학력 증명", desc: "최종학력 성적증명서 + 졸업(재학)증명서 — 영문본" },
  { key: "english_score", label: "영어 성적표", desc: "IELTS·PTE·TOEFL 등 공식 성적표 (있는 경우 먼저 제출)" },
  { key: "financial", label: "재정 증빙", desc: "은행 잔고증명서 — 학비+생활비 커버 금액, 영문 발급" },
  { key: "gs_statement", label: "GS 진술서", desc: "유학 목적 진술서 (GS) — 양식은 담당팀이 안내" },
  { key: "personal_statement", label: "자기소개서 (SOP)", desc: "지원 학교 제출용 — 초안이어도 먼저 올려주세요" },
  { key: "recommendation", label: "추천서", desc: "의대 지원자 필수 — 그 외 과정은 해당 시에만", medicalOnly: true },
  { key: "other", label: "기타 서류", desc: "담당팀이 별도로 요청한 서류", optional: true },
];

// 담당팀이 발급해서 학생에게 주는 서류
const RECEIVED_DOCS: { key: string; label: string }[] = [
  { key: "quote", label: "견적서" },
  { key: "offer_letter", label: "Offer Letter (입학 오퍼)" },
  { key: "coe", label: "입학허가서 (CoE)" },
  { key: "visa_grant", label: "비자 승인서 (Grant Letter)" },
];

type UiStatus = "todo" | "review" | "done" | "fix";

function toUiStatus(d: DocRow | undefined): UiStatus {
  if (!d || (!d.storage_path && !d.file_url)) return "todo";
  const s = (d.status ?? "").toLowerCase();
  if (s === "verified" || s === "approved") return "done";
  if (s === "rejected") return "fix";
  return "review"; // submitted / received / pending 등 — 파일이 있으면 검토 중
}

const STATUS_UI: Record<UiStatus, { label: string; chip: string; dot: string }> = {
  todo: { label: "제출 필요", chip: "bg-cream-200 text-ink-700", dot: "bg-cream-300 text-ink-500" },
  review: { label: "검토 중", chip: "bg-gold-100 text-gold-600", dot: "bg-gold-600 text-white" },
  done: { label: "승인 완료", chip: "bg-success/15 text-success", dot: "bg-success text-white" },
  fix: { label: "보완 필요", chip: "bg-error/15 text-error", dot: "bg-error text-white" },
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default async function MypageDocumentsPage() {
  const { student } = await requireStudent();
  const admin = createAdminClient();

  let docs: DocRow[] = [];
  if (student.id) {
    const { data } = await admin
      .from("documents")
      .select("id, doc_type, file_url, storage_path, original_filename, status, note, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });
    docs = (data ?? []) as DocRow[];
  }

  // doc_type 별 최신 1건
  const byType = new Map<string, DocRow>();
  for (const d of docs) {
    if (!byType.has(d.doc_type)) byType.set(d.doc_type, d);
  }

  // 다운로드 signed URL (1시간)
  const signedUrl = new Map<string, string>();
  const withFiles = [...byType.values()].filter((d) => d.storage_path);
  if (withFiles.length > 0) {
    const results = await Promise.all(
      withFiles.map((d) =>
        admin.storage.from(BUCKET).createSignedUrl(d.storage_path as string, 3600),
      ),
    );
    withFiles.forEach((d, i) => {
      const url = results[i]?.data?.signedUrl;
      if (url) signedUrl.set(d.id, url);
    });
  }

  // 진행률 — 필수 서류 기준 (recommendation 은 의대만, other 제외)
  const required = STUDENT_DOCS.filter(
    (t) => !t.optional && (!t.medicalOnly || student.is_medical),
  );
  const doneCount = required.filter((t) => toUiStatus(byType.get(t.key)) === "done").length;
  const reviewCount = required.filter((t) => toUiStatus(byType.get(t.key)) === "review").length;
  const pct = required.length === 0 ? 0 : Math.round((doneCount / required.length) * 100);

  const received = RECEIVED_DOCS.map((t) => ({ ...t, row: byType.get(t.key) })).filter(
    (t) => t.row && (t.row.storage_path || t.row.file_url),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">📁 서류 체크리스트</h1>
        <p className="mt-1 text-sm text-ink-500">
          아래 서류를 직접 업로드하면 담당팀이 검토 후 승인해드립니다.
        </p>
      </div>

      {/* 진행률 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-bold text-navy-900">
            필수 서류 {required.length}개 중{" "}
            <span className="text-gold-600">{doneCount}개 승인</span>
            {reviewCount > 0 && (
              <span className="ml-1.5 text-xs font-medium text-ink-500">
                · 검토 중 {reviewCount}
              </span>
            )}
          </p>
          <p className="font-display text-xl font-bold text-navy-900">{pct}%</p>
        </div>
        <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-cream-200">
          <div
            className="h-full rounded-full bg-gold-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* 제출 체크리스트 */}
      <ul className="space-y-2">
        {STUDENT_DOCS.filter((t) => !t.medicalOnly || student.is_medical || byType.has(t.key)).map(
          (t, i) => {
            const d = byType.get(t.key);
            const st = toUiStatus(d);
            const ui = STATUS_UI[st];
            const url = d ? signedUrl.get(d.id) : undefined;

            return (
              <li
                key={t.key}
                className={`rounded-xl border px-4 py-3.5 ${
                  st === "done"
                    ? "border-success/30 bg-success/5"
                    : st === "fix"
                      ? "border-error/40 bg-error/5"
                      : st === "review"
                        ? "border-gold-600/30 bg-gold-100/30"
                        : "border-cream-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ui.dot}`}
                  >
                    {st === "done" ? "✓" : st === "fix" ? "!" : i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy-900">{t.label}</p>
                      {(t.optional || (t.medicalOnly && !student.is_medical)) && (
                        <span className="rounded-full bg-cream-200 px-1.5 py-0.5 text-[10px] text-ink-500">
                          선택
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ui.chip}`}>
                        {ui.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{t.desc}</p>

                    {st === "fix" && d?.note && (
                      <p className="mt-1.5 rounded-lg bg-error/10 px-2.5 py-1.5 text-xs font-medium text-error">
                        보완 요청: {d.note}
                      </p>
                    )}

                    {d && (d.storage_path || d.file_url) && (
                      <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
                        <span className="truncate">
                          📄 {d.original_filename ?? "업로드된 파일"} · {fmtDate(d.created_at)}
                        </span>
                        {(url || d.file_url) && (
                          <a
                            href={url ?? d.file_url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-navy-700 underline hover:text-gold-600"
                          >
                            내 파일 보기
                          </a>
                        )}
                      </p>
                    )}
                  </div>

                  <UploadRow docType={t.key} hasFile={st !== "todo"} />
                </div>
              </li>
            );
          },
        )}
      </ul>

      {/* 받은 서류 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">📬 받은 서류</h2>
        <p className="mt-0.5 text-xs text-ink-500">
          담당팀이 발급한 서류 — 견적서, Offer, CoE, 비자 승인서가 여기에 표시됩니다.
        </p>
        {received.length === 0 ? (
          <p className="mt-4 rounded-xl bg-cream-100/60 px-4 py-5 text-center text-xs text-ink-500">
            아직 발급된 서류가 없습니다. 진행이 시작되면 순서대로 도착해요.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {received.map((t) => {
              const url = t.row ? signedUrl.get(t.row.id) : undefined;
              return (
                <li
                  key={t.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-navy-900/15 bg-navy-900/[0.03] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy-900">{t.label}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink-500">
                      {t.row?.original_filename ?? ""} · {t.row ? fmtDate(t.row.created_at) : ""}
                    </p>
                  </div>
                  {(url || t.row?.file_url) && (
                    <a
                      href={url ?? t.row?.file_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full bg-navy-900 px-3.5 py-1.5 text-xs font-bold text-gold-400 hover:bg-navy-800"
                    >
                      다운로드
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-ink-500">
        파일 업로드가 어려우면{" "}
        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="mypage_documents"
          className="font-semibold text-gold-600 underline"
        >
          카톡 채널
        </a>
        로 보내주셔도 됩니다.
      </p>
    </div>
  );
}
