"""draft JSON 두 파일에서 직진/Direct 표현 → 곧바로/본 과정 일괄 치환.
순서 = 긴 패턴 우선 (overlap 방지).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "data"
FILES = ["wilson-faqs-draft-schools.json", "wilson-faqs-draft-majors-scenarios.json"]

# 순서 중요: 긴 패턴부터
REPLACEMENTS = [
    # 의대 Direct/직진 묶음
    ("Direct MBBS/MD 6년 (학사 직진)", "MBBS/MD 6년 본 과정"),
    ("Direct MBBS/MD", "MBBS/MD 본 과정"),
    ("Direct MBBS", "MBBS 본 과정"),
    ("Direct 의대", "본 과정 의대"),
    ("의대 직진", "의대 본 과정 진학"),
    ("MBBS Direct", "MBBS 본 과정"),
    # 학사 직진 묶음
    ("학사 직진학은 어렵지만", "학사 입학사정 통과는 어렵지만"),
    ("학사 직진학", "학사 본 과정 진학"),
    ("학사 직진 가능", "학사 본 과정 진학 가능"),
    ("학사 직진은", "학사 본 과정 진학은"),
    ("학사 직진", "학사 본 과정"),
    # 일반 직진 표현
    ("직진학 입학사정은 어렵지만", "학사 입학사정 통과는 어렵지만"),
    ("직진학 트랙", "본 과정 진학 트랙"),
    ("직진학", "본 과정 진학"),
    ("Go8 직진", "Go8 학사 본 과정"),
    ("학사 직진 트랙", "학사 본 과정 트랙"),
    ("직진 케이스", "본 과정 진학 케이스"),
    ("직진 가능", "본 과정 진학 가능"),
    ("직진 트랙", "본 과정 트랙"),
    # 잔여 단독 "직진"
    ("직진", "곧바로"),
]


def replace_in_text(text: str) -> tuple[str, dict]:
    counts = {}
    for src, dst in REPLACEMENTS:
        n = text.count(src)
        if n:
            text = text.replace(src, dst)
            counts[src] = n
    return text, counts


def process(path: Path) -> None:
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    file_counts = {}
    for cat in data.get("categories", []):
        for item in cat.get("items", []):
            for field in ("q", "a"):
                if field in item:
                    new_val, counts = replace_in_text(item[field])
                    item[field] = new_val
                    for k, v in counts.items():
                        file_counts[k] = file_counts.get(k, 0) + v

    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{path.name}:")
    total = 0
    for src, n in file_counts.items():
        print(f"  {src!r:60} x {n}")
        total += n
    print(f"  --- total replacements: {total}")


for fname in FILES:
    process(ROOT / fname)
