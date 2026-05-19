#!/usr/bin/env python3
"""
master_v2_clean.json + FAQ .md zip -> src/data/*.json (TypeScript import용)

출력 (모두 utf-8, 한 줄로 minified 가능 / 가독성 위해 indent=2):
- src/data/schools.json       (109교 / 각 학교에 programs 압축 임베드)
- src/data/blocking_rules.json (39 / hard|soft 분류 + conditions JSON)
- src/data/wilson_alerts.json (24 / 학생 X / 운영자 only)
- src/data/faqs.json          (83 / card_text + wilson_note + matching meta)
- src/data/pr_categories.json (MLTSSL/STSOL/CSOL 인덱스)
- src/data/index.ts           (export 통합 + 타입 선언)
"""

import json
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT.parent / "ausuhak_v25" / "02_DATABASE" / "ausuhak_master_v2_clean.json"
FAQ_ZIP = ROOT.parent / "ausuhak_v25" / "04_ASSETS" / "ausuhak_complete_package.zip"
OUT = ROOT / "src" / "data"
OUT.mkdir(parents=True, exist_ok=True)

FAQ_ROOT = "ausuhak_faq/"

# 모듈별 기본 카드 (PART F-3 카드 7장)
DEFAULT_CARDS = {"school": [1], "region": [2], "major": [4]}
VISA_PR_CARDS = {
    "학생비자_500": [7], "GS_답변_가이드": [7],
    "485_졸업비자": [5], "PR경로_189_190_491": [5], "직업평가": [5],
}
ALL_VISA_PR_IDS = ["학생비자_500", "485_졸업비자", "PR경로_189_190_491", "GS_답변_가이드", "직업평가"]
MAJOR_NORMALIZE = {
    "간호": "간호", "IT": "IT", "비즈니스": "비즈니스", "공학": "공학",
    "요리호텔": "요리·호텔", "요리": "요리·호텔",
    "유아교육": "유아교육", "디자인": "디자인", "Trade": "Trade",
    "의료": "의료", "미정_추천": "미정", "진로미정": "미정",
    "회계석사": "비즈니스", "회계": "비즈니스",
}


def slugify(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9_-]+", "_", name).strip("_").lower()
    return s[:60] or "unknown"


# 정규화 매칭 키 — master.schools 의 학교명과 majors.all_majors 의 school_name 이
# 다르게 적혀 있어 단순 string match 가 실패하는 케이스 해소용.
# 괄호 안 한글/지역명 제거 + 주 이름 약어화 (Queensland → QLD) + 소문자.
_STATE_LONG_TO_ABBR = {
    "Queensland": "QLD", "Victoria": "VIC", "New South Wales": "NSW",
    "South Australia": "SA", "Western Australia": "WA",
    "Tasmania": "TAS", "Northern Territory": "NT", "Australian Capital Territory": "ACT",
}


def normalize_school_key(name: str) -> str:
    if not name:
        return ""
    s = re.sub(r"\([^)]*\)", "", name)              # (괄호 안) 제거
    s = re.sub(r"[^\x00-\x7F]+", "", s)             # 한글·이모지 제거
    for full, abbr in _STATE_LONG_TO_ABBR.items():
        s = re.sub(rf"\b{full}\b", abbr, s, flags=re.I)
    s = re.sub(r"[/\-_,]", " ", s)
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s


