// PART P: 영문 사이트 (학교 파트너용 / Long Scroll 1페이지).
// 6 sections: Hero / About Wilson / Korean Market / Partnership / Brochure / Contact.
// 영어 단일 페이지라 i18n 키 X / 영문 텍스트 하드코딩.

import Link from "next/link";

const PARTNERSHIP_EMAIL = "partnership@ausuhak.com";
const KAKAO_CHANNEL = "https://pf.kakao.com/_GadTX";

export default function EnglishLanding() {
  return (
    <main className="flex-1">
      <HeroEn />
      <AboutWilsonEn />
      <KoreanMarketEn />
      <PartnershipEn />
      <BrochureEn />
      <ContactEn />
    </main>
  );
}

// ─────────────────────────────────────────────────
// Section 1: Hero
// ─────────────────────────────────────────────────
function HeroEn() {
  return (
    <section className="relative overflow-hidden border-b border-cream-300">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              For Australian Education Partners
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-navy-900 sm:text-5xl">
              Connecting Korean Students with
              <br className="hidden sm:block" /> Australian Education Excellence
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-700 sm:text-lg">
              19 years of Korean student consulting plus prior staff experience inside Australian
              schools. Wilson Kim brings inside-perspective recruitment for institutions seeking
              qualified, well-prepared Korean candidates.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="#brochure"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gold-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-gold-500"
              >
                📄 Download Partnership Brochure
              </a>
              <a
                href={`mailto:${PARTNERSHIP_EMAIL}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-navy-800 px-6 py-3.5 text-base font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-cream-100"
              >
                📧 Contact Wilson
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-500">
              <li className="flex items-baseline gap-1.5">
                <span className="font-semibold text-navy-700">950+</span> students placed
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="font-semibold text-navy-700">QEAC E240</span> certified
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="font-semibold text-navy-700">19 yrs</span> consulting + school staff experience
              </li>
            </ul>
          </div>

          <div className="hidden lg:col-span-2 lg:block">
            <div className="aspect-[3/4] w-full rounded-2xl border border-cream-300 bg-cream-200/60 shadow-md" />
            <p className="mt-2 text-center text-[11px] text-ink-300">
              (Hero image placeholder — Australian campus / Wilson photo)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// Section 2: About Wilson
// ─────────────────────────────────────────────────
function AboutWilsonEn() {
  const credentials = [
    "19 years of Korean student consulting (2007 ~ present)",
    "Australian school staff experience (institutional knowledge)",
    "QEAC E240 — Australian Government certified consultant",
    "950+ Korean students successfully placed",
    "Bilingual: Korean (primary) / English",
  ];

  return (
    <section id="about-wilson" className="border-b border-cream-300 bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">About Wilson</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Wilson Kim — Australia Study Consultant
        </h2>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-ink-700">
              With 19 years of experience in Australia study consulting and prior staff experience at
              Australian educational institutions, Wilson brings a unique inside-perspective to
              international student recruitment.
            </p>

            <h3 className="mt-7 font-display text-lg font-bold text-navy-900">Key Credentials</h3>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-700">
              {credentials.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="mt-1 text-gold-600">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border-l-4 border-gold-600 bg-gold-100/50 p-5">
              <h3 className="font-display text-base font-bold text-navy-900">
                Inside-school perspective
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Unlike typical Korean agencies that view schools from the outside (catalog-based),
                Wilson has worked inside Australian schools — understanding admission criteria,
                student care systems, and graduation outcomes firsthand.
              </p>
            </div>

            <div className="rounded-2xl border-l-4 border-navy-800 bg-cream-100 p-5">
              <h3 className="font-display text-base font-bold text-navy-900">
                Long-term relationship model
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                ausuhak.com follows students from initial consultation through graduation. Many
                former students still keep in touch, sending wedding invitations years after they
                completed their programs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// Section 3: Korean Student Market
// ─────────────────────────────────────────────────
function KoreanMarketEn() {
  const segments = [
    {
      title: "1. High School Graduates",
      hint: "including Korean GED (검정고시) students",
      body: "Foundation → Bachelor's degrees. Most common pathway with strong success rate.",
    },
    {
      title: "2. Working Holiday Makers",
      hint: "already in Australia",
      body: "WHV → Student Visa → Bachelor's / TAFE → 485 visa → PR. Wilson's specialty area.",
    },
    {
      title: "3. University Graduates",
      hint: "career-focused",
      body: "Master's degrees in healthcare / IT / business / engineering. PR-focused pathways.",
    },
  ];

  const reasons = [
    "Strong academic discipline and dedication",
    "Clear English proficiency goals (IELTS preparation focus)",
    "Long-term Australia commitment (most pursue PR pathway)",
    "Strong family financial support",
    "Cultural adaptability with proper guidance",
  ];

  return (
    <section id="market" className="border-b border-cream-300">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          Korean Student Market
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Why Korean students are a strong fit for Australian institutions
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {segments.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
            >
              <h3 className="font-display text-base font-bold text-navy-900">{s.title}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-gold-600">{s.hint}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-lg font-bold text-navy-900">Why Korean Students?</h3>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-700">
              {reasons.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-1 text-gold-600">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-cream-300 bg-cream-100/50 p-5">
            <h3 className="font-display text-base font-bold text-navy-900">Wilson&apos;s Coverage</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">
              All 8 major Australian states. Sydney, Melbourne, Brisbane, Gold Coast, Perth,
              Adelaide, Hobart, Canberra.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Universities · TAFE · Private Colleges · ELICOS schools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// Section 4: Partnership Opportunities
// ─────────────────────────────────────────────────
function PartnershipEn() {
  const offers = [
    "Pre-screened, qualified students",
    "IELTS-prepared candidates",
    "Genuine Student (GS) documentation",
    "Long-term student support through graduation",
    "Korean parent communication (bilingual)",
    "Visa application & arrival support",
  ];

  const lookFor = [
    "Quality education programs aligned with student career goals",
    "Strong student support services",
    "Transparent admission criteria",
    "Fair, competitive commission structure",
    "Genuine commitment to Korean student care",
  ];

  const steps = [
    "Initial inquiry through this page (form below)",
    "Receive Partnership Brochure & introduction materials",
    "Detailed discussion (online video meeting or in-person visit)",
    "Partnership agreement & onboarding",
    "Begin student referrals (first students within 4-8 weeks)",
  ];

  return (
    <section id="partnership" className="border-b border-cream-300 bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">Partnership</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Partnership Opportunities
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-cream-300 p-6">
            <h3 className="font-display text-lg font-bold text-navy-900">What Wilson Offers</h3>
            <ul className="mt-4 flex flex-col gap-1.5 text-sm text-ink-700">
              {offers.map((o) => (
                <li key={o} className="flex items-start gap-2">
                  <span className="mt-1 text-gold-600">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-cream-300 p-6">
            <h3 className="font-display text-lg font-bold text-navy-900">
              What We Look For in Partners
            </h3>
            <ul className="mt-4 flex flex-col gap-1.5 text-sm text-ink-700">
              {lookFor.map((o) => (
                <li key={o} className="flex items-start gap-2">
                  <span className="mt-1 text-navy-800">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border-l-4 border-gold-600 bg-cream-100/60 p-6">
          <h3 className="font-display text-lg font-bold text-navy-900">Partnership Process</h3>
          <ol className="mt-4 flex flex-col gap-3 text-sm text-ink-700">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-gold-500">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// Section 5: Brochure Download (Phase 4에서 PDF + form 추가 / Phase 1 = email CTA)
// ─────────────────────────────────────────────────
function BrochureEn() {
  const contents = [
    "Wilson's profile & credentials",
    "19-year track record + 950+ students placed",
    "Korean student market data & segments",
    "Partnership terms & student referral process",
    "Sample success case studies (anonymized)",
  ];

  return (
    <section id="brochure" className="border-b border-cream-300">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">Brochure</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
          Download the Partnership Brochure
        </h2>
        <p className="mt-3 max-w-2xl text-base text-ink-700">
          20-page PDF (English) with Wilson&apos;s full profile, partnership terms, and sample case
          studies for institutional decision-makers.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gold-400/40 bg-gold-100/50 p-6 lg:col-span-2">
            <h3 className="font-display text-base font-bold text-navy-900">
              📄 Wilson Kim Partnership Pack
            </h3>
            <ul className="mt-4 flex flex-col gap-1.5 text-sm text-ink-700">
              {contents.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="mt-1 text-gold-600">✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-cream-300 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-gold-600">Request access</p>
            <p className="text-sm text-ink-700">
              Email Wilson with your school name and position. The brochure will be sent within
              24 hours.
            </p>
            <a
              href={`mailto:${PARTNERSHIP_EMAIL}?subject=Partnership%20Brochure%20Request&body=School%20name%3A%20%0AYour%20name%3A%20%0APosition%3A%20%0ACountry%3A%20Australia%0A`}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              📧 Request Brochure
            </a>
            <p className="text-[11px] text-ink-500">
              Self-service form coming Phase 4. For now, email is the fastest path.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────
// Section 6: Contact
// ─────────────────────────────────────────────────
function ContactEn() {
  return (
    <section id="contact" className="bg-navy-900 text-cream-100">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-400">Contact</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-cream-100 sm:text-4xl">
          Get in Touch
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div>
              <p className="font-display text-xl font-bold text-cream-100">Wilson Kim</p>
              <p className="text-sm text-cream-200">Australia Study Consultant · QEAC E240</p>
            </div>

            <div className="rounded-2xl border border-cream-100/15 bg-cream-100/5 p-4">
              <p className="text-xs uppercase tracking-wider text-gold-400">📧 Email</p>
              <a
                href={`mailto:${PARTNERSHIP_EMAIL}`}
                className="mt-1 block font-semibold text-cream-100 hover:text-gold-400"
              >
                {PARTNERSHIP_EMAIL}
              </a>
            </div>

            <div className="rounded-2xl border border-cream-100/15 bg-cream-100/5 p-4">
              <p className="text-xs uppercase tracking-wider text-gold-400">💬 KakaoTalk Channel</p>
              <a
                href={KAKAO_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-semibold text-cream-100 hover:text-gold-400"
              >
                pf.kakao.com/_GadTX
              </a>
              <p className="mt-1 text-[11px] text-cream-200">
                (Korean instant messenger — most accessible for Wilson)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-cream-100/15 bg-cream-100/5 p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gold-400">⏰ Working Hours</p>
              <p className="mt-1 font-semibold text-cream-100">Monday ~ Friday</p>
              <p className="text-sm text-cream-200">10:00 AM ~ 6:00 PM (Korea Standard Time / KST)</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gold-400">🗣️ Languages</p>
              <p className="mt-1 text-sm text-cream-200">Korean (primary) · English</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gold-400">⚡ Response Time</p>
              <p className="mt-1 text-sm text-cream-200">Within 48 hours during business days</p>
            </div>
            <p className="text-[11px] text-cream-300">
              For urgent matters, please use email with &quot;URGENT&quot; in the subject line.
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-cream-100/10 pt-6 text-xs text-cream-200">
          © 2026 ausuhak.com · Wilson Kim ·{" "}
          <Link href="/" className="underline hover:text-gold-400">
            한국어 사이트로
          </Link>
        </p>
      </div>
    </section>
  );
}
