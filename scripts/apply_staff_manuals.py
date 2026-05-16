"""tar.gz → Supabase staff_manuals 직접 upsert (REST API).

배경: Migration 026 (5.7MB SQL) 이 브라우저 SQL Editor 에서 paste 실패. 우회 = REST API.
서비스 롤 키 사용 (RLS 우회). 배치 50개씩 → 진행률 출력. ON CONFLICT (number) merge.

사용:
  python scripts/apply_staff_manuals.py
환경:
  .env.local 에 NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 필요.
"""
from __future__ import annotations

import re
import sys
import tarfile
import urllib.request
import urllib.error
import json
from pathlib import Path

TAR_PATH = Path("C:/Users/Wilson/Desktop/ausuhak_v25/04_ASSETS/ausuhak_staff_manuals_475_tar.gz")
ENV_PATH = Path(".env.local")

# import_staff_manuals.py 와 동일 카테고리 매핑
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
]


def detect_category(filename: str) -> str:
    base = filename.replace(".md", "").lower()
    for cat, keys in CATEGORY_MAP:
        for k in keys:
            if k.lower() in base:
                return cat
    return "기타"


def extract_title(filename: str) -> str:
    base = filename.replace(".md", "")
    parts = base.split("_", 2)
    return parts[2].replace("_", " ") if len(parts) >= 3 else base


def make_search_text(content: str) -> str:
    s = re.sub(r"[#*`\[\]()|>\-=]+", " ", content)
    s = re.sub(r"\s+", " ", s).strip()
    return s[:5000]


def load_env() -> tuple[str, str]:
    if not ENV_PATH.exists():
        print(f"ERROR: {ENV_PATH} 없음", file=sys.stderr)
        sys.exit(1)
    env = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 누락", file=sys.stderr)
        sys.exit(1)
    return url, key


def post(url: str, key: str, path: str, body: list | dict | None, prefer: str = "") -> tuple[int, dict | str, dict]:
    """REST API POST. 응답: (status, json/text, headers)"""
    req = urllib.request.Request(
        f"{url}{path}",
        data=json.dumps(body).encode("utf-8") if body is not None else None,
        method="POST" if body is not None else "GET",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": prefer,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            try:
                data = json.loads(raw) if raw else {}
            except json.JSONDecodeError:
                data = raw
            return resp.status, data, dict(resp.headers)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        return e.code, raw, dict(e.headers)


def main() -> int:
    if not TAR_PATH.exists():
        print(f"ERROR: tar 파일 없음: {TAR_PATH}", file=sys.stderr)
        return 1
    url, key = load_env()
    print(f"Supabase URL: {url.split('//')[1].split('.')[0]}...")

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
            rows.append({
                "number": num,
                "category": detect_category(name),
                "title": extract_title(name),
                "content": content,
                "search_text": make_search_text(content),
            })
    rows.sort(key=lambda r: r["number"])
    total = len(rows)
    print(f"Loaded {total} manuals from tar.gz")

    # 배치 upsert
    BATCH = 50
    endpoint = "/rest/v1/staff_manuals?on_conflict=number"
    prefer = "resolution=merge-duplicates,return=minimal"

    ok_count = 0
    for i in range(0, total, BATCH):
        chunk = rows[i:i + BATCH]
        start = chunk[0]["number"]
        end = chunk[-1]["number"]
        status, body, _ = post(url, key, endpoint, chunk, prefer=prefer)
        if 200 <= status < 300:
            ok_count += len(chunk)
            print(f"  Batch {i // BATCH + 1:2d} [#{start:3d}~#{end:3d}] OK   ({ok_count}/{total})")
        else:
            print(f"  Batch {i // BATCH + 1:2d} [#{start:3d}~#{end:3d}] FAIL status={status}")
            print(f"    body: {str(body)[:500]}")
            return 2

    # 검증
    status, _, headers = post(url, key, "/rest/v1/staff_manuals?select=number", None, prefer="count=exact,head=true")
    cr = headers.get("Content-Range", "")
    if "/" in cr:
        actual = cr.split("/")[-1]
        print(f"\nFinal count (Content-Range): {actual}")
        if str(actual) == str(total):
            print("✅ 성공: 모든 row 적용됨")
            return 0
        else:
            print(f"⚠️ 불일치: 기대 {total}, 실제 {actual}")
            return 3
    print(f"\nVerification headers Content-Range 누락: {headers}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
