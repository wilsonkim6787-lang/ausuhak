"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { saveNoticeAction, type NoticeState } from "./actions";

const initial: NoticeState = {};

export default function NoticePanel({
  defaults,
}: {
  defaults: {
    active: boolean;
    title: string;
    body: string;
    version: number;
  };
}) {
  const [state, formAction, pending] = useActionState(saveNoticeAction, initial);
  const [active, setActive] = useState(defaults.active);

  return (
    <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-navy-900">
        📣 메인 페이지 공지 팝업
      </h2>
      <p className="mt-1 text-xs text-ink-500">
        한국어 메인(/) 진입 시 모달로 표시. 학생·학부모가 닫으면 같은 버전은 다시 안 뜸.
        본문 바꾼 후 알리고 싶으면 <strong>버전을 올리세요</strong> (dismiss 무효화).
      </p>

      <form action={formAction} className="mt-5 flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            name="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="size-4 rounded border-cream-300 accent-gold-600"
          />
          공지 활성 (체크하면 메인에 표시)
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">제목</span>
          <input
            type="text"
            name="title"
            defaultValue={defaults.title}
            placeholder="예: 2026년 상반기 일정 안내"
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">
            본문 (줄바꿈 허용 / 학생 노출)
          </span>
          <textarea
            name="body"
            defaultValue={defaults.body}
            rows={6}
            placeholder={"예:\n· 2026.03.01 부터 신규 비자 정책 변경\n· 카톡 상담은 10-18시 사이 응답"}
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm leading-relaxed outline-none focus:border-gold-500"
          />
        </label>

        <div className="grid grid-cols-2 items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">
              현재 버전 (자동)
            </span>
            <input
              type="number"
              name="version"
              defaultValue={String(defaults.version)}
              min={1}
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              name="bump_version"
              className="size-4 rounded border-cream-300 accent-gold-600"
            />
            저장 시 버전 +1 (이전에 닫은 사용자도 다시 보임)
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-cream-200 pt-4">
          <div className="text-xs">
            {state.error && (
              <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">{state.error}</span>
            )}
            {state.ok && !pending && (
              <span className="rounded-lg bg-success/10 px-2.5 py-1 text-success">✓ 저장됨 (메인 즉시 반영)</span>
            )}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중…" : "💾 공지 저장"}
          </Button>
        </div>
      </form>
    </section>
  );
}
