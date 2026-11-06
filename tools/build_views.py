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
    ("design/project/Main.dc.html", "site/Main", "/", "홈", "호주 유학 상담 | 간호·약대·의대 진학 - AusUhak(호주유학)", "호주 대학 교직원 출신 Wilson이 20년 동안 650명 이상을 보냈습니다. 시드니대·모나쉬·UNSW 실제 합격증 45건, 간호·약대·의대 진학과 학생비자, 출국 전 대치동 강사 준비까지 한 곳에서 상담합니다.", False),
    ("design/project/ToolPoints.dc.html", "site/ToolPoints", "/tools/points", "영주권 점수 계산기", "호주 영주권 점수 계산기 | 189 기술이민 점수표 - AusUhak(호주유학)", "호주 이민성 독립 기술이민(189) 점수표로 나이, 영어, 학력, 경력, 주정부 지명 점수를 넣어 졸업 후 예상 영주권 점수를 계산해 보세요.", False),
    ("design/project/ToolSchedule.dc.html", "site/ToolSchedule", "/tools/schedule", "입학 일정 계산", "호주 대학 입학 일정 거꾸로 계산 - AusUhak(호주유학)", "원하는 호주 대학 입학 시기를 고르면 영어 시험, 지원, 학생비자까지 오늘부터 해야 할 일을 거꾸로 계산해 드립니다.", False),
    ("design/project/ToolRoute.dc.html", "site/ToolRoute", "/tools/route", "진학 노선도", "호주 진학 노선도 | 검정고시·고졸·대졸 학력별 루트 - AusUhak(호주유학)", "검정고시, 고졸, 대학 재학, 대졸, 직장인, 조기유학까지 지금 학력을 고르면 호주 대학 입학부터 취업까지 가는 길이 단계별로 나옵니다.", False),
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


# Old board palettes mapped onto the site palette used by the home page
# (ink #1C1F24, body #454B55, muted #5C6370, line #E7E7E4, alt ground #F3F3F1, wine #8E2A3B).
SITE_COLORS = {
    "#0F1B2D": "#1C1F24", "#0A2540": "#15171B", "#1B2A41": "#2A2E35", "#0E3A6B": "#6E1F2D",
    "#0E4C92": "#8E2A3B", "#4A5568": "#454B55", "#5B6577": "#5C6370", "#5A6475": "#5C6370",
    "#33506E": "#454B55", "#AEB6C2": "#A3A6AB", "#9FB0C6": "#A3A6AB", "#C9D3E1": "#C8C9C6",
    "#C9D3E0": "#C8C9C6", "#8EC5FF": "#F2D9DE", "#6FA3DA": "#C98A95", "#C5DAF0": "#E7E7E4", "#E3E8EF": "#E7E7E4",
    "#F5F7FA": "#F3F3F1", "#EAF2FB": "#F3F3F1", "#EEF2F7": "#F3F3F1", "#E6EEF6": "#ECECE9",
    "#F0F4F9": "#F3F3F1", "#E7F0FB": "#FBF1F3", "#D5DCE6": "#E7E7E4", "#5B43A0": "#8E2A3B",
    "#9B2C3E": "#8E2A3B", "#7A1F30": "#6E1F2D", "#1F6B5C": "#1C1F24", "#E4F1EC": "#F3F3F1",
    "#173F33": "#15171B", "#14231D": "#15171B", "#A3521F": "#8E2A3B", "#8A5A1F": "#454B55",
    "#FFF6DD": "#FBF1F3", "#8A6A00": "#6E1F2D", "#6B5A1E": "#6E1F2D", "#4A3A00": "#6E1F2D",
    "#3D4757": "#454B55", "#1F2A3A": "#1C1F24",
    # medical centre
    "#0B1F3A": "#1C1F24", "#071629": "#15171B", "#12305A": "#2A2E35", "#1F2A5C": "#2A2E35",
    "#24346E": "#2A2E35", "#213F6B": "#454B55", "#3A4A8C": "#454B55", "#2B3A4F": "#454B55",
    "#5B6676": "#5C6370", "#7F8EA0": "#8A8D92", "#1C2430": "#1C1F24", "#C8432F": "#8E2A3B",
    "#A8331F": "#6E1F2D", "#8A2A1C": "#6E1F2D", "#FBEDEA": "#FBF1F3", "#FFF6F4": "#FBF1F3",
    "#FF8A73": "#F2D9DE", "#E0A526": "#F2D9DE", "#8A5A00": "#6E1F2D", "#6B4A00": "#6E1F2D",
    "#B7791F": "#8E2A3B", "#FDF3DC": "#FBF1F3", "#F6EAD0": "#F2D9DE", "#F7F8F6": "#F3F3F1",
    "#DDE2E0": "#E7E7E4", "#DCE3EA": "#E7E7E4", "#E3E8E5": "#E7E7E4", "#C9D3DE": "#C8C9C6",
    "#E9EEF5": "#F3F3F1", "#E4EAF1": "#ECECE9", "#ECEEF1": "#ECECE9", "#EEF1EF": "#F3F3F1",
    "#F2F5F3": "#F3F3F1", "#EEF2EF": "#F3F3F1", "#C5CDD3": "#C8C9C6", "#B8C4D2": "#C8C9C6",
    "#A9B6C4": "#A3A6AB", "#B9C2C8": "#C8C9C6",
}
# Green marks right answers and done states in the exam screens; elsewhere it becomes ink.
GREENS = {"#0F6E5A": "#1C1F24", "#0A5546": "#15171B", "#E2F0EB": "#F3F3F1", "#9CCFC0": "#C8C9C6",
          "#DDEFE8": "#F3F3F1", "#CFE6DD": "#E7E7E4"}
