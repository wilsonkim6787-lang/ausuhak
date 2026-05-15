# -*- coding: utf-8 -*-
"""Analyze ausuhak_main_FINAL.html safely — no large body to stdout.
Writes UTF-8 summary + per-section files to .tmp_html_analysis/."""
import os
import re
import sys
import io
from pathlib import Path

# Force stdout to UTF-8 so any minimal print is safe
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SRC = Path(r"C:/Users/Wilson/Desktop/ausuhak_v25/03_HTML/ausuhak_main_FINAL.html")
OUT = Path(__file__).parent

content = SRC.read_text(encoding="utf-8")
lines = content.split("\n")
total = len(lines)

# -- structural scan --
section_open_pat = re.compile(r"<section\b", re.IGNORECASE)
section_close_pat = re.compile(r"</section>", re.IGNORECASE)
id_pat = re.compile(r'\bid="([^"]+)"')
class_pat = re.compile(r'\bclass="([^"]+)"')
heading_pat = re.compile(r"<h([1-3])\b[^>]*>(.*?)</h\1>", re.IGNORECASE | re.DOTALL)
tag_strip = re.compile(r"<[^>]+>")
color_pat = re.compile(r"#[0-9a-fA-F]{3,8}\b")
font_pat = re.compile(r'font-family:\s*([^;"\'\n}]+)')
cssvar_pat = re.compile(r"--[a-zA-Z0-9_-]+:\s*[^;]+;")

# track section ranges by simple depth counter
section_starts = []  # (line_no, id, class)
depth = 0
current_start = None
for i, line in enumerate(lines, 1):
    for _ in section_open_pat.findall(line):
        if depth == 0:
            mid = id_pat.search(line)
            mcl = class_pat.search(line)
            current_start = {
                "start": i,
                "id": mid.group(1) if mid else "",
                "class": mcl.group(1) if mcl else "",
            }
        depth += 1
    for _ in section_close_pat.findall(line):
        depth -= 1
        if depth == 0 and current_start:
            current_start["end"] = i
            section_starts.append(current_start)
            current_start = None

# headings + their position
headings = []
for m in heading_pat.finditer(content):
    level = int(m.group(1))
    text = tag_strip.sub("", m.group(2)).strip()
    if not text:
        continue
    # line number = count newlines before match
    line_no = content.count("\n", 0, m.start()) + 1
    headings.append((line_no, level, text[:120]))

# colors / fonts / css vars
colors = sorted(set(c.lower() for c in color_pat.findall(content)))
fonts = sorted(set(f.strip().strip("\"'") for f in font_pat.findall(content)))
css_vars = sorted(set(cssvar_pat.findall(content)))

# -- write summary --
summary = OUT / "summary.txt"
with open(summary, "w", encoding="utf-8") as f:
    f.write(f"# ausuhak_main_FINAL.html structural summary\n")
    f.write(f"# Total lines: {total}\n")
    f.write(f"# File size: {SRC.stat().st_size} bytes\n\n")
    f.write(f"## Sections ({len(section_starts)})\n")
    for idx, s in enumerate(section_starts, 1):
        f.write(f"{idx:02d}. lines {s['start']}-{s.get('end','?')}  "
                f"id=\"{s['id']}\"  class=\"{s['class']}\"\n")
    f.write(f"\n## Headings ({len(headings)})\n")
    for ln, lvl, txt in headings:
        f.write(f"  H{lvl}  line {ln:>5}  {txt}\n")
    f.write(f"\n## Hex colors ({len(colors)})\n")
    f.write("  " + ", ".join(colors) + "\n")
    f.write(f"\n## Fonts ({len(fonts)})\n")
    for fn in fonts:
        f.write(f"  {fn}\n")
    f.write(f"\n## CSS custom properties ({len(css_vars)})\n")
    for v in css_vars[:60]:
        f.write(f"  {v}\n")

# -- write per-section excerpts (first 30 lines each, UTF-8) --
sections_dir = OUT / "sections"
sections_dir.mkdir(exist_ok=True)
for idx, s in enumerate(section_starts, 1):
    start, end = s["start"], s.get("end", s["start"] + 30)
    excerpt = "\n".join(lines[start - 1 : min(end, start + 80)])
    out_file = sections_dir / f"section_{idx:02d}_head.html"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(excerpt)

# Print ASCII-only stats so this can't surrogate-crash on PowerShell
print(f"OK sections={len(section_starts)} headings={len(headings)} "
      f"colors={len(colors)} fonts={len(fonts)} cssvars={len(css_vars)}")
print(f"OK summary={summary}")
print(f"OK section_heads_dir={sections_dir}")
