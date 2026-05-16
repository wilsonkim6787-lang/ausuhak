// 서류 체크리스트 — PART D-3 / Migration 024.
// 8 doc_types 고정. 각 유형: pending / received / verified / rejected.
// Supabase Storage 업로드 (5MB / PDF·JPG·PNG·DOCX). file_url 외부 링크는 백워드 호환.

import { Button } from "@/components/ui/Button";
import { uploadDocumentAction, deleteDocumentFileAction } from "../actions";
import DownloadButton from "./DownloadButton";

export type DocRow = {
  id: string;
  doc_type: string;
  file_url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  original_filename: string | null;
  status: string | null;
  note: string | null;
  created_at: string;
};

const DOC_TYPES: { key: string; label: string; hint: string }[] = [
  { key: "passport",           label: "여권",              hint: "Passport scan / 만료일 확인" },
  { key: "transcript",         label: "학력 증명",          hint: "성적증명서 / 졸업증명서" },
  { key: "english_score",      label: "영어 성적",          hint: "IELTS / PTE / TOEFL" },
  { key: "financial",          label: "재정 증빙",          hint: "통장 잔고 / 부모 동의서" },
  { key: "gs_statement",       label: "GS Statement",       hint: "Genuine Student 진술서 (2024.3.23 이후)" },
  { key: "recommendation",     label: "추천서",            hint: "교수·고용주 추천 (석사·간호 등)" },
  { key: "personal_statement", label: "Personal Statement", hint: "지원 동기 에세이" },
  { key: "other",              label: "기타",              hint: "기타 서류" },
];

const STATUSES: [string, string][] = [
  ["pending",  "⬜ pending"],
  ["received", "📥 received"],
  ["verified", "✅ verified"],
  ["rejected", "❌ rejected"],
];

const ACCEPT_MIME = "application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.docx";

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

export default function DocumentsPanel({
  studentId,
  docs,
}: {
  studentId: string;
  docs: DocRow[];
}) {
  // doc_type별 최신 row 매핑
  const byType = new Map<string, DocRow>();
  docs.forEach((d) => {
    if (!byType.has(d.doc_type)) byType.set(d.doc_type, d);
  });

  const verifiedCount = docs.filter((d) => d.status === "verified").length;
  const receivedCount = docs.filter((d) => d.status === "received").length;
  const pendingCount = DOC_TYPES.length - byType.size + docs.filter((d) => d.status === "pending").length;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-navy-900">
            서류 체크리스트 (8 유형)
          </h2>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-success">✅ {verifiedCount}</span>
            <span className="rounded-full bg-navy-900 px-2 py-0.5 text-white">📥 {receivedCount}</span>
            <span className="rounded-full bg-cream-200 px-2 py-0.5 text-ink-500">⬜ {pendingCount}</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-500">
          5MB 이하 PDF · JPG · PNG · DOCX 업로드. 다운로드 링크는 5분 유효.
        </p>

        <ul className="mt-5 flex flex-col gap-3">
          {DOC_TYPES.map((t) => {
            const row = byType.get(t.key);
            const hasUpload = Boolean(row?.storage_path);
            const hasLegacyUrl = Boolean(row?.file_url) && !hasUpload;

            return (
              <li key={t.key} className="rounded-xl border border-cream-300 bg-cream-100/50 p-4">
                <form action={uploadDocumentAction} className="flex flex-col gap-3">
                  <input type="hidden" name="student_id" value={studentId} />
                  <input type="hidden" name="doc_type" value={t.key} />
                  {row?.id && <input type="hidden" name="doc_id" value={row.id} />}

                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-bold text-navy-900">
                        {t.label}
                      </p>
                      <p className="text-[11px] text-ink-500">{t.hint}</p>
                    </div>
                    <select
                      name="status"
                      defaultValue={row?.status ?? "pending"}
                      className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs text-navy-900"
                    >
                      {STATUSES.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* 현재 업로드 상태 표시 */}
                  {hasUpload && row && (
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-xs">
                      <span className="font-semibold text-navy-900">📎 {row.original_filename ?? "파일"}</span>
                      <span className="text-ink-500">{formatBytes(row.size_bytes)}</span>
                      <span className="ml-auto flex gap-1.5">
                        <DownloadButton documentId={row.id} />
                      </span>
                    </div>
                  )}
                  {hasLegacyUrl && row?.file_url && (
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs">
                      <span className="font-semibold text-navy-900">🔗 외부 링크 (legacy)</span>
                      <a
                        href={row.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto truncate text-navy-700 underline hover:text-gold-600"
                      >
                        열기
                      </a>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-ink-500">
                        {hasUpload ? "새 파일 (교체)" : "파일 업로드"}
                      </span>
                      <input
                        type="file"
                        name="file"
                        accept={ACCEPT_MIME}
                        className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs text-navy-900 file:mr-2 file:rounded file:border-0 file:bg-navy-900 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-gold-400 hover:file:bg-navy-800"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-ink-500">메모</span>
                      <input
                        type="text"
                        name="note"
                        defaultValue={row?.note ?? ""}
                        placeholder="내부 메모"
                        className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs text-navy-900 outline-none focus:border-gold-500"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="submit" size="sm" variant="secondary">
                      저장
                    </Button>
                  </div>
                </form>

                {/* 삭제 (별도 form — 다른 action) */}
                {row && (hasUpload || hasLegacyUrl) && (
                  <form action={deleteDocumentFileAction} className="mt-2 flex justify-end">
                    <input type="hidden" name="doc_id" value={row.id} />
                    <input type="hidden" name="student_id" value={studentId} />
                    <button
                      type="submit"
                      className="text-[11px] text-error hover:underline"
                    >
                      파일 삭제
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
