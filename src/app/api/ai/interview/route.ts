import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

// AI interview practice (/medical/interview-lab).
// GET  -> { enabled, loggedIn, used, limit }
// POST -> { mode: "question" | "grade", ... } -> JSON from the model
// Prompts are built here so the endpoint cannot be used as a general AI proxy.

export const maxDuration = 60;

const FREE_GRADES = 3;
const QUESTIONS_PER_DAY = 15;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

const TOPICS: Record<string, string> = {
  all: "any typical theme (motivation, ethics, communication, teamwork, Australian healthcare, rural or Indigenous health, resilience)",
  motivation: "motivation for medicine",
  ethics: "a medical ethics dilemma",
  communication: "communication or teamwork, possibly a short role-play",
  australia: "Australian healthcare and society, including rural or Aboriginal and Torres Strait Islander health",
  resilience: "resilience and self-reflection",
  dentvet: "dentistry or veterinary science",
};

const enabled = () => !!process.env.ANTHROPIC_API_KEY;
const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);

async function usage(userId: string) {
  const admin = adminClient();
  if (!admin) return { grades: 0, questionsToday: 0 };
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [g, q] = await Promise.all([
    admin.from("crm_ai_usage").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("kind", "grade"),
    admin.from("crm_ai_usage").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("kind", "question").gte("created_at", since),
  ]);
  return { grades: g.count ?? 0, questionsToday: q.count ?? 0 };
}

export async function GET() {
  const { user, profile } = await getSession();
  if (!user) return NextResponse.json({ enabled: enabled(), loggedIn: false, used: 0, limit: FREE_GRADES });
  const isAdmin = profile?.role === "admin";
  const u = isAdmin ? { grades: 0 } : await usage(user.id);
  return NextResponse.json({ enabled: enabled(), loggedIn: true, used: u.grades, limit: FREE_GRADES });
}

function extractJson(text: string) {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s < 0 || e <= s) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

async function callModel(prompt: string, maxTokens: number) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
    cache: "no-store",
  });
  if (res.status === 429 || res.status === 529) return { error: "rate_limited" as const };
  if (!res.ok) {
    console.error("anthropic", res.status, (await res.text()).slice(0, 300));
    return { error: "upstream" as const };
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[]; stop_reason?: string };
  if (data.stop_reason === "refusal") return { error: "refused" as const };
  const text = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  const json = extractJson(text);
  return json ? { json } : { error: "invalid_json" as const };
}

const fail = (code: string, status: number) => NextResponse.json({ code }, { status });

export async function POST(req: NextRequest) {
  if (!enabled()) return fail("disabled", 503);
  const { user, profile } = await getSession();
  if (!user) return fail("login", 401);
  const isAdmin = profile?.role === "admin";
  const admin = adminClient();
  if (!admin) return fail("disabled", 503);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400);
  }
  const mode = body.mode;
  const format = clip(body.format, 80);

  if (mode === "question") {
    if (!isAdmin && (await usage(user.id)).questionsToday >= QUESTIONS_PER_DAY) return fail("rate_limited", 429);
    const topic = TOPICS[String(body.theme)] ?? TOPICS.all;
    const prompt =
      `You write practice questions for Australian medical school interviews (format: ${format}) for international applicants. ` +
      `Write ONE new, original question on ${topic}. Do not copy any real university's question. ` +
      `Reply with only JSON: {"prompt": "the question or scenario in English, 1-3 sentences", "ko": "Korean: one sentence of what interviewers look for"}`;
    const r = await callModel(prompt, 400);
    if ("error" in r) return fail(r.error!, r.error === "rate_limited" ? 429 : 502);
    await admin.from("crm_ai_usage").insert({ user_id: user.id, kind: "question" });
    return NextResponse.json(r.json);
  }

  if (mode === "grade") {
    const used = isAdmin ? 0 : (await usage(user.id)).grades;
    if (used >= FREE_GRADES) return fail("limit", 402);
    const question = clip(body.question, 600);
    const parent = clip(body.parent, 600);
    const answer = clip(body.answer, 6000).trim();
    if (!question || answer.length < 20) return fail("bad_request", 400);
    const prompt =
      "You are an experienced interviewer for Australian medical school admissions (MMI and panel). Assess a practice answer from a Korean international applicant. Be honest and specific; do not inflate scores.\n\n" +
      `Format practised: ${format}.\n` +
      (parent ? `Earlier question: ${parent}\n` : "") +
      `Question: ${question}\n\nApplicant answer (may be notes or partly Korean):\n"""\n${answer}\n"""\n\n` +
      "Score each criterion 1-5: empathy (patient-centred, considers others), structure (clear logical flow), ethics (sound judgement, principles, safety, escalation where relevant), specifics (concrete examples or evidence, Australian context where relevant), delivery (clarity and natural English for an interview). Give overall 1-10.\n" +
      "Write all feedback text in Korean, except outline, phrases and followUps which must be in English.\n" +
      'Reply with only JSON: {"overall": number, "verdict": "한 줄 총평", "summary": "2문장 요약", "scores": {"empathy": n, "structure": n, "ethics": n, "specifics": n, "delivery": n}, "strengths": ["2-3 items"], "improvements": ["2-4 concrete items"], "outline": ["4-6 short English steps of a strong answer"], "phrases": ["2-3 useful English sentences the applicant could say"], "followUps": ["2 follow-up questions an interviewer would ask next, in English"]}';
    const r = await callModel(prompt, 2000);
    if ("error" in r) return fail(r.error!, r.error === "rate_limited" ? 429 : 502);
    if (!r.json?.scores) return fail("invalid_json", 502);
    await admin.from("crm_ai_usage").insert({ user_id: user.id, kind: "grade" });
    return NextResponse.json({ ...r.json, _used: isAdmin ? 0 : used + 1 });
  }

  return fail("bad_request", 400);
}
