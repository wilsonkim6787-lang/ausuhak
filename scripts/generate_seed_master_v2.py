#!/usr/bin/env python3
"""
master_v2_clean.json → 002_data_schools_seed.sql 생성

입력: C:\\Users\\Wilson\\Desktop\\ausuhak_v25\\02_DATABASE\\ausuhak_master_v2_clean.json
출력: C:\\Users\\Wilson\\Desktop\\ausuhak\\supabase\\migrations\\002_data_schools_seed.sql

생성 내용 (PART D-4):
- schools 테이블 INSERT (109교 / majors의 unique school_name)
- blocking_rules INSERT (39개)
- wilson_alerts_rules INSERT (24개)

사양서 룰 반영:
- PART 0-2 간호 IELTS 7.0 (NMBA 통일)
- PART H-0 UNSW 간호 미운영 (자동 차단)
- PART H-0 Adelaide University = UoA+UniSA 통합 (2026.01)
- 학교명 표준화 (master_v2_clean 정본 그대로)
"""

import json
import sys
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
MASTER_JSON = ROOT.parent / "ausuhak_v25" / "02_DATABASE" / "ausuhak_master_v2_clean.json"
OUTPUT_SQL = ROOT / "supabase" / "migrations" / "002_data_schools_seed.sql"


def sql_str(v):
    """SQL 안전한 문자열 (single quote escape)"""
    if v is None or v == "":
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v).replace("'", "''")
    return f"'{s}'"


def sql_array(items):
    """PostgreSQL TEXT[] 배열"""
    if not items:
        return "NULL"
    quoted = [str(x).replace("'", "''").replace('"', '\\"') for x in items if x]
    if not quoted:
        return "NULL"
    arr = ",".join(f'"{x}"' for x in quoted)
    return f"'{{{arr}}}'"


def sql_jsonb(obj):
    """JSONB 박기 (single quote 이스케이프)"""
    if obj is None:
        return "NULL"
    j = json.dumps(obj, ensure_ascii=False).replace("'", "''")
    return f"'{j}'::jsonb"


def slugify_school_id(name: str) -> str:
    """school_name → ASCII slug (unique master_id 보장용)
    Note: master_v2_clean의 school_id는 카테고리 그룹 ID (MED/NURSE-B 등)라서 unique X.
    master_id는 school_name 기반 slug로 생성해 109교 unique 보장."""
    s = re.sub(r"[^a-zA-Z0-9_-]+", "_", name).strip("_").lower()
    return s[:50] or "unknown"


def classify_school_type(school_name: str, all_schools_meta: dict) -> str:
    """학교 카테고리 → schools.type 매핑"""
    if school_name in all_schools_meta:
        cat = all_schools_meta[school_name].get("_source_category", "")
        if "universities" in cat:
            return "university"
        if "foundation" in cat:
            return "foundation"
        if "tafe" in cat:
            return "tafe"
        if "diploma" in cat:
            return "diploma_verified"
        if "vocational" in cat:
            return "vocational_private"
        if "elicos" in cat:
            return "elicos"
        if "under18" in cat:
            return "under18"
        if "hsp" in cat:
            return "hsp"
    return "university"  # default fallback


def is_anmac_certified(school_name: str, programs: list) -> bool:
    """간호 코스 운영 + ANMAC 인증 추정 (master_v2_clean에 explicit field 없음)"""
    # 사양서 PART H-0: UNSW 간호 미운영 (자동 false)
    if "UNSW" in school_name.upper() and not any("Nursing" in p.get("major_name", "") for p in programs):
        return False
    # 간호 코스가 있는 학교는 ANMAC 인증으로 추정 (master_v2_clean = Wilson 검수)
    has_nursing = any(
        "Nursing" in p.get("major_name", "") or "간호" in p.get("major_name", "")
        for p in programs
    )
    return has_nursing


