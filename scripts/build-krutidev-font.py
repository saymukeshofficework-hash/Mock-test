#!/usr/bin/env python3
"""Build tth-krutidev.woff2: a free Kruti Dev 010-compatible web font.

Phones (Android/iOS) do not have Kruti Dev 010, so Krutidev text (plain ASCII such as
"f'k{kk") showed as English letters. This script takes Noto Sans Devanagari (SIL OFL 1.1,
see typing-practice/fonts/OFL.txt) and maps each Kruti Dev key code to the matching Devanagari glyph, so the
same ASCII text draws as Hindi on every device. Only the font file is generated; the
typing engine is unchanged (comparison stays on the ASCII key codes).

Usage (one time, output is committed):
  pip install fonttools brotli uharfbuzz
  python3 scripts/build-krutidev-font.py NotoSansDevanagari-Regular.ttf typing-practice/fonts/tth-krutidev.woff2
"""
import sys

import uharfbuzz as hb
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

ZWJ = "‍"

# Kruti Dev 010 key code -> (Unicode text to shape, glyph to drop).
# Dropping the helper consonant leaves only the mark/matra, placed where it sits after
# (or before, for ि) a consonant, which is how Kruti Dev draws it.
MAP = {
    # consonants (full)
    "d": "क", "x": "ग", "³": "ङ", "p": "च", "N": "छ", "t": "ज", "¥": "ञ", "V": "ट",
    "B": "ठ", "M": "ड", "<": "ढ", "r": "त", "n": "द", "u": "न", "i": "प", "Q": "फ",
    "c": "ब", "e": "म", ";": "य", "j": "र", "y": "ल", "G": "ळ", "o": "व", "l": "स",
    "g": "ह",
    # half forms (also the bar-less left part of ख घ ण थ ध भ श ष; "k" adds the bar)
    "D": "क्" + ZWJ, "[": "ख्" + ZWJ, "X": "ग्" + ZWJ, "?": "घ्" + ZWJ, "P": "च्" + ZWJ,
    "T": "ज्" + ZWJ, "÷": "झ्" + ZWJ, ".": "ण्" + ZWJ, "R": "त्" + ZWJ, "F": "थ्" + ZWJ,
    "/": "ध्" + ZWJ, "U": "न्" + ZWJ, "I": "प्" + ZWJ, "¶": "फ्" + ZWJ, "C": "ब्" + ZWJ,
    "H": "भ्" + ZWJ, "E": "म्" + ZWJ, "¸": "य्" + ZWJ, "Y": "ल्" + ZWJ, "O": "व्" + ZWJ,
    "'": "श्" + ZWJ, '"': "ष्" + ZWJ, "L": "स्" + ZWJ, "º": "ह्" + ZWJ,
    ">": "झ",
    # conjuncts
    "{": "क्ष्" + ZWJ, "=": "त्र", "«": "त्र्" + ZWJ, "K": "ज्ञ", "J": "श्र", "|": "द्य",
    "}": "द्व", ")": "द्ध", "Ù": "त्त्" + ZWJ, "í": "द्द", "ã": "ह्म", "à": "ह्न",
    "á": "ह्य", "Ø": "क्र", "æ": "द्र", "Ý": "फ्र", ":": "रु", "#": "रू",
    # independent vowels
    "v": "अ", "b": "इ", "m": "उ", "Å": "ऊ", "_": "ऋ", ",": "ए",
    # matras and signs (helper consonant dropped)
    "k": ("पा", "प"), "h": ("पी", "प"), "f": ("पि", "प"), "q": ("पु", "प"),
    "w": ("पू", "प"), "`": ("पृ", "प"), "s": ("पे", "प"), "S": ("पै", "प"),
    "W": ("पॅ", "प"), "a": ("पं", "प"), "¡": ("पँ", "प"), "%": "ः",
    "~": ("ड्", "ड"), "+": ("ब़", "ब"), "Z": ("र्प", "प"),
    "ª": ("ट्र", "ट"),
    # punctuation
    "A": "।", "]": ",", "-": ".", "\\": "?", "&": "-", "¼": "(", "½": ")", "^": "‘",
    "*": "’", "Þ": "“", "ß": "”", "¾": "=", "·": "ऽ",
}
# Kruti Dev draws the number keys as Devanagari digits.
MAP.update({str(d): "०१२३४५६७८९"[d] for d in range(10)})
MAP[" "] = " "

