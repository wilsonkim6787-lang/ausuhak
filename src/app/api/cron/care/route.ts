// Vercel Cron → 학생 자동 케어 일일 평가.
// auto_kakao 룰 히트를 notifications(kakao_manual, pending)로 적재 → /admin/command 발송 대기에 등장.
// wilson 룰은 자동 발송 X (Wilson 이 /admin/care 에서 직접 검토).
// 인증: Vercel Cron 이 Authorization: Bearer ${CRON_SECRET} 헤더로 호출 (env 필요).

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadStudentsForCare } from "@/lib/care/load";
import { CARE_RULES, evaluateCareRules, renderAutoMessage } from "@/lib/care/rules";

export const dynamic = "force-dynamic";

const CARE_PREFIX = "care:"; // notifications.stage_key 식별자 (중복 방지 키)
const COOLDOWN_DAYS = 14; // 같은 학생+같은 룰은 14일에 한 번만 적재

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  let students;
  try {
    students = await loadStudentsForCare(admin);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const hits = evaluateCareRules(students);
  const autoHits = hits.filter((h) => h.severity === "auto_kakao");

  // 최근 COOLDOWN_DAYS 내 적재된 케어 알림 → (학생|stage_key) 집합으로 중복 차단
  const cutoff = new Date(Date.now() - COOLDOWN_DAYS * 86_400_000).toISOString();
  const { data: recent } = await admin
    .from("notifications")
    .select("student_id, stage_key")
    .like("stage_key", `${CARE_PREFIX}%`)
    .gte("created_at", cutoff);
  const seen = new Set((recent ?? []).map((r) => `${r.student_id}|${r.stage_key}`));

  const toInsert: Array<{
    student_id: string;
    channel: string;
    stage_key: string;
    message: string;
    status: string;
    created_by: null;
  }> = [];
  for (const h of autoHits) {
    const stageKey = `${CARE_PREFIX}${h.rule_id}`;
    const dedupeKey = `${h.student_id}|${stageKey}`;
    if (seen.has(dedupeKey)) continue;
    const rule = CARE_RULES.find((r) => r.id === h.rule_id);
    if (!rule?.autoMessageTemplate) continue;
    seen.add(dedupeKey); // 같은 실행 내 중복도 방지
    toInsert.push({
      student_id: h.student_id,
      channel: "kakao_manual",
      stage_key: stageKey,
      message: renderAutoMessage(rule, h.student_name),
      status: "pending",
      created_by: null,
    });
  }

  if (toInsert.length > 0) {
    const { error } = await admin.from("notifications").insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    evaluated: students.length,
    hits: hits.length,
    autoHits: autoHits.length,
    queued: toInsert.length,
  });
}
