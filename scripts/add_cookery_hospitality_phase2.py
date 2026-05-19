#!/usr/bin/env python3
"""
Phase 2 데이터 보강 (2026-05-19) — TAFE 11 + 사립 specialist 8 학교에
요리·호텔 표준 코스 약 55 entries 신규 추가.

Wilson IELTS 표준 적용:
- Cert·Diploma → IELTS 6.0 (각 5.5)
- Bachelor → IELTS 6.5 (각 6.0)

ANZSCO PR 코드:
- Chef 351311 (MLTSSL)
- Cook 351411 (MLTSSL)
- Pastrycook 351112 (MLTSSL)
- Restaurant Manager 141111 (MLTSSL)
- Hotel Manager 141311 (CSOL)

대상 master JSON 의 majors.all_majors[] 배열에 append.
school_name 은 master 의 기존 variant 와 정확히 일치하게 (embed 의 NAME_TYPE_OVERRIDES 가 정규화).
"""

import json
import sys
from datetime import datetime
from pathlib import Path

MASTER = Path("C:/Users/Wilson/Desktop/ausuhak_v25/02_DATABASE/ausuhak_master_v2_clean.json")
VERIFIED_AT = "2026-05-19"
VERIFIED_BY = "Wilson Phase 2 scaffold (IELTS 6.0/6.5 표준 / TAFE 11 + 사립 specialist 8 / Cookery·Hospitality 라인업 보강)"

# ─── 학교 메타 (캠퍼스 · PR 카테고리 · 학비 등급) ─────────────────────

TAFES = [
    {"school_name": "TAFE NSW", "campus": "NSW 다중 캠퍼스 (Sydney CBD Ultimo / Kingscliff / Newcastle / Wollongong / Liverpool)",
     "pr_category": "Cat 1 Sydney / Cat 2 Newcastle·Wollongong", "tier": "tafe"},
    {"school_name": "TAFE QLD", "campus": "QLD 다중 캠퍼스 (Brisbane / Gold Coast / Cairns / Townsville / Sunshine Coast)",
     "pr_category": "Cat 1 Brisbane / Cat 2 Gold Coast / Cat 3 북부 QLD", "tier": "tafe"},
    {"school_name": "TAFE SA", "campus": "SA 다중 캠퍼스 (Adelaide Regency / Tonsley / Tea Tree Gully)",
     "pr_category": "Cat 2 Adelaide (전 지역)", "tier": "tafe"},
    {"school_name": "TAFE VIC", "campus": "VIC (Melbourne 중심)",
     "pr_category": "Cat 1 Melbourne", "tier": "tafe"},
    {"school_name": "TAFE WA", "campus": "WA 다중 캠퍼스 (Perth / Joondalup / Fremantle / Bentley)",
     "pr_category": "Cat 2 Perth (전 지역)", "tier": "tafe"},
    {"school_name": "TasTAFE TAS", "campus": "TAS (Hobart / Launceston / Burnie)",
     "pr_category": "Cat 3 Regional (전 지역)", "tier": "tafe"},
    {"school_name": "CDU TAFE NT", "campus": "NT (Darwin / Casuarina / Palmerston)",
     "pr_category": "Cat 3 Regional (Darwin)", "tier": "tafe"},
    {"school_name": "Holmesglen TAFE VIC", "campus": "Melbourne (Chadstone / Moorabbin / Glen Waverley / City)",
     "pr_category": "Cat 1 Melbourne", "tier": "tafe"},
    {"school_name": "Box Hill Institute VIC", "campus": "Melbourne (Box Hill / Lilydale / Nelson)",
     "pr_category": "Cat 1 Melbourne", "tier": "tafe"},
    {"school_name": "Chisholm Institute VIC", "campus": "Melbourne (Dandenong / Frankston / Cranbourne / Mornington)",
     "pr_category": "Cat 1 Melbourne", "tier": "tafe"},
    {"school_name": "Victoria Univ Polytechnic VIC", "campus": "Melbourne (Footscray Park / City Flinders / Sunshine / Werribee)",
     "pr_category": "Cat 1 Melbourne", "tier": "tafe"},
]

