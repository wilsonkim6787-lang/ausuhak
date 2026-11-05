"use client";
import { useSyncExternalStore } from "react";

type Tab = "home" | "docs" | "msg";
const TABS: [Tab, string][] = [
  ["home", "홈"],
  ["docs", "서류"],
  ["msg", "메시지"],
];

// The current tab lives in the URL hash (#docs, #msg) so it survives reloads.
const EVT = "mp-tab";
function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener(EVT, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener(EVT, cb);
  };
}

// On phones the page is split into three tabs (bottom bar). On wider screens
// every pane shows and the bar is hidden by CSS.
export default function Tabs({ children }: { children: React.ReactNode }) {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  const h = hash.slice(1);
  const tab: Tab = h === "docs" || h === "msg" ? h : "home";

  function pick(t: Tab) {
    try {
      window.history.replaceState(null, "", t === "home" ? window.location.pathname + window.location.search : "#" + t);
    } catch {}
    window.dispatchEvent(new Event(EVT));
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <div className="mp-panes" data-tab={tab}>
        {children}
      </div>
      <nav className="mp-tabbar" aria-label="마이페이지 메뉴">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => pick(k)}>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