EXAM_BOARDS = ("Mock.dc.html", "UcatMock.dc.html", "Practice.dc.html", "InterviewLab.dc.html")
RGBA = {"11,31,58": "28,31,36", "15,27,45": "28,31,36", "14,76,146": "142,42,59", "245,247,250": "243,243,241",
        "10,37,64": "21,23,27", "200,67,47": "142,42,59", "142,197,255": "242,217,222", "7,22,41": "21,23,27"}


FLAT = ["linear-gradient(155deg, #0A2540 0%, #0E3A6B 60%, #0E4C92 100%)",
        "linear-gradient(155deg, #071B33 0%, #0B3360 60%, #0E4C92 100%)",
        "linear-gradient(120deg, #0F6E5A 0%, #0B1F3A 100%)"]


def recolor(board, src):
    for g in FLAT:  # decorative blue hero gradients become the flat ink ground
        src = src.replace(g, "#1C1F24")
    src = src.replace("background: #F2C14E; color: #0F1B2D", "background: #8E2A3B; color: #FFFFFF").replace("#F2C14E", "#F2D9DE")
    table = dict(SITE_COLORS)
    if not board.endswith(EXAM_BOARDS):
        table.update(GREENS)
    src = re.sub(r"#[0-9A-Fa-f]{6}\b", lambda m: table.get(m.group(0).upper(), m.group(0)), src)
    def rgba(m):
        k = re.sub(r"\s", "", m.group(2))
        return m.group(1) + RGBA.get(k, m.group(2))
    return re.sub(r"(rgba?\()(\s*\d+\s*,\s*\d+\s*,\s*\d+)", rgba, src)


SHELL_BOARDS = ("Nursing", "Pharmacy", "Business", "IT", "Cookery", "EarlyStudy", "GeneralEnglish",
                "HiddenMajors", "GED", "Visa", "ToolPoints", "ToolSchedule", "ToolRoute")


def uses_shell(board):
    return board.startswith("design/project/") and os.path.basename(board)[:-8] in SHELL_BOARDS


def strip_chrome(src):
    """Drop the board's own header, footer and phone bars; BoardShell supplies the shared ones."""
    src = re.sub(r"<header\b.*?</header>\s*", "", src, count=1, flags=re.S)
    i = src.rfind("<footer")
    if i >= 0:
        j = src.find("</footer>", i)
        src = src[:i] + src[j + len("</footer>"):]
    src = re.sub(r'<a [^>]*class="kakao-float".*?</a>\s*', "", src, flags=re.S)
    src = re.sub(r'<nav [^>]*class="(?:mobile-dock|bar)".*?</nav>\s*', "", src, flags=re.S)
    return src


