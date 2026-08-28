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

// async 옵션 미사용 → parse 는 동기 string 반환 (서버·클라이언트 공용).
export function renderMarkdown(src: string): string {
  return md.parse(src) as string;
}
