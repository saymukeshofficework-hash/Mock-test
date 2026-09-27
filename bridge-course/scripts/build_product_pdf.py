"""Assemble the sellable PDF from the per-chapter Google Docs exports.

Input : content/source/parts/*.pdf (exact "File → Download → PDF" exports, named as in
        content/source/manifest.json) — git-ignored, never committed.
Output: content/source/Bridge Course Notes by Rakesh Pandey.pdf

Adds a cover page and a contents list (typeset with Chromium so Hindi renders
correctly), page numbers on every chapter page, and a bookmark outline (Paper →
chapter) so the PDF is easy to navigate on a phone. Chapter pages themselves are the
author's exports, unchanged.

Usage:
  pip install pymupdf playwright
  FONT_DIR=/path/to/node_modules/@fontsource \
    python3 bridge-course/scripts/build_product_pdf.py
(@fontsource/noto-sans-devanagari, noto-serif-devanagari, inter, source-serif-4)
"""
import json
import os
import re
import sys
from html import escape
from pathlib import Path

import pymupdf
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "content" / "source"
OUT = SRC / "Bridge Course Notes by Rakesh Pandey.pdf"
FONT_DIR = os.environ.get("FONT_DIR")
CHROMIUM = os.environ.get("CHROMIUM_PATH")  # optional explicit browser path

PAPERS = {  # paper number → (English title, Hindi title) as printed in the notes
    "cdep": (1, "Child Development and Educational Psychology", "बाल विकास और शैक्षिक मनोविज्ञान"),
    "cpa": (2, "Curriculum, Pedagogy and Assessment", "पाठ्यचर्या, शिक्षाशास्त्र एवं मूल्यांकन"),
    "lang1": (3, "Pedagogy of Language-I", "भाषा का शिक्षाशास्त्र-I"),
    "lang2": (4, "Pedagogy of Language-II (English)", ""),
    "math": (5, "Pedagogy of Mathematics", "गणित का शिक्षाशास्त्र"),
    "twau": (6, "Pedagogy of The World Around Us", "हमारे आस-पास की दुनिया (TWAU) का शिक्षाशास्त्र"),
}


def chapter_label(doc_title: str) -> str:
    return re.sub(r"\s*\(Bridge Course Notes by Rakesh pandey\)\s*$", "", doc_title, flags=re.I)


def font_css() -> str:
    f = FONT_DIR
    faces = [
        ("NS", 400, "noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2"),
        ("NS", 700, "noto-sans-devanagari/files/noto-sans-devanagari-devanagari-700-normal.woff2"),
        ("NSer", 700, "noto-serif-devanagari/files/noto-serif-devanagari-devanagari-700-normal.woff2"),
        ("In", 400, "inter/files/inter-latin-400-normal.woff2"),
        ("In", 600, "inter/files/inter-latin-600-normal.woff2"),
        ("In", 700, "inter/files/inter-latin-700-normal.woff2"),
        ("SS", 700, "source-serif-4/files/source-serif-4-latin-700-normal.woff2"),
    ]
    return "".join(
        f"@font-face{{font-family:{n};font-weight:{w};src:url(file://{f}/{p})}}" for n, w, p in faces
    )


