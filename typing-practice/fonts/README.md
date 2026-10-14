# Fonts for Typing Practice

| Format | Font | Where it comes from |
|---|---|---|
| English | Site font (Segoe UI / Arial) | System |
| Hindi Unicode | Noto Sans Devanagari | Google Fonts (`display=swap`, Devanagari subset downloaded only when Hindi is on screen) |
| Mangal | Mangal → Noto Sans Devanagari fallback | Installed on Windows; everyone else sees Noto Sans Devanagari |
| Krutidev | Kruti Dev 010 → `tth-krutidev.woff2` fallback | Installed copy first; phones/Macs get the bundled free font (below) |

## Kruti Dev 010

Kruti Dev is a legacy, non-Unicode font: it draws Hindi glyphs on ASCII key codes,
so without the font a Krutidev passage looks like `f'k{kk gesa`. The page handles
this: it detects whether the font is available (`document.fonts.load`) and, if not,
shows the key codes in a monospace font, a notice, and the Unicode Hindi text for
reference. Typing and scoring work either way, because comparison is on the key codes.

The `@font-face` in `../css/typing.css` (and in `/cpct/typing.html`) uses a copy
**installed on the student's device** first (`local("Kruti Dev 010")`). Android and iOS
have none, so it falls back to `tth-krutidev.woff2` (8 KB) in this folder.

`tth-krutidev.woff2` is **not** the Kruti Dev font. It is built from Noto Sans Devanagari
(SIL Open Font License 1.1, see `OFL.txt`) by `scripts/build-krutidev-font.py`, which maps
each Kruti Dev key code (the same table as `js/engine/krutidev.js`) to the matching
Devanagari glyph. So `f'k{kk` draws as शिक्षा on every device, free to redistribute.
Characters it does not cover fall back to the next font in the stack.

To rebuild it: `pip install fonttools brotli uharfbuzz`, get `NotoSansDevanagari-Regular.ttf`, run
`python3 scripts/build-krutidev-font.py NotoSansDevanagari-Regular.ttf typing-practice/fonts/tth-krutidev.woff2`,
then bump `css/typing.css?v=` in `../index.html`.
