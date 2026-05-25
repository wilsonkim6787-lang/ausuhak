// 이용약관 — 한국 사이트 전용 / 표준 한국 전자상거래법 기준.
// 환불은 전자상거래법 17조 (7일 청약철회) 기본 정책. Wilson이 자체 정책 정하면 수정.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";
const EFFECTIVE_DATE = "2026-05-16";

export default async function TermsPage({
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
            이용약관
          </h1>
          <p className="mt-2 text-xs text-ink-500">시행일: {EFFECTIVE_DATE}</p>

          <p className="mt-6 text-sm leading-relaxed text-ink-700">
            본 약관은 ausuhak.com (호주유학, 이하 &ldquo;사이트&rdquo;) 이 제공하는 호주 유학 매칭·상담·교육 서비스의 이용 조건을 정합니다.
          </p>

          <Section title="제1조 (목적)">
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              본 약관은 사이트가 제공하는 진단·매칭·상담·결제·학습 콘텐츠 등 일체의 서비스 이용에 관한 사항을 정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (용어의 정의)">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· <strong>사이트</strong>: ausuhak.com 및 그 하위 도메인 일체</li>
              <li>· <strong>이용자</strong>: 사이트에 접속하여 서비스를 이용하는 모든 자연인·법인</li>
              <li>· <strong>회원</strong>: 이메일로 가입하여 마이페이지를 보유한 이용자</li>
              <li>· <strong>운영자</strong>: Wilson Kim (QEAC E240, 호주 정부 인증 유학 상담사)</li>
            </ul>
          </Section>

          <Section title="제3조 (약관의 효력 및 변경)">
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              본 약관은 사이트에 게시함으로써 효력이 발생합니다. 운영자는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 7일 전 사이트 공지사항에 게시합니다. 변경 약관에 동의하지 않는 이용자는 회원 탈퇴를 요청할 수 있습니다.
            </p>
          </Section>

          <Section title="제4조 (회원 가입 및 탈퇴)">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· <strong>가입</strong>: 이메일과 비밀번호를 등록하면 회원 가입이 완료됩니다.</li>
              <li>· <strong>탈퇴</strong>: 마이페이지에서 직접 탈퇴하거나, 카카오 채널로 요청하실 수 있습니다.</li>
              <li>· <strong>가입 제한</strong>: 타인의 정보를 도용하거나 허위 정보를 제공한 경우 가입을 거부하거나 사후 강제 탈퇴할 수 있습니다.</li>
            </ul>
          </Section>

          <Section title="제5조 (서비스 제공)">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· <strong>무료 서비스</strong>: 가능성 진단, 카카오 채널 1:1 상담, ISAT 5문제 체험, MMI 1 스테이션 체험.</li>
              <li>· <strong>유료 서비스</strong>: 의대 패키지 ₩300,000 (ISAT 200문제 + MMI 40 스테이션 + Wilson 직접 피드백). 그 외 학교 수속·비자 진행 서비스는 케이스별 별도 견적.</li>
              <li>· <strong>서비스 중단</strong>: 시스템 점검·천재지변·운영자 사정 등 사유로 서비스가 일시 중단될 수 있으며, 가능한 범위에서 사전 공지합니다.</li>
            </ul>
          </Section>

          <Section title="제6조 (결제 및 환불)">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· <strong>결제 방법</strong>: 무통장 입금 (카카오 채널로 안내).</li>
              <li>· <strong>청약철회</strong>: 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에 따라 결제 완료일로부터 7일 이내 청약철회가 가능합니다. 단, 학습 콘텐츠에 이미 접근한 경우 일부 환불이 제한될 수 있습니다.</li>
              <li>· <strong>환불 절차</strong>: 카카오 채널로 환불 요청 → 영업일 기준 3일 이내 확인 → 7영업일 이내 입금 계좌로 환불.</li>
              <li>· <strong>학교 수속 서비스</strong>: 학교 지원·비자 신청 등 진행이 시작된 경우, 이미 발생한 외부 비용 (학교 application fee, 비자 신청료 등) 은 환불되지 않습니다.</li>
            </ul>
          </Section>

          <Section title="제7조 (이용자의 의무)">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· 본인의 이메일·비밀번호를 제3자에게 양도하거나 공유하지 않습니다.</li>
              <li>· 진단·상담 시 본인의 학력·영어·재정 정보를 사실대로 제공합니다.</li>
              <li>· 사이트의 학습 콘텐츠 (ISAT 문제, MMI 시나리오, 모범답안 등) 를 무단으로 복제·배포하지 않습니다.</li>
              <li>· 사이트 운영을 방해하거나 다른 이용자에게 피해를 주는 행위를 하지 않습니다.</li>
            </ul>
          </Section>

          <Section title="제8조 (운영자의 면책)">
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-700">
              <li>· 매칭·상담 결과는 운영자의 19년 호주 유학 컨설팅 경력 및 호주 학교 교직원 경력에 기반한 정보 제공이며, 호주 대학·정부 기관의 최종 합격·비자 발급을 보장하지 않습니다.</li>
              <li>· 이용자가 제공한 정보 (학력·시험 점수·재정 상황 등) 가 부정확하거나 허위인 경우, 그로 인한 결과는 이용자 본인의 책임입니다.</li>
              <li>· 호주 정부·대학의 정책 변경, 비자 규정 개정 등으로 인한 결과는 운영자가 책임지지 않습니다.</li>
              <li>· 천재지변, 전쟁, 정부 조치 등 불가항력으로 인한 서비스 장애에 대해서는 책임이 면제됩니다.</li>
            </ul>
          </Section>

          <Section title="제9조 (저작권)">
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              사이트가 제공하는 모든 콘텐츠 (텍스트·이미지·디자인·ISAT 문제·MMI 시나리오·Wilson 모범답안 등) 의 저작권은 운영자에게 귀속됩니다. 이용자는 본 약관에 따라 개인적 학습 용도로만 사용할 수 있으며, 상업적 사용·복제·배포·재가공은 사전 서면 동의 없이 금지됩니다.
            </p>
          </Section>

          <Section title="제10조 (분쟁 해결 및 준거법)">
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              본 약관에 관한 분쟁은 대한민국 법령을 준거법으로 하며, 분쟁이 발생한 경우 우선 카카오 채널을 통해 협의로 해결합니다. 협의가 이루어지지 않을 경우 「민사소송법」에 따른 관할 법원에서 해결합니다.
            </p>
          </Section>

          <Section title="부칙">
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              본 약관은 {EFFECTIVE_DATE} 부터 시행합니다.
            </p>
          </Section>

          <div className="mt-10 rounded-2xl border border-cream-300 bg-white p-6 text-sm leading-relaxed text-ink-700 shadow-sm">
            <p className="font-semibold text-navy-900">문의</p>
            <p className="mt-2">
              약관·결제·환불 관련 문의는 카카오 채널로 보내주세요. Wilson 직접 응대 (평일 10:00~18:00 KST).
            </p>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="terms_contact"
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