def _rep(src, a, b, n=1):
    assert a in src, (a[:70])
    return src.replace(a, b, n)


def patch_paid(board, src):
    """Paid exam content: entitlement comes from /api/pay/status, questions from /api/content (see src/lib/medpay.ts)."""
    src = re.sub(r'<label [^>]*><input type="checkbox" onChange="\{\{toggleAdmin\}\}"[^>]*>검수 모드[^<]*</label>', "", src)
    status = ("fetch('/api/pay/status').then(function (r) { return r.json(); }).then(function (s) { "
              "self.setState({ admin: !!s.admin, owned: (s.owned || {})['%s'] || {}, pay: s }); }).catch(function () {});\n    ")
    if board.endswith("Practice.dc.html"):
        src = _rep(src, "try { admin = window.localStorage.getItem('bank-admin') === '1'; } catch (e) {}", "")
        src = _rep(src, "fetch('/_blob/81614ab32359623e7fc904052024d987').then(function (r) { return r.json(); }).then(function (d) { self.setState({ d: d }); })",
                   (status % "isat") + "fetch('/api/content/isat-bank').then(function (r) { return r.json(); }).then(function (d) { self.setState({ d: d, full: !!d.full }); })")
        src = _rep(src, "var isFree = function (it) { return S.admin || freeIds[it.id]; };",
                   "var isFree = function (it) { return S.admin || S.full || freeIds[it.id]; };")
        src = src.replace(">실전 모의고사는 세트당 30,000원이며, 구독 없이 필요한 세트만 고르면 됩니다.<",
                          ">실전 모의고사 세트(30,000원)를 하나라도 구매하면 문제은행 전체가 열립니다.<")
        return src
    exam = "ucat" if board.endswith("UcatMock.dc.html") else "isat"
    src = re.sub(r'("MOCK-\d\d": )"/_blob/([0-9a-f]{32})"', r'\1"/api/content/\2"', src)
    src = _rep(src, "admin: lsGet('bank-admin', 0) === 1 }", "admin: false, owned: {}, pay: null }")
    src = _rep(src, "  componentDidMount() {\n    var self = this;\n", "  componentDidMount() {\n    var self = this;\n    " + (status % exam))
    if exam == "isat":
        src = _rep(src, "var s = sessions[id], open = S.admin || FREE_MOCKS[id],", "var s = sessions[id], open = S.admin || FREE_MOCKS[id] || (S.owned || {})[id],")
        lock_old, lock_new = "locked: !open,", "locked: !open || (!!FREE_MOCKS[id] && !S.admin && !(S.owned || {})[id]),"
    else:
        src = _rep(src, "open = ready && (S.admin || FREE_MOCKS[id]),", "open = ready && (S.admin || FREE_MOCKS[id] || (S.owned || {})[id]),")
        lock_old, lock_new = "locked: ready && !open,", "locked: ready && (!open || (!!FREE_MOCKS[id] && !S.admin && !(S.owned || {})[id])),"
    buy = (" buy: function () { if (window.ausuhakBuy) window.ausuhakBuy('%s', id); else location.href = '/medical/services'; },"
           " buyLabel: S.pay && S.pay.payEnabled ? '30,000원에 전체 풀기' : '세트당 30,000원',") % exam
    src = _rep(src, lock_old, lock_new + buy)
    src = _rep(src, "if (FREE_MOCKS[id] && !self.state.admin)", "if (FREE_MOCKS[id] && !self.state.admin && !(self.state.owned || {})[id])")
    src = _rep(src, "if (FREE_MOCKS[S.mock] && !S.admin)", "if (FREE_MOCKS[S.mock] && !S.admin && !(S.owned || {})[S.mock])")
    src, n = re.subn(r'<a href="Services\.dc\.html" style="([^"]*)">세트당 30,000원</a>',
                     r'<button type="button" onClick="{{m.buy}}" style="\1; border: 0; font: inherit; font-weight: 800; cursor: pointer">{{m.buyLabel}}</button>', src)
    assert n == 1, n
    return src