# all_majors 의 학교명 → (canonical_name, type) 명시 매핑.
# 정규화 키로도 매칭 못 잡히는 44개 케이스 + Wilson 정정 (Business School 분리 학교 → 부모 대학으로 통합 등).
NAME_TYPE_OVERRIDES = {
    # ── TAFE 변형 (정규 TAFE 8 + 분교/주별) ─────────────────────────
    "TAFE NSW":                    ("TAFE NSW", "tafe"),
    "TAFE QLD":                    ("TAFE QLD", "tafe"),
    "TAFE QLD Bachelor Nursing":   ("TAFE QLD", "tafe"),       # bachelor of nursing 별도 표기 → 통합
    "TAFE SA":                     ("TAFE SA", "tafe"),
    "TAFE VIC":                    ("TAFE VIC", "tafe"),
    "TAFE Victoria (RMIT TAFE)":   ("TAFE VIC", "tafe"),       # RMIT TAFE = VIC 일부
    "TAFE WA":                     ("TAFE WA", "tafe"),
    "TAFE WA (TIWA)":              ("TAFE WA", "tafe"),
    "TasTAFE TAS":                 ("TasTAFE", "tafe"),
    "CDU TAFE NT":                 ("CDU TAFE", "tafe"),
    "Holmesglen TAFE VIC":         ("Holmesglen TAFE", "tafe"),
    "Box Hill Institute VIC":      ("Box Hill Institute", "tafe"),       # VIC state TAFE
    "Chisholm Institute VIC":      ("Chisholm Institute", "tafe"),       # VIC state TAFE
    "Victoria Univ Polytechnic VIC": ("Victoria University Polytechnic", "tafe"),

    # ── Pathway College (대학 부속 진학 College) ─────────────────────
    "Charles Darwin University Pathway College": ("Charles Darwin University Pathway College", "pathway_college"),
    "Federation Pathway College":                ("Federation Pathway College", "pathway_college"),
    "Griffith College (Pathway College)":        ("Griffith College", "pathway_college"),
    "La Trobe College Australia":                ("La Trobe College Australia", "pathway_college"),
    "Monash College Diploma":                    ("Monash College", "pathway_college"),
    "UTAS College":                              ("UTAS College", "pathway_college"),
    "UTS College":                               ("UTS College", "pathway_college"),
    "Western Sydney University - The College (WSU College)": ("WSU College", "pathway_college"),
    "ECC (Edith Cowan College, 구 PIBT)":        ("Edith Cowan College", "pathway_college"),
    "University of Newcastle College of International Education (UNCIE)": ("UNCIE", "pathway_college"),

    # ── Foundation 변형 ─────────────────────────────────────────────
    "ACU Foundation":                       ("ACU Foundation", "foundation"),
    "UC College Foundation":                ("UC College Foundation", "foundation"),
    "Flinders University Foundation Studies": ("Flinders Foundation", "foundation"),

    # ── 독립 대학 (universities_39 누락) ───────────────────────────
    "CQUniversity Australia":          ("CQUniversity", "university"),
    "Flinders University":             ("Flinders University", "university"),
    "Southern Cross University (SCU)": ("Southern Cross University", "university"),

    # ── Business School 분리 표기 → 부모 대학으로 통합 ───────────────
    "Adelaide University (UoA + UniSA 통합) — Adelaide Business School": ("Adelaide University", "university"),
    "Macquarie University — Macquarie Business School":                  ("Macquarie University", "university"),
    "Monash University — Monash Business School":                        ("Monash University", "university"),
    "University of Melbourne (UMelb) — Melbourne Business School (MBS)": ("University of Melbourne (UMelb)", "university"),
    "UMelb UMelbourne":                                                  ("University of Melbourne (UMelb)", "university"),
    "UNSW Sydney — AGSM (Australian Graduate School of Management)":     ("UNSW Sydney", "university"),
    "University of Queensland (UQ) — UQ Business School":                ("University of Queensland (UQ)", "university"),
    "University of South Australia (UniSA → Adelaide University 통합)":  ("Adelaide University", "university"),
    "University of Sydney (USyd) — USyd Business School":                ("University of Sydney (USyd)", "university"),
    "University of Technology Sydney (UTS) — UTS Business School":       ("University of Technology Sydney (UTS)", "university"),
    "University of Western Australia (UWA) — UWA Business School":       ("University of Western Australia (UWA)", "university"),

    # ── Vocational / Private institute ─────────────────────────────
    "ACAP (Australian College of Applied Professions)":     ("ACAP", "vocational_private"),
    "AIB (Australian Institute of Business)":               ("AIB", "vocational_private"),
    "AIPC (Australian Institute of Professional Counsellors)": ("AIPC", "vocational_private"),
    "APIC (Asia Pacific International College) - ECA 그룹": ("APIC", "vocational_private"),
    "Australian Learning Group (ALG)":                      ("ALG", "vocational_private"),
    "SAIBT (South Australian Institute of Business and":    ("SAIBT", "vocational_private"),  # 정본에 잘린 문자열
    "Stott's College":                                      ("Stott's College", "vocational_private"),

    # ── Phase 2 사립 specialist cookery·hospitality ─────────────────
    "BMIHMS by Torrens (Blue Mountains International Hotel Management School)": ("BMIHMS by Torrens", "vocational_private"),
    "William Blue College of Hospitality (Torrens)":        ("William Blue College", "vocational_private"),
    "Imagine Education Australia":                          ("Imagine Education Australia", "vocational_private"),
    "Australian Pacific College (APC)":                     ("Australian Pacific College", "vocational_private"),
    "Lonsdale Institute":                                   ("Lonsdale Institute", "vocational_private"),  # master 의 elicos_closed_18 라벨 오버라이드

    # ── pseudo-school (PR 트랙 묶음 — 실제 학교 X) ───────────────────
    "⚪ 공통 PR (다중 TAFE)": ("⚪ 공통 PR (다중 TAFE)", "pseudo"),
    "🔵 남자 PR (다중 TAFE)": ("🔵 남자 PR (다중 TAFE)", "pseudo"),
    "🟣 여자 PR (다중 TAFE)": ("🟣 여자 PR (다중 TAFE)", "pseudo"),
}


