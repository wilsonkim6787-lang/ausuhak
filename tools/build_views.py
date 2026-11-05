#!/usr/bin/env python3
"""Regenerate src/views/** from the design boards and write the matching route pages.

Run: python3 tools/build_views.py <scratchpad dir>
"""
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SP = sys.argv[1]

# (source board, view name, route path, breadcrumb name, title override, description override, client-only)
SITE_PAGES = [
    ("design/project/Main.dc.html", "site/Main", "/", "홈", None, None, False),
    ("design/project/Nursing.dc.html", "site/Nursing", "/nursing", "보건·간호", None, None, False),
    ("design/project/Pharmacy.dc.html", "site/Pharmacy", "/pharmacy", "약대", None, None, False),
    ("design/project/Business.dc.html", "site/Business", "/business", "경영·회계", None, None, False),
    ("design/project/IT.dc.html", "site/IT", "/it", "IT", None, None, False),
    ("design/project/Cookery.dc.html", "site/Cookery", "/cookery", "요리·호텔", None, None, False),
    ("design/project/EarlyStudy.dc.html", "site/EarlyStudy", "/early-study", "조기유학", None, None, False),
    ("design/project/GeneralEnglish.dc.html", "site/GeneralEnglish", "/general-english", "어학연수", None, None, False),
    ("design/project/HiddenMajors.dc.html", "site/HiddenMajors", "/hidden-majors", "알짜 전공", None, None, False),
    ("design/project/GED.dc.html", "site/GED", "/ged", "검정고시 진학", None, None, False),
    ("design/project/Visa.dc.html", "site/Visa", "/visa", "비자 문의", None, None, False),
    ("design/project/Partners.dc.html", "site/Partners", "/en", "For Partners",
     "AusUhak | Australian Education Agent in Seoul, Korea",
     "AusUhak is a Seoul-based education agency placing Korean students into Australian universities, colleges and English schools. QEAC E240 qualified counsellor, 20 years of experience.", False),
]