def front_matter_html(entries, total_pages: int) -> str:
    rows = []
    for e in entries:
        if e["kind"] == "paper":
            hi = f' <span class="hi">· {escape(e["hi"])}</span>' if e["hi"] else ""
            rows.append(f'<tr class="paper"><td colspan="2">Paper {e["num"]}: {escape(e["title"])}{hi}</td></tr>')
        else:
            rows.append(f'<tr><td class="ch">{escape(e["title"])}</td><td class="pg">{e["page"]}</td></tr>')
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
{font_css()}
@page {{ size: Letter; margin: 0 }}
* {{ box-sizing: border-box; margin: 0 }}
body {{ font-family: In, NS, sans-serif; color: #10213a }}
.cover {{ height: 11in; background: #10213a; color: #fbf7ee; padding: 1.2in 0.9in; position: relative; page-break-after: always }}
.badge {{ display: inline-block; border: 1.5px solid #f4a340; color: #f4a340; border-radius: 99px; padding: 6px 16px; font-weight: 700; letter-spacing: .2em; font-size: 12pt }}
h1 {{ font-family: SS, NSer, serif; font-size: 48pt; line-height: 1.05; margin-top: 28px }}
.by {{ font-family: SS, serif; font-size: 24pt; color: #e6dcc4; margin-top: 10px }}
.rule {{ width: 90px; height: 5px; background: #e8871e; margin: 36px 0 }}
.papers {{ font-size: 13pt; line-height: 1.9; color: #d7dfea }}
.papers b {{ color: #f4a340 }}
.meta {{ position: absolute; left: .9in; right: .9in; bottom: .9in; font-size: 10.5pt; color: #a9b6c8; line-height: 1.6 }}
.toc {{ padding: .7in .8in .6in; }}
.toc h2 {{ font-family: SS, serif; font-size: 26pt }}
.toc p.note {{ color: #5b6f8c; font-size: 10pt; margin-top: 4px }}
table {{ width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 10.5pt }}
tr.paper td {{ padding: 12px 0 4px; font-weight: 700; color: #a25608; font-size: 11pt; border-bottom: 1.5px solid #e8871e }}
tr.paper .hi {{ font-weight: 400; color: #5b6f8c }}
td {{ padding: 3px 0; vertical-align: top }}
td.ch {{ padding-left: 10px }}
td.pg {{ text-align: right; width: 44px; font-variant-numeric: tabular-nums; color: #5b6f8c }}
tr {{ page-break-inside: avoid }}
</style></head><body>
<section class="cover">
  <span class="badge">BRIDGE COURSE 2.0</span>
  <h1>Bridge Course<br>Notes</h1>
  <p class="by">by Rakesh Pandey</p>
  <div class="rule"></div>
  <div class="papers">{"<br>".join(f"<b>Paper {n}</b> &nbsp;{escape(t)}" for n, t, _ in PAPERS.values())}</div>
  <p class="meta">{sum(1 for e in entries if e['kind']=='chapter')} chapter notes · {total_pages} pages<br>
  In-text questions with answers &amp; explanations · end-of-unit answers · quick revision lists<br><br>
  Licensed for the buyer’s personal study only. Please do not share, forward or resell this PDF.</p>
</section>
<section class="toc"><h2>Contents</h2><p class="note">Tap a chapter in your PDF app’s bookmarks/outline to jump to it.</p>
<table>{"".join(rows)}</table></section>
</body></html>"""


def render_front(html: str, path: Path) -> int:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROMIUM) if CHROMIUM else p.chromium.launch()
        page = b.new_page()
        page.set_content(html, wait_until="load")
        page.evaluate("document.fonts.ready")
        page.pdf(path=str(path), format="Letter", print_background=True, prefer_css_page_size=True)
        b.close()
    return pymupdf.open(path).page_count


def main():
    if not FONT_DIR:
        sys.exit("Set FONT_DIR to node_modules/@fontsource (see docstring).")
    manifest = json.loads((SRC / "manifest.json").read_text())
    body = pymupdf.open()
    chapters = []  # (paper_key, label, start_index_in_body)
    for paper in manifest["papers"]:
        for ch in paper["chapters"]:
            f = SRC / "parts" / ch["file"]
            if not f.exists():
                sys.exit(f"Missing {f}")
            key = ch["file"].rsplit("-", 1)[0]
            chapters.append((key, chapter_label(ch["docTitle"]), body.page_count))
            body.insert_pdf(pymupdf.open(f))

    tmp = SRC / ".front.pdf"
    front_pages = 2
    for _ in range(3):  # contents length can change the offsets; iterate until stable
        entries, last = [], None
        for key, label, start in chapters:
            if key != last:
                n, t, hi = PAPERS[key]
                entries.append({"kind": "paper", "num": n, "title": t, "hi": hi})
                last = key
            entries.append({"kind": "chapter", "title": label, "page": front_pages + start + 1})
        got = render_front(front_matter_html(entries, front_pages + body.page_count), tmp)
        if got == front_pages:
            break
        front_pages = got

    book = pymupdf.open(tmp)
    book.insert_pdf(body)
    tmp.unlink()

    # Page numbers (not on the cover).
    total = book.page_count
    for i in range(1, total):
        pg = book[i]
        r = pg.rect
        pg.insert_textbox(
            pymupdf.Rect(0, r.height - 30, r.width, r.height - 14),
            f"Bridge Course Notes by Rakesh Pandey  ·  {i + 1} / {total}",
            fontsize=7.5, fontname="helv", color=(0.45, 0.5, 0.58), align=pymupdf.TEXT_ALIGN_CENTER,
        )

    toc, last = [[1, "Cover", 1], [1, "Contents", 2]], None
    for key, label, start in chapters:
        if key != last:
            n, t, _ = PAPERS[key]
            toc.append([1, f"Paper {n}: {t}", front_pages + start + 1])
            last = key
        toc.append([2, label, front_pages + start + 1])
    book.set_toc(toc)
    book.set_metadata({
        "title": "Bridge Course Notes by Rakesh Pandey",
        "author": "Rakesh Pandey",
        "subject": "Bridge Course 2.0 — chapter-wise notes (6 papers)",
        "creator": "Bridge Course Notes",
    })
    book.save(OUT, garbage=3, deflate=True)
    size = OUT.stat().st_size / 1024 / 1024
    print(f"Wrote {OUT.relative_to(ROOT)} — {total} pages ({front_pages} front + {body.page_count} chapter), {size:.2f} MB")


if __name__ == "__main__":
    main()
