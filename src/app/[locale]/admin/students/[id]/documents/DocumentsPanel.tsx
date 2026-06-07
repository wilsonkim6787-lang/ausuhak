// BLOCK 4 — 서류 탭: 전체 문서를 출국 전 / 출국 후 2그룹으로.
// 올림(학생 제출, gold) / 받음(staff 제공, navy) 태그. 그룹별 업로드.
// 권한: uploadDocumentAction = super_admin (기존 모델 유지). 엔진/액션 재사용.

import { uploadDocumentAction, deleteDocumentFileAction } from "../actions";
import { isStaffDocType } from "@/lib/progress";
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

type Group = "before" | "after";

const DOC_META: Record<string, { label: string; group: Group }> = {
  passport: { label: "여권", group: "before" },
  transcript: { label: "학력 증명", group: "before" },
  english_score: { label: "영어 성적", group: "before" },
  financial: { label: "재정 증빙", group: "before" },
  gs_statement: { label: "GS Statement", group: "before" },
  recommendation: { label: "추천서", group: "before" },
  personal_statement: { label: "Personal Statement", group: "before" },
  quote: { label: "견적서", group: "before" },
  offer_letter: { label: "Offer Letter", group: "before" },
  coe: { label: "입학허가서(CoE)", group: "before" },
  visa_grant: { label: "비자 승인서(Grant)", group: "before" },
  other: { label: "기타", group: "before" },
  oshc: { label: "보험(OSHC)", group: "after" },
  accommodation: { label: "숙소 서류", group: "after" },
  arrival: { label: "도착 확인", group: "after" },
};

const UPLOAD_TYPES: Record<Group, { key: string; label: string }[]> = {
  before: [
    { key: "passport", label: "여권" },
    { key: "transcript", label: "학력 증명" },
    { key: "english_score", label: "영어 성적" },
    { key: "financial", label: "재정 증빙" },
    { key: "gs_statement", label: "GS Statement" },
    { key: "recommendation", label: "추천서" },
    { key: "personal_statement", label: "Personal Statement" },
    { key: "other", label: "기타" },
  ],
  after: [
    { key: "oshc", label: "보험(OSHC)" },
    { key: "accommodation", label: "숙소 서류" },
    { key: "arrival", label: "도착 확인" },
  ],
};

const STATUSES: [string, string][] = [
  ["requested", "요청됨"],
  ["pending", "대기"],
  ["received", "받음"],
  ["verified", "확인"],
  ["rejected", "반려"],
];

const ACCEPT_MIME =
  "application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.docx";

function groupOf(docType: string): Group {
  return DOC_META[docType]?.group ?? "before";
}
function labelOf(docType: string): string {
  return DOC_META[docType]?.label ?? docType;
}

export default function DocumentsPanel({
  studentId,
  docs,
}: {
  studentId: string;
  docs: DocRow[];
}) {
  const groups: Record<Group, DocRow[]> = { before: [], after: [] };
  for (const d of docs) groups[groupOf(d.doc_type)].push(d);

  return (
    <div className="flex flex-col gap-5">
      <DocGroup
        title="🛫 출국 전 서류"
        hint="입학·비자 단계 서류 (여권·성적·재정·견적서·CoE·비자 승인서 등)"
        group="before"
        studentId={studentId}
        docs={groups.before}
      />
      <DocGroup
        title="🏡 출국 후 서류"
        hint="도착 후 보험·숙소·정착 서류"
        group="after"
        studentId={studentId}
        docs={groups.after}
      />
    </div>
  );
}

function DocGroup({
  title,
  hint,
  group,
  studentId,
  docs,
}: {
  title: string;
  hint: string;
  group: Group;
  studentId: string;
  docs: DocRow[];
}) {
  return (
    <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-bold text-navy-900">{title}</h2>
        <span className="text-xs text-ink-500">{docs.length}개</span>
      </div>
      <p className="mt-0.5 text-xs text-ink-500">{hint}</p>

      {docs.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-cream-300 bg-cream-100/50 px-4 py-3 text-xs text-ink-500">
          아직 등록된 서류가 없어요.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {docs.map((d) => {
            const staff = isStaffDocType(d.doc_type);
            const hasFile = Boolean(d.storage_path || d.file_url);
            return (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-cream-300 bg-cream-100/40 px-3 py-2.5 text-sm"
              >
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    staff ? "bg-navy-900 text-white" : "bg-gold-500 text-white"
                  }`}
                >
                  {staff ? "받음" : "올림"}
                </span>
                <span className="font-semibold text-navy-900">{labelOf(d.doc_type)}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-ink-500">
                  {d.original_filename ?? (hasFile ? "파일" : "—")}
                </span>

                {/* 상태 (파일 변경 없이 상태만 저장) */}
                <form action={uploadDocumentAction}>
                  <input type="hidden" name="student_id" value={studentId} />
                  <input type="hidden" name="doc_type" value={d.doc_type} />
                  <input type="hidden" name="doc_id" value={d.id} />
                  <select
                    name="status"
                    defaultValue={d.status ?? "pending"}
                    className="rounded-md border border-cream-300 bg-white px-1.5 py-1 text-[11px] text-navy-900"
                  >
                    {STATUSES.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="ml-1 text-[11px] font-semibold text-navy-700 hover:text-gold-600">
                    저장
                  </button>
                </form>

                {hasFile && d.storage_path && <DownloadButton documentId={d.id} />}
                {hasFile && d.file_url && !d.storage_path && (
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-navy-700 underline hover:text-gold-600"
                  >
                    링크 열기
                  </a>
                )}

                <form
                  action={deleteDocumentFileAction}
                  className="shrink-0"
                >
                  <input type="hidden" name="doc_id" value={d.id} />
                  <input type="hidden" name="student_id" value={studentId} />
                  <button type="submit" className="text-[11px] text-error hover:underline">
                    삭제
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {/* 그룹 업로드 */}
      <form
        action={uploadDocumentAction}
        className="mt-4 flex flex-wrap items-center gap-2 border-t border-cream-200 pt-4"
      >
        <input type="hidden" name="student_id" value={studentId} />
        <input type="hidden" name="status" value="received" />
        <select
          name="doc_type"
          required
          defaultValue=""
          className="rounded-md border border-cream-300 bg-white px-2 py-1.5 text-xs text-navy-900"
        >
          <option value="" disabled>
            서류 종류
          </option>
          {UPLOAD_TYPES[group].map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="file"
          name="file"
          accept={ACCEPT_MIME}
          required
          className="text-xs file:mr-2 file:rounded file:border-0 file:bg-navy-900 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-gold-400"
        />
        <button
          type="submit"
          className="rounded-md bg-gold-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gold-500"
        >
          업로드
        </button>
        <span className="text-[10px] text-ink-500">5MB · PDF·JPG·PNG·DOCX</span>
      </form>
    </section>
  );
}
