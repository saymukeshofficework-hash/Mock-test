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

