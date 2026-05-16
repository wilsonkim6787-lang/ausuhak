"""tar.gz 안의 475 매뉴얼 → Supabase INSERT SQL 생성.

사용: python scripts/import_staff_manuals.py > supabase/migrations/026_seed_staff_manuals.sql

dollar-quoted strings ($tag$...$tag$) 로 single quote 이스케이프 회피.
카테고리는 파일명 키워드 best-effort.
"""
from __future__ import annotations

import re
import sys
import tarfile
from pathlib import Path

TAR_PATH = Path("C:/Users/Wilson/Desktop/ausuhak_v25/04_ASSETS/ausuhak_staff_manuals_475_tar.gz")

# 카테고리 매핑 — 파일명에 키워드 있으면 해당 카테고리 (우선순위 순)
CATEGORY_MAP = [
    ("PR",          ["PR신청", "영주권"]),
    ("비자",         ["비자", "Bridging", "BVA", "BVB", "BVE", "TR", "WHV", "456"]),
    ("학력_검정고시", ["검정고시"]),
    ("학력_조기유학", ["조기유학", "고1", "고2", "보딩"]),
    ("학력_고졸",    ["고졸", "Year12", "수능"]),
    ("학력_대학",    ["대학생", "대학교", "휴학"]),
    ("학력_한국학사", ["한국학사", "한국4년제", "한국교사"]),
    ("학력_한국전공자", ["한국간호사", "한국의사", "한국약사", "한국회계사", "한국변호사", "한국IT", "한국공대", "한국회계"]),
    ("전공_간호",    ["간호"]),
    ("전공_의료",    ["의대", "의료", "의사", "약사", "치과", "물리치료", "정신과", "진료", "GP", "OSHC"]),
    ("전공_IT",      ["IT", "ICT"]),
    ("전공_요리",    ["요리", "쉐프", "쿠킹"]),
    ("전공_트레이드", ["트레이드", "트레이즈", "Trade", "전기", "용접", "헤어"]),
    ("어학",         ["어학", "ELICOS", "IELTS", "PTE", "어학연수"]),
    ("학교",         ["Foundation", "Diploma", "TAFE", "Master", "패스웨이"]),
    ("지역",         ["시드니", "멜번", "브리즈번", "퍼스", "애들레이드", "Adelaide", "타스마니아", "캔버라", "Regional"]),
    ("생활",         ["생활", "인터넷", "통신", "TFN", "Super", "은행", "교통", "주거", "쉐어", "렌트"]),
    ("의료_정신건강", ["멘탈", "정신건강", "헬스"]),
    ("가족",         ["가족", "결혼", "자녀", "부모"]),
    ("취업",         ["취업", "구직", "이력서", "면접", "연봉"]),
    ("시민권",       ["시민권"]),
    ("기타",         []),
]


def detect_category(filename: str) -> str | None:
    """파일명 키워드 매칭. 매뉴얼 다중 키워드면 우선순위 높은 카테고리 채택."""
    base = filename.replace(".md", "").lower()
    for cat, keys in CATEGORY_MAP:
        for k in keys:
            if k.lower() in base:
                return cat
    return "기타"


def extract_title(filename: str) -> str:
    """manual_NNN_keyword1_keyword2.md → 'keyword1 keyword2'"""
    base = filename.replace(".md", "")
    parts = base.split("_", 2)
    if len(parts) < 3:
        return base
    return parts[2].replace("_", " ")


def make_search_text(content: str) -> str:
    """markdown 특수문자 제거 → ILIKE 검색용 평문"""
    s = re.sub(r"[#*`\[\]()|>\-=]+", " ", content)
    s = re.sub(r"\s+", " ", s).strip()
    return s[:5000]  # 너무 길면 자름


def dollar_quote(s: str) -> str:
    """Postgres dollar-quoted string. content 안에 충돌 없는 tag 자동 선택."""
    tag = "M"
    while f"${tag}$" in s:
        tag += "x"
    return f"${tag}${s}${tag}$"


def main() -> int:
    if not TAR_PATH.exists():
        print(f"-- ERROR: tar 파일 없음: {TAR_PATH}", file=sys.stderr)
        return 1

    rows = []
    with tarfile.open(TAR_PATH) as t:
        for m in t:
            if not m.isfile():
                continue
            name = m.name.split("/")[-1]
            if not name.startswith("manual_"):
                continue
            try:
                num = int(name.split("manual_")[1].split("_")[0])
            except (ValueError, IndexError):
                continue
            f = t.extractfile(m)
            if f is None:
                continue
            content = f.read().decode("utf-8")
            title = extract_title(name)
            category = detect_category(name)
            search = make_search_text(content)
            rows.append((num, category, title, content, search))

    rows.sort(key=lambda r: r[0])
    print(f"-- ═══════════════════════════════════════════════════════════")
    print(f"-- 026_seed_staff_manuals.sql")
    print(f"-- {len(rows)} 매뉴얼 시드 (Wilson v6 / ausuhak_staff_manuals_475_tar.gz)")
    print(f"-- 생성 스크립트: scripts/import_staff_manuals.py")
    print(f"-- 재실행 OK (ON CONFLICT (number) DO UPDATE)")
    print(f"-- ═══════════════════════════════════════════════════════════")
    print()
    print("BEGIN;")
    print()

    BATCH = 40  # 한 INSERT 당 row 수 (statement 크기 균형)
    for i in range(0, len(rows), BATCH):
        chunk = rows[i:i + BATCH]
        print("INSERT INTO staff_manuals (number, category, title, content, search_text) VALUES")
        vals = []
        for num, cat, title, content, search in chunk:
            cat_v = dollar_quote(cat) if cat else "NULL"
            vals.append(
                f"  ({num}, {cat_v}, {dollar_quote(title)}, {dollar_quote(content)}, {dollar_quote(search)})"
            )
        print(",\n".join(vals))
        print("ON CONFLICT (number) DO UPDATE SET")
        print("  category = EXCLUDED.category,")
        print("  title = EXCLUDED.title,")
        print("  content = EXCLUDED.content,")
        print("  search_text = EXCLUDED.search_text,")
        print("  updated_at = NOW();")
        print()

    print("COMMIT;")
    return 0


if __name__ == "__main__":
    sys.exit(main())
