# -*- coding: utf-8 -*-
"""Extract FULL section bodies from FINAL HTML to safe per-section .txt files.
Never prints body to stdout to avoid surrogate crash."""
import re
import sys
import io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SRC = Path(r"C:/Users/Wilson/Desktop/ausuhak_v25/03_HTML/ausuhak_main_FINAL.html")
OUT = Path(__file__).parent / "full_sections"
OUT.mkdir(exist_ok=True)

content = SRC.read_text(encoding="utf-8")
lines = content.split("\n")

section_open_pat = re.compile(r"<section\b", re.IGNORECASE)
section_close_pat = re.compile(r"</section>", re.IGNORECASE)
id_pat = re.compile(r'\bid="([^"]+)"')
class_pat = re.compile(r'\bclass="([^"]+)"')

section_starts = []
depth = 0
current = None
for i, line in enumerate(lines, 1):
    for _ in section_open_pat.findall(line):
        if depth == 0:
            mid = id_pat.search(line)
            mcl = class_pat.search(line)
            current = {
                "start": i,
                "id": mid.group(1) if mid else "",
                "class": mcl.group(1) if mcl else "",
            }
        depth += 1
    for _ in section_close_pat.findall(line):
        depth -= 1
        if depth == 0 and current:
            current["end"] = i
            section_starts.append(current)
            current = None

for idx, s in enumerate(section_starts, 1):
    body = "\n".join(lines[s["start"] - 1 : s["end"]])
    name = s["id"] or f"sec{idx}"
    fp = OUT / f"{idx:02d}_{name}.txt"
    fp.write_text(body, encoding="utf-8")
    print(f"OK {idx:02d} id={s['id']} class={s['class']} lines={s['start']}-{s['end']} bytes={len(body)}")
