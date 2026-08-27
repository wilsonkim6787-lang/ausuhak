"use client";

// 서류 1종 업로드 버튼 — 파일 고르면 즉시 제출.

import { useActionState, useRef } from "react";
import { uploadMyDocAction, type UploadDocState } from "./actions";

const ACCEPT =
  "application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.docx";

const initial: UploadDocState = {};

export default function UploadRow({
  docType,
  hasFile,
}: {
  docType: string;
  hasFile: boolean;
}) {
  const [state, formAction, pending] = useActionState(uploadMyDocAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="doc_type" value={docType} />
      <label
        className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
          pending
            ? "bg-cream-200 text-ink-500"
            : hasFile
              ? "border border-cream-300 bg-white text-navy-700 hover:border-gold-600 hover:text-gold-600"
              : "bg-gold-600 text-white hover:bg-gold-500"
        }`}
      >
        {pending ? "업로드 중…" : hasFile ? "다시 올리기" : "파일 올리기"}
        <input
          type="file"
          name="file"
          accept={ACCEPT}
          disabled={pending}
          className="hidden"
          onChange={(e) => {
            if (e.currentTarget.files?.length) formRef.current?.requestSubmit();
          }}
        />
      </label>
      {state.error && state.docType === docType && (
        <p className="max-w-[220px] text-right text-[10px] leading-snug text-error">
          ⚠️ {state.error}
        </p>
      )}
    </form>
  );
}
