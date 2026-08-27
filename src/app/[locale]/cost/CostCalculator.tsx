"use client";

// 유학 비용 간이 계산기 — 클라이언트 계산 전용 (DB 없음).
// 수치는 2026년 일반적 범위의 추정치. 정확한 견적은 상담으로 유도.

import { useMemo, useState } from "react";
import { track } from "@vercel/analytics";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";
const AUD_KRW = 900; // 참고 환율 (표기용)

const COURSES = [
  { key: "elicos", label: "어학연수", tuitionPerMonth: 1600 },
  { key: "vet", label: "TAFE·전문학교 (요리·IT·트레이드 등)", tuitionPerMonth: 1250 },
  { key: "uni", label: "대학교 (학사)", tuitionPerMonth: 3000 },
  { key: "master", label: "대학원 (석사)", tuitionPerMonth: 3300 },
] as const;

const CITIES = [
  { key: "sydney", label: "시드니", livingPerMonth: 2200 },
  { key: "melbourne", label: "멜버른", livingPerMonth: 2000 },
  { key: "brisbane", label: "브리즈번", livingPerMonth: 1800 },
  { key: "goldcoast", label: "골드코스트", livingPerMonth: 1700 },
  { key: "etc", label: "기타 (애들레이드·퍼스 등)", livingPerMonth: 1600 },
] as const;

const MONTHS = [3, 6, 12, 18, 24] as const;

const OSHC_PER_MONTH = 55; // 유학생 건강보험
const SETTLE_ONCE = 2000; // 초기 정착비 (보증금·초기 장보기 등, 1회)

const fmtAud = (n: number) => `A$${Math.round(n).toLocaleString()}`;
const fmtKrw = (n: number) => `약 ${Math.round((n * AUD_KRW) / 10000).toLocaleString()}만원`;

export default function CostCalculator() {
  const [course, setCourse] = useState<(typeof COURSES)[number]["key"]>("elicos");
  const [city, setCity] = useState<(typeof CITIES)[number]["key"]>("sydney");
  const [months, setMonths] = useState<number>(6);

  const r = useMemo(() => {
    const c = COURSES.find((x) => x.key === course)!;
    const ct = CITIES.find((x) => x.key === city)!;
    const tuition = c.tuitionPerMonth * months;
    const living = ct.livingPerMonth * months;
    const oshc = OSHC_PER_MONTH * months;
    const total = tuition + living + oshc + SETTLE_ONCE;
    return { tuition, living, oshc, total, perMonth: total / months };
  }, [course, city, months]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* 입력 */}
      <div className="flex flex-col gap-5 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-navy-900">과정</span>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value as typeof course)}
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm"
          >
            {COURSES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-navy-900">도시</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value as typeof city)}
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm"
          >
            {CITIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-navy-900">기간</span>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  months === m
                    ? "bg-navy-900 text-cream-100"
                    : "border border-cream-300 bg-white text-navy-700 hover:border-gold-600"
                }`}
              >
                {m}개월
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className="flex flex-col rounded-2xl border border-gold-600/40 bg-white p-6 shadow-md">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-600">예상 총비용</p>
        <p className="mt-2 font-display text-4xl font-bold text-navy-900">
          {fmtAud(r.total)}
        </p>
        <p className="mt-1 text-sm text-ink-500">
          {fmtKrw(r.total)} · 월 평균 {fmtAud(r.perMonth)} (1 AUD ≈ {AUD_KRW}원 기준)
        </p>

        <dl className="mt-5 flex flex-col gap-2 border-t border-cream-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-700">학비 ({months}개월)</dt>
            <dd className="font-semibold text-navy-900">{fmtAud(r.tuition)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-700">생활비 (숙소·식비·교통)</dt>
            <dd className="font-semibold text-navy-900">{fmtAud(r.living)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-700">유학생 건강보험 (OSHC)</dt>
            <dd className="font-semibold text-navy-900">{fmtAud(r.oshc)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-700">초기 정착비 (1회)</dt>
            <dd className="font-semibold text-navy-900">{fmtAud(SETTLE_ONCE)}</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-lg bg-cream-100 px-3 py-2.5 text-xs leading-relaxed text-ink-700">
          ⚠️ 학교·과정·환율에 따라 실제 비용은 달라집니다. 학생비자는 주 24시간(방학 무제한)
          아르바이트가 가능해 생활비 상당 부분을 현지에서 충당하는 경우가 많습니다.
          장학금·프로모션 반영한 정확한 견적은 무료 상담으로 확인하세요.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="cost_calculator"
            onClick={() => track("kakao_click", { source: "cost_calculator" })}
            className="flex-1 rounded-full bg-gold-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-gold-500"
          >
            💬 내 상황 맞춤 견적 받기
          </a>
          <a
            href="tel:010-9848-7789"
            className="flex-1 rounded-full border border-cream-300 bg-white px-4 py-3 text-center text-sm font-semibold text-navy-700 hover:bg-cream-100"
          >
            📞 010-9848-7789
          </a>
        </div>
      </div>
    </div>
  );
}
