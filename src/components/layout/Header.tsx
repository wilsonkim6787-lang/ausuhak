"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function Header() {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);

  const menuItems = [
    { key: "diagnose", label: t("menuDiagnose"), href: "/diagnose" },
    { key: "story", label: t("menuStory"), href: "/#story" },
    { key: "medical", label: t("menuMedical"), href: "/medical.html" },
    { key: "faq", label: t("menuFaq"), href: "/faq" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/92 backdrop-blur-md">
        <nav className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 sm:text-[22px]">
              ausuhak
              <span className="italic text-gold-600">.com</span>
            </span>
            <span className="hidden text-[11px] font-medium text-ink-500 sm:inline">
              {t("subBrand")}
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-5 sm:flex">
            {menuItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm font-medium text-navy-700 transition hover:text-gold-600"
              >
                {item.label}
              </a>
            ))}

            {/* 로그인 / 회원가입 (구분선으로 분리) */}
            <div className="flex items-center gap-3 border-l border-cream-300 pl-5">
              <Link
                href="/login"
                className="text-sm font-medium text-navy-700 transition hover:text-gold-600"
              >
                {t("menuLogin")}
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-navy-700 px-4 py-1.5 text-sm font-semibold text-navy-700 transition hover:border-gold-600 hover:bg-gold-600 hover:text-white"
              >
                {t("menuSignup")}
              </Link>
            </div>

            {/* 카톡 = 노란 카카오 색 (가시성 명확) */}
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="header_desktop"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE500] px-4 py-2 text-sm font-bold text-[#3C1E1E] transition hover:scale-[1.02]"
            >
              <span aria-hidden>{"\u{1F4AC}"}</span>
              {t("ctaKakao")}
            </a>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="header_mobile"
              aria-label="카톡 상담"
              className="rounded-full bg-[#FEE500] px-3 py-2 text-sm font-bold text-[#3C1E1E]"
            >
              <span aria-hidden>{"\u{1F4AC}"}</span>
            </a>
            <button
              type="button"
              aria-label="메뉴 열기"
              onClick={() => setOpen(true)}
              className="text-navy-900"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy-900 p-6 sm:hidden">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="self-end text-gold-500"
          >
            <X className="size-8" />
          </button>
          <nav className="mt-6 flex flex-1 flex-col gap-2">
            {menuItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-5 text-[22px] font-medium text-cream-100"
              >
                {item.label}
              </a>
            ))}

            {/* 모바일 로그인 / 회원가입 */}
            <div className="mt-2 flex gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-cream-100/40 py-3 text-center text-sm font-semibold text-cream-100"
              >
                {t("menuLogin")}
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-gold-600 py-3 text-center text-sm font-bold text-white"
              >
                {t("menuSignup")}
              </Link>
            </div>

            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              data-kakao-source="header_mobile_menu"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#FEE500] px-6 py-4 text-center text-base font-bold text-[#3C1E1E]"
            >
              <span aria-hidden>{"\u{1F4AC}"}</span>
              {t("ctaKakao")}
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
