import Link from "next/link";
import "./shell.css";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/#route", label: "진학 노선도" },
  { href: "/#majors", label: "전공별" },
  { href: "/medical", label: "의대 준비" },
  { href: "/visa", label: "비자 문의" },
  { href: "/offers", label: "합격증" },
  { href: "/faq", label: "FAQ" },
  { href: "/news", label: "소식" },
];

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="ux-head">
      <div className="ux-head-in">
        <Link href="/" className="ux-logo" aria-label="호주유학 홈">
          <span aria-hidden="true" className="ux-logo-mark">호</span>
          <span className="ux-logo-text">호주유학</span>
        </Link>
        <nav aria-label="주요 메뉴" className="ux-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={current === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/#ask" className="ux-cta">내 상황 보내기</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const social = Object.entries(SITE.social).filter(([, v]) => v);
  const label: Record<string, string> = { instagram: "인스타그램", naverBlog: "네이버 블로그", youtube: "유튜브" };
  return (
    <footer className="ux-foot">
      <div className="ux-wrap ux-foot-grid">
        <div className="ux-foot-col">
          <span className="ux-foot-brand">{SITE.name}</span>
          <span>대표 {SITE.owner} · 사업자등록번호 {SITE.bizNo}</span>
          <span>사업장: {SITE.bizAddress}</span>
          <span>대면 상담: {SITE.officeAddress.full}</span>
        </div>
        <div className="ux-foot-col">
          <span className="ux-foot-title">상담</span>
          <span>{SITE.phone}</span>
          <a href={SITE.kakao} target="_blank" rel="noopener">카카오톡 채널</a>
          <span>{SITE.hours}</span>
        </div>
        <div className="ux-foot-col">
          <span className="ux-foot-title">EC 파트너</span>
          <a href="https://educennow.com/online" target="_blank" rel="noopener">EC 화상영어</a>
          <span>EC 어학원 · 필리핀 세부</span>
        </div>
        <div className="ux-foot-col">
          <span className="ux-foot-title">더 보기</span>
          {social.map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noopener">{label[k] || k}</a>
          ))}
          <Link href="/en">English (For Partners)</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/terms">이용약관</Link>
        </div>
      </div>
    </footer>
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
        <a className="ux-btn ux-btn-kakao" href={SITE.kakao} target="_blank" rel="noopener">카카오톡으로 물어보기</a>
        <Link className="ux-btn ux-btn-line" href="/#ask">상담 신청서 보내기</Link>
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