def infer_type_from_name(name: str) -> str | None:
    """NAME_TYPE_OVERRIDES 에 없는 미지의 학교명 type 휴리스틱 추론."""
    if not name:
        return None
    s = name.lower()
    if name.startswith(("🟣", "🔵", "⚪", "🟠", "🟡", "🟢")):
        return "pseudo"
    if "tafe" in s or "polytechnic" in s:
        return "tafe"
    if "foundation" in s:
        return "foundation"
    if "pathway" in s and "college" in s:
        return "pathway_college"
    if " college" in s and any(uni_kw in s for uni_kw in ("uts", "utas", "monash", "adelaide", "deakin", "griffith", "la trobe", "swinburne")):
        return "pathway_college"
    return None


def canonicalize_school_name(raw_name: str) -> tuple[str, str | None]:
    """all_majors 의 school_name → (정규 학교명, type override).
    NAME_TYPE_OVERRIDES 우선 → infer_type_from_name fallback → 원본 그대로."""
    override = NAME_TYPE_OVERRIDES.get(raw_name)
    if override:
        return override
    inferred = infer_type_from_name(raw_name)
    return (raw_name, inferred)


def classify_type(meta: dict, fallback_type: str | None = None) -> str:
    cat = (meta or {}).get("_source_category", "")
    if "universities" in cat: return "university"
    if "foundation" in cat: return "foundation"
    if "tafe" in cat: return "tafe"
    if "diploma" in cat: return "diploma_verified"
    if "vocational" in cat: return "vocational_private"
    if "elicos" in cat: return "elicos"
    if "under18" in cat: return "under18"
    if "hsp" in cat: return "hsp"
    if fallback_type: return fallback_type
    return "university"


def build_alts(name: str) -> list:
    alts = []
    m = re.search(r"\(([^)]+)\)", name)
    if m:
        alts.append(m.group(1).strip())
    return alts


# ─────────────────────────── FAQ parsing ───────────────────────────

WILSON_RE = re.compile(r"^##\s*⭐\s*Wilson[^\n]*$", re.MULTILINE)
NEXT_H2_RE = re.compile(r"^##\s", re.MULTILINE)
REF_HEADING_RE = re.compile(r"^##\s*🔗\s*참조\s*모듈", re.MULTILINE)
REF_INLINE_RE = re.compile(r"^\*참조\s*모듈\s*:\s*(.*?)\*\s*$", re.MULTILINE)


def decode_zip_name(info):
    n = info.filename
    if not (info.flag_bits & 0x800):
        try:
            return n.encode("cp437").decode("utf-8")
        except Exception:
            return n
    return n


