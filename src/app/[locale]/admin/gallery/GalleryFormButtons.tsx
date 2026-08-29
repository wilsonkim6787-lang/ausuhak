"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "저장 중…" : "저장"}
    </Button>
  );
}

export function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm("이 사진을 삭제할까요? 이미지 파일과 데이터가 영구 삭제됩니다."))
          e.preventDefault();
      }}
      className="text-xs font-semibold text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}
