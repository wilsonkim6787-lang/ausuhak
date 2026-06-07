import { requireStudent } from "@/lib/auth/requireStudent";
import { createAdminClient } from "@/lib/supabase/admin";
import PhaseBar from "@/components/mypage/PhaseBar";
import PhaseAccordion, { type DocItem } from "@/components/mypage/PhaseAccordion";
import {
  buildStatusMap,
  currentSubstep,
  nextSubstep,
  isStaffDocType,
  ALL_SUBSTEPS,
} from "@/lib/progress";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

type SubstepRow = { substep_key: string; status: string };
type DocRow = {
  id: string;
  doc_type: string;
  substep_key: string | null;
  storage_path: string | null;
  file_url: string | null;
  original_filename: string | null;
};

export default async function MypageHome() {
  const { student } = await requireStudent();

  let substepRows: SubstepRow[] = [];
  let docRows: DocRow[] = [];

  if (student.id) {
    const admin = createAdminClient();
    const [subsRes, docsRes] = await Promise.all([
      admin
        .from("student_substeps")
        .select("substep_key, status")
        .eq("student_id", student.id),
      admin
        .from("documents")
        .select("id, doc_type, substep_key, storage_path, file_url, original_filename")
        .eq("student_id", student.id),
    ]);
    substepRows = (subsRes.data ?? []) as SubstepRow[];
    docRows = (docsRes.data ?? []) as DocRow[];
  }

  const statusMap = buildStatusMap(substepRows, student.current_stage);
  const allDone = ALL_SUBSTEPS.every((s) => statusMap[s.key] === "done");
  const cur = currentSubstep(statusMap);
  const next = nextSubstep(statusMap);

  // 서류 → sub-step 별 묶기 (학생 표시용)
  const docsBySubstep: Record<string, DocItem[]> = {};
  for (const d of docRows) {
    const staff = isStaffDocType(d.doc_type);
    const key = d.substep_key ?? (staff ? null : "a_docs");
    if (!key) continue;
    (docsBySubstep[key] ??= []).push({
      id: d.id,
      doc_type: d.doc_type,
      original_filename: d.original_filename,
      hasFile: Boolean(d.storage_path || d.file_url),
      isStaff: staff,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HERO */}
      <section className="rounded-2xl bg-navy-900 px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-white">
          ● 진행 중
        </span>
        {allDone ? (
          <h1 className="mt-4 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
            호주 도착까지 모두 마쳤어요 🎉
          </h1>
        ) : (
          <>
            <h1 className="mt-4 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
              지금, {cur.label} 중이에요
            </h1>
            {next && (
              <p className="mt-2.5 text-sm text-cream-200 sm:text-base">
                다음 단계 ›{" "}
                <span className="font-semibold text-gold-400">{next.label}</span>
              </p>
            )}
          </>
        )}
      </section>

      {/* 2. PHASE BAR */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
        <PhaseBar statusMap={statusMap} />
      </section>

      {/* 3. STAGE ACCORDION */}
      <PhaseAccordion statusMap={statusMap} docsBySubstep={docsBySubstep} />

      {/* 4. KAKAO CTA */}
      <a
        href={KAKAO_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-kakao-source="mypage_progress"
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#FEE500] px-4 py-4 text-sm font-bold text-[#3C1E1E] shadow-sm transition hover:brightness-95"
      >
        <span className="text-lg">💬</span>
        카카오톡으로 문의하기
      </a>
    </div>
  );
}
