#!/usr/bin/env python3
"""
FAQ 83개 .md 콘텐츠 파싱 → 006_data_faqs_content.sql 생성 (Phase 1.5)

기존 005는 메타데이터만 INSERT (콘텐츠 4필드 = NULL).
006은 UPDATE로 콘텐츠 4필드를 채움:
- card_text     = .md 본문 (Wilson 추천 섹션 제외)
- wilson_note   = '## ⭐ Wilson' 섹션 (있으면)
- internal_data = NULL (Phase 2에서 Wilson이 admin UI로 채움)
- matching_cards    = 모듈 타입별 기본값
- required_modules  = 시나리오 파일의 '🔗 참조 모듈' 섹션 파싱

입력: ausuhak_v25/04_ASSETS/ausuhak_complete_package.zip
출력: supabase/migrations/006_data_faqs_content.sql
"""

import json
import re
import sys
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_SQL = ROOT / "supabase" / "migrations" / "006_data_faqs_content.sql"
ZIP_PATH = ROOT.parent / "ausuhak_v25" / "04_ASSETS" / "ausuhak_complete_package.zip"
FAQ_ROOT = "ausuhak_faq/"

# 모듈 타입별 카드 번호 (PART F-3 카드 7장 배치)
DEFAULT_CARDS = {
    "school": [1],
    "region": [2],
    "major": [4],
}

# visa_pr 파일별 카드 배치
VISA_PR_CARDS = {
    "학생비자_500": [7],
    "GS_답변_가이드": [7],
    "485_졸업비자": [5],
    "PR경로_189_190_491": [5],
    "직업평가": [5],
}

# 6변수 표준 매핑 (PART 0-7)
MAJOR_NORMALIZE = {
    "간호": "간호", "IT": "IT", "비즈니스": "비즈니스", "공학": "공학",
    "요리호텔": "요리·호텔", "요리": "요리·호텔",
    "유아교육": "유아교육", "디자인": "디자인", "Trade": "Trade",
    "의료": "의료", "미정_추천": "미정", "진로미정": "미정",
    "회계석사": "비즈니스", "회계": "비즈니스",
}

ALL_VISA_PR_IDS = [
    "학생비자_500", "485_졸업비자", "PR경로_189_190_491",
    "GS_답변_가이드", "직업평가",
]

# ────────────────────────────────────────────────────────────────────
# Zip 디코딩 (CP437 → UTF-8)
# ────────────────────────────────────────────────────────────────────

def decode_zip_name(info):
    n_raw = info.filename
    if not (info.flag_bits & 0x800):
        try:
            return n_raw.encode("cp437").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return n_raw
    return n_raw


def load_md_files():
    files = []
    if not ZIP_PATH.exists():
        print(f"❌ Zip not found: {ZIP_PATH}", file=sys.stderr)
        sys.exit(1)

    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        for info in zf.infolist():
            n = decode_zip_name(info)
            if not n.startswith(FAQ_ROOT):
                continue
            if not n.endswith(".md") or n.endswith("README.md"):
                continue
            rel = PurePosixPath(n[len(FAQ_ROOT):])
            if str(rel) == ".":
                continue
            body = zf.read(info).decode("utf-8")
            files.append((rel, body))
    return sorted(files, key=lambda x: str(x[0]))


# ────────────────────────────────────────────────────────────────────
# Content extraction
# ────────────────────────────────────────────────────────────────────

WILSON_HEADING_RE = re.compile(r"^##\s*⭐\s*Wilson[^\n]*$", re.MULTILINE)
NEXT_H2_RE = re.compile(r"^##\s", re.MULTILINE)


def split_wilson_note(body: str) -> tuple[str, str | None]:
    """
    Returns (card_text_body, wilson_note).
    Removes the '## ⭐ Wilson...' section from card_text and returns it separately.
    """
    m = WILSON_HEADING_RE.search(body)
    if not m:
        return body.strip(), None

    start = m.start()
    # 다음 h2 찾기 (Wilson 섹션 본문은 그 직전까지)
    after = body[m.end():]
    next_m = NEXT_H2_RE.search(after)
    if next_m:
        wilson_block = body[start:m.end() + next_m.start()]
        rest = body[:start] + body[m.end() + next_m.start():]
    else:
        wilson_block = body[start:]
        rest = body[:start]

    # Wilson 본문에서 헤딩 줄 제거 (이미 'Wilson 추천'이라는 라벨이 있음)
    wilson_body = re.sub(r"^##\s*⭐\s*Wilson[^\n]*\n", "", wilson_block, count=1)
    wilson_body = wilson_body.strip()

    return rest.strip(), (wilson_body if wilson_body else None)


