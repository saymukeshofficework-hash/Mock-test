# REMiX AI — frontend

React + Vite single-page app: the dark DJ-console UI, waveform editor,
remix controls, A/B preview, stems panel, export panel, DJ deck and
project bar. All audio playback, A/B switching, the DJ deck mixer and
quick waveform edits (loop/cut/duplicate/reverse/fade) run client-side
via the Web Audio API — only analysis, synthesis, mixing, mastering and
export are server-side (see `../backend/README.md`).

## Install & run (development)

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. The dev server proxies `/api/*` to
`http://127.0.0.1:8000` (the backend) — see `vite.config.js`. Start the
backend first (`../backend/README.md`).

## Build for production

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

Deploy `dist/` to any static host (nginx, Netlify, Vercel, S3+CloudFront,
etc.) and point it at your deployed backend — either via a reverse-proxy
rule for `/api/*`, or by changing the `BASE` constant in
`src/lib/api.js` to your backend's absolute URL.

## Structure

```
src/
  App.jsx                 Top-level state + composition
  lib/
    api.js                Backend HTTP client + job polling
    audioEngine.js         Web Audio wrapper (AudioDeck, crossfade, meters)
    hooks.js               useIsMobile, usePreviewPlayer (A/B engine)
  components/
    UploadPanel.jsx         Upload / drag-drop / validation
    Waveform.jsx            Canvas waveform: zoom/scroll/region-select/beat grid
    PlaybackBar.jsx          Transport, BPM/key/vocal badges, A/B + volumes
    RegionEditor.jsx         Client-side loop/cut/duplicate/reverse/fade
    RemixControls.jsx        Style presets, energy, tempo, vocal/bass/drums, FX, AI Remix
    StemsPanel.jsx           Stem separation + per-stem mute/solo/volume/download
    ExportPanel.jsx          Format/bitrate/bit-depth export + progress
    DJDeck.jsx               Two-deck live mixer (crossfader, EQ, filter, jog wheels)
    ProjectBar.jsx           New/Save/Save As/Load/Delete projects
  styles.css                Dark glass/metallic DJ-console theme, mobile layout
```

Mobile gets its own layout (sticky AI Remix button, bottom transport bar
with a large play button) rather than a shrunk desktop view — see the
`@media (max-width: 860px)` block in `styles.css` and the
`mobile-bottom-bar` in `App.jsx`.
