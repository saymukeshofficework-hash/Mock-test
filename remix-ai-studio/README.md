# REMiX AI — DJ Remix Studio

Upload a song, pick a remix style, hit **AI REMIX**, listen, adjust,
export. A full-stack app that turns an uploaded track into a DJ-style
remix using real signal processing — tempo/key/structure detection,
procedurally-synthesized drums/bass/percussion arranged around your
song's actual structure, DJ effects, and a proper mastering chain — not
canned samples or a scripted demo.

```
UPLOAD SONG → CHOOSE STYLE → ADJUST ENERGY → AI REMIX → LISTEN → ADJUST → EXPORT
```

## Quickstart

```bash
# 1. Backend (analysis, synthesis, mixing, mastering, export)
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --env-file .env
```

```bash
# 2. Frontend (the DJ-console UI)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, upload any MP3/WAV/M4A/AAC/FLAC/OGG file,
and go. Full setup/deployment details: [`backend/README.md`](backend/README.md),
[`frontend/README.md`](frontend/README.md).

## What it actually does

- **Analyzes** the uploaded song for real: BPM (librosa beat tracking),
  musical key (chroma + Krumhansl-Schmuckler), song structure
  (novelty-based segmentation into intro/verse/chorus/breakdown/outro),
  and vocal presence.
- **Builds an arrangement from *your* song** — the intro/build-up/drop/
  breakdown/outro placement adapts to the detected structure and length
  of each upload, not a single fixed timeline.
- **Generates original drums, bass and percussion** procedurally (numpy
  oscillators/noise/envelopes) across 6 Indian-commercial-DJ/Bollywood-
  club-inspired presets — Bollywood Club, Indian Dance, Romantic House,
  Festival EDM, Retro Disco, Chill Remix. Nothing is sampled from any
  existing recording or modeled on a specific artist.
- **Beat-matches** tempo changes with a phase-vocoder time-stretch
  (pitch preserved), and keeps the generated drums/bass/FX locked to the
  beat grid.
- **Applies real DJ effects**: reverb, delay/echo, filter sweeps,
  flanger, phaser, stutter/beat-repeat, reverse, tape stop, vinyl stop,
  risers, impacts — all actual DSP, triggered at the arrangement points
  a DJ would actually use them.
- **Masters the result**: EQ, compression, a peak limiter, and loudness
  normalization to broadcast-standard LUFS, with live LUFS/peak/RMS/
  dynamic-range readouts.
- **Separates vocals/instrumental** via a center-channel phase-
  cancellation heuristic by default (zero extra dependencies); an
  optional Demucs (ML) path is included and documented for when you want
  higher-quality 4-stem separation — see the backend README for the
  honest breakdown of what's real DSP vs. heuristic vs. optional ML.
- **Exports** WAV (16/24-bit) and MP3 (128–320kbps) via ffmpeg, plus
  individual stem downloads.
- **DJ Deck**: an optional two-deck mixer (jog wheels, pitch, cue, loop,
  crossfader, EQ, filter) that runs entirely client-side in the browser.
- **Waveform editor**: zoom/scroll/region-select with loop/cut/duplicate/
  reverse/fade, applied live to the in-browser remix buffer.
- **Projects**: save/load/save-as/delete a project's settings, analysis
  and result references.

Nothing in the UI is a dead button — every control either performs its
real function or is disabled with a clear reason (e.g. Export is
disabled until a remix exists).

## Copyright & safety

REMiX AI processes audio you provide; it does not fetch, download, or
bypass DRM on anything from a streaming service. The UI displays: *"Upload
only music you own or have permission to remix."* The 6 remix presets are
original production parameter sets (tempo/pattern/instrumentation), not
audio samples and not modeled on any specific artist's recordings.

## Scope notes

Everything described above is implemented and tested end-to-end (upload →
analyze → AI Remix → stems → export, plus the DJ deck and waveform editor —
see the Playwright-driven test transcript in the PR/commit description).
Two spec items were deliberately deferred rather than faked:

- **Free-text remix requests** ("make this a high-energy Indian club
  remix") — the structured equivalent (song + style + energy + tempo +
  vocal/bass/drum intensity + effects) is fully implemented; parsing
  natural language into those same parameters would need an NLU/LLM layer
  and is a reasonable follow-up, not a core capability.
- **Formal "demo mode"** — the spec asks for one only if the real backend
  can't run locally. It can and does (this backend is the real
  analysis/synthesis/mastering pipeline, not a scripted simulation), so a
  separate simulated mode wasn't built.

## Project layout

```
remix-ai-studio/
  backend/            FastAPI service — audio_engine/, routers/, jobs.py, main.py
  frontend/            React + Vite SPA — src/components/, src/lib/
```

See each subproject's README for full architecture, environment
variables, and production deployment notes.
