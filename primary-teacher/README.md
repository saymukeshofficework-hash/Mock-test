# Primary Teacher — डिजिटल कक्षा

A hands-free, voice-led digital classroom for young children sitting together in a
room. The teacher presses **Start** once; the app then speaks each item, waits for
the child chorus, pauses, and moves to the next item — no further taps required in
Auto mode.

Static HTML/CSS/vanilla JS. No backend, no build step, no API keys.

## Core flow

```
Show item → Teacher speaks (TTS) → wait for speech to end
          → "बच्चों की बारी" / "सब मिलकर बोलें" → 2-second pause → next item
```

Every item is spoken individually — the app never reads a whole lesson as one long
sentence, and the pause never starts before the teacher's speech has actually
finished (it waits on the Web Speech API's `onend` event, not a fixed timer).

## Run it

Just open `index.html` in a browser, or serve the folder statically:

```bash
cd primary-teacher
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works in most browsers, since the
app uses plain `<script>` tags (no ES modules, no bundler).

### GitHub Pages

This folder is a self-contained static site. Point GitHub Pages at the repo root
(or configure it to serve `/primary-teacher`) and it will work as-is — nothing to
build.

## Browser / TTS limitations

- Speech comes entirely from the browser's built-in **Web Speech API**
  (`speechSynthesis`). Voice quality, available languages, and even whether speech
  plays at all depends on the device and browser — there is no server-side TTS.
- **Chrome / Edge (desktop & Android)** generally have the best and widest voice
  selection. **Safari/iOS** has fewer voices and may need a real user tap before the
  first utterance plays (a browser restriction, not a bug in this app).
- Voice lists load **asynchronously** — the app waits for the browser's
  `voiceschanged` event (with a polling fallback) before populating the voice
  pickers in Settings.
- If the device has no native Hindi (`hi-IN`) voice installed, the app shows a small
  warning in Settings but still functions, falling back to the best available voice
  language-permitting.
- Long lessons (e.g. counting 1–100) issue many short utterances back-to-back; this
  is intentional (see Core flow above) rather than one giant sentence, so the pacing
  stays natural for children to repeat.

## Hindi voice setup

For the most natural Hindi speech:

1. Open **Settings → हिंदी आवाज़ (Hindi voice)** and pick a voice tagged `hi-IN` if
   one is listed — it's ranked highest automatically.
2. On Chrome/Android, installing additional TTS voices (Settings → Accessibility →
   Text-to-speech → Install voice data → Hindi) adds more `hi-IN` options.
3. If no `hi-IN` voice exists on the device, the closest available Hindi variant is
   used, and English-labelled "India" voices are never substituted for Hindi speech
   (only used for the English lessons).
4. Default Hindi speaking rate is `0.85` (slightly slower than 1.0) for clarity;
   adjust it in Settings, along with pitch and volume, and use **🔊 आवाज़ जांचें /
   Test voice** to preview instantly.

## Project structure

```
index.html
css/style.css          — base UI, home screen, settings modal
css/classroom.css       — the big projector/TV-friendly teaching screen
js/tts.js               — Web Speech API wrapper: voice discovery/ranking, speak/stop
js/lesson-engine.js     — state machine: speak → children's turn → pause → next
js/settings.js          — localStorage-backed settings (voice, speed, pause, mode, UI language…)
js/ui.js                — DOM rendering + bilingual (Hindi/English) interface strings
js/app.js               — wires everything together, navigation, keyboard shortcuts
data/counting-hindi.js   — Hindi number words 1–100 + counting lessons
data/counting-english.js — English number words 1–100 + counting lesson
data/english.js          — English A–Z
data/hindi.js             — Hindi Varnamala + Swar
data/matras.js            — Matra (vowel-sign) example words
data/words.js              — two/three-letter Hindi words + object counting
```

Numbers are **always displayed as plain digits** (`1 2 3 … 100`), never Devanagari
numerals — only the *spoken* word is language-specific (`3` → "तीन" or "Three"). The
number-name lookup tables are stored explicitly; digits are never sent to the
speech engine.

## Adding a new lesson

Lessons are plain data objects — the lesson engine and UI work generically with any
of them, so no UI/engine code needs to change.

1. Add a `<script src="data/your-file.js"></script>` tag in `index.html`, placed
   after `js/lesson-engine.js` (and after `counting-hindi.js` if you need
   `window.HINDI_NUMBER_WORDS`).
2. In that file, push one or more lesson objects onto `window.ALL_LESSONS`:

```js
window.ALL_LESSONS.push({
  id: "my-lesson-id",          // unique
  title: "पाठ का नाम",          // shown as the card title (content language)
  titleEn: "Lesson Name",      // shown as the card subtitle when UI language = English
  category: "counting",        // "counting" | "language" — controls which home section it appears in
  language: "hi-IN",           // BCP-47 tag used to pick the TTS voice ("hi-IN" or "en-IN")
  introduction: "बच्चों, आज हम...", // optional, spoken once before the first item
  items: [
    { display: "3", speech: "तीन", repeatText: "तीन" },
    // optional per-item fields: image (URL/emoji), instruction (shown above the item)
  ]
});
```

That's it — the lesson automatically appears on the home screen, in the correct
category, and runs through the same Auto/Manual teach flow as every other lesson.

## Settings persisted in localStorage

Voice choices, speech rate/pitch/volume, children's pause length, Auto/Manual mode,
interface language (Hindi/English), and the last opened lesson are all remembered
between visits (`localStorage` key `primaryTeacher.settings.v1`). No personal data
leaves the device — everything runs entirely client-side.

## Keyboard shortcuts (in the classroom screen)

| Key | Action |
|---|---|
| Space | Play / Pause / Resume |
| → | Next |
| ← | Previous |
| R | Repeat current item |
| Esc | Stop (or exit fullscreen, if active) |
