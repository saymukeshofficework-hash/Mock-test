# content/source — PRIVATE staging area for the paid PDF

Nothing in this folder except this README, `manifest.json` and `.gitignore` is ever
committed. PDFs, Word/Google exports and working files here are git-ignored so the
commercial product can't end up on public GitHub.

## Where the source material is

Google Drive (account saymukeshofficework@gmail.com) → folder
**`bridge course notes by Rakesh pandey`**, with six sub-folders:

| Sub-folder | Chapter docs |
|---|---|
| Child Development and Educational Psychology | 3 |
| Curriculum, Pedagogy and Assessment | 1 |
| Pedagogy of Language-I | 12 |
| Pedagogy of Language-II | 14 (+1 duplicate "Unit 11") |
| Pedagogy of Mathematics | 4 |
| Pedagogy of The World Around Us | 6 |

They are **Google Docs, one per chapter — there is no compiled PDF yet.** It was not
available on this machine (no Google Drive sync); it was inspected through the Google
Drive connector.

## File required for production

`content/source/Bridge Course Notes by Rakesh Pandey.pdf` — one PDF, all 40 chapters in
the order of `manifest.json`.

## How it was produced (27 Sep 2026)

1. Each of the 40 Google Docs was exported with Google's own PDF export (identical to
   **File → Download → PDF**) into `content/source/parts/<file>.pdf` (names from `manifest.json`).
2. `bridge-course/scripts/build_product_pdf.py` assembled them: cover page, 2-page
   contents list, the 40 chapters unchanged, page numbers, bookmarks (Paper → chapter).
   Result: **198 pages, 5.4 MB, US Letter**.
3. `npm run product:inspect` (in `bridge-course/`) confirms it opens and reports size/pages.

To rebuild after editing a Doc: re-export that Doc into `parts/` under the same name, run
`FONT_DIR=… python3 bridge-course/scripts/build_product_pdf.py`, re-upload to Storage
(see `docs/SUPABASE_SETUP.md` §4), and optionally re-run
`scripts/previews/render_previews_from_pdf.py` for the landing-page samples.

Resolve the notes in `manifest.json` (duplicate Unit 11, missing TWAU units 3–4,
single-unit Curriculum paper) before selling.
