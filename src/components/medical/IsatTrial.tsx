"use client";

// ISAT 무료 체험 — 고정 id 1~5 (Wilson 2026-05-16).
// 선택 → 즉시 정답·해설 reveal → 다음. 마지막에 점수 + 카카오 게이트.

import { useState } from "react";
import type { IsatQuestion } from "@/data/medical";
import { ISAT_FREE_MAX_ID } from "@/data/medical";
import KakaoGateModal from "./KakaoGateModal";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function IsatTrial({ questions }: { questions: IsatQuestion[] }) {
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [gateOpen, setGateOpen] = useState(false);

  if (questions.some((q) => q.id > ISAT_FREE_MAX_ID)) {
    return (
      <LockedCard
        title="🔒 무료 체험 범위를 벗어난 문제"
        body="ISAT 풀세트는 결제 후 이용 가능합니다."
      />
    );
  }

  if (idx >= questions.length) {
    return (
      <>
        <Result
          questions={questions}
          picks={picks}
          onUnlock={() => setGateOpen(true)}
        />
        <KakaoGateModal
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          kakaoSource="medical_isat_trial_unlock"
        />
      </>
    );
  }

  const q = questions[idx];
  const picked = picks[q.id];
  const revealed = Boolean(picked);

  const choose = (letter: string) => {
    if (revealed) return;
    setPicks((prev) => ({ ...prev, [q.id]: letter }));
  };

  const next = () => setIdx((i) => i + 1);

  return (
    <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-gold-600">
          {idx + 1} / {questions.length}
        </span>
        <span className="rounded-full bg-cream-200 px-3 py-1 text-[11px] uppercase tracking-wider text-ink-700">
          {q.category === "critical_reasoning"
            ? "Critical Reasoning"
            : "Quantitative Reasoning"}
        </span>
      </div>

      <article className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-900 sm:text-base">
        {q.passage}
      </article>

      <p className="mt-5 font-display text-base font-bold text-navy-900 sm:text-lg">
        {q.question}
      </p>

      <ul className="mt-4 space-y-2.5">
        {q.options.map((opt) => {
          const letter = opt.charAt(0);
          const isPicked = picked === letter;
          const isAnswer = q.answer === letter;
          const state = !revealed
            ? "idle"
            : isAnswer
            ? "correct"
            : isPicked
            ? "wrong"
            : "muted";

          const base =
            "w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition sm:text-[15px]";
          const cls = {
            idle: "border-cream-300 bg-white text-ink-900 hover:border-gold-600 hover:bg-cream-100",
            correct: "border-success/40 bg-success/5 text-ink-900",
            wrong: "border-error/40 bg-error/5 text-ink-900",
            muted: "border-cream-300 bg-cream-100/50 text-ink-500",
          }[state];

          return (
            <li key={letter}>
              <button
                type="button"
                onClick={() => choose(letter)}
                disabled={revealed}
                className={`${base} ${cls}`}
              >
                {opt}
                {revealed && isAnswer && (
                  <span className="ml-2 text-xs font-bold text-success">
                    ✓ 정답
                  </span>
                )}
                {revealed && isPicked && !isAnswer && (
                  <span className="ml-2 text-xs font-bold text-error">
                    ✗ 선택
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <section className="mt-5 rounded-xl border border-cream-300 bg-cream-100/60 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
            해설
          </p>
          <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-900">
            {q.explanation}
          </div>
          <button
            type="button"
            onClick={next}
            className="mt-5 inline-flex rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-gold-400 transition hover:bg-navy-800"
          >
            {idx + 1 === questions.length ? "결과 보기 →" : "다음 문제 →"}
          </button>
        </section>
      )}
    </div>
  );
}

function Result({
  questions,
  picks,
  onUnlock,
}: {
  questions: IsatQuestion[];
  picks: Record<number, string>;
  onUnlock: () => void;
}) {
  const correct = questions.filter((q) => picks[q.id] === q.answer).length;
  const total = questions.length;

  return (
    <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
        결과
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
        {correct} / {total}
      </h2>
      <p className="mt-2 text-sm text-ink-700">
        무료 체험은 Critical Reasoning {total}문제. 풀세트는 CR 100 + QR 100 (총 200문제) + Wilson 직접 피드백.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onUnlock}
          className="rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
        >
          🔒 풀세트 200문제 풀기
        </button>
        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="medical_isat_trial_result"
          className="rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cream-100"
        >
          💬 카카오로 약점 1:1 상담
        </a>
      </div>
    </div>
  );
}

function LockedCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="font-display text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-700">{body}</p>
      <a
        href={KAKAO_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-kakao-source="medical_isat_locked"
        className="mt-4 inline-flex rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
      >
        💬 카카오로 결제 문의
      </a>
    </div>
  );
}
