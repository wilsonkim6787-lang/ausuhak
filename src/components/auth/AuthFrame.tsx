import Link from "next/link";
import "./auth.css";

export default function AuthFrame({ children, tab }: { children: React.ReactNode; tab?: "login" | "signup" | "family" }) {
  return (
    <div className="au">
      <aside className="au-side">
        <Link href="/" className="au-brand">
          AusUhak<span>호주유학</span>
        </Link>
        <h1>학생과 부모님이 같은 화면에서 진행 상황을 봅니다</h1>
        <ul>
          <li>지금 어느 단계인지, 다음에 무엇을 해야 하는지</li>
          <li>서류 올리기와 제가 보내 드린 서류(견적서, Offer Letter, CoE, 비자 승인서)</li>
          <li>AusUhak과 주고받은 메시지</li>
        </ul>
      </aside>
      <main className="au-main">
        <div className="au-card">
          {tab ? (
            <nav className="au-tabs" aria-label="로그인 또는 가입">
              <Link href="/login" aria-current={tab === "login" ? "page" : undefined}>로그인</Link>
              <Link href="/signup" aria-current={tab === "signup" ? "page" : undefined}>회원가입</Link>
              <Link href="/signup/family" aria-current={tab === "family" ? "page" : undefined}>가족 연결</Link>
            </nav>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}
