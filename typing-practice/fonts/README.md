# Fonts for Typing Practice

| Format | Font | Where it comes from |
|---|---|---|
| English | Site font (Segoe UI / Arial) | System |
| Hindi Unicode | Noto Sans Devanagari | Google Fonts (`display=swap`, Devanagari subset downloaded only when Hindi is on screen) |
| Mangal | Mangal → Noto Sans Devanagari fallback | Installed on Windows; everyone else sees Noto Sans Devanagari |
| Krutidev | Kruti Dev 010 | **Not bundled** — see below |

## Kruti Dev 010

Kruti Dev is a legacy, non-Unicode font: it draws Hindi glyphs on ASCII key codes,
so without the font a Krutidev passage looks like `f'k{kk gesa`. The page handles
this: it detects whether the font is available (`document.fonts.load`) and, if not,
shows the key codes in a monospace font, a notice, and the Unicode Hindi text for
reference. Typing and scoring work either way, because comparison is on the key codes.

Right now the `@font-face` in `../css/typing.css` only uses a copy **installed on the
student's device** (`local("Kruti Dev 010")`), because no font file is committed —
check the licence of your copy before publishing it.

To serve the font to every visitor:

1. Put `KrutiDev010.woff2` (and optionally `KrutiDev010.ttf`) in this folder.
2. In `../css/typing.css`, replace the `src:` line of the `"TTH Kruti Dev 010"`
   `@font-face` with the commented-out version right below it (it adds the `url()`s).
3. Bump `css/typing.css?v=` in `../index.html`.

The font is only requested when Krutidev mode is used (`.font-krutidev`), and uses
`font-display: swap`, so it never slows down the initial page load.
