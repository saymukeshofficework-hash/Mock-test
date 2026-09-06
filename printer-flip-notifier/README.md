# Printer Flip Notifier

A tiny Windows tray app for anyone printing double-sided on a printer with no
automatic duplexer — like the Canon PIXMA G3000 — where Windows pauses the
job and waits for you to flip the stack and reload it. This app watches for
that moment and **speaks a reminder out loud** ("Please flip the pages.") so
you don't have to keep checking the screen.

## How it detects the flip prompt

Two independent, configurable checks run in the background:

1. **Print-queue status (recommended, most reliable).** Windows marks a
   print job with a "needs user attention" flag whenever it's paused waiting
   on you — including the manual-duplex pause. The app polls the queue for
   your printer and watches for that flag.
2. **Window-title keywords (fallback).** Some printer utilities show their
   own dialog instead of going through the flag above. The app also scans
   visible window titles for words like "flip", "duplex", "reload the
   paper", etc. (fully customizable in Settings).

Either check can be turned off. If the exact wording your Canon software
uses isn't in the default keyword list, add it in Settings — right-click the
tray icon → **Settings...**.

While a prompt is active, the app re-announces the message every N seconds
(configurable, default 15s) until you flip the pages and the job continues.

## Requirements

- Windows 10/11 (the automatic detection relies on Windows print-spooler and
  window APIs; on macOS/Linux the app still runs and can speak on demand,
  but won't auto-detect the prompt).
- Python 3.9+

## Setup

```
pip install -r requirements.txt
python app.py
```

The app minimizes straight to the system tray. Right-click the tray icon for:

- **Test alert** — speak the message immediately, to check your speakers/TTS voice.
- **Paused** — temporarily stop watching without quitting.
- **Start with Windows** — adds/removes a per-user auto-start entry.
- **Settings...** — change the spoken message, which printer to watch,
  re-announce interval, and the fallback keyword list.
- **Quit**.

Settings are saved to `config.json` next to the app so they persist between
runs.

## Packaging as a standalone .exe (optional)

So it can run without a Python install:

```
pip install pyinstaller
pyinstaller --onefile --noconsole --name PrinterFlipNotifier app.py
```

The executable will be in `dist/PrinterFlipNotifier.exe`. Copy `config.json`
next to it if you want to ship your own defaults.

## Files

- `app.py` — tray icon, settings window, and the polling loop.
- `detectors.py` — the two detection strategies (spooler status, window titles).
- `speaker.py` — offline text-to-speech via `pyttsx3`, serialized through a
  background queue (falls back to printing the message to the console if no
  voice backend is available).
- `config.py` — loading/saving `config.json`.

## Notes and limitations

- Manual-duplex prompts are a Windows/print-driver behavior; there's no
  single universal signal every printer driver uses, which is why this app
  layers two detection methods instead of relying on one. If neither fires
  for your setup, watch for the exact dialog/notification text next time you
  print double-sided and add the distinguishing word to the keyword list in
  Settings.
- The app only reads print-queue metadata and window titles — it doesn't
  need administrator rights and doesn't touch the print job itself.