def clean_card_text(body: str) -> str:
    """
    Strip the file-level h1 title (first '# ...') and the initial frontmatter
    blockquote ('> ...' lines right after the title).
    Keep everything else as-is (markdown preserved).
    """
    lines = body.split("\n")
    out = []
    state = "before-h1"
    for line in lines:
        if state == "before-h1":
            if line.startswith("# "):
                state = "after-h1"
            continue
        if state == "after-h1":
            if line.strip() == "":
                continue
            if line.startswith(">"):
                state = "after-frontmatter"
                continue
            # 첫 h1 뒤에 blockquote가 없으면 바로 본문 시작
            out.append(line)
            state = "body"
            continue
        if state == "after-frontmatter":
            if line.startswith(">") or line.strip() == "":
                # 인접한 blockquote / 빈 줄은 frontmatter 일부로 간주
                continue
            out.append(line)
            state = "body"
            continue
        out.append(line)

    # 본문 양끝 공백 정리
    text = "\n".join(out).strip()
    # `---` 구분선이 맨 앞에 남아 있으면 제거
    text = re.sub(r"^---+\s*\n+", "", text)
    return text


# ────────────────────────────────────────────────────────────────────
# Scenario: required_modules 파싱
# ────────────────────────────────────────────────────────────────────

REF_HEADING_RE = re.compile(r"^##\s*🔗\s*참조\s*모듈", re.MULTILINE)
REF_INLINE_RE = re.compile(r"^\*참조\s*모듈\s*:\s*(.*?)\*\s*$", re.MULTILINE)

SCHOOL_DIRS = {"G8", "시드니_차선책", "멜번_차선책", "기타_지방"}


def parse_required_modules(body: str) -> dict:
    """
    Parse '## 🔗 참조 모듈' (Format A, newer) or '*참조 모듈: ...*' (Format B, older).
    Returns dict like {schools, regions, majors, visa_pr}.
    """
    schools, regions, majors, visa_pr = [], [], [], []

    # Format A: ## 🔗 참조 모듈 + bullet list
    m = REF_HEADING_RE.search(body)
    section = None
    if m:
        after = body[m.end():]
        next_h = NEXT_H2_RE.search(after)
        section = after[: next_h.start()] if next_h else after
    else:
        # Format B: *참조 모듈: ...*
        m2 = REF_INLINE_RE.search(body)
        if m2:
            section = m2.group(1)

    if section is None:
        return {"schools": [], "regions": [], "majors": [], "visa_pr": []}

    # 본문에서 모든 .md 참조 + '01~05 전체' 패턴을 끌어옴
    # 디렉토리 컨텍스트 추적: '02_학교_모듈/G8/' 이후의 'NN_Name.md'는 모두 그 디렉토리 소속
    current_dir = None
    # 토큰 단위로 처리: 줄 분리 후 콤마 / 슬래시 분리
    for raw_line in section.split("\n"):
        line = raw_line.strip(" \t-`*")
        if not line:
            continue

        # 02_학교_모듈/<group>/<NN_Name.md>
        # 03_지역_모듈/<NN_Name.md>
        # 04_전공_모듈/<NN_Name.md>
        # 05_비자PR_모듈/<NN_Name.md>
        # '01~05 전체' (visa_pr)

        # Split by separators (comma / slash with no extension after)
        for token in re.split(r"[,]", line):
            token = token.strip(" \t`")
            if not token:
                continue

            # 디렉토리 prefix가 들어 있으면 컨텍스트 업데이트
            # 예: '02_학교_모듈/G8/01_USyd.md' 또는 '02_학교_모듈/시드니_차선책/03_Wollongong.md'
            mdir = re.search(r"(0[2-5]_[^/]+)(?:/([^/]+))?/", token)
            if mdir:
                current_dir = (mdir.group(1), mdir.group(2))

            # '01~05 전체' (visa_pr만 사용됨)
            if "01~05" in token and "전체" in token:
                visa_pr = list(ALL_VISA_PR_IDS)
                continue

            # 파일명 추출: 'NN_Name.md' 또는 'Name.md' 또는 'NN_Name'
            mfile = re.search(r"(\d+_)?([^/`*\s]+?)\.md", token)
            if not mfile:
                continue
            raw_name = mfile.group(2)

            if current_dir is None:
                continue
            top, sub = current_dir

            if top == "02_학교_모듈":
                if raw_name and raw_name not in schools:
                    schools.append(raw_name)
            elif top == "03_지역_모듈":
                if raw_name and raw_name not in regions:
                    regions.append(raw_name)
            elif top == "04_전공_모듈":
                norm = MAJOR_NORMALIZE.get(raw_name, raw_name)
                if norm and norm not in majors:
                    majors.append(norm)
            elif top == "05_비자PR_모듈":
                if raw_name and raw_name not in visa_pr:
                    visa_pr.append(raw_name)

    return {
        "schools": schools,
        "regions": regions,
        "majors": majors,
        "visa_pr": visa_pr,
    }


# ────────────────────────────────────────────────────────────────────
# faq_id 재구성 (005와 동일 규칙)
# ────────────────────────────────────────────────────────────────────