def split_wilson(body: str):
    m = WILSON_RE.search(body)
    if not m:
        return body.strip(), None
    start = m.start()
    after = body[m.end():]
    nx = NEXT_H2_RE.search(after)
    if nx:
        block = body[start:m.end() + nx.start()]
        rest = body[:start] + body[m.end() + nx.start():]
    else:
        block = body[start:]
        rest = body[:start]
    w = re.sub(r"^##\s*⭐\s*Wilson[^\n]*\n", "", block, count=1).strip()
    return rest.strip(), (w or None)


def clean_card(body: str) -> str:
    out, state = [], "before-h1"
    for line in body.split("\n"):
        if state == "before-h1":
            if line.startswith("# "):
                state = "after-h1"
            continue
        if state == "after-h1":
            if line.strip() == "":
                continue
            if line.startswith(">"):
                state = "after-fm"
                continue
            out.append(line); state = "body"; continue
        if state == "after-fm":
            if line.startswith(">") or line.strip() == "":
                continue
            out.append(line); state = "body"; continue
        out.append(line)
    text = "\n".join(out).strip()
    return re.sub(r"^---+\s*\n+", "", text)


def parse_required(body: str) -> dict:
    schools, regions, majors, visa_pr = [], [], [], []
    section = None
    m = REF_HEADING_RE.search(body)
    if m:
        after = body[m.end():]
        nx = NEXT_H2_RE.search(after)
        section = after[: nx.start()] if nx else after
    else:
        m2 = REF_INLINE_RE.search(body)
        if m2:
            section = m2.group(1)
    if section is None:
        return {"schools": [], "regions": [], "majors": [], "visa_pr": []}
    current_dir = None
    for raw in section.split("\n"):
        line = raw.strip(" \t-`*")
        if not line:
            continue
        for token in re.split(r"[,]", line):
            token = token.strip(" \t`")
            if not token:
                continue
            mdir = re.search(r"(0[2-5]_[^/]+)(?:/([^/]+))?/", token)
            if mdir:
                current_dir = (mdir.group(1), mdir.group(2))
            if "01~05" in token and "전체" in token:
                visa_pr = list(ALL_VISA_PR_IDS); continue
            mfile = re.search(r"(\d+_)?([^/`*\s]+?)\.md", token)
            if not mfile or current_dir is None:
                continue
            raw_name = mfile.group(2)
            top, _sub = current_dir
            if top == "02_학교_모듈":
                if raw_name not in schools: schools.append(raw_name)
            elif top == "03_지역_모듈":
                if raw_name not in regions: regions.append(raw_name)
            elif top == "04_전공_모듈":
                norm = MAJOR_NORMALIZE.get(raw_name, raw_name)
                if norm not in majors: majors.append(norm)
            elif top == "05_비자PR_모듈":
                if raw_name not in visa_pr: visa_pr.append(raw_name)
    return {"schools": schools, "regions": regions, "majors": majors, "visa_pr": visa_pr}


def faq_id_for(rel: PurePosixPath):
    parts = rel.parts
    top = parts[0]
    stem = rel.stem
    if top == "01_시나리오":
        sub = parts[-2]
        cat = re.sub(r"^\d+_", "", sub)
        return f"scenario_{cat}_{stem}", "scenario", cat
    name = re.sub(r"^\d+_", "", stem)
    if top == "02_학교_모듈":
        return f"school_{name}", "school", parts[1] if len(parts) > 2 else ""
    if top == "03_지역_모듈":
        return f"region_{name}", "region", ""
    if top == "04_전공_모듈":
        return f"major_{name}", "major", ""
    if top == "05_비자PR_모듈":
        return f"visa_pr_{name}", "visa_pr", ""
    return "", "", ""


def cards_for(faq_id, mt):
    if mt == "scenario":
        return None
    if mt in DEFAULT_CARDS:
        return DEFAULT_CARDS[mt]
    if mt == "visa_pr":
        return VISA_PR_CARDS.get(faq_id[len("visa_pr_"):], [7])
    return None