def build_alternate_names(school_name: str) -> list:
    """학교명 별칭 추출 (괄호 안 내용 등)"""
    alternates = []
    # "University of Sydney (USyd)" → ["USyd"]
    m = re.search(r"\(([^)]+)\)", school_name)
    if m:
        alternates.append(m.group(1).strip())
    return alternates


def main():
    print(f"Loading {MASTER_JSON} ...")
    with open(MASTER_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    # ────────────────────────────────────────────────────────
    # 1. majors에서 unique school_name 109개 추출 (정본)
    # ────────────────────────────────────────────────────────
    majors = data["majors"]["all_majors"]
    schools_majors = defaultdict(list)
    school_ids = {}  # school_name → school_id
    for m in majors:
        name = m.get("school_name")
        if not name:
            continue
        sid = m.get("school_id")
        if sid:
            school_ids[name] = sid
        schools_majors[name].append(m)

    print(f"  Unique schools in majors: {len(schools_majors)}")
    print(f"  With school_id: {len(school_ids)}")

    # ────────────────────────────────────────────────────────
    # 2. schools 카테고리에서 학교별 메타 수집
    # ────────────────────────────────────────────────────────
    all_schools_meta = {}  # school_name → metadata dict (campus, cricos, founded 등)
    for cat_key, items in data["schools"].items():
        if cat_key.startswith("_"):
            continue
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            name = item.get("school_name") or item.get("name")
            if not name:
                continue
            if name not in all_schools_meta:
                all_schools_meta[name] = {**item, "_source_category": cat_key}

    print(f"  Schools meta collected: {len(all_schools_meta)}")

    # ────────────────────────────────────────────────────────
    # 3. SQL 생성: schools INSERT
    # ────────────────────────────────────────────────────────
    sql_lines = [
        "-- ════════════════════════════════════════════════════════════",
        "-- 002_data_schools_seed.sql",
        "-- master_v2_clean.json (Wilson 검수 2026-05-08) 정본 임포트",
        "-- 109교 + 1,235전공 (학교별 programs JSONB) + 차단 39 + Alert 24",
        "-- 생성 도구: scripts/generate_seed_master_v2.py",
        "-- ════════════════════════════════════════════════════════════",
        "",
        "BEGIN;",
        "",
        "-- ─── schools (109교) ───",
        "",
    ]

    schools_inserted = 0
    for school_name in sorted(schools_majors.keys()):
        programs = schools_majors[school_name]
        meta = all_schools_meta.get(school_name, {})

        # master_id = school_name slug (109교 unique 보장 / school_id는 그룹 ID라 unique X)
        sid = slugify_school_id(school_name)

        # alternate_names
        alts = build_alternate_names(school_name)

        # type
        stype = classify_school_type(school_name, all_schools_meta)

        # city / state / campus (meta에서 추출)
        campus = meta.get("campus", "")
        # campus에서 city/state 추출 (e.g. "Sydney CBD (NSW) Metro")
        city = None
        state = None
        m_state = re.search(r"\((NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\)", campus)
        if m_state:
            state = m_state.group(1)
        m_city = re.match(r"([^(]+)", campus)
        if m_city:
            city = m_city.group(1).strip().split()[0] if m_city.group(1).strip() else None

        cricos = meta.get("cricos") or None
        founded = meta.get("founded") or ""
        try:
            founded_int = int(re.search(r"\d{4}", str(founded)).group(0)) if founded else None
        except Exception:
            founded_int = None

        qs_raw = meta.get("qs_ranking") or ""
        qs_int = None
        try:
            qs_match = re.search(r"\d+", str(qs_raw))
            if qs_match:
                qs_int = int(qs_match.group(0))
        except Exception:
            pass

        operator = meta.get("operator") or None

        # programs JSONB (각 학교의 전공 리스트 - 가공 후)
        programs_clean = []
        for p in programs:
            programs_clean.append({
                "major_id": p.get("major_id"),
                "major_name": p.get("major_name"),
                "level": p.get("level"),
                "duration": p.get("duration"),
                "tuition_2026": p.get("tuition_2026"),
                "ielts": p.get("ielts"),
                "entry_requirement": p.get("entry_requirement"),
                "pr_category": p.get("pr_category"),
                "pr_grade": p.get("pr_grade"),
                "campus": p.get("campus"),
                "note": p.get("note"),
                "scholarships": p.get("scholarships", []),
            })

        # ANMAC (간호 코스 + Wilson 검수 가정)
        anmac = is_anmac_certified(school_name, programs)

        sql_lines.append(
            f"INSERT INTO schools (master_id, name, alternate_names, type, city, state, "
            f"campus, cricos_code, anmac_certified, qs_ranking, founded, operator, "
            f"programs, status, last_verified_at) VALUES ("
            f"{sql_str(sid)}, "
            f"{sql_str(school_name)}, "
            f"{sql_array(alts)}, "
            f"{sql_str(stype)}, "
            f"{sql_str(city)}, "
            f"{sql_str(state)}, "
            f"{sql_str(campus[:255] if campus else None)}, "
            f"{sql_str(cricos)}, "
            f"{sql_str(anmac) if anmac else 'NULL'}, "
            f"{sql_str(qs_int) if qs_int else 'NULL'}, "
            f"{sql_str(founded_int) if founded_int else 'NULL'}, "
            f"{sql_str(operator[:255] if operator else None)}, "
            f"{sql_jsonb(programs_clean)}, "
            f"'active', "
            f"'2026-05-08'::timestamp"
            f") ON CONFLICT (master_id) DO NOTHING;"
        )
        schools_inserted += 1

    sql_lines.append("")
    sql_lines.append(f"-- schools inserted: {schools_inserted}")
    sql_lines.append("")

    # ────────────────────────────────────────────────────────
    # 4. blocking_rules (master_v2_clean.blocking_rules.blocking_rules_39)
    #    카테고리 1~5는 .rules list / 카테고리 6은 major별 (nursing/cookery/it)
    #    카테고리 7은 로직 (룰 아님)
    # ────────────────────────────────────────────────────────
    sql_lines.append("-- ─── blocking_rules (정본 nested 구조) ───")
    sql_lines.append("")

    blocking_inserted = 0

    def emit_blocking_rule(rule, default_severity="soft", default_category=""):
        nonlocal blocking_inserted
        rule_id = rule.get("id") or f"BLOCK-{blocking_inserted + 1:03d}"
        priority = rule.get("priority") or ""
        # priority → severity 매핑
        if "절대" in priority or "🔴" in priority:
            severity = "hard"
        elif "높음" in priority or "매우 높음" in priority:
            severity = "soft"
        else:
            severity = default_severity

        title = rule.get("rule_name") or rule_id
        # description = condition + action + alternative + wilson_reason 합침 (텍스트)
        desc_parts = []
        if rule.get("condition"):
            desc_parts.append(f"Condition: {rule['condition']}")
        if rule.get("action"):
            desc_parts.append(f"Action: {rule['action']}")
        if rule.get("alternative"):
            desc_parts.append(f"Alternative: {rule['alternative']}")
        if rule.get("wilson_reason"):
            desc_parts.append(f"Wilson 19년: {rule['wilson_reason']}")
        description = " | ".join(desc_parts)

        # conditions JSONB = 원본 rule 통째로
        conditions_obj = {k: v for k, v in rule.items() if k != "id"}

        sql_lines.append(
            f"INSERT INTO blocking_rules (rule_id, severity, category, title, description, "
            f"conditions, action, active) VALUES ("
            f"{sql_str(rule_id)}, "
            f"{sql_str(severity)}, "
            f"{sql_str(default_category[:50])}, "
            f"{sql_str(title[:255])}, "
            f"{sql_str(description)}, "
            f"{sql_jsonb(conditions_obj)}, "
            f"{sql_str(rule.get('action', 'exclude')[:50] if rule.get('action') else 'exclude')}, "
            f"TRUE"
            f") ON CONFLICT (rule_id) DO NOTHING;"
        )
        blocking_inserted += 1

    br39 = data.get("blocking_rules", {}).get("blocking_rules_39", {})
    for cat_key, content in br39.items():
        if cat_key.startswith("_"):
            continue
        # cat_1~5 + cat_6 (major별 nested) 처리
        if isinstance(content, dict):
            rules = content.get("rules")
            if isinstance(rules, list):
                # category_1~5 pattern
                for rule in rules:
                    if isinstance(rule, dict):
                        emit_blocking_rule(rule, default_category=cat_key)
            elif rules is None:
                # category_6 = nested by major (nursing/cookery/it)
                for major_key, major_rules in content.items():
                    if isinstance(major_rules, list):
                        for rule in major_rules:
                            if isinstance(rule, dict):
                                emit_blocking_rule(rule, default_category=f"{cat_key}_{major_key}")

    sql_lines.append("")
    sql_lines.append(f"-- blocking_rules inserted: {blocking_inserted}")
    sql_lines.append("")

    # ────────────────────────────────────────────────────────
    # 5. wilson_alerts_rules (master_v2_clean.wilson_alerts.critical_alerts_24)
    # ────────────────────────────────────────────────────────
    sql_lines.append("-- ─── wilson_alerts_rules (24개) ───")
    sql_lines.append("")

    wa_data = data.get("wilson_alerts", {})
    wa_inserted = 0
    for key, items in wa_data.items():
        if key.startswith("_"):
            continue
        if not isinstance(items, list):
            continue
        for alert in items:
            if not isinstance(alert, dict):
                continue
            alert_id = alert.get("alert_id") or f"ALERT-{wa_inserted + 1:03d}"
            title = alert.get("title") or alert_id
            wilson_quote = alert.get("wilson_quote") or ""
            principle = alert.get("principle") or ""
            wilson_truth = alert.get("wilson_truth") or ""
            applies_to = alert.get("applies_to") or ""
            marketing_app = alert.get("marketing_application") or ""
            conditions = alert.get("conditions") or {}

            sql_lines.append(
                f"INSERT INTO wilson_alerts_rules (alert_id, title, wilson_quote, principle, "
                f"wilson_truth, applies_to, marketing_application, conditions, active) VALUES ("
                f"{sql_str(alert_id)}, "
                f"{sql_str(title[:255] if title else alert_id)}, "
                f"{sql_str(wilson_quote)}, "
                f"{sql_str(principle)}, "
                f"{sql_str(wilson_truth)}, "
                f"{sql_str(applies_to)}, "
                f"{sql_str(marketing_app)}, "
                f"{sql_jsonb(conditions)}, "
                f"TRUE"
                f") ON CONFLICT (alert_id) DO NOTHING;"
            )
            wa_inserted += 1

    sql_lines.append("")
    sql_lines.append(f"-- wilson_alerts_rules inserted: {wa_inserted}")
    sql_lines.append("")
    sql_lines.append("COMMIT;")
    sql_lines.append("")
    sql_lines.append(f"-- ✅ TOTAL: {schools_inserted} schools / {blocking_inserted} blocking_rules / {wa_inserted} wilson_alerts")

    # ────────────────────────────────────────────────────────
    # 6. 파일 저장
    # ────────────────────────────────────────────────────────
    OUTPUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_SQL.write_text("\n".join(sql_lines), encoding="utf-8")

    print(f"\n✅ Generated: {OUTPUT_SQL}")
    print(f"   - schools: {schools_inserted}")
    print(f"   - blocking_rules: {blocking_inserted}")
    print(f"   - wilson_alerts_rules: {wa_inserted}")
    print(f"   - File size: {OUTPUT_SQL.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
