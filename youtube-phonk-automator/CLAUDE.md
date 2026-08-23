# YouTube Phonk Automator — CLAUDE.md

## Purpose
Windows desktop app that turns a Markdown metadata file + any source video +
a music folder into a rendered MP4 (FFmpeg) and then drives an already
logged-in Chrome/Edge browser (Playwright) through the YouTube Studio upload
flow. Target machine: Windows 11 laptop, **4 GB RAM**.

## Stack
- Python 3.x, standard library first.
- Tkinter for UI (no web/Electron frameworks).
- SQLite (stdlib `sqlite3`) for jobs/history/settings.
- FFmpeg/FFprobe via `subprocess` — never decode frames in Python, never load
  whole media files into memory.
- Playwright (Python) for browser automation — connects to a real user
  session; never stores or enters Google passwords.
- PyInstaller for the Windows build.

## Directory layout
```
app.py                  entry point
core/                   business logic (parsing, media, jobs, browser)
database/               sqlite schema + access
ui/                     Tkinter screens
utils/                  logger, validators, filenames, system_info
data/                   sample data (sample_upload.md) — not code
tests/                  unittest suite for all logic that doesn't need
                         ffmpeg/tkinter/a live browser
output/ temp/ logs/     runtime dirs (gitignored contents, dirs kept via .gitkeep)
```

## Coding conventions
- Type hints on all public functions. Docstrings only on non-obvious
  behavior — no restating the signature.
- One responsibility per module in `core/`; UI code never calls FFmpeg or
  Playwright directly — it goes through `core/`.
- Long-running work (FFmpeg, folder scans, Playwright) always runs on a
  background `threading.Thread`; UI updates come back via `root.after(...)`
  or a thread-safe queue — the Tk mainloop must never block.
- No global mutable state outside `SettingsManager`/`Database` singletons
  created in `app.py` and passed down explicitly.

## 4 GB RAM rules
- Exactly one FFmpeg subprocess at a time. Exactly one browser context at a
  time. No concurrent job processing — the job queue is strictly sequential.
- Never read a whole video/audio file into a Python `bytes`/`bytearray`.
  FFmpeg/FFprobe do all decoding; Python only builds argv lists and reads
  line-buffered stdout/stderr.
- No polling loops under ~1s interval. Resource monitor (RAM/CPU) updates
  at most every few seconds and is optional/off by default.

## FFmpeg rules
- Always probe with `ffprobe -print_format json` before building an encode
  command — never guess duration/resolution/codec.
- Build the filter graph as a list of args, not shell strings — no
  `shell=True`, ever (avoids injection and is required on Windows anyway).
- Default encode: H.264 (`-crf` per quality preset), AAC audio, `+faststart`.
  Preserve source resolution/orientation unless the user changes it.
- A transition that cannot be built reliably falls back to a hard cut and
  the user is told — never silently produce different output than planned.

## Browser automation rules
- Playwright only ever *attaches* to a browser the user already has open and
  logged into (CDP `connect_over_cdp` or a persistent profile the user
  points at) — this app never automates a login form and never touches
  Google credentials.
- Prefer accessible role/label/text selectors over CSS position or
  coordinates. If a required element isn't found, stop and surface
  "YouTube Studio interface appears to have changed" — never blind-click.
- Publish requires explicit user confirmation unless "Auto Publish" was
  deliberately turned on (default OFF).

## Testing rules
- `tests/` uses stdlib `unittest` (no extra test-runner dependency) and
  covers only pure logic: markdown parsing, duration parsing, filename
  sanitizing, database access, music-selection logic, FFmpeg *command
  construction* (asserting the argv list, never actually invoking FFmpeg).
- UI, live FFmpeg rendering, and live YouTube upload are validated manually
  — see `MANUAL_TESTING.md`. Do not claim a manual-only feature "works" in
  a commit message or report until it has actually been run.

## Deployment
- `build.py` / `build.bat` wrap PyInstaller into a folder-based dist
  (`dist/YouTubePhonkAutomator/`). No auto-download of FFmpeg or browsers —
  first-run wizard lets the user point at existing `ffmpeg.exe`/`ffprobe.exe`.

## Token-efficient workflow (for future Claude Code sessions)
- Reference files directly (`core/ffmpeg_processor.py`), don't re-read the
  whole tree.
- Keep phases small; run `tests/` after each change; commit per phase.
- Don't dump full file contents in chat once a file exists — summarize the
  diff instead.

## Things Claude must NOT do
- No Content ID bypass, copyright-evasion pitch/speed tricks, watermark
  removal, or auth/security bypass of any kind.
- No storing Google passwords/cookies/tokens; never log secrets.
- No cloud video/audio/AI processing of any kind — everything runs locally
  except the browser's normal interaction with youtube.com.
- No fabricated "success" output — never print/report an upload, render, or
  publish as successful without having actually observed it succeed.
