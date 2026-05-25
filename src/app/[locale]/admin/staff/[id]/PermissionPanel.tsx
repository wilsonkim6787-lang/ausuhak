"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateStaffPermissionsAction, type PermActionState } from "../actions";

const initial: PermActionState = {};

export default function PermissionPanel({
  staffId,
  initialPerms,
  groups,
}: {
  staffId: string;
  initialPerms: Record<string, boolean>;
  groups: { group: string; keys: { key: string; label: string }[] }[];
}) {
  const [state, formAction, pending] = useActionState(updateStaffPermissionsAction, initial);
  const [checked, setChecked] = useState<Record<string, boolean>>(initialPerms);

  function toggle(key: string) {
    setChecked((p) => ({ ...p, [key]: !p[key] }));
  }
  function setAll(group: { key: string; label: string }[], value: boolean) {
    setChecked((p) => {
      const next = { ...p };
      for (const k of group) next[k.key] = value;
      return next;
    });
  }

  const totalActive = Object.values(checked).filter(Boolean).length;
  const totalKeys = groups.reduce((a, g) => a + g.keys.length, 0);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="staff_id" value={staffId} />

      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-bold text-navy-900">
            🔑 권한 ({totalActive}/{totalKeys})
          </h2>
          <p className="text-xs text-ink-500">체크된 항목만 직원이 사용 가능.</p>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          {groups.map((g) => (
            <fieldset key={g.group} className="rounded-xl border border-cream-300 bg-cream-100/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <legend className="text-xs font-semibold text-navy-900">{g.group}</legend>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAll(g.keys, true)}
                    className="rounded border border-cream-300 bg-white px-1.5 py-0.5 text-[10px] text-navy-700 hover:bg-cream-200"
                  >
                    전체 켜기
                  </button>
                  <button
                    type="button"
                    onClick={() => setAll(g.keys, false)}
                    className="rounded border border-cream-300 bg-white px-1.5 py-0.5 text-[10px] text-navy-700 hover:bg-cream-200"
                  >
                    전체 끄기
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {g.keys.map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      checked[key]
                        ? "border-gold-500 bg-gold-100"
                        : "border-cream-300 bg-white hover:bg-cream-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={`perm:${key}`}
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                      className="size-4 accent-gold-600"
                    />
                    <span className={checked[key] ? "font-semibold text-navy-900" : "text-navy-700"}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-md">
        <div className="text-xs">
          {state.error && (
            <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">{state.error}</span>
          )}
          {state.ok && !pending && (
            <span className="rounded-lg bg-success/10 px-2.5 py-1 text-success">✓ 저장됨</span>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "💾 권한 저장"}
        </Button>
      </div>
    </form>
  );
}
