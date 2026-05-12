#!/usr/bin/env python3
"""
FAQ 84개 .md → 005_data_faqs_seed.sql 생성 (Phase 1 placeholder)

Phase 1.3에서는:
- faq_id + module_type + category + matching_6vars + source_file 박음
- card_text / internal_data / wilson_note = NULL (Step 1.6 매칭 엔진 빌드 시 .md 파싱하여 박음)

Phase 1.6에서:
- src/data/faq/*.md 다시 읽어서 콘텐츠 4필드 분리
- 매칭 엔진과 동시 검증

입력: /tmp/ausuhak_faq_extract/ausuhak_faq/**/*.md (zip 풀린 위치)
출력: C:\\Users\\Wilson\\Desktop\\ausuhak\\supabase\\migrations\\005_data_faqs_seed.sql
"""

import re
import sys
import zipfile
from pathlib import PurePosixPath, Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_SQL = ROOT / "supabase" / "migrations" / "005_data_faqs_seed.sql"
ZIP_PATH = ROOT.parent / "ausuhak_v25" / "04_ASSETS" / "ausuhak_complete_package.zip"
FAQ_ROOT_IN_ZIP = "ausuhak_faq/"


def sql_str(v):
    if v is None or v == "":
        return "NULL"
    s = str(v).replace("'", "''")
    return f"'{s}'"


def sql_array(items):
    if not items:
        return "NULL"
    arr = ",".join(f'"{str(x).strip()}"' for x in items if x)
    return f"'{{{arr}}}'"


def sql_jsonb(obj):
    import json
    if obj is None or obj == {}:
        return "NULL"
    j = json.dumps(obj, ensure_ascii=False).replace("'", "''")
    return f"'{j}'::jsonb"


def parse_scenario_file(path: PurePosixPath) -> dict:
    """01_시나리오/01_검정고시/09_간호.md → metadata"""
    parts = path.parts
    sub_folder = parts[-2]   # '01_검정고시'
    file_stem = path.stem    # '09_간호'

    # 카테고리 (학력)
    category = re.sub(r"^\d+_", "", sub_folder)   # '검정고시'

    # faq_id
    faq_id = f"scenario_{category}_{file_stem}"

    # 6변수 매핑
    matching = {"education": [category]}

    # 전공 추출 (파일명)
    name_no_prefix = re.sub(r"^\d+_", "", file_stem)
    # 매핑 키워드
    major_keywords = {
        "간호": "간호", "비즈니스": "비즈니스", "IT": "IT", "공학": "공학",
        "요리": "요리·호텔", "요리호텔": "요리·호텔", "Trade": "Trade",
        "디자인": "디자인", "회계석사": "비즈니스", "유아교육": "유아교육",
        "의료": "의료", "직업평가": None, "어학연수": None, "PR전환": None,
        "비자연장": None, "학생비자전환": None, "휴학": None, "졸업후": None,
        "편입": None, "초등생": None, "중학생": None, "고등학생": None,
        "부모동반": None, "ELICOS": None, "진로미정": "미정",
    }
    for k, v in major_keywords.items():
        if k in name_no_prefix:
            if v:
                matching["major"] = [v]
            break

    # 영어 레벨 (파일명 'IELTS6.0이상' 등)
    if "IELTS6.0이상" in file_stem:
        matching["english"] = ["6.0", "6.5", "7.0+"]
    elif "IELTS5.5이하" in file_stem:
        matching["english"] = ["없음", "4.0-5.0", "5.5"]

    return {
        "faq_id": faq_id,
        "module_type": "scenario",
        "category": category,
        "matching_6vars": matching,
        "question": f"{category} 학생 시나리오: {name_no_prefix}",
        "source_file": f"ausuhak_faq/{path}",
    }


def parse_school_file(path: PurePosixPath) -> dict:
    """02_학교_모듈/G8/01_USyd.md → metadata"""
    parts = path.parts
    group = parts[-2]   # 'G8' / '시드니_차선책' / '멜번_차선책' / '기타_지방'
    file_stem = path.stem  # '01_USyd'
    name_no_prefix = re.sub(r"^\d+_", "", file_stem)  # 'USyd'

    faq_id = f"school_{name_no_prefix}"
    return {
        "faq_id": faq_id,
        "module_type": "school",
        "category": group,
        "matching_6vars": {},
        "question": f"학교 정보: {name_no_prefix} ({group})",
        "source_file": f"ausuhak_faq/{path}",
    }


def parse_region_file(path: PurePosixPath) -> dict:
    """03_지역_모듈/01_시드니.md → metadata"""
    file_stem = path.stem
    name = re.sub(r"^\d+_", "", file_stem)
    return {
        "faq_id": f"region_{name}",
        "module_type": "region",
        "category": name,
        "matching_6vars": {"preferred_region": [name]},
        "question": f"지역 정보: {name}",
        "source_file": f"ausuhak_faq/{path}",
    }