FLAGS = hb.BufferFlags.REMOVE_DEFAULT_IGNORABLES | hb.BufferFlags.DO_NOT_INSERT_DOTTED_CIRCLE


def shape(hb_font, text):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    buf.flags = FLAGS
    hb.shape(hb_font, buf)
    pen = 0
    out = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        out.append((info.codepoint, pen + pos.x_offset, pos.y_offset, pos.x_advance))
        pen += pos.x_advance
    return out


def main(src, dst):
    font = TTFont(src)
    order = list(font.getGlyphOrder())
    hb_font = hb.Font(hb.Face(hb.Blob.from_file_path(src)))
    gs = font.getGlyphSet()
    glyf, hmtx = font["glyf"], font["hmtx"]
    helper_gids = {}
    cmap = {}
    # "z" (stem र, as in प्र): Noto has no standalone glyph, so take the contour that प्र adds to प.
    def contours(name):
        rec = DecomposingRecordingPen(gs)
        gs[name].draw(rec)
        out, cur = [], []
        for op, args in rec.value:
            cur.append((op, args))
            if op in ("closePath", "endPath"):
                out.append(tuple(cur))
                cur = []
        return out
    extra = [c for c in contours("uni092A094D0930") if c not in contours("uni092A")]
    assert len(extra) == 1
    rec = DecomposingRecordingPen(gs)
    rec.value = list(extra[0])
    tt = TTGlyphPen(None)
    rec.replay(TransformPen(tt, (1, 0, 0, 1, -hmtx["uni092A"][0], 0)))
    glyf["kd007A"] = tt.glyph()
    glyf["kd007A"].recalcBounds(glyf)
    hmtx["kd007A"] = (0, glyf["kd007A"].xMin)
    cmap[ord("z")] = "kd007A"

    for key, spec in MAP.items():
        text, helper = (spec, None) if isinstance(spec, str) else spec
        glyphs = shape(hb_font, text)
        if helper:
            hgid = shape(hb_font, helper)[0][0]
            # Drop the helper consonant (and anything HarfBuzz merged it into must not happen).
            assert any(g[0] == hgid for g in glyphs), (key, text)
            idx = [i for i, g in enumerate(glyphs) if g[0] == hgid][0]
            base = glyphs.pop(idx)
            # Glyphs after the helper are placed relative to its end, glyphs before it to the start.
            origin = base[1] + base[3] if idx == 0 else 0
            glyphs = [(g, x - origin, y, a) for g, x, y, a in glyphs]
        if len(glyphs) == 1 and glyphs[0][1] == 0 and glyphs[0][2] == 0:
            cmap[ord(key)] = order[glyphs[0][0]]
            continue
        rec = DecomposingRecordingPen(gs)
        for g, x, y, _ in glyphs:
            gs[order[g]].draw(TransformPen(rec, (1, 0, 0, 1, x, y)))
        tt = TTGlyphPen(None)
        rec.replay(tt)
        name = "kd%04X" % ord(key)
        glyf[name] = tt.glyph()
        glyf[name].recalcBounds(glyf)
        adv = max(0, sum(g[3] for g in glyphs))
        hmtx[name] = (adv, getattr(glyf[name], "xMin", 0))
        cmap[ord(key)] = name
    font.setGlyphOrder(list(glyf.glyphOrder))
    for table in font["cmap"].tables:
        if table.isUnicode():
            table.cmap = dict(cmap)
    font["maxp"].numGlyphs = len(glyf.glyphOrder)

    opts = Options()
    opts.layout_features = []
    opts.name_IDs = []
    opts.notdef_outline = True
    opts.flavor = "woff2"
    sub = Subsetter(opts)
    sub.populate(unicodes=cmap.keys())
    sub.subset(font)
    name = font["name"]
    name.names = []
    for nid, val in ((0, "Copyright 2022 The Noto Project Authors. Kruti Dev key mapping by TETTESTHUB."),
                     (1, "TTH Krutidev Web"), (2, "Regular"), (3, "TTHKrutidevWeb-1.0"),
                     (4, "TTH Krutidev Web"), (5, "Version 1.0"), (6, "TTHKrutidevWeb-Regular"),
                     (13, "SIL Open Font License 1.1"), (14, "https://openfontlicense.org")):
        name.setName(val, nid, 3, 1, 0x409)
    font.flavor = "woff2"
    font.save(dst)
    print("wrote", dst, len(cmap), "keys")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "tth-krutidev.woff2")