def faq_id_for(rel: PurePosixPath) -> tuple[str, str]:
    """returns (faq_id, module_type)"""
    parts = rel.parts
    top = parts[0]
    stem = rel.stem

    if top == "01_시나리오":
        sub = parts[-2]
        category = re.sub(r"^\d+_", "", sub)
        return f"scenario_{category}_{stem}", "scenario"
    if top == "02_학교_모듈":
        name = re.sub(r"^\d+_", "", stem)
        return f"school_{name}", "school"
    if top == "03_지역_모듈":
        name = re.sub(r"^\d+_", "", stem)
        return f"region_{name}", "region"
    if top == "04_전공_모듈":
        name = re.sub(r"^\d+_", "", stem)
        return f"major_{name}", "major"
    if top == "05_비자PR_모듈":
        name = re.sub(r"^\d+_", "", stem)
        return f"visa_pr_{name}", "visa_pr"
    return "", ""


def matching_cards_for(faq_id: str, module_type: str) -> list[int] | None:
    if module_type == "scenario":
        return None
    if module_type in DEFAULT_CARDS:
        return DEFAULT_CARDS[module_type]
    if module_type == "visa_pr":
        # faq_id = 'visa_pr_학생비자_500' → suffix
        suffix = faq_id[len("visa_pr_"):]
        return VISA_PR_CARDS.get(suffix, [7])
    return None


# ────────────────────────────────────────────────────────────────────
# SQL emitting
# ────────────────────────────────────────────────────────────────────

def dollar_quote(content: str) -> str:
    """PostgreSQL dollar-quoted string. Pick tag that doesn't appear in content."""
    tag = "faq"
    i = 0
    while f"${tag}$" in content:
        i += 1
        tag = f"faq{i}"
    return f"${tag}${content}${tag}$"


def sql_int_array(items):
    if not items:
        return "NULL"
    return f"'{{{','.join(str(x) for x in items)}}}'"


def sql_jsonb(obj):
    if obj is None:
        return "NULL"
    # required_modules 비어있어도 빈 객체로 명시 (시나리오임을 표시)
    j = json.dumps(obj, ensure_ascii=False).replace("'", "''")
    return f"'{j}'::jsonb"


def main():
    files = load_md_files()
    print(f"Found {len(files)} .md files")

    out = [
        "-- ════════════════════════════════════════════════════════════",
        "-- 006_data_faqs_content.sql",
        "-- FAQ 콘텐츠 4필드 채움 (card_text / wilson_note / matching_cards / required_modules)",
        "-- internal_data = NULL (Wilson이 admin UI에서 채움 / Phase 2+)",
        "-- 생성 도구: scripts/generate_faqs_content.py",
        "-- ════════════════════════════════════════════════════════════",
        "",
        "BEGIN;",
        "",
    ]

    counts = {"scenario": 0, "school": 0, "region": 0, "major": 0, "visa_pr": 0}
    no_wilson_count = 0

    for rel, body in files:
        faq_id, module_type = faq_id_for(rel)
        if not faq_id:
            continue
        counts[module_type] += 1

        # 1) Wilson 섹션 분리
        body_without_wilson, wilson_note = split_wilson_note(body)
        if wilson_note is None:
            no_wilson_count += 1

        # 2) card_text 정리 (h1 + frontmatter blockquote 제거)
        card_text = clean_card_text(body_without_wilson)

        # 3) matching_cards
        cards = matching_cards_for(faq_id, module_type)

        # 4) required_modules (scenario만)
        req_modules = None
        if module_type == "scenario":
            req_modules = parse_required_modules(body)

        # SQL UPDATE
        sets = [f"card_text = {dollar_quote(card_text)}"]
        if wilson_note:
            sets.append(f"wilson_note = {dollar_quote(wilson_note)}")
        if cards is not None:
            sets.append(f"matching_cards = {sql_int_array(cards)}")
        if req_modules is not None:
            sets.append(f"required_modules = {sql_jsonb(req_modules)}")

        out.append(f"-- {faq_id}")
        out.append("UPDATE internal_faqs SET")
        out.append("  " + ",\n  ".join(sets))
        out.append(f"WHERE faq_id = '{faq_id}';")
        out.append("")

    out.append("COMMIT;")
    out.append("")
    out.append(f"-- ✅ Updated: {sum(counts.values())} FAQ rows")
    out.append(f"-- Breakdown: scenario={counts['scenario']} / school={counts['school']} / region={counts['region']} / major={counts['major']} / visa_pr={counts['visa_pr']}")
    out.append(f"-- Wilson note found: {sum(counts.values()) - no_wilson_count} / no Wilson note: {no_wilson_count}")

    OUTPUT_SQL.write_text("\n".join(out), encoding="utf-8")
    print(f"\n✅ Generated: {OUTPUT_SQL}")
    print(f"   scenario: {counts['scenario']} (expected 36)")
    print(f"   school:   {counts['school']} (expected 24)")
    print(f"   region:   {counts['region']} (expected 8)")
    print(f"   major:    {counts['major']} (expected 10)")
    print(f"   visa_pr:  {counts['visa_pr']} (expected 5)")
    print(f"   TOTAL:    {sum(counts.values())} (expected 83)")
    print(f"   Wilson note: {sum(counts.values()) - no_wilson_count} files / NULL: {no_wilson_count}")


if __name__ == "__main__":
    main()
