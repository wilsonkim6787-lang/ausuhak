"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

// Counts clicks on buttons and contact links (consult, Kakao, phone) and the first touch on a form,
// so the admin "홈페이지 반응" page shows which part of a page brings consultations.
function sectionOf(el: Element) {
  if (el.closest(".bar")) return "mobile-bar";
  if (el.closest("header")) return "nav";
  const s = el.closest("section[id], footer");
  return s ? (s.id || s.tagName.toLowerCase()) : "";
}

export default function TrackClicks() {
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    const started = new WeakSet<Element>();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest("a, button");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      const isCta = el.classList.contains("btn") || href === "#ask" || href.includes("pf.kakao.com") || href.startsWith("tel:") || (el.tagName === "BUTTON" && (el as HTMLButtonElement).type === "submit");
      if (!isCta) return;
      track("click", { label: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60), href, section: sectionOf(el) });
    };
    const onFocus = (e: FocusEvent) => {
      const form = (e.target as Element | null)?.closest?.("form");
      if (!form || started.has(form)) return;
      if (!(e.target as Element).matches("input, select, textarea")) return;
      started.add(form);
      track("form_start", { section: sectionOf(form) });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("focusin", onFocus, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusin", onFocus, true);
    };
  }, []);
  return null;
}
