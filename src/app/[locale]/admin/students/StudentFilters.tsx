"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Initial = {
  q?: string;
  stage?: string;
  lead_status?: string;
  is_medical?: string;
  filter?: string;
};

const LEAD_STATUSES = [
  ["all", "전체"],
  ["lead", "Lead"],
  ["contacted", "Contacted"],
  ["pro", "PRO"],
  ["contract", "Contract"],
  ["visa", "Visa"],
  ["onsite", "Onsite"],
  ["pr", "PR"],
];

export default function StudentFilters({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [stage, setStage] = useState(initial.stage ?? "all");
  const [leadStatus, setLeadStatus] = useState(initial.lead_status ?? "all");
  const [isMedical, setIsMedical] = useState(initial.is_medical ?? "all");

  function apply(next: Partial<Initial>) {
    const params = new URLSearchParams();
    const merged = {
      q: next.q ?? q,
      stage: next.stage ?? stage,
      lead_status: next.lead_status ?? leadStatus,
      is_medical: next.is_medical ?? isMedical,
    };
    if (merged.q) params.set("q", merged.q);
    if (merged.stage && merged.stage !== "all") params.set("stage", merged.stage);
    if (merged.lead_status && merged.lead_status !== "all")
      params.set("lead_status", merged.lead_status);
    if (merged.is_medical && merged.is_medical !== "all")
      params.set("is_medical", merged.is_medical);
    // 대시보드 단축 필터는 초기화
    router.push(`/admin/students${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({});
        }}
        className="flex flex-col gap-3"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 이름·카카오ID·전화·이메일 검색"
          className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              apply({ stage: e.target.value });
            }}
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-xs text-navy-900 outline-none focus:border-gold-500"
          >
            <option value="all">Stage 전체</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Stage {n}
              </option>
            ))}
          </select>

          <select
            value={leadStatus}
            onChange={(e) => {
              setLeadStatus(e.target.value);
              apply({ lead_status: e.target.value });
            }}
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-xs text-navy-900 outline-none focus:border-gold-500"
          >
            {LEAD_STATUSES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={isMedical}
            onChange={(e) => {
              setIsMedical(e.target.value);
              apply({ is_medical: e.target.value });
            }}
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-xs text-navy-900 outline-none focus:border-gold-500"
          >
            <option value="all">의대 전체</option>
            <option value="true">의대만</option>
            <option value="false">일반만</option>
          </select>

          <Button type="submit" size="sm">검색</Button>

          {(q || stage !== "all" || leadStatus !== "all" || isMedical !== "all" || initial.filter) && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setQ("");
                setStage("all");
                setLeadStatus("all");
                setIsMedical("all");
                router.push("/admin/students");
              }}
            >
              초기화
            </Button>
          )}
        </div>

        {initial.filter && (
          <p className="text-xs text-gold-600">
            대시보드 단축 필터 적용 중: <code className="rounded bg-cream-200 px-1.5">{initial.filter}</code>
          </p>
        )}
      </form>
    </div>
  );
}
