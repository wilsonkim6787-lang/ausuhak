"""monitoring_sites → src/data/monitoring-sites.json 정적 dump.
FAQ 페이지에서 빌드 시 import 해서 카테고리별 참고 사이트 노출.
"""
from __future__ import annotations

import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env.local"
OUT_PATH = ROOT / "src" / "data" / "monitoring-sites.json"


def load_env() -> tuple[str, str]:
    env: dict[str, str] = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: env 누락", file=sys.stderr)
        sys.exit(1)
    return url, key


def fetch_all(url: str, key: str) -> list[dict]:
    req = urllib.request.Request(
        f"{url}/rest/v1/monitoring_sites?select=sheet,section,category,name,url,description,display_order&order=sheet.asc,display_order.asc",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Prefer": "count=exact",
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    url, key = load_env()
    rows = fetch_all(url, key)
    print(f"fetched {len(rows)} sites")

    # 시트별 카운트 확인
    by_sheet: dict[str, int] = {}
    for r in rows:
        s = r.get("sheet", "")
        by_sheet[s] = by_sheet.get(s, 0) + 1
    print("\nby sheet:")
    for s, n in sorted(by_sheet.items()):
        print(f"  {s}: {n}")

    OUT_PATH.write_text(
        json.dumps({"sites": rows}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n→ {OUT_PATH.relative_to(ROOT)} ({OUT_PATH.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
