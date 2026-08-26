# Standalone tool pages

Every calculator under `/tools/*.html` is a plain, standalone HTML file —
no build step, no framework — matching how `bbc-english/` and
`video-cutter/` work elsewhere in this repo. They're served as static
files (everything in `public/` is copied verbatim into `dist/` by Vite)
and linked to from the React app's `/tools` hub page (`src/pages/Tools.tsx`
→ `src/components/ToolCard.tsx`), but are not React routes themselves.

## Structure

- `assets/tools-data.js` — the tool catalog (name/description/category/status
  in English + Hindi), a plain-JS port of `../../src/data/tools.ts`. Kept in
  sync by hand — if you add or edit a tool there, mirror the change here too
  (and re-run the generator below, or hand-edit the corresponding `.html`).
- `assets/tools-shared.js` — the shared engine every page loads: the
  language toggle (reads/writes the same `bulbulmam_locale` localStorage key
  as the React app, so the choice carries over between them), the real
  numerology math (Life Path, Destiny, Name, Lucky Number/Date, Personal
  Year — deterministic digit-sum arithmetic) and the Sun Sign lookup, and
  the generic "not connected" notice for tools that need real astronomical
  data. See `src/lib/calculationEngine.ts` for why those aren't faked.
- `assets/tools.css` — a plain-CSS port of the main app's Tailwind theme
  (same color tokens, fonts, card/button/form styles), so these pages look
  identical to the rest of the site without a build step.
- `<slug>.html` — one per tool (45 total), each a thin shell: real `<title>`/
  `<meta description>` for SEO, a small `<script>` setting
  `window.TOOL_SLUG`/`window.TOOL_TITLE`, then markup for the hero, the
  right form for that tool's category, FAQ (native `<details>`, no JS
  needed), and a "Related Tools" sidebar — before loading the two shared
  scripts above.

## Bilingual text

Any bilingual text uses `data-en`/`data-hi` (or `-placeholder`/`-aria`
variants) attributes; `tools-shared.js` swaps `textContent` based on the
current locale on load and on toggle. There's no template engine — the
English text is what's in the HTML source, Hindi is the data attribute.

## Internal links

Pages link back into the React app with plain relative paths one level up
(`../about`, `../book`, `../courses`, …) and to sibling tool pages with a
flat relative filename (`other-slug.html`). Both work regardless of the
GitHub Pages sub-path this whole site is deployed under, because they're
real page navigations (not client-side routing) — see the repo-root
`404.html` and `src/lib/publicBase.ts` for how deep links into the React
app are resolved.

## Regenerating all 45 pages

If you need to regenerate every page at once (e.g. after a structural
change to the shared header/footer/form markup), the authoring script used
to generate them can be recreated: it reads `assets/tools-data.js` (via
Node's `vm` module, since it's written as a browser `<script>`) and emits
one `.html` file per entry. That script isn't checked into the repo — these
`.html` files are the real, hand-maintainable deliverable, not a build
artifact — but the pattern in this file is enough to rebuild it if needed.
For a one-off change, just hand-edit the specific `.html` file(s).
