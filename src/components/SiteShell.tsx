import Link from "next/link";
import "./shell.css";
import { SITE } from "@/lib/site";

// One header, footer and phone bar for every page except the home page, which carries its own
// copy of the same design. Keep NAV in step with the home page header.
export const NAV = [
  { href: "/#majors", label: "전공별 진학" },
  { href: "/medical", label: "의대 준비 센터" },
  { href: "/offers", label: "합격증" },
  { href: "/tools/points", label: "영주권 점수 계산" },
  { href: "/faq", label: "질문" },
  { href: "/news", label: "소식" },
  { href: "/visa", label: "비자 문의" },
];

const Arrow = () => (
  <svg className="ux-arr" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="ux-head">
      <div className="ux-head-in">
        <Link href="/" className="ux-logo" aria-label="AusUhak(호주유학) 홈">
          <span aria-hidden="true" className="ux-logo-mark">A</span>
          <b className="ux-logo-text">AusUhak</b>
          <small className="ux-logo-sub">호주유학</small>
        </Link>
        <nav aria-label="주요 메뉴" className="ux-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={current === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/login" className="ux-login">로그인</Link>
        <Link href="/signup" className="ux-join">가입하기</Link>
        <Link href="/#ask" className="ux-cta">내 상황 보내기</Link>
        <details className="ux-menu">
          <summary aria-label="메뉴 열기">메뉴</summary>
          <nav aria-label="전체 메뉴" className="ux-menu-sheet">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
            <Link href="/login">로그인 · 마이페이지</Link>
            <Link href="/#ask">내 상황 보내기</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const social = Object.entries(SITE.social).filter(([, v]) => v);
  const label: Record<string, string> = { instagram: "인스타그램", naverBlog: "네이버 블로그", youtube: "유튜브" };
  return (
    <>
      <footer className="ux-foot">
        <div className="ux-wrap ux-foot-in">
          <div className="ux-close">
            <div>
              <h2>호주 진학, 지금 학력에서 시작합니다</h2>
              <p>질문은 무료입니다. 가능한 길과 어려운 길을 처음부터 나눠 말씀드립니다.</p>
            </div>
            <Link className="ux-btn ux-btn-p ux-btn-lg" href="/#ask">내 상황 보내기</Link>
          </div>
          <div className="ux-dir">
            <div className="ux-dir-name">
              <b>{SITE.name}</b>
              <span>호주 대학 진학과 학생비자 상담</span>
            </div>
            <div className="ux-dir-col">
              <h4>전공</h4>
              <Link href="/medical">의대 준비 센터</Link>
              <Link href="/pharmacy">약대</Link>
              <Link href="/nursing">간호 · 보건</Link>
              <Link href="/business">경영 · 회계</Link>
              <Link href="/it">IT</Link>
              <Link href="/cookery">요리 · 호텔</Link>
              <Link href="/early-study">조기유학</Link>
            </div>
            <div className="ux-dir-col">
              <h4>자료</h4>
              <Link href="/faq">자주 묻는 질문</Link>
              <Link href="/offers">합격증</Link>
              <Link href="/news">소식</Link>
              <Link href="/visa">비자 문의</Link>
              <Link href="/tools/points">영주권 점수 계산기</Link>
              <Link href="/en">Partners</Link>
              {social.map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener">{label[k] || k}</a>
              ))}
            </div>
            <div className="ux-dir-col ux-dir-wide">
              <h4>연락</h4>
              <a href={"tel:" + SITE.phone.replace(/-/g, "")}>{SITE.phone}</a>
              <a href={SITE.kakao} target="_blank" rel="noopener">카카오톡 채널</a>
              <span>{SITE.email}</span>
              <span>{SITE.officeAddress.full} (대치)</span>
              <span>{SITE.hours}</span>
            </div>
          </div>
          <div className="ux-legal">
            <span>© 2026 {SITE.name}</span>
            <span>대표 {SITE.owner}</span>
            <span>사업자등록번호 {SITE.bizNo}</span>
            <span>사업장 {SITE.bizAddress}</span>
            {SITE.mailOrderNo ? <span>통신판매업 신고 {SITE.mailOrderNo}</span> : null}
            <Link href="/privacy">개인정보처리방침</Link>
            <Link href="/terms">이용약관</Link>
          </div>
        </div>
      </footer>
      <nav className="ux-bar" aria-label="빠른 상담">
        <a className="ux-btn ux-btn-s" href={SITE.kakao} target="_blank" rel="noopener">카카오톡</a>
        <Link className="ux-btn ux-btn-p" href="/#ask">내 상황 보내기</Link>
      </nav>
    </>
  );
}

export function AskBox({ title = "내 상황에 맞는 길이 궁금하다면", text = "학력, 영어 점수, 원하는 전공과 시기를 보내 주시면 가능한 길을 먼저 알려 드립니다." }: { title?: string; text?: string }) {
  return (
    <section className="ux-ask" aria-label="상담 신청">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="ux-ask-btns">
        <Link className="ux-btn ux-btn-p" href="/#ask">내 상황 보내기<Arrow /></Link>
        <a className="ux-btn ux-btn-w" href={SITE.kakao} target="_blank" rel="noopener">카카오톡으로 묻기</a>
      </div>
    </section>
  );
}

export function Crumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="현재 위치" className="ux-crumbs">
      {items.map((it, i) => (
        <span key={i}>
          {it.path ? <Link href={it.path}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
          {i < items.length - 1 ? " ›" : ""}
        </span>
      ))}
    </nav>
  );
}

export default function SiteShell({ children, current }: { children: React.ReactNode; current?: string }) {
  return (
    <div className="ux-page">
      <SiteHeader current={current} />
      <main className="ux-main">{children}</main>
      <SiteFooter />
    </div>
  );
}

// Wraps a page generated from a design board: shared header and footer around the board's own sections.
export function BoardShell({ children, current }: { children: React.ReactNode; current?: string }) {
  return (
    <div className="ux-page ux-page-board">
      <SiteHeader current={current} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
