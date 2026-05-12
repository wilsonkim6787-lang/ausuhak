// Step 1.1 placeholder Hero - 실제 Hero는 Step 1.5에서 PART F F-2 따라 빌드
export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero (placeholder) */}
      <section className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-100 px-4 py-2 text-xs font-bold tracking-wider text-gold-600">
            <span className="size-1.5 rounded-full bg-gold-600 animate-pulse" />
            PHASE 1 BUILD · STEP 1.1
          </span>
        </div>

        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-navy-900 sm:text-6xl">
          호주 유학 19년
          <br />
          <span className="italic text-gold-600">+ 호주 학교 교직원 경력</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700 sm:text-xl">
          검정고시도 / 워홀러도 / 대졸도 호주 명문대 진학.
          <br />
          Wilson Kim (QEAC E240) · 950명+ 누적 학생.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://pf.kakao.com/_GadTX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-gold-500"
          >
            💬 카톡 채널로 1:1 상담 (30분 무료)
          </a>
          <button
            type="button"
            disabled
            className="inline-flex min-h-[44px] cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-navy-800 px-6 py-3.5 text-base font-semibold text-navy-800 opacity-60"
          >
            🎯 30초 진단 시작 (Step 1.6 오픈 예정)
          </button>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-500">
          <span>✓ 950명+ 누적 학생</span>
          <span>✓ QEAC E240 자격</span>
          <span>✓ 19년 컨설팅 + 학교 교직원 경력</span>
        </div>

        <p className="mt-8 text-xs text-ink-500">
          ⏰ 평일 10:00 ~ 18:00 (KST) · 주말·공휴일 휴무
        </p>
      </section>

      {/* Phase 1 진행 상황 */}
      <section className="container mx-auto max-w-5xl border-t border-cream-300 px-4 py-16">
        <h2 className="mb-2 font-display text-2xl font-semibold text-navy-900">
          📍 Phase 1 빌드 진행
        </h2>
        <p className="mb-6 text-ink-700">
          Step 1.1 환경 설정 완료. Vercel 미리보기 URL → Wilson 검토 → Step 1.2 i18n.
        </p>

        <ul className="space-y-2 text-sm text-ink-700">
          <li>✅ Step 1.1 환경 설정 (Next.js 16 + Tailwind v4 + TypeScript)</li>
          <li>⏳ Step 1.2 i18n 라우팅 (next-intl / ko 기본 / en 1페이지)</li>
          <li>⏳ Step 1.3 디자인 시스템 + 기본 컴포넌트</li>
          <li>⏳ Step 1.4 DB 마이그레이션 (Supabase + master_v2_clean 109교·1,235전공)</li>
          <li>⏳ Step 1.5 메인 페이지 (Hero + Wilson 스토리 + 합격 사례)</li>
          <li>⏳ Step 1.6 진단 시스템 (6변수 → 시나리오 매칭 → 카드 7장)</li>
          <li>⏳ Step 1.7 카드 7장 컴포넌트</li>
          <li>⏳ Step 1.8 관리자 페이지 + 견적서</li>
          <li>⏳ Step 1.9 영문 사이트 /en (1페이지)</li>
          <li>⏳ Step 1.10 배포 + Wilson 시각 검토</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-cream-300 bg-navy-900 text-cream-100">
        <div className="container mx-auto max-w-5xl px-4 py-12">
          <p className="font-display text-xl font-semibold">ausuhak.com (호주유학)</p>
          <p className="mt-1 text-sm text-cream-300">
            Wilson Kim · QEAC E240 · 19년 호주 유학 컨설팅 + 호주 학교 교직원 경력
          </p>

          <div className="mt-6 space-y-1.5 text-sm">
            <p>
              💬 카카오 채널:{" "}
              <a
                href="https://pf.kakao.com/_GadTX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-500 hover:underline"
              >
                pf.kakao.com/_GadTX
              </a>
            </p>
            <p>⏰ 영업 시간: 평일 10:00 ~ 18:00 (KST) · 주말·공휴일 휴무</p>
          </div>

          <p className="mt-8 text-xs text-cream-300">© 2026 ausuhak.com</p>
        </div>
      </footer>
    </main>
  );
}
