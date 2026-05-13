// 진단 결과 URL 토큰 (base64url) — Phase 1은 stateless (DB X).
// Phase 2: students 테이블 + diagnose_uuid 컬럼으로 마이그레이션.

import type { DiagnoseInput } from "./types";

function b64urlEncode(s: string): string {
  // Node 20+ Buffer + URL-safe (RFC 4648)
  return Buffer.from(s, "utf-8").toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf-8");
}

export function encodeInput(input: DiagnoseInput): string {
  return b64urlEncode(JSON.stringify(input));
}

export function decodeInput(token: string): DiagnoseInput | null {
  try {
    const obj = JSON.parse(b64urlDecode(token));
    if (typeof obj !== "object" || obj === null) return null;
    if (typeof obj.age !== "number") return null;
    if (typeof obj.education !== "string") return null;
    return obj as DiagnoseInput;
  } catch {
    return null;
  }
}
