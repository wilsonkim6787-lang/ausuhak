"use client";
import { useOptimistic, startTransition } from "react";
import { cycleStep } from "@/lib/crm/admin-actions";
import { STEP_STATE } from "@/lib/crm/flows";

const NEXT: Record<string, string> = { todo: "doing", doing: "done", done: "todo", skip: "todo" };

// Step chip that changes state on screen immediately; the server action saves it.
export default function StepButton({
  id,
  label,
  state,
  color,
  due,
}: {
  id: string;
  label: string;
  state: string;
  color: string;
  due?: { text: string; late: boolean } | null;
}) {
  const [s, setS] = useOptimistic(state);
  const done = s === "done";
  const cur = s === "doing";
  const skip = s === "skip";
  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          setS(NEXT[s] ?? "todo");
          await cycleStep(fd);
        });
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="ad-step"
        title="눌러서 상태 바꾸기"
        style={{
          borderColor: cur ? "#E8B4BE" : "#E3E8EF",
          background: cur ? "#FFF7F8" : done ? "#FFFFFF" : "#F8FAFC",
          color: done || cur ? "#0F1B2D" : "#6B7588",
          textDecoration: skip ? "line-through" : undefined,
        }}
      >
        <span aria-hidden="true" className="ad-step-dot" style={{ borderColor: done ? color : cur ? "#9B2C3E" : "#C5CDD9", background: done ? color : "transparent" }} />
        <span className="ad-step-label">
          {label}
          {due && !done ? <small style={{ color: due.late ? "#9B2C3E" : undefined }}>마감 {due.text}</small> : null}
        </span>
        <span className="ad-step-state" style={{ color: done ? color : cur ? "#9B2C3E" : "#8A94A6" }}>{STEP_STATE[s]?.label ?? s}</span>
      </button>
    </form>
  );
}