def parse_major_file(path: PurePosixPath) -> dict:
    """04_전공_모듈/01_간호.md → metadata"""
    file_stem = path.stem
    name = re.sub(r"^\d+_", "", file_stem)

    # 6변수 매핑 (사양서 PART 0-7 표준)
    major_map = {
        "간호": "간호", "IT": "IT", "비즈니스": "비즈니스", "공학": "공학",
        "요리호텔": "요리·호텔", "유아교육": "유아교육", "디자인": "디자인",
        "Trade": "Trade", "의료": "의료", "미정_추천": "미정",
    }
    major_value = major_map.get(name, name)

    return {
        "faq_id": f"major_{name}",
        "module_type": "major",
        "category": name,
        "matching_6vars": {"major": [major_value]} if major_value != "미정" else {},
        "question": f"전공 정보: {name}",
        "source_file": f"ausuhak_faq/{path}",
    }


def parse_visa_pr_file(path: PurePosixPath) -> dict:
    """05_비자PR_모듈/01_학생비자_500.md → metadata"""
    file_stem = path.stem
    name = re.sub(r"^\d+_", "", file_stem)
    return {
        "faq_id": f"visa_pr_{name}",
        "module_type": "visa_pr",
        "category": name,
        "matching_6vars": {},
        "question": f"비자/PR 정보: {name}",
        "source_file": f"ausuhak_faq/{path}",
    }


def main():
    if not ZIP_PATH.exists():
        print(f"❌ Zip not found: {ZIP_PATH}", file=sys.stderr)
        sys.exit(1)

    # zip 안의 .md 파일 목록 (README.md 제외)
    # 한국어 파일명이 CP437로 인코딩되어 깨져 있음 → UTF-8로 재디코딩 필요
    md_files = []
    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        for info in zf.infolist():
            n_raw = info.filename
            # UTF-8 flag (0x800) 안 켜진 zip이면 CP437→UTF-8 디코딩
            if not (info.flag_bits & 0x800):
                try:
                    n = n_raw.encode("cp437").decode("utf-8")
                except (UnicodeEncodeError, UnicodeDecodeError):
                    n = n_raw
            else:
                n = n_raw

            if not n.startswith(FAQ_ROOT_IN_ZIP):
                continue
            if not n.endswith(".md"):
                continue
            if n.endswith("README.md"):
                continue
            rel = PurePosixPath(n[len(FAQ_ROOT_IN_ZIP):])
            if str(rel) == ".":
                continue
            md_files.append(rel)

    md_files.sort()
    print(f"Found {len(md_files)} .md files in zip")

    sql_lines = [
        "-- ════════════════════════════════════════════════════════════",
        "-- 005_data_faqs_seed.sql",
        "-- FAQ 84개 placeholder row (Phase 1.3)",
        "-- 콘텐츠 4필드 (card_text / internal_data / wilson_note) = NULL",
        "-- Step 1.6 매칭 엔진 빌드 시 .md 파싱하여 채움",
        "-- 생성 도구: scripts/generate_seed_faqs.py",
        "-- ════════════════════════════════════════════════════════════",
        "",
        "BEGIN;",
        "",
    ]

    counts = {"scenario": 0, "school": 0, "region": 0, "major": 0, "visa_pr": 0}

    for rel in md_files:
        # rel은 PurePosixPath: '01_시나리오/01_검정고시/09_간호.md' 같은 형식
        top = rel.parts[0]

        # 각 파서에 zip 내 경로 (PurePosixPath)와 source 경로 전달
        # 파서는 'rel.parts[-2]' / 'rel.stem' 등을 쓰므로 PurePosixPath 호환
        if top == "01_시나리오":
            meta = parse_scenario_file(rel)
        elif top == "02_학교_모듈":
            meta = parse_school_file(rel)
        elif top == "03_지역_모듈":
            meta = parse_region_file(rel)
        elif top == "04_전공_모듈":
            meta = parse_major_file(rel)
        elif top == "05_비자PR_모듈":
            meta = parse_visa_pr_file(rel)
        else:
            continue

        counts[meta["module_type"]] += 1

        sql_lines.append(
            f"INSERT INTO internal_faqs (faq_id, module_type, category, question, "
            f"matching_6vars, source_file, last_updated_at) VALUES ("
            f"{sql_str(meta['faq_id'])}, "
            f"{sql_str(meta['module_type'])}, "
            f"{sql_str(meta['category'])}, "
            f"{sql_str(meta['question'])}, "
            f"{sql_jsonb(meta['matching_6vars'])}, "
            f"{sql_str(meta['source_file'])}, "
            f"'2026-05-04'::timestamp"
            f") ON CONFLICT (faq_id) DO NOTHING;"
        )

    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append(f"-- ✅ TOTAL: {sum(counts.values())} FAQ rows")
    sql_lines.append(f"-- Breakdown: scenario={counts['scenario']} / school={counts['school']} / region={counts['region']} / major={counts['major']} / visa_pr={counts['visa_pr']}")
    sql_lines.append(f"-- 사양서 PART D-4 기대값: scenario=36 / school=24 / region=8 / major=10 / visa_pr=5 (총 84)")

    OUTPUT_SQL.write_text("\n".join(sql_lines), encoding="utf-8")
    print(f"\n✅ Generated: {OUTPUT_SQL}")
    print(f"   - scenario: {counts['scenario']} (expected 36)")
    print(f"   - school:   {counts['school']} (expected 24)")
    print(f"   - region:   {counts['region']} (expected 8)")
    print(f"   - major:    {counts['major']} (expected 10)")
    print(f"   - visa_pr:  {counts['visa_pr']} (expected 5)")
    print(f"   - TOTAL:    {sum(counts.values())} (expected 84)")


if __name__ == "__main__":
    main()
