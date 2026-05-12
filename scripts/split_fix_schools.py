#!/usr/bin/env python3
"""
002_data_schools_seed.sql 의 schools INSERT 부분만 추출 + 분할 → 100KB 미만 파일들 생성

출력:
  supabase/migrations/002_FIX_00_reset_schools.sql       (기존 58교 삭제)
  supabase/migrations/002_FIX_01_schools_part_01.sql     (11교)
  supabase/migrations/002_FIX_01_schools_part_02.sql     (11교)
  ... (총 11개 분할 파일)

사용: Wilson SQL Editor에서 00 → 01_part_01 → ... → 01_part_11 순서대로 실행
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MIG_DIR = ROOT / "supabase" / "migrations"
SOURCE = MIG_DIR / "002_data_schools_seed.sql"

# 분할 사이즈 (KB / Wilson 결정: 각 part 100KB 미만)
# 동적 분할: 누적 사이즈 < MAX_PART_KB 일 때까지 같은 part에 누적
MAX_PART_KB = 90  # 안전 마진 10KB


def main():
    content = SOURCE.read_text(encoding="utf-8")

    # schools INSERT 문만 추출 (blocking_rules / wilson_alerts 제외)
    school_inserts = re.findall(
        r"INSERT INTO schools \(.*?\) ON CONFLICT \(master_id\) DO NOTHING;",
        content,
        re.DOTALL,
    )
    print(f"Schools INSERT found: {len(school_inserts)}")

    # 00_reset 파일 (기존 schools 데이터 삭제 / 다른 테이블은 그대로)
    reset_sql = """-- ════════════════════════════════════════════════════════════
-- 002_FIX_00_reset_schools.sql
-- 기존 schools 58교 삭제 (master_id가 그룹 ID로 잘못 박힘)
-- 그 다음 002_FIX_01_schools_part_01.sql ~ part_11.sql 순서대로 실행
-- 다른 테이블(blocking_rules / wilson_alerts / FAQ 등) = 그대로 유지
-- ════════════════════════════════════════════════════════════

BEGIN;

-- 학교 의존 데이터 먼저 정리 (외래키 / Phase 1엔 아직 비어있을 것)
DELETE FROM school_applications;

-- schools 전체 삭제
DELETE FROM schools;

COMMIT;

-- 검증: SELECT COUNT(*) FROM schools;  → 0 이어야 함
"""
    (MIG_DIR / "002_FIX_00_reset_schools.sql").write_text(reset_sql, encoding="utf-8")
    print(f"✅ Generated: 002_FIX_00_reset_schools.sql")

    # 기존 schools part 파일들 정리 (재실행 시 잔여물 제거)
    for old in MIG_DIR.glob("002_FIX_01_schools_part_*.sql"):
        old.unlink()

    # Dynamic 분할: 누적 사이즈 < MAX_PART_KB
    max_bytes = MAX_PART_KB * 1024
    parts = []                # list of lists of INSERTs
    current_chunk = []
    current_size = 0

    for insert in school_inserts:
        ins_size = len(insert.encode("utf-8"))
        # 한 학교 INSERT가 90KB 초과면 단독 part로
        if ins_size > max_bytes:
            if current_chunk:
                parts.append(current_chunk)
                current_chunk = []
                current_size = 0
            parts.append([insert])
            continue
        # 누적이 한도 넘으면 새 part 시작
        if current_size + ins_size > max_bytes:
            parts.append(current_chunk)
            current_chunk = [insert]
            current_size = ins_size
        else:
            current_chunk.append(insert)
            current_size += ins_size

    if current_chunk:
        parts.append(current_chunk)

    total_parts = len(parts)
    for i, chunk in enumerate(parts):
        part_num = i + 1
        fname = f"002_FIX_01_schools_part_{part_num:02d}.sql"
        body = [
            f"-- ════════════════════════════════════════════════════════════",
            f"-- {fname}",
            f"-- 109교 中 {part_num}/{total_parts} 분할 ({len(chunk)}교)",
            f"-- master_id = school_name slug (unique 보장)",
            f"-- ════════════════════════════════════════════════════════════",
            "",
            "BEGIN;",
            "",
        ]
        body.extend(chunk)
        body.append("")
        body.append("COMMIT;")
        body.append("")
        body.append(f"-- ✅ Inserted: {len(chunk)} schools (part {part_num}/{total_parts})")

        out_path = MIG_DIR / fname
        out_path.write_text("\n".join(body), encoding="utf-8")
        size_kb = out_path.stat().st_size / 1024
        marker = "⚠️ >100KB" if size_kb >= 100 else "✅"
        print(f"{marker} {fname} ({len(chunk)} schools / {size_kb:.1f} KB)")

    print(f"\nTotal: 1 reset + {total_parts} parts = {total_parts + 1} files")
    print(f"Wilson 실행 순서:")
    print(f"  1) 002_FIX_00_reset_schools.sql")
    for i in range(total_parts):
        print(f"  {i+2}) 002_FIX_01_schools_part_{i+1:02d}.sql")


if __name__ == "__main__":
    main()
