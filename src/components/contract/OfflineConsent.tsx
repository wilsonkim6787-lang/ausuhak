"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { checkUpload, extOf, UPLOAD_ACCEPT } from "@/lib/crm/upload";
import { recordOfflineConsent } from "@/lib/crm/contract-actions";
import type { ActionResult } from "@/components/admin/client";

// Consent that arrived by KakaoTalk or email: upload the proof (screenshot or mail file)
// to the family's private folder, then record who agreed and when.
export default function OfflineConsent({ id, familyId, studentId, signerName, today }: { id: string; familyId: string; studentId: string; signerName: string; today: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ActionResult>(undefined);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || !file.name) return setMsg({ error: "받은 답장의 캡처나 메일 파일을 골라 주세요." });
    const bad = checkUpload(file.name, file.size);
    if (bad) return setMsg({ error: bad });
    const sb = browserClient();
    if (!sb) return setMsg({ error: "저장소 연결이 설정되지 않았습니다." });
    setBusy(true);
    setMsg(undefined);
    const path = `${familyId}/${studentId}/contract-${id}-${Date.now()}.${extOf(file.name)}`;
    const up = await sb.storage.from("crm-docs").upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (up.error) {
      setBusy(false);
      return setMsg({ error: "파일을 올리지 못했습니다. 다시 시도해 주세요." });
    }
    const out = new FormData();
    out.set("id", id);
    out.set("path", path);
    for (const k of ["channel", "agreed_name", "agreed_date", "note"]) out.set(k, String(fd.get(k) ?? ""));
    const r = await recordOfflineConsent(out);
    setBusy(false);
    setMsg(r);
  }
  return (
    <form onSubmit={onSubmit} className="ad-form">
      <label>받은 곳
        <select name="channel" defaultValue="kakao">
          <option value="kakao">카카오톡</option>
          <option value="email">이메일</option>
        </select>
      </label>
      <label>동의한 분<input type="text" name="agreed_name" defaultValue={signerName} maxLength={40} required /></label>
      <label>동의한 날<input type="date" name="agreed_date" defaultValue={today} max={today} required /></label>
      <label className="full">받은 답장 (캡처 또는 메일 파일)<input type="file" name="file" accept={UPLOAD_ACCEPT} required /></label>
      <label className="full">메모<input type="text" name="note" maxLength={500} placeholder="예: 해외 체류 중이라 카카오톡으로 받음" /></label>
      <button type="submit" className="ad-btn sm" disabled={busy}>{busy ? "저장하는 중…" : "동의 기록 저장"}</button>
      {msg?.error ? <p className="ad-msg-err full" role="alert">{msg.error}</p> : null}
      {msg?.ok ? <p className="ad-msg-ok full" role="status">{msg.ok}</p> : null}
    </form>
  );
}