def preprocess(board, src):
    """Board-level fixes applied before conversion (the design files stay untouched)."""
    if not board.endswith("design/project/Main.dc.html"):
        src = recolor(board, src)
    if uses_shell(board):
        src = strip_chrome(src)
    if board.endswith(("Mock.dc.html", "UcatMock.dc.html", "Practice.dc.html")):
        src = patch_paid(board, src)
    if board.startswith("med/"):
        src = src.replace("호주유학 메디컬", "AusUhak 메디컬").replace('href="https://ausuhak.com"', 'href="/"')
        src = re.sub(r'<span style="([^"]*)">(AusUhak 메디컬 · (?:인터뷰 연습실|문제은행))</span>',
                     r'<h1 style="\1; margin: 0; font-size: 16px">\2</h1>', src, count=1)
        src = src.replace(">PREMIUM 체험판<", ">AI 채점 3문제 무료<")
        src = (src.replace("호주유학 홈", "AusUhak 홈")
                  .replace("인터뷰는 앱으로 매일 연습합니다", "인터뷰는 이 사이트에서 매일 연습합니다")
                  .replace("공부는 앱으로, 부족한 과목은 선생님과", "시험 공부는 모의고사로, 부족한 과목은 대치동 강사와")
                  .replace("공부는 앱으로, 과목은 선생님과", "시험 공부는 모의고사로, 과목은 대치동 강사와"))
        # class hooks so the phone layout can tighten the medical header (see globals.css)
        src = src.replace('<div style="background: #1C1F24; color: #E7E7E4; font-size: 14px">', '<div class="med-notice" style="background: #1C1F24; color: #E7E7E4; font-size: 14px">', 1)
        i = src.find('<nav aria-label="주요 메뉴"')
        if i >= 0 and "<header" in src[:i]:
            src = src[:i] + '<nav class="med-nav"' + src[i + 4:]
            j = src.find("</nav>", i)
            k = src.find('<div style="display: flex; gap: 6px; align-items: center">', j)
            if 0 <= k - j < 20:
                src = src[:k] + '<div class="med-acts"' + src[k + 4:]
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


def patch_home_fonts(path):
    """The home board names Google faces; the site loads Pretendard globally and Noto Serif KR via next/font."""
    t = open(path, encoding="utf-8").read()
    t = t.replace("'IBM Plex Sans KR'", "'Pretendard Variable','Pretendard'")
    t = t.replace("var(--font-serif-kr),'Noto Serif KR'", "'Noto Serif KR'")
    open(path, "w", encoding="utf-8").write(t)


