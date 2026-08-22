# BBC English Coaching Classes Burhar — Learning Platform

A mobile-first English learning platform for BBC English Coaching Classes Burhar (Burhar, Madhya Pradesh, India). Independent institute — no affiliation with the British Broadcasting Corporation.

**Don't Just Learn English. Use It.**

## Run locally

No build step. Serve this folder with any static file server, e.g.:

```
cd bbc-english
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html`.

## What's inside

- Daily English Gym (Word Power, Grammar, Speaking, Real English, Confidence)
- Grammar Arena + Error Hunter game
- Word Power vocabulary builder
- Speaking Lab with 7-Day Speaking Challenge (timer, optional recording, self-evaluation)
- Think in English™ and Real English (basic → polite → natural → professional)
- Reading Lab and Listening Lab (original content only, no copyrighted BBC material)
- Free English Test → shareable English Snapshot
- XP, levels, streaks, achievements — all stored locally (no backend)
- Dark mode, installable PWA, offline shell caching

## Configuration

All business/contact details (phone, WhatsApp, email, address, pricing) live in [`js/config.js`](./js/config.js) and are empty until supplied — see [`CLAUDE.md`](./CLAUDE.md) for the full rules on what must never be fabricated.

## Project conventions

See [`CLAUDE.md`](./CLAUDE.md) for directory structure, coding conventions, brand rules, and the token-efficient workflow for future changes.
