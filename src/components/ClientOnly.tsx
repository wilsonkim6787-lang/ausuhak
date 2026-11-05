"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Renders children only in the browser (for interactive tools that read
// localStorage, timers or randomness while rendering).
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <>{children}</> : <div style={{ minHeight: "100vh" }} aria-busy="true" />;
}
