import Link from "next/link";
import AuthFrame from "@/components/auth/AuthFrame";
import { FamilyForm } from "@/components/auth/forms";
import { getSession } from "@/lib/auth";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "가족 연결 - AusUhak(호주유학)", description: "가족 연결", path: "/signup/family", noindex: true });

export default async function Page() {
  const { user } = await getSession();
  return (
    <AuthFrame tab="family">
      {user ? (
        <FamilyForm />
      ) : (
        <div className="au-form">
          <h2>가족 연결</h2>
          <p className="au-note">부모님은 회원가입 화면에서 &lsquo;학부모&rsquo;를 고르고 연결 코드를 넣으시면 바로 연결됩니다. 이미 가입하셨다면 로그인 후 이 화면에서 코드를 넣어 주세요.</p>
          <Link className="au-btn" href="/signup" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>학부모로 가입하기</Link>
          <Link href="/login?next=/signup/family" style={{ fontSize: 14 }}>이미 가입했어요, 로그인</Link>
        </div>
      )}
    </AuthFrame>
  );
}
