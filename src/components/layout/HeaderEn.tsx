"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// PART P: 영문 사이트 전용 헤더.
// 한글 사이트 Header.tsx와 분리 (메뉴 구성·CTA 다름).
// - 로고 + 언어 토글 (KO) + Brochure CTA + Contact CTA
export default function HeaderEn() {
  const [open, setOpen] = useState(false);
  const partnershipEmail = "mailto:partnership@ausuhak.com";

  const menuItems = [
    { label: "About Wilson", href: "#about-wilson" },
    { label: "Korean Market", href: "#market" },
    { label: "Partnership",   href: "#partnership" },
    { label: "Brochure",      href: "#brochure" },
    { label: "Contact",       href: "#contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/92 backdrop-blur-md">
        <nav className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <Link href="/en" className="flex items-baseline gap-2.5">
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 sm:text-[22px]">
              ausuhak
              <span className="italic text-gold-600">.com</span>
            </span>
            <span className="hidden text-[11px] font-medium text-ink-500 sm:inline">
              (For Partners)
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-7 sm:flex">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-navy-700 transition hover:text-gold-600"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/"
              className="text-xs font-medium text-ink-500 transition hover:text-gold-600"
            >
              한국어
            </Link>
            <a
              href={partnershipEmail}
              className="rounded-full bg-gold-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              📧 Contact Wilson
            </a>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <a
              href={partnershipEmail}
              className="rounded-full bg-gold-600 px-3.5 py-2 text-xs font-semibold text-white"
            >
              📧
            </a>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="text-navy-900"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy-900 p-6 sm:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="self-end text-gold-500"
          >
            <X className="size-8" />
          </button>
          <nav className="mt-6 flex flex-1 flex-col gap-2">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-5 text-[22px] font-medium text-cream-100"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="border-b border-white/10 py-5 text-[18px] font-medium text-cream-200"
            >
              한국어 사이트로 ↗
            </Link>
            <a
              href={partnershipEmail}
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-gold-600 px-6 py-4 text-center text-base font-semibold text-white"
            >
              📧 Contact Wilson
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
