// 개인정보처리방침 — 한국 사이트 전용 / 표준 한국 전자상거래법 기준.
// Wilson 검토 후 카피 수정 가능. 사업자등록은 Phase 2.5 대기 (현재 미기재).

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";
const LAST_UPDATED = "2026-05-16";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const HeaderCmp = locale === "en" ? HeaderEn : Header;

  return (
    <>
      <HeaderCmp />
      <main className="flex-1 bg-cream-100">
        <section className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/"
            className="text-xs font-semibold text-navy-700 hover:text-gold-600"
          >
            ← 홈
          </Link>

          <h1 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
            개인정보처리방침
          </h1>
          <p className="mt-2 text-xs text-ink-500">최종 개정일: {LAST_UPDATED}</p>

          <p className="mt-6 text-sm leading-relaxed text-ink-700">
            ausuhak.com (호주유학, 이하 &ldquo;사이트&rdquo;) 은 이용자의 개인정보를 중요하게 생각하며,
            「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침은 사이트가 수집·이용하는 개인정보의 항목, 목적, 보유 기간, 권리 행사 방법을 명시합니다.
          </p>

          <Section title="1. 수집하는 개인정보 항목">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· <strong>진단 (선택)</strong>: 나이, 학력, 영어 점수, 지역 선호, 전공, 예산 — 매칭 결과 제공 목적. URL 토큰 기반 stateless 처리 (서버 미저장).</li>
              <li>· <strong>회원가입 (선택)</strong>: 이메일, 비밀번호 — 마이페이지·결제 이력 관리.</li>
              <li>· <strong>결제</strong>: 입금자 성명, 입금 금액, 결제 일시 — 결제 확인 및 회계 처리.</li>
              <li>· <strong>카카오 채널 상담</strong>: 카카오톡 채널 메시지 — 1:1 상담 응대.</li>
              <li>· <strong>자동 수집</strong>: 접속 IP, 쿠키, 접속 로그, 디바이스 정보 — 서비스 안정성 및 보안.</li>
            </ul>
          </Section>

          <Section title="2. 수집 및 이용 목적">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· 호주 유학 매칭 결과 제공 및 상담</li>
              <li>· 회원 식별·인증·관리</li>
              <li>· 결제 처리 및 환불 응대</li>
              <li>· 카카오 채널을 통한 1:1 응대</li>
              <li>· 서비스 운영·개선 및 부정 이용 방지</li>
            </ul>
          </Section>

          <Section title="3. 보유 및 이용 기간">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· <strong>회원 정보</strong>: 회원 탈퇴 시까지 (탈퇴 즉시 파기)</li>
              <li>· <strong>결제 기록</strong>: 5년 (「전자상거래 등에서의 소비자보호에 관한 법률」 시행령 제6조)</li>
              <li>· <strong>진단 결과</strong>: 서버 미저장 (URL 토큰 기반 stateless)</li>
              <li>· <strong>접속 로그</strong>: 3개월 (통신비밀보호법)</li>
              <li>· <strong>카카오 채널 상담 이력</strong>: 카카오 정책에 따름</li>
            </ul>
          </Section>

          <Section title="4. 제3자 제공">
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              사이트는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 이용자가 명시적으로 동의한 경우, 호주 대학·어학원 입학 지원을 위해 필요한 정보를 해당 기관에 제공할 수 있습니다. 제공 시 사전에 항목·목적·보유 기간을 안내드립니다.
            </p>
          </Section>

          <Section title="5. 개인정보 처리 위탁">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· <strong>Vercel Inc. (미국)</strong>: 사이트 호스팅</li>
              <li>· <strong>Supabase Inc. (미국)</strong>: 회원·결제 데이터베이스</li>
              <li>· <strong>카카오 (대한민국)</strong>: 카카오 채널 상담</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">
              위탁업체와 개인정보 보호에 관한 계약을 체결하고, 위탁 처리 현황을 정기 점검합니다.
            </p>
          </Section>

          <Section title="6. 정보주체의 권리">
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              이용자는 언제든지 개인정보 열람·정정·삭제·처리정지를 요구할 수 있습니다. 카카오 채널을 통해 요청하시면 영업일 기준 3일 이내 처리합니다. 14세 미만 아동의 개인정보는 보호자 동의 없이 수집하지 않습니다.
            </p>
          </Section>

          <Section title="7. 개인정보 보호책임자">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· 성명: Wilson Kim</li>
              <li>· 자격: QEAC E240 (호주 정부 인증 유학 상담사)</li>
              <li>· 연락: 카카오 채널 (<a href={KAKAO_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-600 hover:underline">https://pf.kakao.com/_GadTX</a>)</li>
            </ul>
          </Section>

          <Section title="8. 개인정보 변경 이력">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· 2026-05-16: 최초 제정</li>
            </ul>
          </Section>

          <div className="mt-10 rounded-2xl border border-cream-300 bg-white p-6 text-sm leading-relaxed text-ink-700 shadow-sm">
            <p className="font-semibold text-navy-900">문의</p>
            <p className="mt-2">
              개인정보 관련 문의·삭제 요청은 카카오 채널로 보내주세요. Wilson 직접 응대 (평일 10:00~18:00 KST).
            </p>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="privacy_contact"
              className="mt-4 inline-flex rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              💬 카카오 채널로 문의
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold text-navy-900 sm:text-xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
