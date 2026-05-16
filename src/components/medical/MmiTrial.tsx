"use client";

// MMI 무료 체험 — 고정 station id 1 (Wilson 2026-05-16).
// 1분 준비 + 4분 답변 + Wilson 모범답안 reveal. 풀세트 = 카카오 게이트.

import { useEffect, useRef, useState } from "react";
import type { MmiStation } from "@/data/medical";
import { MMI_FREE_STATION_ID } from "@/data/medical";
import KakaoGateModal from "./KakaoGateModal";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";
const PREP_SECONDS = 60;

type Phase = "intro" | "prep" | "answer" | "review";

export default function MmiTrial({ station }: { station: MmiStation }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [gateOpen, setGateOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (station.id !== MMI_FREE_STATION_ID) {
    return (
      <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="font-display text-lg font-bold text-navy-900">
          🔒 무료 체험 범위를 벗어난 스테이션
        </h3>
        <p className="mt-2 text-sm text-ink-700">
          MMI 풀세트 40 스테이션은 결제 후 이용 가능합니다.
        </p>
        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="medical_mmi_locked"
          className="mt-4 inline-flex rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
        >
          💬 카카오로 결제 문의
        </a>
      </div>
    );
  }

  const startTimer = (seconds: number, onEnd: () => void) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(seconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const beginPrep = () => {
    setPhase("prep");
    startTimer(PREP_SECONDS, () => setPhase("answer"));
  };

  const skipToPhase = (target: Phase) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (target === "answer") {
      setPhase("answer");
      startTimer(station.time_seconds, () => setPhase("review"));
    } else if (target === "review") {
      setPhase("review");
      setSecondsLeft(0);
    }
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <>
      <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="rounded-full bg-cream-200 px-3 py-1 uppercase tracking-wider text-ink-700">
            Station #{station.id}
          </span>
          <PhaseLabel phase={phase} secondsLeft={secondsLeft} fmt={fmt} />
        </div>

        <h3 className="mt-4 font-display text-xl font-bold text-navy-900 sm:text-2xl">
          {station.title}
        </h3>

        <article className="mt-4 whitespace-pre-line rounded-xl border border-cream-300 bg-cream-100/40 p-4 text-sm leading-relaxed text-ink-900 sm:p-5 sm:text-[15px]">
          {station.scenario}
        </article>

        <section className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
            평가 기준
          </p>
          <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-ink-700 sm:grid-cols-2">
            {station.criteria.map((c, i) => (
              <li key={i}>· {c}</li>
            ))}
          </ul>
        </section>

        {phase === "intro" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={beginPrep}
              className="rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              🕐 준비 1분 시작
            </button>
            <button
              type="button"
              onClick={() => skipToPhase("answer")}
              className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-cream-100"
            >
              바로 답변 시작
            </button>
          </div>
        )}

        {phase === "prep" && (
          <div className="mt-6 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-ink-700">
            🧠 생각 정리 시간입니다. 화면에 메모하지 마시고 머릿속으로 구조를 잡으세요 (실전 동일).
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => skipToPhase("answer")}
                className="rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-gold-400 transition hover:bg-navy-800"
              >
                준비 끝 — 답변 시작
              </button>
            </div>
          </div>
        )}

        {phase === "answer" && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-ink-700">
              답변 시간 — 머릿속으로 말하거나 아래에 메모해보세요.
            </p>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              placeholder="① 공감 표현 → ② 원칙 입장 → ③ 대안 → ④ 큰 맥락 …"
              className="mt-2 w-full rounded-xl border border-cream-300 bg-cream-100/40 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500 focus:border-gold-600 focus:outline-none"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => skipToPhase("review")}
                className="rounded-full bg-gold-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gold-500"
              >
                답변 끝 — Wilson 모범답안 보기
              </button>
            </div>
          </div>
        )}

        {phase === "review" && (
          <section className="mt-6 rounded-xl border border-cream-300 bg-cream-100/60 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
              Wilson 모범답안
            </p>
            <div
              className="mt-3 text-sm leading-relaxed text-ink-900 [&_strong]:font-semibold [&_strong]:text-navy-900"
              dangerouslySetInnerHTML={{ __html: station.model_answer }}
            />
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setGateOpen(true)}
                className="rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
              >
                🔒 풀세트 40 스테이션 풀기
              </button>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="medical_mmi_trial_review"
                className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-cream-100"
              >
                💬 카카오로 답변 피드백 받기
              </a>
            </div>
          </section>
        )}
      </div>
      <KakaoGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        kakaoSource="medical_mmi_trial_unlock"
      />
    </>
  );
}

function PhaseLabel({
  phase,
  secondsLeft,
  fmt,
}: {
  phase: Phase;
  secondsLeft: number;
  fmt: (s: number) => string;
}) {
  if (phase === "intro")
    return <span className="text-ink-500">대기 중</span>;
  if (phase === "prep")
    return (
      <span className="font-mono text-warning">준비 {fmt(secondsLeft)}</span>
    );
  if (phase === "answer")
    return (
      <span className="font-mono text-gold-600">답변 {fmt(secondsLeft)}</span>
    );
  return <span className="text-success">완료</span>;
}
