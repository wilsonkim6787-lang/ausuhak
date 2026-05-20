"""wilson-faqs.json 의 open.kakao.com/studywilson 표현 → 정본 카톡 채널 (pf.kakao.com/_GadTX) 로 정리.
memory feedback-content-absolute-rules 규칙 #2.
"""
import json
import re
from pathlib import Path

MAIN = Path(__file__).resolve().parents[1] / "src" / "data" / "wilson-faqs.json"

# 정본 카톡 채널
OFFICIAL = "https://pf.kakao.com/_GadTX"

REPLACEMENTS = [
    # URL 형식 (longest first)
    ("https://open.kakao.com/o/studywilson", OFFICIAL),
    ("http://open.kakao.com/o/studywilson", OFFICIAL),
    ("open.kakao.com/o/studywilson", OFFICIAL),
    # ID 형식
    ("카카오 'studywilson'", "카카오 채널"),
    ("카카오 studywilson 추가", "카카오 채널 추가"),
    ("카카오 studywilson", "카카오 채널"),
    ("studywilson", "카카오 채널"),
]


def main():
    text = MAIN.read_text(encoding="utf-8")
    counts = {}
    for src, dst in REPLACEMENTS:
        n = text.count(src)
        if n:
            text = text.replace(src, dst)
            counts[src] = n
    MAIN.write_text(text, encoding="utf-8")

    # 검증
    data = json.loads(text)  # JSON 유효성
    total = sum(len(c["items"]) for c in data["categories"])

    print("replacements:")
    grand = 0
    for src, n in counts.items():
        print(f"  {src!r:55} x {n}")
        grand += n
    print(f"  --- total: {grand}")
    print(f"  faqs intact: {total} items in {len(data['categories'])} categories")


if __name__ == "__main__":
    main()
