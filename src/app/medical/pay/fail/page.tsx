import Link from "next/link";
import SiteShell from "@/components/SiteShell";

export const metadata = { title: { absolute: "결제 취소 - AusUhak(호주유학)" }, robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const cancelled = sp.code === "PAY_PROCESS_CANCELED" || sp.code === "USER_CANCEL";
  return (
    <SiteShell>
      <div className="ux-wrap" style={{ maxWidth: 640 }}>
        <h1 className="ux-h1">{cancelled ? "결제를 취소했습니다" : "결제를 마치지 못했습니다"}</h1>
        <p className="ux-lead">{cancelled ? "결제되지 않았습니다. 원하실 때 다시 고르시면 됩니다." : (sp.message || "카드 승인 중 문제가 생겼습니다. 결제되지 않았으니 다시 시도해 주세요.")}</p>
        <Link className="ux-btn ux-btn-p" href="/medical/isat-mock">모의고사로 돌아가기</Link>
      </div>
    </SiteShell>
  );
}
