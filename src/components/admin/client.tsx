"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { browserClient } from "@/lib/supabase/client";
import { checkUpload, extOf, UPLOAD_ACCEPT } from "@/lib/crm/upload";

export type NavItem = { href: string; label: string; count?: number; alert?: boolean };

export function AdminNavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname() || "/admin";
  return (
    <div className="ad-links">
      {items.map((it) => {
        const on = it.href === "/admin" ? path === "/admin" : path === it.href || path.startsWith(it.href + "/");
        return (
          <Link key={it.href} href={it.href} className="ad-link" aria-current={on ? "page" : undefined}>
            {it.label}
            {it.count ? <span className={it.alert ? "ad-pill" : "ad-count"}>{it.count}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function Submit({ children, className = "ad-btn sm", confirm }: { children: React.ReactNode; className?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

// A checkbox that submits its form when ticked (dashboard to-dos).
export function AutoCheck({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <input
      type="checkbox"
      aria-label={label}
      disabled={pending}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    />
  );
}

export type ActionResult = { error?: string; ok?: string; code?: string; studentId?: string } | undefined;

export function ActionForm({
  action,
  children,
  className = "ad-form",
  resetOnOk = false,
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  resetOnOk?: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, act] = useActionState(async (prev: ActionResult, fd: FormData) => {
    const r = await action(prev, fd);
    if (resetOnOk && r?.ok) ref.current?.reset();
    return r;
  }, undefined);
  return (
    <form ref={ref} action={act} className={className}>
      {children}
      {state?.error ? <p className="ad-msg-err full" role="alert">{state.error}</p> : null}
      {state?.ok ? <p className="ad-msg-ok full" role="status">{state.ok}</p> : null}
    </form>
  );
}

export function AddStudentResult({
  action,
  children,
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, act] = useActionState(async (prev: ActionResult, fd: FormData) => {
    const r = await action(prev, fd);
    if (r?.code) ref.current?.reset();
    return r;
  }, undefined);
  return (
    <>
      <form ref={ref} action={act} className="ad-form">
        {children}
        {state?.error ? <p className="ad-msg-err full" role="alert">{state.error}</p> : null}
      </form>
      {state?.code ? (
        <div className="ad-code" role="status" style={{ borderStyle: "solid", borderColor: "#1F6B5C", background: "#F6FBF9" }}>
          <span>{state.ok} 아래 연결 코드를 학생과 부모님께 보내 주세요. 가입할 때 넣으면 이 학생과 연결됩니다.</span>
          <b>{state.code}</b>
          {state.studentId ? <Link href={`/admin/students/${state.studentId}`}>학생 화면 열기</Link> : null}
        </div>
      ) : null}
    </>
  );
}

// Wilson uploads a file for the family (direction to_family). The file goes
// straight to the private bucket with Wilson's session, then the server action
// checks the path and records it.
export function UploadToFamily({
  familyId,
  studentId,
  cases,
  record,
}: {
  familyId: string;
  studentId: string;
  cases: { id: string; title: string }[];
  record: (fd: FormData) => Promise<ActionResult>;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ActionResult>(undefined);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file");
    const label = String(fd.get("label") || "").trim();
    if (!(file instanceof File) || !file.name) return setMsg({ error: "파일을 골라 주세요." });
    if (!label) return setMsg({ error: "서류 이름을 넣어 주세요." });
    const bad = checkUpload(file.name, file.size);
    if (bad) return setMsg({ error: bad });
    const sb = browserClient();
    if (!sb) return setMsg({ error: "저장소 연결이 설정되지 않았습니다." });
    setBusy(true);
    setMsg(undefined);
    const base = file.name.replace(/\.[^.]+$/, "").replace(/[^\w.\-가-힣]+/g, "_").slice(0, 80) || "file";
    const path = `${familyId}/${studentId}/${Date.now()}-${base}.${extOf(file.name)}`;
    const up = await sb.storage.from("crm-docs").upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (up.error) {
      setBusy(false);
      return setMsg({ error: "파일을 올리지 못했습니다. 다시 시도해 주세요." });
    }
    const out = new FormData();
    out.set("student_id", studentId);
    out.set("path", path);
    out.set("file_name", file.name);
    out.set("label", label);
    out.set("case_id", String(fd.get("case_id") || ""));
    const r = await record(out);
    setBusy(false);
    setMsg(r);
    if (r?.ok) form.reset();
  }
  return (
    <form ref={ref} onSubmit={onSubmit} className="ad-form">
      <label className="full">서류 이름<input type="text" name="label" placeholder="예: 입학허가서(CoE)" maxLength={120} required /></label>
      {cases.length ? (
        <label className="full">진행 건
          <select name="case_id" defaultValue="">
            <option value="">연결 안 함</option>
            {cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
      ) : null}
      <label className="full">파일<input type="file" name="file" accept={UPLOAD_ACCEPT} required /></label>
      <button type="submit" className="ad-btn sm" disabled={busy}>{busy ? "올리는 중…" : "올리기"}</button>
      {msg?.error ? <p className="ad-msg-err full" role="alert">{msg.error}</p> : null}
      {msg?.ok ? <p className="ad-msg-ok full" role="status">{msg.ok}</p> : null}
    </form>
  );
}
