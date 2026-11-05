"use client";
import { useState } from "react";

export default function CopyCode({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {}
  }
  return (
    <button type="button" className="mp-code-copy" onClick={copy}>
      {done ? "복사했습니다" : "코드 복사"}
    </button>
  );
}
