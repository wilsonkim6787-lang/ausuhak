import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { ro } from "@/components/mypage/ko";
import "@/components/mypage/mypage.css";

export const metadata = {
  title: { absolute: "마이페이지 - AusUhak(호주유학)" },
  robots: { index: false, follow: false },
};

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const { sb, profile } = await requireFamily();
  const { data: fam } = await sb.from("crm_families").select("display_name").eq("id", profile.family_id).maybeSingle();
  const relation = profile.relation || (profile.role === "student" ? "학생" : "보호자");
  const family = fam?.display_name || (profile.name ? `${profile.name} 가족` : "우리 가족");

  return (
    <div className="mp">
      <header className="mp-head">
        <div className="mp-head-in">
          <Link href="/mypage" className="mp-brand">
            <b>AusUhak</b>
            <span>마이페이지</span>
          </Link>
          <div className="mp-who">
            <span className="mp-who-name">
              {family} · {relation}
              <span className="mp-who-suffix">{ro(relation).slice(relation.length)} 로그인</span>
            </span>
            <form action={logoutAction}>
              <button type="submit" className="mp-logout">로그아웃</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
