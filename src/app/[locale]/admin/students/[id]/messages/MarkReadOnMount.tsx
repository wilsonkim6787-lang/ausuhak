"use client";

import { useEffect, useRef } from "react";
import { markStudentMessagesReadAction } from "./actions";

// 메시지 탭 열람 시 1회 실행 — 읽음 처리 후 revalidate 로 안읽음 뱃지 동기화.
export default function MarkReadOnMount({ studentId }: { studentId: string }) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void markStudentMessagesReadAction(studentId);
  }, [studentId]);
  return null;
}
