"""머지된 wilson-faqs.json 의 5개 카테고리에서 새 항목(append 된 끝부분) 을 앞으로 이동.
메인 페이지 FAQPreview 미리보기에서 새 질문이 먼저 노출되도록.
"""
import json
from pathlib import Path

MAIN = Path(__file__).resolve().parents[1] / "src" / "data" / "wilson-faqs.json"

# (category index, 신규 항목 수 = 끝에서 가져올 개수)
REORDER = [
    (0, 20),  # 처음 시작할 때: new 20
    (2, 51),  # 학교 고르기: new 51
    (3, 15),  # 간호·의대·약대: new 15
    (4, 5),   # 요리·트레이드: new 5
    (5, 10),  # IT·경영·교육: new 10
]


def main():
    data = json.loads(MAIN.read_text(encoding="utf-8"))
    cats = data["categories"]

    for idx, new_count in REORDER:
        items = cats[idx]["items"]
        total = len(items)
        if new_count > total:
            print(f"WARN: {cats[idx]['name']} has {total} items, new_count={new_count}")
            continue
        old_items = items[: total - new_count]
        new_items = items[total - new_count :]
        cats[idx]["items"] = new_items + old_items
        print(f"  {cats[idx]['icon']} {cats[idx]['name']}: new {new_count} → top, old {len(old_items)} → bottom")

    MAIN.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n  total items unchanged: {sum(len(c['items']) for c in cats)}")


if __name__ == "__main__":
    main()
