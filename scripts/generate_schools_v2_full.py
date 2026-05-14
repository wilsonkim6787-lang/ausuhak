#!/usr/bin/env python3
"""
master_v2_clean.json 14개 카테고리 → 020_fix_schools_import.sql 생성

기존 002_data_schools_seed.sql 결함:
  - majors의 unique school_name만 추출 (107교) → elicos_closed / under18 / cat30 / hsp 누락
  - 모두 type='university'로 부정확 분류

신규 (이 스크립트):
  - schools.* 14개 카테고리 직접 순회
  - 카테고리별 type / payment_cycle / status 정확 매핑 (Wilson 2026-05-14 결정)
  - operations_verified_13 = 학교 아님 (운영 검증 노트) → SKIP
  - 결과 442교 import (예상)

생성:
  C:\\Users\\Wilson\\Desktop\\ausuhak\\supabase\\migrations\\020_fix_schools_import.sql

사용:
  python scripts/generate_schools_v2_full.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER_JSON = ROOT.parent / "ausuhak_v25" / "02_DATABASE" / "ausuhak_master_v2_clean.json"
OUT_SQL = ROOT / "supabase" / "migrations" / "020_fix_schools_import.sql"

# ──────────────────────────────────────────────────────────
# Wilson 2026-05-14 결정: 14개 카테고리별 매핑
# ──────────────────────────────────────────────────────────
CATEGORY_MAP = {
    "universities_39":          dict(type="university",          payment_cycle="semester",   default_status="active",        category_label="대학 39교"),
    "foundation_8":             dict(type="foundation",          payment_cycle="split_2_3",  default_status="active",        category_label="Foundation 8교"),
    "foundation_courses_32":    dict(type="foundation",          payment_cycle="split_2_3",  default_status="active",        category_label="Foundation 코스 32개"),
    "elicos_operating_47":      dict(type="elicos",              payment_cycle="lump_sum",   default_status="active",        category_label="어학원 운영 47교"),
    "elicos_closed_18":         dict(type="elicos",              payment_cycle="lump_sum",   default_status="closed",        category_label="어학원 폐교 18교 (추천 X)"),
    "tafe_8_states":            dict(type="tafe",                payment_cycle="semester",   default_status="active",        category_label="TAFE 8주"),
    "diploma_verified_22":      dict(type="diploma",             payment_cycle="semester",   default_status="active",        category_label="Diploma 검증 22교"),
    "vocational_private_10":    dict(type="vocational_private",  payment_cycle="split_2_3",  default_status="active",        category_label="사립 직업학교 10교"),
    "under18_schools_21":       dict(type="under18",             payment_cycle="quarterly",  default_status="active",        category_label="조기유학 21교"),
    "under18_public_6states":   dict(type="under18",             payment_cycle="quarterly",  default_status="active",        category_label="조기유학 공립 6주"),
    "cat30_new_223":            dict(type="vocational_private",  payment_cycle="split_2_3",  default_status="verify_needed", category_label="Cat30 신규 223교 (확인 필요)"),
    "hsp_private_elicos_15":    dict(type="elicos",              payment_cycle="lump_sum",   default_status="active",        category_label="HSP 사립 어학원 15교"),
    "hsp_government_5":         dict(type="under18",             payment_cycle="quarterly",  default_status="active",        category_label="HSP 정부 5교"),
    # operations_verified_13 = 학교가 아닌 운영 검증 항목 → SKIP
}

SKIP_CATEGORIES = {"operations_verified_13"}


# ──────────────────────────────────────────────────────────
# SQL 헬퍼
# ──────────────────────────────────────────────────────────
def sql_str(v):
    if v is None or v == "":
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v).replace("'", "''")
    return f"'{s}'"


def sql_array(items):
    if not items:
        return "NULL"
    clean = [str(x).replace("'", "''").replace('"', '\\"') for x in items if x]
    if not clean:
        return "NULL"
    return "'{" + ",".join(f'"{x}"' for x in clean) + "}'"


def sql_jsonb(obj):
    if obj is None or (isinstance(obj, (list, dict)) and not obj):
        return "NULL"
    j = json.dumps(obj, ensure_ascii=False).replace("'", "''")
    return f"'{j}'::jsonb"


def slugify(s, maxlen=80):
    s = re.sub(r"[^a-zA-Z0-9_-]+", "_", str(s)).strip("_").lower()
    return s[:maxlen] or "unknown"


def clean_cricos(v):
    """CRICOS = 6+ alphanumeric (예: 00116K, 087993A). 'X', '검증 필요' 등은 NULL."""
    if not v:
        return None
    s = str(v).strip()
    if not s or s == "X":
        return None
    # 한글/특수문자 포함 시 NULL
    if re.search(r"[^\x00-\x7F]", s):
        return None
    # 정상 CRICOS 패턴
    if re.match(r"^[\dA-Za-z]{4,12}$", s):
        return s.upper()
    return None


# ──────────────────────────────────────────────────────────
# 카테고리별 row 추출
# ──────────────────────────────────────────────────────────
def extract_state_city(campus_str: str):
    """'Sydney CBD (NSW) Metro' → ('Sydney', 'NSW')"""
    if not campus_str:
        return None, None
    state = None
    m = re.search(r"\((NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\)", campus_str)
    if m:
        state = m.group(1)
    city = None
    m2 = re.match(r"([A-Za-z][A-Za-z\s]+?)(?:\s+CBD|\s+\(|$)", campus_str.strip())
    if m2:
        city = m2.group(1).strip().split()[0]
    return city, state


def normalize_school_row(cat_key, item, cat_meta, occurrence_idx):
    """모든 카테고리 row → 공통 dict 변환"""
    # 카테고리별 학교명 추출 (compact 포맷 처리)
    if cat_key == "diploma_verified_22":
        # "school" 필드 = "UC-001 UTS College Sydney" 형태
        raw = item.get("school") or ""
        m = re.match(r"^([A-Z]+-\d+)\s+(.+)$", raw)
        if m:
            ext_id = m.group(1)
            name = m.group(2)
        else:
            ext_id = f"DIP-{occurrence_idx:03d}"
            name = raw or f"Diploma {occurrence_idx}"
        campus_str = item.get("category", "")
        category_str = item.get("category", "")
    elif cat_key == "foundation_courses_32":
        # 코스 row (school_id parent reference)
        name = item.get("school_name") or item.get("course_name") or "Foundation Course"
        # 코스라서 학교명 + 코스명 결합
        cname = item.get("course_name")
        if cname and cname not in name:
            name = f"{name} — {cname}"
        ext_id = item.get("course_id") or f"FC-CRS-{occurrence_idx:03d}"
        campus_str = item.get("parent_uni", "")
        category_str = "Foundation Course"
    else:
        name = item.get("school_name") or item.get("name") or f"Unknown {cat_key} {occurrence_idx}"
        ext_id = item.get("_id") or f"{cat_key[:6].upper()}-{occurrence_idx:03d}"
        campus_str = item.get("campus", "")
        category_str = item.get("category", "")

    # master_id = category prefix + ext_id (전역 unique 보장)
    cat_prefix = cat_key.split("_")[0][:8]
    master_id = slugify(f"{cat_prefix}_{ext_id}")

    city, state = extract_state_city(campus_str)
    if not state:
        state = item.get("_state")  # under18 / hsp 카테고리는 _state 필드 있음

    # founded → int (있으면)
    founded_raw = item.get("founded") or ""
    founded_int = None
    if founded_raw:
        m = re.search(r"\d{4}", str(founded_raw))
        if m:
            founded_int = int(m.group(0))

    qs_raw = item.get("qs_ranking") or ""
    qs_int = None
    if qs_raw:
        m = re.search(r"\d+", str(qs_raw))
        if m:
            qs_int = int(m.group(0))

    # alternate_names = 괄호 안 추출
    alts = []
    m = re.search(r"\(([^)]+)\)", name)
    if m:
        alts.append(m.group(1).strip())

    # status = 카테고리 default + _flag 오버라이드
    status = cat_meta["default_status"]
    flag = item.get("_flag")
    if flag == "확인필요":
        status = "verify_needed"

    # internal_notes JSONB = Wilson 노트 + 메타 (학생 노출 X)
    internal = {}
    for nk in ("_wilson_note", "_note", "_flag", "_is_avoid", "_korean_ratio_pct",
              "_status", "_go8", "_majors_count", "_state", "_parent_uni",
              "_cat", "_id"):
        if nk in item and item[nk] not in (None, ""):
            internal[nk.lstrip("_")] = item[nk]

    # programs JSONB = master 원본 보존 + course 정보
    programs = []
    if cat_key == "foundation_courses_32":
        programs.append({
            "course_id": item.get("course_id"),
            "school_id": item.get("school_id"),
            "course_name": item.get("course_name"),
            "level": item.get("level"),
            "tuition_2026": item.get("tuition_2026"),
            "parent_uni": item.get("parent_uni"),
            "pathway_to": item.get("pathway_to"),
            "verified_source": item.get("verified_source"),
            "scholarships": item.get("scholarships", []),
        })
    elif cat_key == "diploma_verified_22":
        # detail 필드는 string-encoded dict → 보존
        programs.append({
            "detail": item.get("detail"),
        })
    else:
        # 일반 카테고리 = course_name / level / duration / tuition 보존
        programs.append({
            "course_name": item.get("course_name"),
            "level": item.get("level"),
            "duration": item.get("duration"),
            "intake": item.get("intake"),
            "tuition_2026": item.get("tuition"),
            "ielts": item.get("ielts"),
            "pte": item.get("pte"),
            "toefl": item.get("toefl"),
            "academic": item.get("academic"),
            "scholarships": item.get("scholarships", []),
        })

    # scholarships JSONB = top-level 스칼라십 (있는 경우만)
    scholarships = item.get("scholarships") if isinstance(item.get("scholarships"), list) else None

    return dict(
        master_id=master_id,
        name=name,
        alternate_names=alts,
        type=cat_meta["type"],
        city=city,
        state=state,
        campus=campus_str[:255] if campus_str else None,
        cricos_code=clean_cricos(item.get("cricos")),
        anmac_certified=None,  # 별도 룰 적용
        qs_ranking=qs_int,
        founded=founded_int,
        operator=(item.get("operator") or None),
        programs=programs,
        scholarships=scholarships,
        status=status,
        payment_cycle=cat_meta["payment_cycle"],
        master_category=cat_key,
        category_label=cat_meta["category_label"],
        internal_notes=internal if internal else None,
        last_verified_at="2026-05-14",
    )


def main():
    print(f"Loading {MASTER_JSON} ...")
    with open(MASTER_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    schools = data["schools"]
    rows = []
    per_cat_count = {}

    for cat_key in CATEGORY_MAP.keys():
        if cat_key in SKIP_CATEGORIES:
            continue
        items = schools.get(cat_key)
        if not isinstance(items, list):
            continue
        cat_meta = CATEGORY_MAP[cat_key]
        for idx, item in enumerate(items, start=1):
            if not isinstance(item, dict):
                continue
            row = normalize_school_row(cat_key, item, cat_meta, idx)
            rows.append(row)
        per_cat_count[cat_key] = len([r for r in rows if r["master_category"] == cat_key])

    print(f"  Categories processed: {len(per_cat_count)}")
    for k, v in per_cat_count.items():
        print(f"    {k:30s} → {v:4d} rows")
    print(f"  TOTAL: {len(rows)} schools")

    # master_id 중복 체크
    seen = set()
    dups = []
    for r in rows:
        if r["master_id"] in seen:
            dups.append(r["master_id"])
        seen.add(r["master_id"])
    if dups:
        print(f"  ⚠️ {len(dups)} duplicate master_id detected (will append suffix)")
        seen2 = {}
        for r in rows:
            mid = r["master_id"]
            if mid in seen2:
                seen2[mid] += 1
                r["master_id"] = f"{mid}_{seen2[mid]}"
            else:
                seen2[mid] = 1

    # ──────────────────────────────────────────
    # SQL 작성
    # ──────────────────────────────────────────
    lines = [
        "-- ════════════════════════════════════════════════════════════",
        "-- 020_fix_schools_import.sql",
        "-- 사양서 PART D-4 v2: master_v2_clean.json 14개 카테고리 전체 import",
        "-- ",
        "-- 이전 import (002_data_schools_seed.sql) 결함:",
        "--   - majors→unique school_name 방식 = 107교만 / type 부정확",
        "-- ",
        "-- 이 마이그레이션:",
        f"--   - 14개 카테고리 직접 순회 → {len(rows)}교 import",
        "--   - type / payment_cycle / status 카테고리별 정확 매핑",
        "--   - operations_verified_13 (운영 검증 노트) = SKIP",
        "-- ",
        "-- 1차 실행 에러 (Wilson 2026-05-14):",
        "--   ERROR: 22001 value too long for type character varying(50)",
        "--   → master_id 7교 = 50자 초과 (vocational_private = TAFE 길거기 학교명)",
        "--   → 해결: 아래 ALTER COLUMN으로 컬럼 사이즈 확장 후 INSERT",
        "-- ",
        "-- 생성 도구: scripts/generate_schools_v2_full.py",
        "-- ════════════════════════════════════════════════════════════",
        "",
        "BEGIN;",
        "",
        "-- ─── 컬럼 사이즈 확장 (50자 → 200자 / 학교명 긴 케이스 대비) ───",
        "ALTER TABLE schools ALTER COLUMN master_id   TYPE VARCHAR(200);",
        "ALTER TABLE schools ALTER COLUMN city        TYPE VARCHAR(100);",
        "",
        "-- ─── 신규 컬럼: master_category + internal_notes ───",
        "ALTER TABLE schools ADD COLUMN IF NOT EXISTS master_category VARCHAR(50);",
        "ALTER TABLE schools ADD COLUMN IF NOT EXISTS internal_notes JSONB;",
        "CREATE INDEX IF NOT EXISTS idx_schools_master_category ON schools(master_category);",
        "",
        "COMMENT ON COLUMN schools.master_category IS '원본 14개 카테고리 (universities_39, elicos_closed_18 등). Wilson 검증 + 디버깅용';",
        "COMMENT ON COLUMN schools.internal_notes IS '⚠️ INTERNAL ONLY. wilson_note / is_avoid / korean_ratio_pct 등. 학생 노출 X.';",
        "",
        "-- ─── 기존 데이터 비우기 (FK CASCADE 포함) ───",
        "-- Phase 1 시점 = students/school_applications 데이터 없음 → 안전",
        "TRUNCATE schools CASCADE;",
        "",
        "-- ─── 전체 학교 INSERT ───",
        "",
    ]

    for r in rows:
        lines.append(
            "INSERT INTO schools ("
            "master_id, name, alternate_names, type, city, state, campus, cricos_code, "
            "qs_ranking, founded, operator, programs, scholarships, "
            "status, payment_cycle, master_category, internal_notes, last_verified_at"
            ") VALUES ("
            f"{sql_str(r['master_id'])}, "
            f"{sql_str(r['name'])}, "
            f"{sql_array(r['alternate_names'])}, "
            f"{sql_str(r['type'])}, "
            f"{sql_str(r['city'])}, "
            f"{sql_str(r['state'])}, "
            f"{sql_str(r['campus'])}, "
            f"{sql_str(r['cricos_code'])}, "
            f"{sql_str(r['qs_ranking']) if r['qs_ranking'] else 'NULL'}, "
            f"{sql_str(r['founded']) if r['founded'] else 'NULL'}, "
            f"{sql_str(r['operator'][:255] if r['operator'] else None)}, "
            f"{sql_jsonb(r['programs'])}, "
            f"{sql_jsonb(r['scholarships'])}, "
            f"{sql_str(r['status'])}, "
            f"{sql_str(r['payment_cycle'])}, "
            f"{sql_str(r['master_category'])}, "
            f"{sql_jsonb(r['internal_notes'])}, "
            f"'{r['last_verified_at']}'::timestamp"
            ");"
        )

    lines.append("")
    lines.append("-- ─── 검증 뷰 갱신 (14개 카테고리 카운트) ───")
    lines.append("DROP VIEW IF EXISTS v_schools_payment_cycle_check;")
    lines.append("CREATE VIEW v_schools_payment_cycle_check AS")
    lines.append("SELECT")
    lines.append("  master_category,")
    lines.append("  type,")
    lines.append("  payment_cycle,")
    lines.append("  status,")
    lines.append("  COUNT(*) AS school_count")
    lines.append("FROM schools")
    lines.append("GROUP BY master_category, type, payment_cycle, status")
    lines.append("ORDER BY master_category;")
    lines.append("")
    lines.append("COMMENT ON VIEW v_schools_payment_cycle_check IS")
    lines.append("  '디버깅: 14개 master_category × type × payment_cycle 매핑 검증. SELECT * FROM v_schools_payment_cycle_check;';")
    lines.append("")
    lines.append("COMMIT;")

    OUT_SQL.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n[OK] Generated: {OUT_SQL}")
    print(f"     Size: {OUT_SQL.stat().st_size:,} bytes / {len(rows)} schools")


if __name__ == "__main__":
    main()
