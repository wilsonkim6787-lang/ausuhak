#!/usr/bin/env python3
"""
모든 마이그레이션 SQL을 1개 파일로 합쳐서 Wilson 복붙용 생성

출력: supabase/migrations/000_BUNDLED_PHASE1.sql

순서 (사양서 PART D-10):
  001_initial_users.sql           (스키마)
  002_initial_schools.sql         (스키마)
  002_data_schools_seed.sql       (데이터)
  003_initial_students.sql        (스키마)
  004_initial_lifecycle.sql       (스키마)
  005_initial_faqs.sql            (스키마)
  005_data_faqs_seed.sql          (데이터)
  012_initial_settings.sql        (스키마+초기 12 row)
  013_initial_rls.sql             (RLS)
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MIG_DIR = ROOT / "supabase" / "migrations"
OUTPUT = MIG_DIR / "000_BUNDLED_PHASE1.sql"

ORDER = [
    "001_initial_users.sql",
    "002_initial_schools.sql",
    "002_data_schools_seed.sql",
    "003_initial_students.sql",
    "004_initial_lifecycle.sql",
    "005_initial_faqs.sql",
    "005_data_faqs_seed.sql",
    "012_initial_settings.sql",
    "013_initial_rls.sql",
]


def main():
    bundled = [
        "-- ════════════════════════════════════════════════════════════",
        "-- ausuhak.com Phase 1 마이그레이션 통합 SQL",
        "-- ════════════════════════════════════════════════════════════",
        "-- 실행 방법:",
        "--   1. Supabase 대시보드 → SQL Editor",
        "--   2. [New query] 클릭",
        "--   3. 이 파일 전체 복붙",
        "--   4. [Run] 클릭 (1~2분 소요)",
        "--",
        "-- 정본:",
        "--   - schools: 109교 + 1,235전공 (programs JSONB)",
        "--   - blocking_rules: 36개 / wilson_alerts_rules: 24개",
        "--   - internal_faqs: 83개 placeholder (콘텐츠 = Step 1.6)",
        "--   - site_settings: 12개 초기 row",
        "--   - RLS: 모든 테이블 활성화 (3중 보안 Layer 1)",
        "-- ════════════════════════════════════════════════════════════",
        "",
    ]

    for fname in ORDER:
        path = MIG_DIR / fname
        if not path.exists():
            print(f"⚠️  missing: {fname}")
            continue

        bundled.append("")
        bundled.append(f"-- ───────────────────────────────────────────────────────────")
        bundled.append(f"-- ▼ {fname}")
        bundled.append(f"-- ───────────────────────────────────────────────────────────")
        bundled.append("")
        bundled.append(path.read_text(encoding="utf-8"))

    OUTPUT.write_text("\n".join(bundled), encoding="utf-8")
    size_mb = OUTPUT.stat().st_size / 1024 / 1024
    print(f"✅ Generated: {OUTPUT}")
    print(f"   Size: {size_mb:.2f} MB")
    print(f"   Files bundled: {len(ORDER)}")


if __name__ == "__main__":
    main()
