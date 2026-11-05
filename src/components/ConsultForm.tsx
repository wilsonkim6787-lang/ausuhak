"use client";
import { useState } from "react";
import type { FormEvent, FormHTMLAttributes } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track";

type Props = FormHTMLAttributes<HTMLFormElement> & { source: string };

function labelOf(el: HTMLElement): string {
  const label = el.closest("label");
  if (!label) return el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.getAttribute("name") || "항목";
  let text = "";
  label.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) text += n.textContent;
    else if (n instanceof HTMLElement && !["INPUT", "SELECT", "TEXTAREA"].includes(n.tagName)) text += n.textContent;
  });
  return text.replace(/\*/g, "").replace(/\s+/g, " ").trim() || "항목";
}

// Wraps the consultation forms from the designs: collects every field by its
// label text and posts it to /api/consult.
export default function ConsultForm({ source, children, style, ...rest }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const formEl = e.currentTarget;
    const fields: Record<string, string> = {};
    let agreed = false;
    for (const el of Array.from(e.currentTarget.elements) as HTMLInputElement[]) {
      if (!["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) || el.type === "submit" || el.type === "button") continue;
      if (el.type === "checkbox") {
        if (el.required) agreed = agreed || el.checked;
        else if (el.checked) fields[labelOf(el)] = "예";
        continue;
      }
      if (el.type === "radio") {
        if (el.checked) fields[labelOf(el)] = el.value;
        continue;
      }
      const v = (el.value || "").trim();
      if (v && v !== "선택해 주세요") fields[labelOf(el)] = v;
    }
    setState("sending");
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, page: window.location.pathname, fields, agreed }),
      });
      if (res.ok) track("form_submit", { label: source, section: (formEl.closest("section[id]") as HTMLElement | null)?.id || "" });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div style={{ ...style, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }} role="status">
        <strong style={{ fontSize: 22 }}>잘 받았습니다.</strong>
        <span>영업일 기준 24시간 안에 카카오톡이나 전화로 제가 직접 연락드리겠습니다.</span>
        <span>급한 내용은 카카오톡 채널로도 보내 주세요.</span>
        <a href={SITE.kakao} target="_blank" rel="noopener" style={{ fontWeight: 800 }}>카카오톡 채널 열기</a>
      </div>
    );
  }

  return (
    <form {...rest} style={style} onSubmit={onSubmit} aria-busy={state === "sending"}>
      {children}
      {state === "error" ? (
        <p role="alert" style={{ gridColumn: "1 / -1", margin: 0, color: "#9B2C3E", fontWeight: 700 }}>
          전송이 되지 않았습니다. 잠시 후 다시 보내 주시거나 카카오톡 채널({SITE.kakao})이나 전화({SITE.phone})로 연락 주세요.
        </p>
      ) : null}
    </form>
  );
}