MED = "의대 준비 센터"
MED_PAGES = [
    ("med/project/Main.dc.html", "medical/Main", "/medical", MED,
     "호주 의대·치대·수의대 준비 센터 | ISAT·UCAT·인터뷰 - AusUhak(호주유학)",
     "호주 의대, 치대, 수의대 진학을 준비하는 한국 학생을 위한 센터입니다. 대학별 입학 요건과 학비, 입시 일정, ISAT·UCAT 문제은행과 모의고사, MMI 인터뷰 준비까지 한곳에서 확인하세요.", False),
    ("med/project/Universities.dc.html", "medical/Universities", "/medical/universities", "대학 정보",
     "호주 의대·치대·수의대 대학별 정보 | 입학 요건·학비 - AusUhak(호주유학)",
     "모나쉬, 시드니, 멜버른, UNSW, 퀸즐랜드 등 호주 의대·치대·수의대 22개 대학의 입학 요건, 시험 점수, 영어 기준, 국제학생 학비를 대학별로 비교합니다.", False),
    ("med/project/Admission.dc.html", "medical/Admission", "/medical/admission", "입학 안내",
     "호주 의대 입학 안내 | 고졸·학부·대졸 경로별 요건 - AusUhak(호주유학)",
     "고등학교 졸업 후 바로 가는 학부 의대, 학사 후 가는 대학원 의대(MD), 치대와 수의대까지 경로별 입학 요건과 준비 순서를 정리했습니다.", False),
    ("med/project/Calendar.dc.html", "medical/Calendar", "/medical/calendar", "입시 일정",
     "호주 의대 입시 일정 | ISAT·UCAT·지원 마감 - AusUhak(호주유학)",
     "호주 의대·치대·수의대 지원 마감, ISAT·UCAT ANZ 시험일, 인터뷰와 합격 발표 시기를 대학별 달력으로 확인하세요.", False),
    ("med/project/IbSat.dc.html", "medical/IbSat", "/medical/ib-sat", "IB·SAT",
     "IB·SAT 학생의 호주 의대 지원 가이드 - AusUhak(호주유학)",
     "IB 디플로마와 SAT·AP 성적으로 호주 의대·치대에 지원할 때 필요한 점수 환산, 과목 요건, 대학별 차이를 정리했습니다.", False),
    ("med/project/Interview.dc.html", "medical/Interview", "/medical/mmi", "인터뷰",
     "호주 의대 MMI 인터뷰 준비 | 대학별 형식과 기출 주제 - AusUhak(호주유학)",
     "호주 의대·치대 MMI와 패널 인터뷰의 대학별 형식, 자주 나오는 주제, 답변 구조와 연습 방법을 안내합니다.", False),
    ("med/project/InterviewLab.dc.html", "medical/InterviewLab", "/medical/interview-lab", "인터뷰 연습실",
     "MMI 인터뷰 연습실 - AusUhak(호주유학)",
     "호주 의대 MMI 스테이션 문제를 시간 제한에 맞춰 연습하고 답변을 점검해 보세요.", True),
    ("med/project/Mock.dc.html", "medical/Mock", "/medical/isat-mock", "ISAT 모의고사",
     "ISAT 실전 모의고사 | 호주 의대 입학시험 - AusUhak(호주유학)",
     "실제 ISAT과 같은 시간 배분으로 풀어 보는 실전 모의고사입니다. 영역별 점수와 해설을 바로 확인할 수 있습니다.", True),
    ("med/project/Practice.dc.html", "medical/Practice", "/medical/isat", "ISAT 문제은행",
     "ISAT 문제은행 | 호주 의대 입학시험 연습 문제 - AusUhak(호주유학)",
     "호주 의대·치대 지원에 필요한 ISAT 연습 문제 233문항을 영역별로 풀고 해설을 확인하세요. UCAT·GAMSAT 준비 자료도 함께 제공합니다.", True),
    ("med/project/Scores.dc.html", "medical/Scores", "/medical/scores", "합격선",
     "호주 의대 합격선 | 대학별 ISAT·UCAT·ATAR 점수 - AusUhak(호주유학)",
     "호주 의대·치대 대학별 최근 합격선과 시험 점수, 성적 기준을 비교해 내 점수로 지원 가능한 학교를 가늠해 보세요.", False),
    ("med/project/Services.dc.html", "medical/Services", "/medical/services", "서비스와 비용",
     "호주 의대 입시 컨설팅 서비스 - AusUhak(호주유학)",
     "호주 의대·치대·수의대 지원 전략, 원서 작성, 인터뷰 준비까지 Wilson이 직접 진행하는 서비스와 진행 방식을 안내합니다.", False),
    ("med/project/UcatMock.dc.html", "medical/UcatMock", "/medical/ucat-mock", "UCAT 모의고사",
     "UCAT ANZ 실전 모의고사 - AusUhak(호주유학)",
     "UCAT ANZ와 같은 영역 구성과 시간으로 풀어 보는 실전 모의고사입니다.", True),
]


