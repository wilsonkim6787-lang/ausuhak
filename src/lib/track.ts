// Fire-and-forget beacon to /api/track.
export function track(kind: "click" | "form_start" | "form_submit", data: { label?: string; href?: string; section?: string } = {}) {
  try {
    const payload = JSON.stringify({ kind, ...data, page: location.pathname });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([payload], { type: "text/plain" }));
    else fetch("/api/track", { method: "POST", body: payload, keepalive: true });
  } catch {}
}
