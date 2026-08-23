# Third-party code in this folder

This app is self-hosted (no CDN dependency at runtime) by vendoring the
following packages here as-is, unmodified, straight from their published
npm builds. All are used entirely client-side.

| Package | Version | License | Source |
|---|---|---|---|
| `@ffmpeg/ffmpeg` (`ffmpeg/`) | 0.12.10 | MIT | https://github.com/ffmpegwasm/ffmpeg.wasm |
| `@ffmpeg/core` (`core/`) | 0.12.6 | MIT (JS wrapper); the bundled `ffmpeg-core.wasm` binary is FFmpeg compiled to WebAssembly, which includes GPL-licensed components (e.g. libx264) — see the project's own licensing notes | https://github.com/ffmpegwasm/ffmpeg.wasm, https://ffmpeg.org |
| `@ffmpeg/util` (`util/`) | 0.12.1 | MIT | https://github.com/ffmpegwasm/ffmpeg.wasm |
| `jszip` (`jszip/`) | 3.10.1 | MIT or GPL-3.0-or-later (dual-licensed; used here under MIT) | https://github.com/Stuk/jszip |

`ffmpeg-core.wasm` is the single-thread build (not the multi-thread
`core-mt` variant), chosen specifically so this app works on GitHub Pages
without requiring COOP/COEP cross-origin-isolation headers.