PRIVATES = [
    {"school_name": "William Angliss Institute", "school_type": "사립 specialist (government endorsed)",
     "campus": "Melbourne (555 La Trobe St) + Sydney (Pyrmont)",
     "pr_category": "Cat 1 Melbourne / Sydney", "tier": "premium-mid",
     "courses": ["cert3_cookery", "cert4_kitchen", "diploma_hospitality"]},
    {"school_name": "Le Cordon Bleu Australia (Adelaide)", "school_type": "사립 specialist (프랑스 culinary 브랜드)",
     "campus": "Adelaide (Days Rd Regency Park) + Sydney + Brisbane",
     "pr_category": "Cat 2 Adelaide / Cat 1 Sydney·Brisbane", "tier": "premium",
     "courses": ["cert3_cookery", "cert3_patisserie", "cert4_kitchen", "diploma_hospitality", "bachelor_hotel"]},
    {"school_name": "International College of Hotel Management (ICHM)", "school_type": "사립 specialist (hotel management)",
     "campus": "Adelaide (37 Sturt St)",
     "pr_category": "Cat 2 Adelaide", "tier": "premium",
     "courses": ["bachelor_hotel", "diploma_tourism"]},
    {"school_name": "BMIHMS by Torrens (Blue Mountains International Hotel Management School)",
     "school_type": "사립 specialist (Torrens University 부속 hotel management)",
     "campus": "Sydney (Hyde Park) + Leura (Blue Mountains)",
     "pr_category": "Cat 1 Sydney / Cat 3 Leura (Regional)", "tier": "premium",
     "courses": ["diploma_hotel"]},
    {"school_name": "William Blue College of Hospitality (Torrens)", "school_type": "사립 specialist (Torrens 부속 hospitality)",
     "campus": "Sydney CBD (Surry Hills)",
     "pr_category": "Cat 1 Sydney", "tier": "premium-mid",
     "courses": ["bachelor_hospitality", "diploma_hospitality"]},
    {"school_name": "Imagine Education Australia", "school_type": "사립 vocational (Gold Coast 주거 친화)",
     "campus": "Gold Coast (Southport) + Brisbane + Sydney",
     "pr_category": "Cat 2 Gold Coast / Cat 1 Sydney·Brisbane", "tier": "mid",
     "courses": ["cert3_cookery", "diploma_hospitality"]},
    {"school_name": "Australian Pacific College (APC)", "school_type": "사립 vocational",
     "campus": "Sydney CBD + Melbourne CBD",
     "pr_category": "Cat 1 Sydney / Melbourne", "tier": "mid",
     "courses": ["cert3_cookery", "diploma_hospitality"]},
    {"school_name": "Lonsdale Institute", "school_type": "사립 vocational",
     "campus": "Melbourne CBD + Sydney CBD",
     "pr_category": "Cat 1 Melbourne / Sydney", "tier": "mid",
     "courses": ["cert3_cookery", "diploma_hospitality"]},
]

# ─── 가격대 (학교 등급별) ────────────────────────────────────────────
TUITION_BY_TIER = {
    "tafe":         {"cert3": "$17,000~$22,000/년", "cert4": "$18,000~$24,000/년",
                     "diploma": "$20,000~$28,000/년", "bachelor": "$23,000~$30,000/년"},
    "mid":          {"cert3": "$16,000~$22,000/년", "cert4": "$17,000~$23,000/년",
                     "diploma": "$18,000~$25,000/년", "bachelor": "$22,000~$28,000/년"},
    "premium-mid":  {"cert3": "$22,000~$28,000/년", "cert4": "$23,000~$28,000/년",
                     "diploma": "$25,000~$32,000/년", "bachelor": "$28,000~$35,000/년"},
    "premium":      {"cert3": "$28,000~$36,000/년", "cert4": "$30,000~$38,000/년",
                     "diploma": "$32,000~$40,000/년", "bachelor": "$35,000~$42,000/년"},
}