def head_meta(src):
    t = re.search(r"<title>(.*?)</title>", src, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', src)
    return (html.unescape(t.group(1).strip()) if t else None, html.unescape(d.group(1)) if d else None)


TOPQ = {
    "검정고시인데 영어가 약해요. 어떻게 시작하나요?": "00-000",
    "검정고시로 호주 의대에 도전할 수 있나요?": "00-003",
    "간호학과, 지금 성적으로도 가능한가요?": "03-000",
    "영어 점수가 없어도 시작할 수 있나요?": "00-021",
    "예산이 적은데 현실적인 방법이 있나요?": "01-003",
    "워홀 중인데 학생비자로 바꿀 수 있나요?": "02-048",
    "한국 대학을 중퇴했는데 다시 시작할 수 있나요?": "00-022",
    "영주권으로 이어지는 전공은 무엇인가요?": "02-044",
}


def preprocess(board, src):
    """Board-level fixes applied before conversion (the design files stay untouched)."""
    if board.endswith("design/project/Main.dc.html"):
        src = src.replace('<sc-for list="{{topQs}}" as="q" hint-placeholder-count="8">\n<a href="#"',
                          '<sc-for list="{{topQs}}" as="q" hint-placeholder-count="8">\n<a href="{{q.url}}"')
        src = src.replace("map((x) => ({ cat: x[0], q: x[1],",
                          "map((x) => ({ cat: x[0], q: x[1], url: '/faq/' + (" + json.dumps(TOPQ, ensure_ascii=False) + "[x[1]] || ''),")
    return src


def run(board, view, linkmap):
    out = os.path.join(ROOT, "src/views", view + ".tsx")
    srcp = os.path.join(SP, board)
    text = preprocess(board, open(srcp, encoding="utf-8").read())
    tmp = os.path.join(ROOT, "tools/.tmp_" + board.replace("/", "_"))
    open(tmp, "w", encoding="utf-8").write(text)
    board_path = tmp
    os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.check_call([sys.executable, os.path.join(ROOT, "tools/dc2tsx.py"), board_path, out,
                           os.path.join(ROOT, linkmap), os.path.join(ROOT, "tools/assetmap.json"),
                           os.path.join(ROOT, "tools/textlinks.json")])
    os.remove(tmp)


def patch_main(path):
    """Make the FAQ search box on the home page a real GET form to /faq."""
    t = open(path, encoding="utf-8").read()
    i = t.find('type={"search"}')
    if i < 0:
        return
    start = t.rfind("<label ", 0, i)
    end = t.find("</label>", i)
    seg = t[start:end + len("</label>")]
    seg2 = seg.replace("<label ", '<form action="/faq" method="get" role="search" ', 1)[:-len("</label>")] + "</form>"
    seg2 = seg2.replace('type={"search"}', 'type={"search"} name="q" aria-label="질문 검색"', 1)
    seg2 = seg2.replace('<button type={"button"}', '<button type={"submit"}', 1)
    t = t[:start] + seg2 + t[end + len("</label>"):]
    open(path, "w", encoding="utf-8").write(t)


def write_page(route, view, crumbs, title, desc, client_only):
    d = os.path.join(ROOT, "src/app", route.strip("/")) if route != "/" else os.path.join(ROOT, "src/app")
    os.makedirs(d, exist_ok=True)
    comp = view.split("/")[-1] + "View"
    lines = ["// Generated by tools/build_views.py", 'import { pageMeta, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";']
    if client_only:
        lines.append('import ClientOnly from "@/components/ClientOnly";')
    lines.append('import %s from "@/views/%s";' % (comp, view))
    lines.append("")
    lines.append("export const metadata = pageMeta(%s);" % json.dumps(
        {"title": title, "description": desc, "path": route}, ensure_ascii=False))
    lines.append("")
    lines.append("const crumbs = %s;" % json.dumps(crumbs, ensure_ascii=False))
    lines.append("")
    lines.append("export default function Page() {")
    lines.append("  return (")
    lines.append("    <>")
    if len(crumbs) > 1:
        lines.append('      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd(crumbs))} />')
    if client_only:
        lines.append("      <ClientOnly><%s /></ClientOnly>" % comp)
    else:
        lines.append("      <%s />" % comp)
    lines.append("    </>")
    lines.append("  );")
    lines.append("}")
    open(os.path.join(d, "page.tsx"), "w").write("\n".join(lines) + "\n")


for board, view, route, crumb, t, dsc, co in SITE_PAGES:
    src = open(os.path.join(SP, board), encoding="utf-8").read()
    ht, hd = head_meta(src)
    run(board, view, "tools/links_design.json")
    if view == "site/Main":
        patch_main(os.path.join(ROOT, "src/views/site/Main.tsx"))
    crumbs = [{"name": "홈", "path": "/"}] + ([{"name": crumb, "path": route}] if route != "/" else [])
    write_page(route, view, crumbs, t or ht, dsc or hd, co)
    print("ok", route)

for board, view, route, crumb, t, dsc, co in MED_PAGES:
    run(board, view, "tools/links_med.json")
    if view == "medical/InterviewLab":
        subprocess.check_call([sys.executable, os.path.join(ROOT, "tools/patch_interview.py"), os.path.join(ROOT, "src/views/medical/InterviewLab.tsx")])
    crumbs = [{"name": "홈", "path": "/"}, {"name": MED, "path": "/medical"}]
    if route != "/medical":
        crumbs.append({"name": crumb, "path": route})
    write_page(route, view, crumbs, t, dsc, co)
    print("ok", route)
