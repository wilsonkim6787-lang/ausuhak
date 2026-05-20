"""draft 두 파일 (학교 51 + 전공 30 + 시나리오 20) → wilson-faqs.json 머지.
카테고리 이름으로 자동 매핑. _meta 제거. 머지 후 draft 파일 삭제.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "data"
MAIN = ROOT / "wilson-faqs.json"
DRAFTS = [
    ROOT / "wilson-faqs-draft-schools.json",
    ROOT / "wilson-faqs-draft-majors-scenarios.json",
]

# draft category name → wilson-faqs.json category index
MAPPING = {
    "학교 고르기 (DRAFT +50)": 2,        # 🎓 학교 고르기
    "간호·의대·약대 (DRAFT +15)": 3,      # 🏥 간호·의대·약대
    "IT·경영·교육 (DRAFT +10)": 5,        # 💼 IT·경영·교육
    "요리·트레이드 (DRAFT +5)": 4,        # 🍳 요리·트레이드
    "시나리오별 케이스 (DRAFT +20)": 0,   # 🌱 처음 시작할 때
}


def main():
    main_data = json.loads(MAIN.read_text(encoding="utf-8"))
    cats = main_data["categories"]
    before = [len(c["items"]) for c in cats]

    merged_total = 0
    for draft_path in DRAFTS:
        draft = json.loads(draft_path.read_text(encoding="utf-8"))
        for d_cat in draft.get("categories", []):
            target_idx = MAPPING.get(d_cat["name"])
            if target_idx is None:
                print(f"WARN: no mapping for {d_cat['name']!r}, skip")
                continue
            n = len(d_cat["items"])
            cats[target_idx]["items"].extend(d_cat["items"])
            merged_total += n
            print(f"  {d_cat['name']!r} → cats[{target_idx}] {cats[target_idx]['name']!r} (+{n})")

    after = [len(c["items"]) for c in cats]

    MAIN.write_text(json.dumps(main_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print("\n--- result ---")
    for c, b, a in zip(cats, before, after):
        diff = a - b
        marker = f"  +{diff}" if diff else ""
        print(f"  {c['icon']} {c['name']}: {b} → {a}{marker}")
    print(f"\n  total: {sum(before)} → {sum(after)} (+{merged_total})")

    # draft 파일 삭제
    for p in DRAFTS:
        p.unlink()
        print(f"  removed: {p.name}")


if __name__ == "__main__":
    main()
