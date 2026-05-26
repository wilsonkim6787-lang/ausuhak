import Link from "next/link";
import { useTranslations } from "next-intl";
import { GraduationCap, Briefcase, Wrench, CalendarDays, Plane } from "lucide-react";

// PART F-2 / PART E-16 site_settings 동적 로드 (Phase 1.7에서 DB 연결)
// PART N-11: 자매학교 EC 어학원·화상영어 = 푸터 로고만 (카드/FAQ X)
// PART 0-1: Wilson 개인 카톡 ID 노출 X / 채널 URL만
export default function Footer() {
  const t = useTranslations("Footer");
  const kakaoUrl = "https://pf.kakao.com/_GadTX";

  return (
    <footer className="mt-auto bg-navy-900 text-cream-100">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          {/* Column 1: 브랜드 */}
          <div>
            <p className="font-display text-2xl font-bold tracking-wide text-cream-100">
              ausuhak.com (호주유학)
            </p>
            <p className="mt-3 text-sm leading-relaxed text-cream-200">
              {t("tagline")}
            </p>

            {/* QEAC 배지 placeholder */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cream-300/20 bg-white/5 px-3 py-2">
              <span className="size-2 rounded-full bg-gold-500" />
              <span className="text-[11px] font-bold tracking-wider text-gold-500">
                QEAC E240 · 호주 정부 인증
              </span>
            </div>
          </div>

          {/* Column 2: 연락 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("contactEyebrow")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-kakao-source="footer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FEE500] px-4 py-2 text-sm font-semibold text-[#3C1E1E] transition hover:scale-[1.02]"
                >
                  <span aria-hidden>{"\u{1F4AC}"}</span>
                  카카오 채널로 1:1 상담
                </a>
              </li>
              <li className="whitespace-pre-line text-cream-200">
                <span aria-hidden>{"\u{23F0}"}</span> {t("hoursValue")}
              </li>
            </ul>
          </div>

          {/* Column 3: Wilson 자매 서비스 (페이지 최하단에만 / 브랜드명 직접 노출 X) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("sisterEyebrow")}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cream-200">
              {t("sisterBody")}
            </p>
          </div>
        </div>

        {/* 비자 신청 대행 */}
        <div className="mt-12 border-t border-cream-100/15 pt-10">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
            비자 신청 대행
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                {
                  Icon: GraduationCap,
                  name: "학생비자",
                  code: "500",
                  desc: "호주 정규 과정(대학·VET·ELICOS 등)에 등록한 유학생을 위한 비자입니다. 입학 허가(CoE)를 받은 뒤 신청하며, 과정 길이에 따라 최대 5년까지 체류할 수 있습니다. 수업 기간 중에는 2주당 48시간까지, 방학 중에는 제한 없이 일할 수 있습니다. (과정 시작 전에는 근무 불가)",
                },
                {
                  Icon: Briefcase,
                  name: "졸업생 임시비자",
                  code: "485",
                  desc: "호주에서 과정을 마친 졸업생이 현지에 남아 취업·경력을 쌓을 수 있는 비자입니다. 직업·전문대 졸업자(약 18개월)와 학위 졸업자(2~3년) 스트림으로 나뉘며, 졸업 후 6개월 이내에 신청해야 합니다. 전공이 2년 학업요건을 충족해야 하고, 지방 지역 수학 시 체류 기간이 연장될 수 있습니다.",
                },
                {
                  Icon: Wrench,
                  name: "연수비자",
                  code: "407",
                  desc: "호주 승인 스폰서 아래에서 직무 관련 훈련을 받기 위한 비자입니다. 통상 최대 2년까지 체류 가능하며, 근무는 훈련 과정과 관련된 범위로 제한됩니다. 특히 간호사·약사 등이 호주 등록(AHPRA)을 위해 감독 실무가 필요한 경우 활용되는 경로입니다.",
                },
                {
                  Icon: CalendarDays,
                  name: "단기 전문활동",
                  code: "408",
                  desc: "특정 단기 활동·행사·전문 업무를 위한 비자입니다. 엔터테인먼트, 연구 프로젝트 참여, 고급 스포츠, 종교 활동, 문화 교류 프로그램 등 정해진 활동 유형에 한해 발급됩니다. 충분한 재정·건강보험과 일시 체류 의도가 요구됩니다.",
                },
                {
                  Icon: Plane,
                  name: "방문비자",
                  code: "600",
                  desc: "관광·가족 방문·단기 비즈니스 목적으로 호주에 머무를 때 사용하는 비자입니다. 취업은 허용되지 않으며, 최대 12개월까지 유효합니다. 학생 가족의 방문이나 입학 전 사전 답사 등에 활용됩니다.",
                },
              ] as const
            ).map((v) => (
              <details
                key={v.code}
                className="group rounded-xl border border-cream-100/10 bg-white/5 transition-colors hover:border-gold-500/40"
              >
                <summary className="flex cursor-pointer items-center gap-3 px-4 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/15">
                    <v.Icon size={18} className="text-gold-500" />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-cream-100">
                    {v.name}{" "}
                    <span className="font-normal text-cream-200/50">{v.code}</span>
                  </span>
                  <span className="text-cream-200/50 transition-transform duration-200 group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <div className="px-4 pb-5 pl-16">
                  <p className="text-[13px] leading-relaxed text-cream-200/80">
                    {v.desc}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-gold-500">
                    최신 조건은 카톡 상담에서 안내드립니다
                  </p>
                </div>
              </details>
            ))}
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-cream-200/50">
            비자 신청 대행 업무만 진행하며, 발급 여부는 호주 이민성(Department of Home Affairs)의 결정에 따릅니다.
          </p>
        </div>

        {/* 하단 라인 */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream-100/15 pt-6 text-xs text-cream-200 sm:flex-row sm:items-center">
          <p>© 2026 ausuhak.com</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold-500">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-gold-500">
              {t("terms")}
            </Link>
            <Link href="/en" className="hover:text-gold-500">
              {t("languageToggle")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