def derive_scenario_meta(category: str, stem: str) -> dict:
    """파일명 → 6변수 매칭 메타 (PART 0-7 6변수 표준)"""
    education_map = {
        "검정고시": "검정고시", "고졸": "고졸",
        "대학재학": "대학재학", "대졸": "대졸",
        "워홀러": "워홀러",
    }
    edu = education_map.get(category, None)
    # stem 예: "09_간호" / "01_명문대_G8_의대"
    s = re.sub(r"^\d+_", "", stem)
    major = None
    medical = False
    if "간호" in s: major = "간호"
    elif "IT" in s: major = "IT"
    elif "비즈니스" in s or "회계" in s: major = "비즈니스"
    elif "공학" in s: major = "공학"
    elif "요리" in s or "호텔" in s: major = "요리·호텔"
    elif "유아" in s: major = "유아교육"
    elif "디자인" in s: major = "디자인"
    elif "Trade" in s: major = "Trade"
    elif "의대" in s or "의료" in s:
        major = "의료"; medical = True
    elif "미정" in s: major = "미정"
    return {
        "education": [edu] if edu else [],
        "major": [major] if major else [],
        "is_medical": medical,
    }


# ─────────────────────────── main ───────────────────────────

def main():
    print(f"Loading master: {MASTER}")
    with open(MASTER, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ─── schools ───
    # all_majors 학교명 → canonical name + 추론 type 매핑 적용.
    # 매핑된 결과를 그룹핑하니까 "TAFE QLD" + "TAFE QLD Bachelor Nursing" 등 변형이 한 학교로 통합됨.
    majors = data["majors"]["all_majors"]
    schools_by_name = defaultdict(list)
    inferred_type_for_canon: dict[str, str | None] = {}
    pseudo_dropped = 0
    for m in majors:
        n = m.get("school_name")
        if not n: continue
        canon, inferred = canonicalize_school_name(n)
        if inferred == "pseudo":
            pseudo_dropped += 1
            continue
        schools_by_name[canon].append(m)
        if inferred and canon not in inferred_type_for_canon:
            inferred_type_for_canon[canon] = inferred

    # meta_by_name 인덱스 = (a) original 이름 (b) normalize_school_key 결과 두 가지 키로 등록.
    # 두 set 이름이 다른 (e.g. "TAFE NSW" vs "TAFE NSW (시드니)") 케이스도 정상 join.
    meta_by_name = {}
    meta_by_key = {}
    for cat_key, items in data["schools"].items():
        if cat_key.startswith("_") or not isinstance(items, list): continue
        for it in items:
            if not isinstance(it, dict): continue
            n = it.get("school_name") or it.get("name")
            if not n: continue
            if n not in meta_by_name:
                meta_by_name[n] = {**it, "_source_category": cat_key}
            k = normalize_school_key(n)
            if k and k not in meta_by_key:
                meta_by_key[k] = {**it, "_source_category": cat_key}

    schools_out = []
    for name in sorted(schools_by_name.keys()):
        # 메타 조회: original 이름 → 정규화 키 fallback
        meta = meta_by_name.get(name)
        if not meta:
            meta = meta_by_key.get(normalize_school_key(name), {})
        progs = schools_by_name[name]
        # campus: meta 의 campus 가 비어있거나 "확인필요" 이면 program 들의 campus 합집합으로 보강.
        meta_campus = (meta.get("campus") or "").strip()
        if not meta_campus or meta_campus == "확인필요":
            prog_campuses = []
            for p in progs:
                pc = (p.get("campus") or "").strip()
                if pc and pc != "확인필요" and pc not in prog_campuses:
                    prog_campuses.append(pc)
            campus = prog_campuses[0] if prog_campuses else meta_campus
        else:
            campus = meta_campus
        st_match = re.search(r"\((NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\)", campus)
        city_match = re.match(r"([^(]+)", campus)
        city = (city_match.group(1).strip().split()[0] if city_match and city_match.group(1).strip() else None)
        qs = None
        qs_raw = meta.get("qs_ranking") or ""
        m_qs = re.search(r"\d+", str(qs_raw))
        if m_qs: qs = int(m_qs.group(0))
        founded = None
        if meta.get("founded"):
            m_f = re.search(r"\d{4}", str(meta["founded"]))
            if m_f: founded = int(m_f.group(0))

        progs_clean = []
        for p in progs:
            progs_clean.append({
                "id": p.get("major_id"),
                "name": p.get("major_name"),
                "level": p.get("level"),
                "duration": p.get("duration"),
                "tuition": p.get("tuition_2026"),
                "ielts": p.get("ielts"),
                "entry": p.get("entry_requirement"),
                "pr_cat": p.get("pr_category"),
                "pr_grade": p.get("pr_grade"),
                "campus": p.get("campus"),
                "note": p.get("note"),
            })

        has_nursing = any("Nursing" in (p.get("major_name") or "") or "간호" in (p.get("major_name") or "") for p in progs)
        anmac = bool(has_nursing) and not ("UNSW" in name.upper() and not has_nursing)

        schools_out.append({
            "id": slugify(name),
            "name": name,
            "alts": build_alts(name),
            "type": classify_type(meta, inferred_type_for_canon.get(name)),
            "city": city,
            "state": st_match.group(1) if st_match else None,
            "campus": campus or None,
            "cricos": meta.get("cricos") or None,
            "anmac": anmac if anmac else None,
            "qs": qs,
            "founded": founded,
            "operator": meta.get("operator") or None,
            "programs": progs_clean,
        })
    # ── Foundation 8 (master.schools.foundation_8) ──
    # all_majors에 안 들어있어서 별도 처리 (학사 직접 진학 X, Pathway 경유 트랙)
    for it in data["schools"].get("foundation_8", []):
        if not isinstance(it, dict): continue
        name = it.get("school_name") or it.get("name")
        if not name: continue
        campus = it.get("campus") or ""
        st_match = re.search(r"\((NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\)", campus)
        qs_raw = it.get("qs_ranking") or ""
        # "Top 20 (Go8)" → 20
        m_qs = re.search(r"\d+", str(qs_raw))
        qs = int(m_qs.group(0)) if m_qs else None
        operator = it.get("operator") or ""
        # Operator 끝의 괄호 안 = linked university (e.g. "직접 운영 (University of Melbourne)")
        op_m = re.search(r"\(([^)]+University[^)]*)\)", operator)
        linked_uni = op_m.group(1).strip() if op_m else operator
        program = {
            "id": f"FND-{slugify(name)[:20]}",
            "name": it.get("course_name") or "Foundation Studies",
            "level": "Foundation",
            "duration": (it.get("duration") or "").split("/")[0].strip()[:80] or None,
            "tuition": (it.get("tuition") or "").split("/")[0].strip()[:80] or None,
            "ielts": it.get("ielts") or None,
            "entry": it.get("academic") or it.get("gpa") or None,
            "pathway": it.get("pathway_options") or None,
            "linked_university": linked_uni or None,
        }
        schools_out.append({
            "id": slugify(name),
            "name": name,
            "alts": build_alts(name),
            "type": "foundation",
            "city": None,
            "state": st_match.group(1) if st_match else None,
            "campus": campus or None,
            "cricos": it.get("cricos") or None,
            "anmac": None,
            "qs": qs,
            "founded": None,
            "operator": linked_uni or None,
            "programs": [program],
        })

    # ── Diploma 22 (master.schools.diploma_verified_22) ──
    for it in data["schools"].get("diploma_verified_22", []):
        if not isinstance(it, dict): continue
        sch_raw = it.get("school") or ""
        if not sch_raw: continue
        # "UC-001 UTS College Sydney" → name="UTS College", city="Sydney"
        m_sch = re.match(r"([A-Z]{1,3}-\d+\s+)?(.+?)\s+(Sydney|Melbourne|Brisbane|Perth|Adelaide|Gold Coast|Hobart|Canberra|Newcastle|Wollongong|Townsville)(\s+.*)?$", sch_raw)
        if m_sch:
            name = m_sch.group(2).strip()
            city = m_sch.group(3).strip()
        else:
            name = re.sub(r"^[A-Z]{1,3}-\d+\s+", "", sch_raw).strip()
            city = None
        if not name: continue
        # Detail 안의 programs 정보는 dict / 깊은 파싱 생략 (Phase 2)
        det = it.get("detail")
        det_keys = list(det.keys())[:3] if isinstance(det, dict) else []
        program = {
            "id": f"DIP-{slugify(name)[:20]}",
            "name": "Diploma → 학사 2학년 편입",
            "level": "Diploma",
            "note": " / ".join(str(k)[:40] for k in det_keys) if det_keys else None,
        }
        schools_out.append({
            "id": slugify(name),
            "name": name,
            "alts": [],
            "type": "diploma_verified",
            "city": city,
            "state": None,
            "campus": city or None,
            "cricos": None,
            "anmac": None,
            "qs": None,
            "founded": None,
            "operator": None,
            "programs": [program],
        })

    (OUT / "schools.json").write_text(json.dumps(schools_out, ensure_ascii=False, indent=0), encoding="utf-8")
    type_counts = defaultdict(int)
    for s in schools_out:
        type_counts[s["type"]] += 1
    print(f"  schools: {len(schools_out)} (pseudo dropped: {pseudo_dropped})")
    for t, n in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"    {t}: {n}")

    # ─── blocking_rules ───
    blocking_out = []
    br39 = data.get("blocking_rules", {}).get("blocking_rules_39", {})

    def emit_br(rule, cat):
        rid = rule.get("id") or f"BLOCK-{len(blocking_out)+1:03d}"
        prio = rule.get("priority") or ""
        sev = "hard" if ("절대" in prio or "🔴" in prio) else "soft"
        blocking_out.append({
            "id": rid,
            "severity": sev,
            "category": cat,
            "title": rule.get("rule_name") or rid,
            "condition": rule.get("condition"),
            "action": rule.get("action") or "exclude",
            "alternative": rule.get("alternative"),
            "wilson_reason": rule.get("wilson_reason"),
            "raw": rule,
        })

    for cat_key, content in br39.items():
        if cat_key.startswith("_") or not isinstance(content, dict): continue
        rules = content.get("rules")
        if isinstance(rules, list):
            for r in rules:
                if isinstance(r, dict): emit_br(r, cat_key)
        elif isinstance(rules, dict):
            # category_6: rules is { nursing: [...], cookery: [...], it: [...] }
            for mk, mrules in rules.items():
                if isinstance(mrules, list):
                    for r in mrules:
                        if isinstance(r, dict): emit_br(r, f"{cat_key}_{mk}")
    (OUT / "blocking_rules.json").write_text(json.dumps(blocking_out, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"  blocking_rules: {len(blocking_out)}")

    # ─── wilson_alerts ───
    alerts_out = []
    for k, items in (data.get("wilson_alerts") or {}).items():
        if k.startswith("_") or not isinstance(items, list): continue
        for a in items:
            if not isinstance(a, dict): continue
            alerts_out.append({
                "id": a.get("alert_id") or f"ALERT-{len(alerts_out)+1:03d}",
                "title": a.get("title"),
                "quote": a.get("wilson_quote"),
                "principle": a.get("principle"),
                "truth": a.get("wilson_truth"),
                "applies_to": a.get("applies_to"),
                "marketing": a.get("marketing_application"),
                "conditions": a.get("conditions") or {},
            })
    (OUT / "wilson_alerts.json").write_text(json.dumps(alerts_out, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"  wilson_alerts: {len(alerts_out)}")

    # ─── pr_categories index ───
    pr_idx = data.get("majors", {}).get("pr_categories")
    if pr_idx:
        (OUT / "pr_categories.json").write_text(json.dumps(pr_idx, ensure_ascii=False, indent=0), encoding="utf-8")
        print(f"  pr_categories: written")

    # ─── FAQs ───
    print(f"Loading FAQ zip: {FAQ_ZIP}")
    faqs_out = []
    counts = defaultdict(int)
    with zipfile.ZipFile(FAQ_ZIP, "r") as zf:
        for info in zf.infolist():
            n = decode_zip_name(info)
            if not n.startswith(FAQ_ROOT) or not n.endswith(".md") or n.endswith("README.md"):
                continue
            rel = PurePosixPath(n[len(FAQ_ROOT):])
            if str(rel) == ".":
                continue
            body = zf.read(info).decode("utf-8")
            faq_id, mt, cat = faq_id_for(rel)
            if not faq_id:
                continue
            counts[mt] += 1

            body_no_w, wilson = split_wilson(body)
            card_text = clean_card(body_no_w)
            cards = cards_for(faq_id, mt)
            req = parse_required(body) if mt == "scenario" else None
            scenario_meta = derive_scenario_meta(cat, rel.stem) if mt == "scenario" else None

            entry = {
                "id": faq_id,
                "type": mt,
                "category": cat or None,
                "card_text": card_text,
                "wilson_note": wilson,
                "cards": cards,
                "required": req,
                "match": scenario_meta,
            }
            # strip Nones for size
            faqs_out.append({k: v for k, v in entry.items() if v is not None})

    (OUT / "faqs.json").write_text(json.dumps(faqs_out, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"  faqs: {len(faqs_out)} ({dict(counts)})")

    # ─── index.ts ───
    index_ts = '''// AUTO-GENERATED by scripts/embed_master_to_src.py — DO NOT EDIT
// 정본: ausuhak_v25/02_DATABASE/ausuhak_master_v2_clean.json (Wilson 검수 2026-05-08)
import schoolsData from "./schools.json";
import blockingData from "./blocking_rules.json";
import alertsData from "./wilson_alerts.json";
import faqsData from "./faqs.json";

export type Program = {
  id?: string; name?: string; level?: string; duration?: string;
  tuition?: string | number; ielts?: string | number; entry?: string;
  pr_cat?: string; pr_grade?: string; campus?: string; note?: string;
};
export type School = {
  id: string; name: string; alts: string[]; type: string;
  city: string | null; state: string | null; campus: string | null;
  cricos: string | null; anmac: boolean | null;
  qs: number | null; founded: number | null; operator: string | null;
  programs: Program[];
};
export type BlockingRule = {
  id: string; severity: "hard" | "soft"; category: string; title: string;
  condition?: string | null; action: string;
  alternative?: string | null; wilson_reason?: string | null;
  raw: Record<string, unknown>;
};
export type WilsonAlert = {
  id: string; title?: string | null; quote?: string | null;
  principle?: string | null; truth?: string | null;
  applies_to?: string | null; marketing?: string | null;
  conditions: Record<string, unknown>;
};
export type FaqEntry = {
  id: string;
  type: "scenario" | "school" | "region" | "major" | "visa_pr";
  category?: string;
  card_text: string;
  wilson_note?: string;
  cards?: number[];
  required?: { schools: string[]; regions: string[]; majors: string[]; visa_pr: string[] };
  match?: { education: string[]; major: string[]; is_medical: boolean };
};

export const schools = schoolsData as School[];
export const blockingRules = blockingData as BlockingRule[];
export const wilsonAlerts = alertsData as WilsonAlert[];
export const faqs = faqsData as FaqEntry[];

// 인덱스 (매칭 성능)
export const schoolsByName: Record<string, School> = Object.fromEntries(schools.map((s) => [s.name, s]));
export const schoolsById: Record<string, School> = Object.fromEntries(schools.map((s) => [s.id, s]));
export const faqsByType: Record<string, FaqEntry[]> = faqs.reduce((acc, f) => {
  (acc[f.type] ||= []).push(f);
  return acc;
}, {} as Record<string, FaqEntry[]>);
'''
    (OUT / "index.ts").write_text(index_ts, encoding="utf-8")
    print(f"  index.ts: written")

    # 파일 크기 요약
    for p in sorted(OUT.glob("*")):
        print(f"   {p.name}: {p.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
