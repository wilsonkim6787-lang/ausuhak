"use client";
import { useRef, useState, useTransition } from "react";
import { submitDocumentAction } from "@/app/mypage/actions";
import { browserClient } from "@/lib/supabase/client";
import { UPLOAD_ACCEPT, UPLOAD_TYPES, checkUpload, extOf } from "@/lib/crm/upload";

// Uploads straight from the browser to crm-docs/<family_id>/<student_id>/<doc_id>/...
// (storage RLS allows the family's own folder), then records it with a server action.
export default function UploadButton({ docId, familyId, studentId, redo }: { docId: string; familyId: string; studentId: string; redo?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ err?: string; ok?: string }>({});

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const bad = checkUpload(file.name, file.size);
    if (bad) return setMsg({ err: bad });
    const sb = browserClient();
    if (!sb) return setMsg({ err: "지금은 올릴 수 없습니다. 잠시 후 다시 해 주세요." });

    setBusy(true);
    setMsg({});
    const ext = extOf(file.name);
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${familyId}/${studentId}/${docId}/${Date.now()}-${rand}.${ext}`;
    const up = await sb.storage.from("crm-docs").upload(path, file, {
      contentType: file.type || UPLOAD_TYPES[ext],
      upsert: false,
    });
    if (up.error) {
      setBusy(false);
      return setMsg({ err: "파일이 올라가지 않았습니다. 인터넷 연결을 확인하고 다시 올려 주세요." });
    }
    start(async () => {
      const r = await submitDocumentAction({ docId, path, fileName: file.name, size: file.size });
      setBusy(false);
      setMsg(r.error ? { err: r.error } : { ok: "받았습니다. 제가 확인하겠습니다." });
    });
  }

  const working = busy || pending;
  return (
    <>
      <input ref={input} type="file" accept={UPLOAD_ACCEPT} onChange={onFile} hidden />
      <button type="button" className="mp-btn" disabled={working} onClick={() => input.current?.click()}>
        {working ? "올리는 중…" : redo ? "다시 올리기" : "파일 올리기"}
      </button>
      {msg.err ? <span className="mp-upload-msg is-err" role="alert">{msg.err}</span> : null}
      {msg.ok ? <span className="mp-upload-msg is-ok" role="status">{msg.ok}</span> : null}
    </>
  );
}
