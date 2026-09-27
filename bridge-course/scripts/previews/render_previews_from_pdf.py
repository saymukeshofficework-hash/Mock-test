"""Render the landing-page SAMPLE / PREVIEW images from real pages of the final PDF.

Only the upper part of each chosen page stays readable: the lower part is faded out,
and the whole image is watermarked, so previews can't substitute for the product.

  pip install pymupdf
  python3 bridge-course/scripts/previews/render_previews_from_pdf.py
  node bridge-course/scripts/previews/to-webp.mjs   # PNG → WebP (needs sharp)
"""
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[3]
PDF = ROOT / "content" / "source" / "Bridge Course Notes by Rakesh Pandey.pdf"
OUT = ROOT / "bridge-course" / "public" / "previews"

# Chapter titles whose FIRST page is used (matched against the PDF bookmarks).
CHOSEN = [
    "इकाई 1 - बाल्यावस्था को समझना",
    "Unit 4 - Word Recognition: Various Strategies",
    "इकाई 1 - हमारे आस-पास की दुनिया (TWAU) का स्वरूप तथा क्षेत्र",
]
VISIBLE = 0.52  # fraction of the page height left readable
ORANGE = (0.79, 0.43, 0.05)


def main():
    src = pymupdf.open(PDF)
    starts = {title: page for level, title, page in src.get_toc() if level == 2}
    OUT.mkdir(parents=True, exist_ok=True)
    for n, title in enumerate(CHOSEN, 1):
        doc = pymupdf.open()
        doc.insert_pdf(src, from_page=starts[title] - 1, to_page=starts[title] - 1)
        pg = doc[0]
        r = pg.rect
        # Fade: stacked white bands of rising opacity, then solid white.
        top, steps = r.height * VISIBLE, 24
        band = r.height * 0.16 / steps
        for i in range(steps):
            y = top + i * band
            pg.draw_rect(pymupdf.Rect(0, y, r.width, y + band + 0.5), color=None, fill=(1, 1, 1),
                         fill_opacity=(i + 1) / steps, overlay=True)
        pg.draw_rect(pymupdf.Rect(0, top + steps * band, r.width, r.height), color=None, fill=(1, 1, 1), overlay=True)
        pg.insert_textbox(pymupdf.Rect(0, r.height - 90, r.width, r.height - 60),
                          "- Preview ends here - full chapter in the PDF -",
                          fontsize=11, fontname="helv", color=(0.36, 0.43, 0.55), align=pymupdf.TEXT_ALIGN_CENTER)
        # Diagonal watermark grid.
        for row in range(-2, 9):
            for col in range(-1, 3):
                p = pymupdf.Point(col * 260 + (row % 2) * 130, row * 110)
                pg.insert_text(p, "SAMPLE / PREVIEW", fontsize=26, fontname="hebo", color=ORANGE,
                               fill_opacity=0.12, stroke_opacity=0.12,
                               morph=(p, pymupdf.Matrix(1, 1).prerotate(-28)))
        # Corner tag.
        tag = pymupdf.Rect(r.width - 150, 10, r.width - 12, 30)
        pg.draw_rect(tag, color=None, fill=(0.06, 0.13, 0.23), overlay=True)
        pg.insert_text((tag.x0 + 22, tag.y1 - 6), "SAMPLE / PREVIEW", fontsize=9, fontname="hebo", color=(1, 1, 1))
        pix = pg.get_pixmap(dpi=94)  # ≈ 800 px wide
        pix.save(OUT / f"sample-{n}.png")
        print("wrote", (OUT / f"sample-{n}.png").relative_to(ROOT), pix.width, "x", pix.height)


if __name__ == "__main__":
    main()
