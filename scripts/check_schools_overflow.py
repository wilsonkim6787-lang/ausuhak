#!/usr/bin/env python3
"""
020_fix_schools_import.sql 검사 → VARCHAR 제한 초과 컬럼 탐지
사용: python scripts/check_schools_overflow.py
"""
import re
import sys
from pathlib import Path
from collections import Counter

# UTF-8 stdout
sys.stdout.reconfigure(encoding="utf-8")

SQL_FILE = Path(r"C:\Users\Wilson\Desktop\ausuhak\supabase\migrations\020_fix_schools_import.sql")

COLS = [
    "master_id", "name", "alternate_names", "type", "city", "state", "campus",
    "cricos_code", "qs_ranking", "founded", "operator", "programs", "scholarships",
    "status", "payment_cycle", "master_category", "internal_notes", "last_verified_at",
]

# 020 ALTER 적용 후 컬럼 제한 (master_id 50→200, city 50→100)
LIMITS = {
    "master_id": 200,
    "name": 255,
    "type": 30,
    "city": 100,
    "state": 20,
    "campus": 255,
    "cricos_code": 50,
    "operator": 255,
    "status": 20,
    "payment_cycle": 20,
    "master_category": 50,
}


def split_sql_values(raw: str):
    """VALUES (...) 안의 값들을 컴마로 분리. 문자열·JSONB·배열 처리."""
    parts, cur, depth, in_str = [], [], 0, False
    i = 0
    while i < len(raw):
        c = raw[i]
        if c == "'":
            if in_str and i + 1 < len(raw) and raw[i + 1] == "'":
                cur.append("''")
                i += 2
                continue
            in_str = not in_str
            cur.append(c)
            i += 1
            continue
        if not in_str:
            if c in "({[":
                depth += 1
            elif c in ")}]":
                depth -= 1
            if c == "," and depth == 0:
                parts.append("".join(cur).strip())
                cur = []
                i += 1
                continue
        cur.append(c)
        i += 1
    if cur:
        parts.append("".join(cur).strip())
    return parts


def unwrap(raw: str) -> str:
    """SQL literal → Python string (단순 case)"""
    if raw == "NULL":
        return None
    if "::" in raw:
        # 'foo'::jsonb / 'date'::timestamp
        before = raw.split("::")[0]
        if before.startswith("'") and before.endswith("'"):
            return before[1:-1].replace("''", "'")
    if raw.startswith("'") and raw.endswith("'"):
        return raw[1:-1].replace("''", "'")
    return raw  # numeric


def main():
    sql = SQL_FILE.read_text(encoding="utf-8")
    max_per_col = {c: (0, "", "") for c in COLS}
    violations = []

    for line in sql.split("\n"):
        if not line.startswith("INSERT INTO schools"):
            continue
        m = re.search(r"VALUES\s*\((.+)\);\s*$", line)
        if not m:
            continue
        parts = split_sql_values(m.group(1))
        if len(parts) < len(COLS):
            continue

        master_id_val = unwrap(parts[0]) or "?"
        for idx, col in enumerate(COLS):
            v = unwrap(parts[idx])
            if v is None:
                continue
            L = len(v)
            if L > max_per_col[col][0]:
                max_per_col[col] = (L, v[:80], master_id_val)
            if col in LIMITS and L > LIMITS[col]:
                violations.append((col, L, LIMITS[col], master_id_val, v[:150]))

    print("=== Max length per VARCHAR-limited column ===")
    for col in COLS:
        if col not in LIMITS:
            continue
        L, sample, mid = max_per_col[col]
        flag = "  ⚠️ OVERFLOW" if L > LIMITS[col] else ""
        print(f"  {col:18s} max={L:4d}  limit={LIMITS[col]:3d}{flag}")
        if L > LIMITS[col]:
            print(f'      example: master_id="{mid}"  value="{sample}"')

    print(f"\n=== Total violation rows: {len(violations)} ===")
    by_col = Counter(v[0] for v in violations)
    for col, cnt in by_col.most_common():
        print(f"  {col:18s} {cnt:4d} rows  (limit={LIMITS[col]})")

    if violations:
        print("\n=== First 3 samples per offending column ===")
        shown = {}
        for col, L, lim, mid, sample in violations:
            shown.setdefault(col, [])
            if len(shown[col]) < 3:
                shown[col].append((L, mid, sample))
        for col, rows in shown.items():
            print(f"\n  [{col}] limit={LIMITS[col]}:")
            for L, mid, sample in rows:
                print(f"    len={L:4d}  ({mid})")
                print(f"             {sample!r}")


if __name__ == "__main__":
    main()
