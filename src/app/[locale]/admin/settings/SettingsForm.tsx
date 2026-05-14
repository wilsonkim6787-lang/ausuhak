"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { saveSettingsAction, type SettingsState } from "./actions";

export type SettingRow = {
  key: string;
  value: string | null;
  value_en: string | null;
  category: string | null;
  is_public: boolean | null;
  updated_at: string | null;
};

export type BranchRow = {
  slug: string;
  sort_order: number;
  name: string | null;
  name_en: string | null;
  address: string | null;
  address_en: string | null;
  phone: string | null;
  email: string | null;
  business_hours: string | null;
  business_hours_en: string | null;
};

const FIELDS: Record<
  string,
  { label: string; placeholder?: string; type?: "text" | "url" | "email" | "number"; hasEn: boolean }
> = {
  company_name:      { label: "회사명",          hasEn: true },
  business_number:   { label: "사업자등록번호",   hasEn: true,  placeholder: "예: 123-45-67890" },
  representative:    { label: "대표자",          hasEn: true },
  address:           { label: "주소",            hasEn: true },
  phone:             { label: "전화",            hasEn: true,  placeholder: "예: 02-1234-5678" },
  email:             { label: "이메일",          hasEn: true,  type: "email" },
  email_partnership: { label: "업무 이메일 (영문 전용)", hasEn: true, type: "email" },
  kakao_channel_url: { label: "카카오 채널 URL", hasEn: false, type: "url" },
  business_hours:    { label: "본사 영업 시간",   hasEn: true },
  holidays:          { label: "휴무일",          hasEn: true },
  price_pro:         { label: "PRO 가격 (원)",    hasEn: false, type: "number" },
  price_medical:     { label: "의대 가격 (원)",   hasEn: false, type: "number" },
};

const CATEGORY_TITLES: Record<string, string> = {
  company:  "🏢 회사 정보",
  contact:  "📞 본사 연락처",
  kakao:    "💬 카카오",
  business: "🕘 본사 영업 시간",
  pricing:  "💰 가격 (사이트 공개)",
  legal:    "📄 법적",
};

const CATEGORY_ORDER = ["company", "contact", "kakao", "business", "pricing", "legal"];

const initial: SettingsState = {};

export default function SettingsForm({
  rows,
  branches,
}: {
  rows: SettingRow[];
  branches: BranchRow[];
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initial);

  const grouped = new Map<string, SettingRow[]>();
  rows.forEach((r) => {
    const cat = r.category ?? "other";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(r);
  });

  const orderedCats = CATEGORY_ORDER.filter((c) => grouped.has(c)).concat(
    Array.from(grouped.keys()).filter((c) => !CATEGORY_ORDER.includes(c)),
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {orderedCats.map((cat) => {
        const items = grouped.get(cat)!;
        return (
          <section
            key={cat}
            className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-lg font-bold text-navy-900">
              {CATEGORY_TITLES[cat] ?? cat}
            </h2>

            <div className="mt-5 flex flex-col gap-5">
              {items.map((row) => {
                const meta = FIELDS[row.key] ?? { label: row.key, hasEn: true };
                const inputType = meta.type ?? "text";
                return (
                  <div key={row.key} className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-navy-700">
                        {meta.label}
                        <span className="ml-1 text-[10px] font-normal text-ink-300">(한)</span>
                      </span>
                      <input
                        type={inputType}
                        name={`ko:${row.key}`}
                        defaultValue={row.value ?? ""}
                        placeholder={meta.placeholder}
                        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
                      />
                    </label>

                    {meta.hasEn ? (
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-navy-700">
                          {meta.label}
                          <span className="ml-1 text-[10px] font-normal text-ink-300">(영문)</span>
                        </span>
                        <input
                          type={inputType}
                          name={`en:${row.key}`}
                          defaultValue={row.value_en ?? ""}
                          placeholder={meta.placeholder}
                          className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
                        />
                      </label>
                    ) : (
                      <div className="hidden sm:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* 🏬 지사 정보 (최대 3개) */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-navy-900">
          🏬 지사 정보 (최대 3개)
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          비어 있는 지사는 푸터/Contact에 표시되지 않습니다. 지사명(한) 비우면 비활성.
        </p>

        <div className="mt-5 flex flex-col gap-6">
          {branches.map((b, idx) => (
            <fieldset
              key={b.slug}
              className="rounded-xl border border-cream-300 bg-cream-100/50 p-5"
            >
              <legend className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-gold-500">
                지사 {idx + 1}
              </legend>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <BranchInput
                  slug={b.slug}
                  field="name"
                  label="지사명 (한)"
                  defaultValue={b.name}
                  placeholder="예: 시드니 지사"
                />
                <BranchInput
                  slug={b.slug}
                  field="name_en"
                  label="지사명 (영문)"
                  defaultValue={b.name_en}
                  placeholder="e.g. Sydney Branch"
                />
                <BranchInput
                  slug={b.slug}
                  field="address"
                  label="주소 (한)"
                  defaultValue={b.address}
                />
                <BranchInput
                  slug={b.slug}
                  field="address_en"
                  label="주소 (영문)"
                  defaultValue={b.address_en}
                />
                <BranchInput
                  slug={b.slug}
                  field="phone"
                  label="전화"
                  defaultValue={b.phone}
                  placeholder="예: +61 2 1234 5678"
                />
                <BranchInput
                  slug={b.slug}
                  field="email"
                  label="이메일"
                  type="email"
                  defaultValue={b.email}
                />
                <BranchInput
                  slug={b.slug}
                  field="business_hours"
                  label="영업 시간 (한)"
                  defaultValue={b.business_hours}
                  placeholder="예: 평일 09:00 ~ 17:00 (AEST)"
                />
                <BranchInput
                  slug={b.slug}
                  field="business_hours_en"
                  label="영업 시간 (영문)"
                  defaultValue={b.business_hours_en}
                  placeholder="e.g. Mon-Fri 9-5 (AEST)"
                />
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-md">
        <div className="text-xs">
          {state.error && (
            <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">
              {state.error}
            </span>
          )}
          {state.ok && !pending && (
            <span className="rounded-lg bg-success/10 px-2.5 py-1 text-success">
              ✓ 저장됨 (사이트 즉시 반영)
            </span>
          )}
          {!state.error && !state.ok && (
            <span className="text-ink-500">
              빈 값으로 저장하면 해당 항목이 사이트에서 빈 칸으로 표시됩니다.
            </span>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "💾 전체 저장"}
        </Button>
      </div>
    </form>
  );
}

function BranchInput({
  slug,
  field,
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  slug: string;
  field: string;
  label: string;
  defaultValue: string | null;
  placeholder?: string;
  type?: "text" | "email" | "url";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <input
        type={type}
        name={`branch:${slug}:${field}`}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      />
    </label>
  );
}