def patch_home_images(path):
    """Home page: WebP photos (phone-sized copy where one exists), lazy loading below the fold,
    high priority for the first photo, and a <main> landmark around the page sections."""
    t = open(path, encoding="utf-8").read()
    home = os.path.join(ROOT, "public/assets/home")

    def webp(m):
        name = m.group(1)
        return "/assets/home/%s.webp" % name if os.path.exists(os.path.join(home, name + ".webp")) else m.group(0)
    t = re.sub(r"/assets/home/([A-Za-z0-9_]+)\.jpg", webp, t)

    def img(m):
        tag = m.group(0)
        if "loading=" in tag or "fetchPriority" in tag:
            return tag
        sm = re.search(r'src=\{"/assets/home/([A-Za-z0-9_]+)\.webp"\}', tag)
        extra = ""
        first = 'className={"layer"}' in tag or 'className={"f1"}' in tag
        if 'className={"f2"}' in tag or 'className={"f3"}' in tag:
            return tag[:-3] + ' fetchPriority={"high"} decoding={"async"} />'

        if sm and os.path.exists(os.path.join(home, sm.group(1) + "-800.webp")):
            n = sm.group(1)
            sizes = "100vw" if first else "(max-width: 1023px) 100vw, 50vw"
            extra += ' srcSet={"/assets/home/%s-800.webp 800w, /assets/home/%s.webp 1400w"} sizes={"%s"}' % (n, n, sizes)
        elif "src={v?.active?.img}" in tag:
            extra += ' srcSet={`${(v?.active?.img ?? "").replace(".webp", "-800.webp")} 800w, ${v?.active?.img} 1456w`} sizes={"(max-width: 1023px) 100vw, 58vw"}'
        extra += ' fetchPriority={"high"} decoding={"async"}' if first else ' loading={"lazy"} decoding={"async"}'
        return tag[:-3] + extra + " />" if tag.endswith(" />") else tag
    t = re.sub(r"<img [^>]*?/>", img, t)
    t = t.replace('<img className={"pthumb"} src={m?.img}', '<img className={"pthumb"} src={(m?.img ?? "").replace(".webp", "-t.webp")} width={76} height={76}', 1)

    if "<main" not in t and "</header>" in t and '<footer className={"closing"}>' in t:
        t = t.replace("</header>", "</header><main>", 1)
        t = t.replace('<footer className={"closing"}>', '</main><footer className={"closing"}>', 1)
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
    if title:
        title = title.replace("- 호주유학 Wilson", "- AusUhak(호주유학)")
    lines.append("export const metadata = pageMeta(%s);" % json.dumps(
        {"title": title, "description": desc, "path": route}, ensure_ascii=False))
    lines.append("")
    lines.append("const crumbs = %s;" % json.dumps(crumbs, ensure_ascii=False))
    lines.append("")
    if route == "/":
        lines.insert(2, 'import { getPosts, fmtDate } from "@/lib/content";')
        lines.append("export const revalidate = 300;")
        lines.append("")
        lines.append("export default async function Page() {")
        lines.append("  const posts = (await getPosts()).slice(0, 3);")
        lines.append("  const news = posts.length ? posts.map((p) => ({ href: `/news/${p.slug}`, cat: p.category || \"소식\", date: fmtDate(p.published_at), title: p.title.replace(/^\\[[^\\]]*\\]\\s*/, \"\").split(\" — \")[0], excerpt: p.excerpt || \"\" })) : undefined;")
        lines.append("  return (")
        lines.append("    <>")
        lines.append("      <%s news={news} />" % comp)
        lines.append("    </>")
        lines.append("  );")
        lines.append("}")
        open(os.path.join(d, "page.tsx"), "w").write("\n".join(lines) + "\n")
        return
    shell = uses_shell(board_of.get(route, ""))
    paid = route in ("/medical/isat-mock", "/medical/ucat-mock")
    if paid:
        lines.insert(2, 'import PayBridge from "@/components/PayBridge";')
    if shell:
        lines.insert(2, 'import { BoardShell } from "@/components/SiteShell";')
    lines.append("export default function Page() {")
    lines.append("  return (")
    med = route.startswith("/medical")
    lines.append("    <BoardShell current=%s>" % json.dumps(route) if shell else ('    <div className="ux-med">' if med else "    <>"))
    if len(crumbs) > 1:
        lines.append('      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd(crumbs))} />')
    if paid:
        lines.append("      <PayBridge />")
    if client_only:
        lines.append("      <ClientOnly><%s /></ClientOnly>" % comp)
    else:
        lines.append("      <%s />" % comp)
    lines.append("    </BoardShell>" if shell else ("    </div>" if med else "    </>"))
    lines.append("  );")
    lines.append("}")
    open(os.path.join(d, "page.tsx"), "w").write("\n".join(lines) + "\n")


board_of = {r: b for b, v, r, *_ in SITE_PAGES}

for board, view, route, crumb, t, dsc, co in SITE_PAGES:
    src = open(os.path.join(SP, board), encoding="utf-8").read()
    ht, hd = head_meta(src)
    run(board, view, "tools/links_design.json")
    if view == "site/Main":
        patch_main(os.path.join(ROOT, "src/views/site/Main.tsx"))
        patch_home_fonts(os.path.join(ROOT, "src/views/site/Main.tsx"))
        patch_home_images(os.path.join(ROOT, "src/views/site/Main.tsx"))
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
