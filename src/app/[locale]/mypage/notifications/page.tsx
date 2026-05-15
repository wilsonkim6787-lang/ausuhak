// Step 2.5 카톡 알림톡 + 자동화 이후 실제 알림 데이터 연결.
// 현재는 placeholder.

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function MypageNotificationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">🔔 알림</h1>
        <p className="mt-1 text-sm text-ink-500">
          Stage 변경 · 마감일 · 카톡 메시지 등 모든 알림이 여기에 모입니다.
        </p>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-6 text-sm">
        <p className="mb-2 text-ink-700">
          알림톡은 사업자 등록 후 카카오 비즈 채널을 통해 활성화됩니다 (현재 준비 중).
        </p>
        <p className="text-ink-700">
          그동안은 카톡 채널에서 직접 안내를 받으실 수 있습니다.
        </p>

        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="mypage_notifications"
          className="mt-5 inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
        >
          💬 카톡 채널로 이동
        </a>
      </div>
    </div>
  );
}
