"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

// PART O O-5-4: Sticky header / 80px desktop / 56px mobile
// PART N-3: 메뉴 4개 (진단·FAQ·의대·회사소개) + Gold CTA
export default function Header() {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  const kakaoUrl = "https://pf.kakao.com/_GadTX";

  const menuItems = [
    { key: "diagnose", label: t("menuDiagnose"), href: "/diagnose" },
    { key: "story", label: t("menuStory"), href: "#wilson-story" },
    { key: "medical", label: t("menuMedical"), href: "#medical" },
    { key: "faq", label: t("menuFaq"), href: "#faq" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/92 backdrop-blur-md">
        <nav className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-20 sm:px-6">
          {/* Logo */}
          <a href="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 sm:text-[22px]">
              ausuhak
              <span className="italic text-gold-600">.com</span>
            </span>
            <span className="hidden text-[11px] font-medium text-ink-500 sm:inline">
              {t("subBrand")}
            </span>
          </a>

          {/* Desktop menu */}
          <div className="hidden items-center gap-7 sm:flex">
            {menuItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-sm font-medium text-navy-700 transition hover:text-gold-600"
              >
                {item.label}
              </a>
            ))}
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-navy-900 px-5 py-2.5 text-[13px] font-semibold text-gold-500 transition hover:bg-gold-600 hover:text-navy-900"
            >
              {t("ctaKakao")}
            </a>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-navy-900 px-3.5 py-2 text-xs font-semibold text-gold-500"
            >
              💬
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
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-gold-600 px-6 py-4 text-center text-base font-semibold text-white"
            >
              {t("ctaKakao")}
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
