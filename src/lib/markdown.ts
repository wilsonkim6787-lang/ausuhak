// 사이트 공용 markdown 렌더러 — 후기·소식·매뉴얼·관리자 미리보기 전부 이걸 사용.
// GFM 은 ~물결~ / ~~물결~~ 을 취소선(<del>)으로 해석하는데, 한국어 글은
// "12~15주", "1~2일" 같은 범위 표기가 흔해서 한 문단에 ~ 가 2번 나오면
// 그 사이 글자에 줄이 그어지는 사고가 남. → del 토큰을 끄고 ~ 는 항상 문자 그대로.
// (취소선이 정말 필요하면 본문에 <del>텍스트</del> HTML 을 직접 쓰면 됨 — raw HTML 은 통과.)

import { Marked } from "marked";

const md = new Marked({
  gfm: true,
  breaks: false,
  tokenizer: {
    del() {
      return undefined; // 취소선 비활성화
    },
  },
});

// 렌더 결과 HTML 보수적 살균 — 공개 페이지(소식·후기·매뉴얼)에 저장형 XSS 방지.
// marked 는 raw HTML 을 그대로 통과시키므로(<del> 등 의도된 기능), 정상 마크다운
// (굵게·링크·이미지·표)은 건드리지 않고 "위험 태그·이벤트 핸들러·위험 프로토콜"만 제거한다.
// 작성자는 super_admin 뿐이지만 방어선(defense-in-depth) 확보.
function sanitizeHtml(html: string): string {
  return (
    html
      // 위험 태그를 내용째 제거
      .replace(
        /<(script|style|iframe|object|embed|form|noscript|template)\b[\s\S]*?<\/\1\s*>/gi,
        "",
      )
      // 남은 위험 태그(자기닫힘/열림만)
      .replace(
        /<\/?(script|style|iframe|object|embed|form|noscript|template|link|meta|base)\b[^>]*>/gi,
        "",
      )
      // 이벤트 핸들러 속성 (onerror, onclick, ...) 제거
      .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
      .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
      .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
      // href/src 의 javascript:/vbscript:/data:(이미지 제외) 프로토콜 무력화
      .replace(
        /(href|src|xlink:href)\s*=\s*"(?:\s*(?:javascript|vbscript|data(?!:image\/)):)[^"]*"/gi,
        '$1="#"',
      )
      .replace(
        /(href|src|xlink:href)\s*=\s*'(?:\s*(?:javascript|vbscript|data(?!:image\/)):)[^']*'/gi,
        "$1='#'",
      )
  );
}

// async 옵션 미사용 → parse 는 동기 string 반환 (서버·클라이언트 공용).
export function renderMarkdown(src: string): string {
  return sanitizeHtml(md.parse(src) as string);
}
