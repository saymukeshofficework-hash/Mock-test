# REMiX AI — backend

FastAPI service that does the real audio analysis and remix generation:
tempo/key/structure detection (librosa), procedural drum/bass/FX synthesis
and arrangement (numpy/scipy), vocal isolation, mixing, mastering and
MP3/WAV export (ffmpeg).

## 1. Requirements

- Python 3.10+
- `ffmpeg` on PATH (used for format decoding + MP3 encoding)

```bash
# Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg
```

## 2. Install

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # edit if needed
```

## 3. Run (local development)

```bash
uvicorn main:app --reload --env-file .env
```

The API listens on `http://127.0.0.1:8000`. Interactive docs (Swagger UI)
are at `http://127.0.0.1:8000/docs`. `GET /api/health` is a quick liveness
check.

The frontend's Vite dev server proxies `/api/*` to `http://127.0.0.1:8000`
by default (see `frontend/vite.config.js`); override with
`VITE_API_PROXY_TARGET` if the backend runs elsewhere.

## 4. What's real vs. heuristic vs. optional

This app is built to never fake a result. Everything below actually runs
the computation it claims to:

| Feature | Implementation | Notes |
|---|---|---|
| BPM detection | `librosa.beat.beat_track` | Real onset/tempo tracking. |
| Key detection | Chroma (CQT) + Krumhansl-Schmuckler correlation | Real, standard MIR technique. |
| Structure segmentation (intro/verse/chorus/...) | Novelty-based segmentation on MFCC+chroma, energy-ranked labeling | Real signal processing; labels are a heuristic and can be imperfect on unusual song structures — but they come from *your* song, not a fixed template. |
| Vocal presence detection | Harmonic/percussive separation + formant-band energy ratio | A DSP heuristic, not a trained classifier. |
| Vocal/instrumental separation (default) | Center-channel phase cancellation | Real technique; works best on stereo mixes with a centered lead vocal. Explicitly labeled as an approximation in the API response. |
| Vocal/instrumental/drums/bass separation (optional) | Demucs (Meta AI, ML source separation) | Off by default — see below. When enabled, genuinely higher quality. |
| Drums/bass/pads | Procedural synthesis (numpy oscillators/noise/envelopes) | 100% original audio — never samples or reproduces any existing recording. |
| Arrangement (intro/build-up/drop/breakdown/outro) | Built from the real detected structure + energy contour | Adapts per song; not a fixed timeline. |
| Beat-matching / tempo change | `librosa.effects.time_stretch` (phase vocoder) | Pitch-preserving. |
| Effects (reverb, delay, filter sweep, flanger, phaser, stutter, reverse, tape/vinyl stop, riser, impact) | Real DSP (convolution, tap-delay, time-varying filters, variable-rate resampling) | No lookup samples. |
| Mastering (EQ, compression, limiting, loudness normalization) | RBJ shelving filters, envelope-follower compressor, peak limiter, `pyloudnorm` LUFS metering | Real chain; reports LUFS/peak/RMS/dynamic range computed from the actual output. |

### Enabling full ML stem separation (Demucs)

By default the app uses the zero-dependency center-channel heuristic. For
genuine 4-stem ML separation (vocals/drums/bass/other):

```bash
pip install -r requirements-full.txt   # pulls in torch + demucs (multi-GB)
```

Then set `REMIX_ENABLE_DEMUCS=true` in `.env`. The first separation call
downloads the pretrained Demucs model (also sizeable). This is optional by
design — the rest of the app works fully without it.

## 5. Architecture

```
backend/
  main.py            FastAPI app, CORS, startup cleanup sweep
  config.py          Env-driven settings
  jobs.py            In-memory background job queue (thread-per-job)
  store.py           In-memory registries (uploaded files / analysis / results)
  cleanup.py         Periodic temp-file sweep
  routers/
    upload.py        Upload + validate + serve original audio
    analyze.py       Analysis job + generic job-status polling + cancel
    remix.py         AI Remix job + style/energy/effects options
    stems.py         Stem separation job + stem downloads
    export.py        WAV (16/24-bit) / MP3 (128-320kbps) export job
    projects.py       Save/load/list/delete projects (JSON files)
  audio_engine/
    io_utils.py       Format decode (ffmpeg), validation, WAV/MP3 write, waveform peaks
    analysis.py       BPM / key / structure / vocal-presence detection
    vocal_separation.py   Center-channel heuristic + optional Demucs hook
    synth.py          Procedural drum/bass/pad/riser/impact synthesis
    presets.py        The 6 remix style presets + energy/intensity tables
    arrangement.py    Builds the per-song arrangement timeline
    effects.py        Reverb/delay/filter/flanger/phaser/stutter/reverse/tape-stop DSP
    mixer.py          Beat generation, vocal treatment, mixing, effect placement
    mastering.py      EQ/compression/limiting/loudness normalization + metrics
    remix_engine.py   Orchestrates the full pipeline with progress callbacks
```

Swapping the in-memory job queue (`jobs.py`) for Celery/RQ, and the
in-memory registries (`store.py`) for Redis/Postgres + S3-style object
storage, are the two changes needed to take this from a single-process
demo to a horizontally-scalable production service — the rest of the
code doesn't need to change.

## 6. Performance notes

- The first analysis request after the server starts is slower
  (~30-40s for a 45s clip) because librosa's numba-jitted internals
  compile on first use; subsequent requests in the same process are much
  faster (a 45s clip analyzes in ~15-20s, and a full remix — arrangement,
  synthesis, mixing, mastering — renders in 2-5s). Warm the server with a
  throwaway request after deploying if first-request latency matters.
- All heavy work runs in a background thread per job; the HTTP layer only
  ever returns a `job_id` and polls/streams status, so the UI never blocks.
- `REMIX_MAX_DURATION_SEC` and `REMIX_MAX_UPLOAD_MB` cap processing cost
  per request; tune for your hardware.

## 7. Production deployment

- Run behind a real ASGI server config, e.g. `uvicorn main:app --workers 4`
  behind nginx/Caddy, or `gunicorn -k uvicorn.workers.UvicornWorker`.
- Because jobs/results currently live in per-process memory, running
  multiple workers means a job must be polled from the same worker that
  started it (sticky sessions) *or* you should first swap in a shared
  queue/store as noted above.
- Put `uploads/`, `exports/`, `projects/` on persistent/shared storage (or
  swap for S3-compatible object storage) if you run more than one instance.
- Terminate TLS at your reverse proxy; set `REMIX_CORS_ORIGINS` to your
  real frontend origin(s).
