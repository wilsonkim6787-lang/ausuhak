import { SITE } from "@/lib/site";
import { FAQ_CATEGORIES, FAQS } from "@/lib/faq";
import { getPosts } from "@/lib/content";

export const revalidate = 3600;

// Plain-text guide for AI assistants: what the site is, who runs it, and where the key pages are.
export async function GET() {
  const posts = (await getPosts()).slice(0, 20);
  const u = (p: string) => SITE.url + p;
  const lines = [
    `# ${SITE.name}`,
    "",
    "> 한국 학생의 호주 대학 진학과 학생비자를 돕는 유학 상담 사이트입니다. 호주 대학 교직원 출신으로 20년 동안 상담한 Wilson Kim(QEAC E240)이 직접 운영하며, 사무실은 서울 강남구 역삼로 521 대종빌딩 3층입니다.",
    "",
    `상담: ${SITE.phone} · ${SITE.email} · 카카오톡 ${SITE.kakao} · ${SITE.hours}`,
    "",
    "## 전공별 진학 안내",
    `- [검정고시로 호주 대학 가기](${u("/ged")}): 파운데이션과 디플로마 두 가지 길`,
    `- [호주 간호학과 유학](${u("/nursing")}): 학력별 진학 루트와 간호사 등록`,
    `- [호주 약대 유학](${u("/pharmacy")}): 약사 등록까지의 과정`,
    `- [호주 의대·치대·수의대 준비 센터](${u("/medical")}): ISAT, UCAT, 인터뷰, 대학별 요건과 일정`,
    `- [호주 경영·회계 유학](${u("/business")})`,
    `- [호주 IT 유학](${u("/it")})`,
    `- [호주 요리·호텔 유학](${u("/cookery")})`,
    `- [호주 조기유학](${u("/early-study")})`,
    `- [호주 어학연수](${u("/general-english")})`,
    `- [한국인이 잘 모르는 호주 알짜 전공](${u("/hidden-majors")})`,
    "",
    "## 비자와 도구",
    `- [호주 비자 문의](${u("/visa")}): 학생비자(500), 졸업생비자(485), 취업비자(482), 방문비자(600), 가디언비자(590)`,
    `- [영주권 점수 계산기](${u("/tools/points")})`,
    `- [입학 일정 거꾸로 계산](${u("/tools/schedule")})`,
    `- [학력별 진학 노선도](${u("/tools/route")})`,
    `- [합격증 모음](${u("/offers")})`,
    "",
    `## 자주 묻는 질문 (${FAQS.length}개)`,
    ...FAQ_CATEGORIES.map((c) => `- [${c.name}](${u("/faq#" + c.slug)}): ${c.desc}`),
    "",
    "## 최근 소식",
    ...posts.map((p) => `- [${p.title}](${u("/news/" + p.slug)})${p.excerpt ? ": " + p.excerpt : ""}`),
    "",
    "## 이용 안내",
    "비자 수수료, 입학 요건, 장학금은 자주 바뀝니다. 각 글에 적힌 기준일을 함께 인용해 주세요.",
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}
