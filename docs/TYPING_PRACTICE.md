# Typing Practice (`/typing-practice/`)

English, Hindi Unicode, Mangal and Krutidev typing practice for TET Test Hub.
Static HTML + CSS + ES modules — no framework, no build step, no backend — matching
the rest of the TET Test Hub site. Results are stored in the browser (localStorage).

- Page: `typing-practice/index.html` (served at `https://tettesthub.in/typing-practice/`)
- Tests: `cd typing-practice && npm test` (Node ≥ 18, no dependencies; CI runs it in
  `.github/workflows/deploy.yml` before deploying)
- Run locally: from the repo root, `python3 -m http.server 8000` → open
  `http://localhost:8000/typing-practice/` (ES modules don't load from `file://`).

## Layout

```
typing-practice/
  index.html                 page: home/setup, exam intro, test screen, result
  css/typing.css             builds on ../assets/site.css; test-format shell (tf-*)
  fonts/README.md            Kruti Dev font instructions
  js/app.js                  controller: screens, settings, test lifecycle, events
  js/strings.js              Hindi/English UI copy (follows the site-wide toggle)
  js/storage.js              prefs, history, recent passages, daily; ResultStore
  js/engine/                 UI-independent typing engine (unit-tested)
    typing-engine.js         TypingEngine: start/pause/resume/reset/finish, clock, samples
    adapters.js              TypingAdapter + English / UnicodeHindi / Krutidev adapters
    compare.js               word-aware comparison with re-synchronisation
    metrics.js               WPM / gross / net / CPM / accuracy formulas, levels
    analysis.js              word alignment + character error analysis (result screen)
    unicode.js               code points, Devanagari cluster segmentation
    krutidev.js              Unicode → Kruti Dev 010 conversion layer
  js/data/
    formats.js               the four formats
    passages/english.js      English passages (data only)
    passages/hindi-unicode.js Hindi passages (data only; also used by Mangal)
    passages/krutidev.js     Kruti Dev passages, converted from the Hindi ones
    passages/index.js        selection: difficulty/length filters, no repeats, chaining, daily
  js/ui/
    passage-view.js          incremental passage highlighting
    result-view.js           result dashboard, share text
    dashboard.js             My Typing Progress + Test History
    charts.js                dependency-free SVG speed chart and summary bars
  tests/engine.test.js       node:test unit tests
```

Component mapping (the brief's names → where they live): TypingPracticePage =
`index.html` + `app.js`; TypingFormatSelector / PracticeSettings = `renderSetup()`;
TypingStats / TypingTimer / TypingProgress / TypingControls = the `tf-sticky` block
+ `renderMetrics()` / `renderClock()` / `updateControls()`; TypingPassage =
`PassageView`; TypingInput = `#typingInput` + `bindTestInput()`; TypingResult /
PerformanceSummary / ErrorAnalysis / SpeedChart = `result-view.js` + `charts.js`;
TypingHistory / TypingProgressDashboard = `dashboard.js`; DailyChallenge =
`renderDaily()`; TypingInstructions = the `#how` section and the exam intro.

## Typing engine

`TypingEngine` has no DOM or storage code. The page feeds it the full textarea value
on every `input` event (`setInput(value, {composing})`) and calls `tick()` every
200 ms. States: `ready → running ⇄ paused → finished`.

- The timer starts on the first typed character, not on "Start".
- Time is accumulated running time from `performance.now()`, never counted ticks, so
  background-tab throttling can't make it drift. Elapsed time is clamped to the test
  duration.
- Auto-finish on time-up (`tick()`) or when the passage is completed (`setInput`).
- One speed sample per elapsed second → speed-over-time chart.
- `mistakesMade` counts every wrong character typed (not while an IME is composing),
  so fixed mistakes can be reported separately as `correctedErrors`.
- A single input event that inserts ≥ 25 characters counts as a "large insertion"
  (paste-like), used by exam mode.

### Adapters — keeping text layers separate

Every format has an adapter (`adapters.js`) that answers, for that format:
**display text** (the passage string), **input text** (the textarea value),
**comparison text** (`normalize()` + `toUnits()`), **font** (`fontClass`) and
**encoding** (`"unicode"` or `"krutidev-legacy"`). Methods: `normalize`, `toUnits`,
`segment`, `compareUnits`, `calculateErrors`, `renderText`.

- **EnglishTypingAdapter** — NFC; phone "smart" quotes/dashes/ellipsis → ASCII.
- **UnicodeHindiTypingAdapter** (Hindi Unicode, and Mangal with a different font) —
  NFC (so `क़` U+0958 equals `क` + `़`), strips ZWJ/ZWNJ that IMEs insert, maps `|`
  to `।`, and segments into aksharas so conjuncts and matras are highlighted together.
- **KrutidevTypingAdapter** — no Unicode normalization at all (`'` is श, `"` is ष);
  compares the legacy key codes; clusters keep `f` (ि) and zero-width marks with
  their letter.

Characters are Unicode code points (so an emoji is one character, not two).

### Comparison

Word-aware and positional: typed words are matched to passage words, then compared
letter by letter, with re-synchronisation so one slip costs only itself: a missed
space, an extra space inside a word, a skipped word and an extra word are all
detected. Spaces are characters: each expected space typed is correct; double,
leading and trailing spaces are errors. The result screen additionally runs a
minimum-edit-distance word alignment (`analysis.js`) for the correct / incorrect /
missed / extra word counts and the expected-vs-typed error list.

### Metrics (`metrics.js`)

One "word" = 5 characters, for every language.

| Metric | Formula |
|---|---|
| WPM (headline) | correct characters ÷ 5 ÷ minutes |
| Gross WPM | typed characters (correct + incorrect) ÷ 5 ÷ minutes |
| Net WPM | Gross WPM − errors ÷ minutes (never below 0) |
| CPM | correct characters ÷ minutes |
| Accuracy | correct ÷ typed × 100 |
| Errors | incorrect characters + characters skipped in finished words (uncorrected) |
| Corrected mistakes | wrong characters typed and later fixed with Backspace |
| Progress | position reached in the passage ÷ passage length × 100 |

Minutes = time actually spent typing (pauses excluded). Performance level is based on
**Net WPM**: English 90+/70/50/35 (Excellent / Very Good / Good / Average / Needs
Practice); Hindi formats use lower bands 60/45/35/25 since Hindi exams expect
~25–35 WPM. Live WPM/CPM are shown only after 2 s, and a test shorter than 2 s is
not scored ("too short to measure").

## Hindi Unicode / Mangal

Students type with whatever Hindi input they have — Inscript, phonetic, Gboard Hindi,
Google Input Tools, OS IMEs. Both sides are NFC-normalized before comparison. While
an IME composition is active, intermediate states are not counted as mistakes, and if
the composing word still contains Latin letters (phonetic transliteration) the
highlight waits until the Hindi word is committed. Mangal is the same engine with
`font-family: Mangal` (fallback Noto Sans Devanagari).

## Krutidev

Kruti Dev is a font, not an encoding: Hindi glyphs drawn on ASCII key codes (Remington
layout). The passage is the key-code string (e.g. `f'k{kk gesa` = "शिक्षा हमें"),
shown with the Kruti Dev font; the student types the same keys with an English
keyboard; comparison is on the key codes. Passages are generated from the Hindi
Unicode passages by `engine/krutidev.js` (akshara-based: `ि` → `f` before the
cluster, reph → `Z` after it, half forms, conjunct glyphs, subscript र). Tests check
it against standard Kruti Dev spellings, and that every passage converts with no
Devanagari left over. If the font isn't available the page says so, shows the key
codes legibly, and shows the Unicode text for reference. See `typing-practice/fonts/README.md`.

## Storage

`storage.js`, all in localStorage under `tth.typing.*` (falls back to memory with a
notice if storage is blocked): `prefs` (format, duration, difficulty, length),
`history` (last 200 results), `recent` (last 5 passage ids per format, to avoid
repeats), `daily` (daily-challenge completion). The UI language uses the site-wide
`tetLang` key from `/js/i18n.js`.

Results go through a `ResultStore` (`{ save, list, clear }`); `createLocalResultStore()`
is the only implementation today. To sync with Supabase later, add a store that
writes `toSupabaseRow(result, userId)` to a table like:

```sql
create table public.typing_results (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  language text not null,            -- 'en' | 'hi'
  typing_format text not null,       -- 'english' | 'hindi-unicode' | 'mangal' | 'krutidev'
  mode text not null,                -- 'practice' | 'quick' | 'standard' | 'long' | 'exam' | 'daily'
  duration int not null,             -- configured seconds
  time_taken int not null,           -- seconds actually typed
  gross_wpm int not null, net_wpm int not null, wpm int not null, cpm int not null,
  accuracy numeric(5,1) not null,
  correct_chars int not null, incorrect_chars int not null, errors int not null,
  passage_id text not null,
  difficulty text not null,
  created_at timestamptz not null default now()
);
alter table public.typing_results enable row level security;
create policy "own rows" on public.typing_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

This is **not** applied anywhere — Typing Practice works without login, like the rest
of the free practice area.

## Adding passages

- English: append to `js/data/passages/english.js`.
- Hindi: append to `js/data/passages/hindi-unicode.js` — it automatically appears in
  Hindi Unicode, Mangal and (converted) Krutidev. Keep punctuation to `।` and `,` and
  write numbers in words; run `npm test` (it fails if a passage can't be converted).
- A hand-typed Kruti Dev passage: add it to `EXTRA_KRUTIDEV_PASSAGES` in
  `passages/krutidev.js`.

Fields: `id` (unique), `category`, `difficulty` (`easy|medium|hard|exam`), `title`,
`text`. Length (Short < 300 chars, Medium < 600, Long) is computed. For long tests the
selector chains further passages so the text lasts for the chosen duration.

## Modes and exam rules

Quick (30 s), Standard (1 min), Long (5 min), custom Practice (15 s–60 min), Daily
Challenge (one passage per day per format, same for every student, completion saved)
and Exam Practice (intro screen, chosen passage and duration, instructions).

Paste and drag-drop are blocked in every mode. In exam mode, paste/cut attempts,
large single insertions and tab switches are counted, a warning is shown, and they
are listed on the result; the timer keeps running while the tab is hidden. In practice
modes leaving the tab pauses the test. These checks discourage copying but cannot
fully prevent it, and the page says so.

## Known limitations

- Kruti Dev font file is not bundled (licensing) — see `typing-practice/fonts/README.md`.
- Some Kruti Dev key codes (e.g. `Å` ऊ, `Ø` क्र, `æ` द्र, `ª`) need Alt-codes on a
  desktop keyboard and are awkward on phones; they only appear where the Hindi text
  needs them.
- The Unicode → Kruti Dev converter covers the conjuncts used in the passages and
  common Hindi; rare conjuncts fall back to halant forms (`n~` etc.).
- No dark mode, because the rest of the site has none.
- Results live in one browser only until a Supabase store is added.
- "Download Result" is a plain-text file; there is no PDF generator in this site.
