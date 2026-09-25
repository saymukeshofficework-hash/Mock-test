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

## How to produce it

1. In each Google Doc: **File → Download → PDF document**. Save it into
   `content/source/parts/` with the `file` name from `manifest.json`
   (e.g. `cdep-01.pdf`, `lang2-04.pdf`). Optionally put a cover page first as `cover.pdf`
   and add it to the manifest.
2. `cd bridge-course && npm install && npm run product:inspect -- --merge`
   — merges in order, then prints page count, size and page size.
3. Open the result and read the cover, the contents and a few pages of every paper.
4. Upload it to **private** Supabase Storage (see `docs/SUPABASE_SETUP.md` → Storage).

Resolve the three notes in `manifest.json` (duplicate Unit 11, missing TWAU units 3–4,
single-unit Curriculum paper) before selling.