# ─── 코스 템플릿 ─────────────────────────────────────────────────────
COURSE_TEMPLATES = {
    "cert3_cookery": {
        "school_id": "COOK",
        "major_name": "Certificate III in Commercial Cookery (SIT30821)",
        "level": "Certificate III",
        "duration": "1-1.5년 (52주 standard)",
        "ielts": "6.0 (각 5.5)",
        "pte": "50",
        "tuition_key": "cert3",
        "entry_requirement": "Year 12 (한국 고졸 / 검정고시) + IELTS 6.0 각 5.5",
        "pr_grade": "Chef 351311 / Cook 351411 (MLTSSL)",
        "note": "TRA 직업평가 가능. Cookery 트랙 진입 코스 — Cert III + 1년 호주 직장경력 → 485 → 189/190 PR.",
    },
    "cert3_patisserie": {
        "school_id": "PATIS",
        "major_name": "Certificate III in Patisserie (SIT31021)",
        "level": "Certificate III",
        "duration": "1년 (52주)",
        "ielts": "6.0 (각 5.5)",
        "pte": "50",
        "tuition_key": "cert3",
        "entry_requirement": "Year 12 + IELTS 6.0 각 5.5",
        "pr_grade": "Pastrycook 351112 (MLTSSL)",
        "note": "프랑스 culinary 세부 트랙. Le Cordon Bleu 등 specialist 강점.",
    },
    "cert4_kitchen": {
        "school_id": "COOK-IV",
        "major_name": "Certificate IV in Kitchen Management (SIT40521) — Cookery 연장",
        "level": "Certificate IV",
        "duration": "1.5-2년 (Cert III + 6개월 연장)",
        "ielts": "6.0 (각 5.5)",
        "pte": "50",
        "tuition_key": "cert4",
        "entry_requirement": "Cert III in Commercial Cookery 수료 (또는 동등) + IELTS 6.0",
        "pr_grade": "Chef 351311 (MLTSSL)",
        "note": "Sous Chef / Head Chef 진입 코스. 일부 학생은 Cert III + Cert IV 패키지로 처음부터 등록.",
    },
    "diploma_hospitality": {
        "school_id": "HOSP",
        "major_name": "Diploma of Hospitality Management (SIT50422)",
        "level": "Diploma",
        "duration": "2년 (104주)",
        "ielts": "6.0 (각 5.5)",
        "pte": "50",
        "tuition_key": "diploma",
        "entry_requirement": "Year 12 + IELTS 6.0 각 5.5",
        "pr_grade": "Restaurant Manager 141111 (MLTSSL) / Hotel Service Manager 141311 (CSOL)",
        "note": "Hospitality·Hotel manager 트랙. Bachelor 편입 가능 (1-1.5년 인정).",
    },
    "diploma_tourism": {
        "school_id": "HOSP",
        "major_name": "Diploma of Travel and Tourism (SIT50122) / Tourism and Hospitality Management",
        "level": "Diploma",
        "duration": "1.5-2년",
        "ielts": "6.0 (각 5.5)",
        "pte": "50",
        "tuition_key": "diploma",
        "entry_requirement": "Year 12 + IELTS 6.0 각 5.5",
        "pr_grade": "Travel Consultant 451611 (CSOL) / Tour Guide 451612 (CSOL)",
        "note": "Tourism 트랙. 관광청·여행사 진입.",
    },
    "diploma_hotel": {
        "school_id": "HOSP",
        "major_name": "Diploma of Business in International Hotel Management (BMIHMS Pathway)",
        "level": "Diploma",
        "duration": "1년",
        "ielts": "6.0 (각 5.5)",
        "pte": "50",
        "tuition_key": "diploma",
        "entry_requirement": "Year 12 + IELTS 6.0 각 5.5",
        "pr_grade": "Hotel Service Manager 141311 (CSOL)",
        "note": "BMIHMS Bachelor of Business 1학년 인정 트랙.",
    },
    "bachelor_hospitality": {
        "school_id": "HOSP-B",
        "major_name": "Bachelor of Business (Hospitality Management)",
        "level": "Bachelor",
        "duration": "3년",
        "ielts": "6.5 (각 6.0)",
        "pte": "58",
        "tuition_key": "bachelor",
        "entry_requirement": "Year 12 + ATAR 65 (또는 동등) + IELTS 6.5 각 6.0",
        "pr_grade": "Restaurant Manager 141111 (MLTSSL)",
        "note": "Hospitality 학사 트랙. 사립 specialist 의 brand value 활용.",
    },
    "bachelor_hotel": {
        "school_id": "HOSP-B",
        "major_name": "Bachelor of Business (International Hotel Management)",
        "level": "Bachelor",
        "duration": "3년",
        "ielts": "6.5 (각 6.0)",
        "pte": "58",
        "tuition_key": "bachelor",
        "entry_requirement": "Year 12 + ATAR 65 + IELTS 6.5 각 6.0",
        "pr_grade": "Hotel Service Manager 141311 (CSOL)",
        "note": "Hotel management 학사. ICHM / Le Cordon Bleu / BMIHMS 등 specialist brand.",
    },
}


