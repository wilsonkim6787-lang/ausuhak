// Step 2.3에서 payments 테이블 + 데이터 연결.
// 현재는 placeholder.

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function MypagePaymentsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">💳 결제 내역</h1>
        <p className="mt-1 text-sm text-ink-500">
          PRO 컨설팅 · 의대 패키지 등 모든 결제 내역이 여기에 표시됩니다.
        </p>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-6">
        <p className="mb-3 text-sm text-ink-700">
          결제 시스템은 곧 오픈됩니다. 현재는 Wilson과 카톡으로 입금 안내를 받으신 후 진행해주세요.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          <li>· 일반 PRO 컨설팅: ₩50,000</li>
          <li>· 의대 패키지: ₩300,000 (ISAT 200문제 + MMI 40 시나리오)</li>
          <li>· 풀 컨설팅: Wilson 직접 안내</li>
        </ul>

        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="mypage_payments_pending"
          className="mt-5 inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
        >
          💬 카톡으로 결제 문의
        </a>
      </div>
    </div>
  );
}
