"use client";

import type { ReactNode } from "react";

// 삭제 등 되돌릴 수 없는 form 액션 제출 전 confirm() 확인.
// 취소하면 preventDefault 로 submit 을 막는다. (서버/클라이언트 컴포넌트 모두에서 사용 가능)
export default function ConfirmSubmitButton({
  message,
  className,
  children,
  title,
}: {
  message: string;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="submit"
      title={title}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
