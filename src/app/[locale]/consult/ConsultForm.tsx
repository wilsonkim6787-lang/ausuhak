"use client";

import { useActionState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/Button";
import { submitConsultAction, type ConsultState } from "./actions";
import { KAKAO_URL } from "@/lib/constants";


const TOPICS = [
  "어학연수",
  "전문학교·TAFE",
  "대학·대학원",
  "조기유학",
  "워홀 후 진학",
  "의대",
  "기타",
];

const initial: ConsultState = {};

export default function ConsultForm({ source = "web" }: { source?: string }) {
  const [state, formAction, pending] = useActionState(submitConsultAction, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-cream-300 bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">✅</p>
        <p className="mt-3 font-display text-xl font-bold text-navy-900">
          상담 신청이 접수되었습니다
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          영업일 기준 24시간 안에 남겨주신 연락처로 연락드립니다.
          <br />
          급하시면 카카오 채널이나 전화로 바로 문의하셔도 됩니다.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="consult_done"
            className="rounded-full bg-[#FEE500] px-6 py-3 text-sm font-bold text-[#3C1E1E]"
          >
            💬 카카오로 바로 상담
          </a>
          <a
            href="tel:010-9848-7789"
            className="rounded-full border border-cream-300 bg-white px-6 py-3 text-sm font-semibold text-navy-700"
          >
            📞 010-9848-7789
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={() => track("consult_submit", { source })}
      className="flex flex-col gap-4 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8"
    >
      <input type="hidden" name="source" value={source} />
      {/* 허니팟 — 사람에겐 안 보임 */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-navy-900">이름 *</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={50}
            placeholder="홍길동"
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-navy-900">연락처 *</span>
          <input
            name="contact"
            required
            minLength={5}
            maxLength={80}
            placeholder="전화번호 또는 카카오톡 ID"
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-navy-900">관심 분야</span>
        <select
          name="topic"
          className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold text-navy-900">문의 내용 (선택)</span>
        <textarea
          name="message"
          rows={4}
          maxLength={1000}
          placeholder="나이·학력·영어 수준·희망 시기 등을 적어주시면 더 정확한 안내가 가능합니다."
          className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm outline-none focus:border-gold-500"
        />
      </label>

      <label className="flex items-start gap-2 text-xs text-ink-700">
        <input type="checkbox" name="agree" required className="mt-0.5" />
        <span>
          상담 연락을 위한 개인정보(이름·연락처) 수집·이용에 동의합니다.{" "}
          <Link href="/privacy" className="underline" target="_blank">
            개인정보처리방침
          </Link>
        </span>
      </label>

      {state.error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {state.error}</p>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "접수 중…" : "무료 상담 신청하기"}
      </Button>
    </form>
  );
}