def build_entry(major_id: str, school_meta: dict, course_key: str, school_type: str | None = None) -> dict:
    tpl = COURSE_TEMPLATES[course_key]
    tier = school_meta["tier"]
    tuition = TUITION_BY_TIER[tier][tpl["tuition_key"]]
    return {
        "major_id": major_id,
        "school_id": tpl["school_id"],
        "school_name": school_meta["school_name"],
        "school_type": school_type or school_meta.get("school_type") or "국립 (TAFE)",
        "major_name": tpl["major_name"],
        "level": tpl["level"],
        "duration": tpl["duration"],
        "tuition_2026": tuition,
        "ielts": tpl["ielts"],
        "pte": tpl["pte"],
        "entry_requirement": tpl["entry_requirement"],
        "pr_grade": tpl["pr_grade"],
        "note": tpl["note"],
        "_verified_by": VERIFIED_BY,
        "_verified_at": VERIFIED_AT,
        "campus": school_meta["campus"],
        "pr_category": school_meta["pr_category"],
        "scholarships": [],
        "_scholarship_verified_at": VERIFIED_AT,
    }


def main():
    print(f"Loading master: {MASTER}")
    with open(MASTER, encoding="utf-8") as f:
        data = json.load(f)

    # 다음 major_id 시작점
    existing = [m.get("major_id", "") for m in data["majors"]["all_majors"]]
    max_id = max((int(x[4:]) for x in existing if x.startswith("MAJ-") and x[4:].isdigit()), default=0)
    next_id = max_id + 1

    # Idempotent check — 같은 (school_name, major_name) 조합 이미 있으면 skip
    existing_pairs = {(m.get("school_name"), m.get("major_name")) for m in data["majors"]["all_majors"]}

    new_entries: list[dict] = []
    skipped: list[tuple[str, str]] = []

    # ── TAFE 11 × 3 코스 ─────────────────────────────────────────────
    TAFE_COURSES = ["cert3_cookery", "cert4_kitchen", "diploma_hospitality"]
    for tafe in TAFES:
        for course in TAFE_COURSES:
            tpl = COURSE_TEMPLATES[course]
            pair = (tafe["school_name"], tpl["major_name"])
            if pair in existing_pairs:
                skipped.append(pair); continue
            entry = build_entry(f"MAJ-{next_id:04d}", tafe, course, school_type="국립 (TAFE)")
            new_entries.append(entry)
            existing_pairs.add(pair)
            next_id += 1

    # ── 사립 specialist 8 ───────────────────────────────────────────
    for priv in PRIVATES:
        for course in priv["courses"]:
            tpl = COURSE_TEMPLATES[course]
            pair = (priv["school_name"], tpl["major_name"])
            if pair in existing_pairs:
                skipped.append(pair); continue
            entry = build_entry(f"MAJ-{next_id:04d}", priv, course)
            new_entries.append(entry)
            existing_pairs.add(pair)
            next_id += 1

    print(f"\n=== 생성된 entries: {len(new_entries)} (skipped: {len(skipped)}) ===")
    from collections import Counter
    type_counter = Counter(e["school_type"] for e in new_entries)
    for t, n in type_counter.most_common():
        print(f"  {t}: {n}")
    print()
    school_counter = Counter(e["school_name"] for e in new_entries)
    for s, n in sorted(school_counter.items()):
        print(f"  {s}: {n} courses")

    if skipped:
        print("\n=== SKIPPED (이미 존재) ===")
        for s, m in skipped:
            print(f"  - {s} / {m}")

    # ── master.majors.all_majors 에 append ────────────────────────────
    data["majors"]["all_majors"].extend(new_entries)
    data["majors"]["_count"] = len(data["majors"]["all_majors"])

    # ── _meta 에 Phase 2 작업 기록 ────────────────────────────────────
    data["_meta"]["version"] = f"v2.0 (Phase 2 cookery+hospitality 보강 {VERIFIED_AT})"
    data["_meta"].setdefault("phase2_additions", []).append({
        "date": VERIFIED_AT,
        "by": VERIFIED_BY,
        "entries_added": len(new_entries),
        "schools_affected": sorted({e["school_name"] for e in new_entries}),
    })

    # 저장
    with open(MASTER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size_kb = MASTER.stat().st_size / 1024
    print(f"\n✓ Saved: {MASTER} ({size_kb:,.1f} KB)")
    print(f"  total all_majors: {data['majors']['_count']}")
    print(f"  added: {len(new_entries)} entries")


if __name__ == "__main__":
    main()
