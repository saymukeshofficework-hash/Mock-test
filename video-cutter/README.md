# 80-Second Video Maker

A browser-based video cutter and music mixer that automatically splits a video into fixed-length clips (80 seconds / 1:20 by default, adjustable) and mixes in your own MP3 music — entirely client-side, no backend, no uploads.

## Features

- Load an MP4 (or any browser-playable video) and see its duration, resolution, and a live preview
- Automatic sequential splitting into fixed-length clips — 80 seconds by default, adjustable via a "Clip Length" field (5s to 3600s) that applies to the whole video — with the final shorter clip always preserved
- Upload multiple MP3 files into a reorderable music library (drag-and-drop or ↑/↓ buttons), each with duration and inline preview
- Automatic sequential music assignment (Clip 1 → Track 1, Clip 2 → Track 2, ...), fully overridable per clip
- Configurable behavior when there are more clips than tracks: repeat from the start, leave the rest unmusicked, or assign manually
- Music shorter than a clip loops to fill it (toggle-able); music longer than a clip is trimmed
- Original video audio can be kept, muted, or reduced (with a volume slider) alongside the music
- Real MP4 export via [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm), run inside a Web Worker in your browser
- Live per-clip and overall export progress, with Cancel support
- Individual clip downloads, plus a "Download All" ZIP
- Mobile-first, responsive, dark UI with accessible controls

## Privacy

🔒 **Everything happens on your device.** The video and music files you load are never uploaded anywhere — there is no backend server, no analytics beacon, and no network request carrying your media. All cutting, mixing, and encoding is done locally by ffmpeg compiled to WebAssembly, running in a Web Worker in your own browser tab. Closing the tab discards everything (nothing is written to `localStorage`/`sessionStorage` for media).

## How it works

### Video processing (real, not a mockup)

This app vendors [`@ffmpeg/ffmpeg`](https://www.npmjs.com/package/@ffmpeg/ffmpeg) (single-thread WASM core, `vendor/`) so it runs on GitHub Pages without any cross-origin-isolation configuration (no COOP/COEP headers needed — that's only required by the multi-threaded core, which this project intentionally does not use, trading some speed for deployment simplicity). All engine, core, and utility assets are self-hosted under `video-cutter/vendor/` — nothing is fetched from a CDN at runtime.

For each clip, `js/ffmpeg.js` builds an `ffmpeg` command line:

- **The first clip (starts at 0), with no music and original audio kept**: a pure stream copy (`-c copy`) — no re-encoding, very fast, and lossless.
- **Every other clip**: video is re-encoded (`libx264`, `veryfast`, CRF 20). This is deliberate, not a missed optimization — a clip that starts partway through the file will rarely land exactly on a source keyframe, and stream-copying video can only *start* at a keyframe. Testing this project turned up exactly that bug: a clip requested as 20 seconds starting at t=80s came out 33 seconds long, because copy-mode silently pulled in extra content back to the previous keyframe. Re-encoding lets ffmpeg decode-and-discard up to the exact requested frame, so every clip's boundaries are accurate to the source frame rate.
- **When music is assigned, or original audio is muted/reduced**: audio is mixed via `-filter_complex` (`volume` + `amix`), then encoded to AAC. Short music is looped (`-stream_loop -1`) and long music is trimmed, both by capping the final output with `-t <clip duration>`.

### Music assignment

Music tracks are assigned to clips **sequentially and automatically** as soon as clips exist and tracks are in the library (`js/audio.js`). Reordering the library or changing the "more clips than music" behavior doesn't retroactively touch existing assignments — click **Re-run Auto Assignment** to reapply them. Every clip also has its own **Music** dropdown for a one-off manual override, which doesn't require regenerating anything.

### Approximate preview

Before exporting, each clip has a **Preview Mix** button that plays the *original* video (seeked to that clip's time range) alongside the assigned music, both at your chosen volumes, using native `<video>`/`<audio>` elements. This is a convenience to audition a mix quickly — it is not frame-accurate or guaranteed to be perfectly in sync, since it doesn't run through ffmpeg. The actual exported MP4 is the authoritative result.

## Running locally

No build step, no dependencies to install. From the repository root:

```bash
cd video-cutter
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Any static file server works (`npx serve`, VS Code's Live Server, etc.) — the app just needs to be served over HTTP(S) so its ES modules and the FFmpeg Web Worker can load correctly (opening `index.html` directly via `file://` will not work, since module workers require an HTTP origin).

## GitHub Pages deployment

This folder is a static site with no build step, so deployment is just publishing the `video-cutter/` directory. The repository's `.github/workflows/deploy.yml` copies it into the combined Pages site automatically on every push to `main`; the app is served at `<pages-url>/video-cutter/`.

To deploy it standalone instead: enable GitHub Pages for the repository (Settings → Pages) and point it at a branch/folder that contains `video-cutter/`'s contents at its root, or use any static host (Netlify, Vercel, S3, etc.) — just make sure the whole `video-cutter/` folder (including `vendor/`) is uploaded together, and that MIME types for `.wasm` and `.js` are served correctly (virtually all static hosts do this by default).

## Browser requirements

- A recent version of **Chrome, Edge, Firefox, or Safari** (desktop or mobile) with WebAssembly and Web Worker support — effectively any browser released in the last few years.
- **iOS Safari** works but is the most memory-constrained target; keep source videos modest in size/resolution there.
- JavaScript must be enabled. No plugins or extensions required.

## Limitations

- **Memory**: ffmpeg.wasm runs entirely in the browser tab's memory. Very large or very long source videos (multi-GB, many tens of minutes) can exhaust available memory, especially on mobile. The app warns when a loaded file exceeds ~1 GB; if processing fails, try a shorter or lower-resolution source.
- **Single-threaded core**: this build intentionally uses the single-thread ffmpeg-core (not the multi-thread SharedArrayBuffer build) so it works on GitHub Pages without special response headers. This is slower than a multi-threaded/native encoder, particularly for the re-encoded clips (see above) — expect processing to take real time, roughly on the order of the clip's own duration or more, not instant.
- **Clip start accuracy**: clip boundaries are accurate to the source's actual frame timing, but very unusual source encodings (e.g. variable frame rate, no audio track, exotic codecs ffmpeg.wasm's core doesn't support) may behave differently; check the "Technical details" panel if a clip fails.
- **Preview Mix is approximate**: it uses the browser's native media playback, not ffmpeg, so it is a convenience for auditioning a mix, not a guarantee of the exported result's exact timing.
- **Download All** builds a ZIP client-side (via a vendored copy of JSZip); for a very large number of very large clips this can itself use significant memory. Individual **Download** buttons per clip always work as a fallback.
