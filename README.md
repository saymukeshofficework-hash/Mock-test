# Mock-test
Just for test mock

## Ludo 3D

This repository also contains **Ludo 3D**, a complete 3D multiplayer Ludo game built with Three.js and Vite. See [`ludo-3d/README.md`](./ludo-3d/README.md) for features, local development, and GitHub Pages deployment instructions.

## Song Remix Studio

[`song-remix-studio.html`](./song-remix-studio.html) is a self-contained, single-file web app (just open it in a browser, no build step) that lets you remix any song by adding beats:

- Load any local audio file (MP3, WAV, M4A, OGG…) — decoding happens entirely in the browser, nothing is uploaded.
- Auto-detects the song's tempo (BPM) via onset-autocorrelation, plus manual tap-tempo and a BPM slider.
- A 16-step drum machine with genre presets (Hip-Hop, Trap, House/EDM, Rock, Reggaeton, Lo-Fi, Pop) — every drum sound (kick, snare, clap, hats, tom, rim, perc) is synthesized live with the Web Audio API, no sample files needed.
- An effects rack: reverb, echo/delay, bass/treble, drive/lo-fi crush, sidechain "duck" pumping on the kick, swing, and speed/pitch.
- Live playback of the synced song + beats mix, and a one-click WAV export rendered offline via `OfflineAudioContext`.

## REMiX AI — DJ Remix Studio

[`remix-ai-studio/`](./remix-ai-studio/) is a full-stack app (FastAPI backend + React/Vite frontend) that turns an uploaded song into a professional DJ-style remix:

- Real analysis: BPM (librosa beat tracking), musical key (chroma + Krumhansl-Schmuckler), song structure segmentation, and vocal-presence detection.
- An arrangement engine that builds intro/build-up/drop/breakdown/outro placement from *your* song's actual detected structure, not a fixed timeline.
- Six original, legally-safe Indian-commercial-DJ/Bollywood-club-inspired remix presets (Bollywood Club, Indian Dance, Romantic House, Festival EDM, Retro Disco, Chill Remix), with all drums/bass/percussion procedurally synthesized — never sampled from an existing recording.
- Beat-matched tempo changes (pitch-preserving time-stretch), a real DJ effects toolbox (reverb, delay, filter sweeps, flanger, phaser, stutter, reverse, tape/vinyl stop, risers, impacts), and a full mastering chain (EQ, compression, limiting, LUFS loudness normalization).
- Vocal/instrumental separation (center-channel heuristic by default; optional Demucs ML separation documented in `backend/README.md`), WAV/MP3 export, a client-side two-deck DJ mixer, a waveform editor, and a project save/load system.

See [`remix-ai-studio/README.md`](./remix-ai-studio/README.md) for the full feature list, architecture, and setup instructions.

