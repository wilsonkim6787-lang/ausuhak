"use client";
import { useActionState, useState } from "react";
import { agreeContract, type AgreeState } from "@/lib/crm/contract-actions";

// The consent block: every statement must be ticked and the name typed before the button works.
export default function AgreeForm({ id, checks, signerLabel, defaultName }: { id: string; checks: string[]; signerLabel: string; defaultName: string }) {
  const [state, act, pending] = useActionState<AgreeState, FormData>(agreeContract, undefined);
  const [ticked, setTicked] = useState<boolean[]>(() => checks.map(() => false));
  const [name, setName] = useState(defaultName);
  const ready = ticked.every(Boolean) && name.trim().length > 0;
  return (
    <form action={act} className="ct-card">
      <input type="hidden" name="id" value={id} />
      <p className="ct-step">5. 확인과 동의</p>
      <h2>아래 내용을 확인했습니다</h2>
      {checks.map((c, i) => (
        <label key={c} className="ct-check">
          <input
            type="checkbox"
            name="check"
            value={i}
            checked={ticked[i]}
            onChange={(e) => setTicked((t) => t.map((v, j) => (j === i ? e.target.checked : v)))}
          />
          <span>{c}</span>
        </label>
      ))}
      <label className="ct-field">
        <span>동의하는 분 성함 ({signerLabel})</span>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" required />
      </label>
      <button type="submit" className="ct-btn" disabled={!ready || pending}>
        {pending ? "저장하는 중…" : "위 내용에 동의하고 계약합니다"}
      </button>
      {state?.error ? (
        <p className="ct-err" role="alert">
          {state.error}
        </p>
      ) : (
        <p className="ct-note" style={{ textAlign: "center" }}>확인 항목을 모두 체크하고 성함을 입력하시면 동의할 수 있습니다.</p>
      )}
    </form>
  );
}
