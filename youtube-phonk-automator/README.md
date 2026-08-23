# YouTube Phonk Automator

A Windows desktop app that turns a Markdown metadata file, any source video,
and a music folder into a rendered MP4 - then drives an already logged-in
Chrome/Edge browser through the YouTube Studio upload flow. Built for a
Windows 11 laptop with 4 GB RAM: everything runs locally with FFmpeg, one
process at a time, and the only network activity is your browser talking to
youtube.com.

## What it does

1. Parse a Markdown file for title/description/tags/playlist/etc.
2. Let you pick **any** video file and **any** music file/folder.
3. Trim (or loop, with confirmation) the video to a target length.
4. Optionally remove the original audio and mix in music (volume, fade
   in/out).
5. Optionally add cuts (segment boundaries) and transitions (hard cut,
   crossfade, fade, dip to black).
6. Render locally with FFmpeg (H.264/AAC, faststart).
7. Let you preview the result in your default media player.
8. Connect to a browser you're already logged into and drive the YouTube
   Studio upload: file, title, description, tags, playlist, audience,
   visibility.
9. Show a final review screen and only publish after you click **Publish**
   (unless you deliberately turn on Auto Publish).
10. Save everything to a local history you can revisit.

## Requirements

- Windows 11 (a 4 GB RAM machine is the target; it also runs fine on more).
- [FFmpeg](https://ffmpeg.org/download.html) (`ffmpeg.exe` and
  `ffprobe.exe`) - not bundled. Download a build, unzip it anywhere, and
  point the app at both executables in Settings or the first-run wizard.
- Google Chrome or Microsoft Edge, with you already signed into the YouTube
  channel you want to upload to.
- For running from source: Python 3.11+, `pip install -r requirements.txt`,
  then `playwright install chromium` (only needed if you want Playwright to
  manage its own browser install; if you already have Chrome/Edge, that
  step is optional - see Chrome setup below).

The packaged `.exe` (see **Building the Windows executable**) needs none of
the above except FFmpeg and a browser - Python itself is bundled.

## Installation

**From the packaged build:** unzip the release, run
`YouTubePhonkAutomator.exe` inside the extracted `YouTubePhonkAutomator`
folder. Keep the whole folder together - it is a folder-based PyInstaller
distribution, not a single portable file.

**From source:**
```
git clone <this repo>
cd youtube-phonk-automator
pip install -r requirements.txt
python app.py
```

## FFmpeg setup

The app never downloads FFmpeg for you. On first launch, the setup wizard
asks you to locate `ffmpeg.exe` and `ffprobe.exe`. If you skip this, every
video/music action shows "FFmpeg was not found." until you set both paths
in **Settings**.

## Chrome/Edge setup

The app never logs into Google for you and never sees your password - it
only *attaches* to a browser you already have open and signed in, over the
Chrome DevTools Protocol (CDP). To make that possible, launch your browser
with remote debugging enabled and a **dedicated automation profile** (not
your everyday one), e.g.:

```
chrome.exe --remote-debugging-port=9222 --user-data-dir="C:\PhonkAutomatorProfile"
```

(**Settings -> Browser executable / Browser profile folder** stores these
paths; the app can show you this exact command.) Sign into YouTube in that
window once, then click **Connect Browser** in the app.

## YouTube login

You sign in yourself, in a real browser window, the normal way (including
2FA if you use it). The app never asks for or stores your Google password,
and never bypasses YouTube's login or security checks.

## Markdown format

```markdown
# YOUTUBE DATA
## TITLE
Dark Phonk Night Drive
## DESCRIPTION
Welcome to another dark phonk music video.
Enjoy the music.
## TAGS
phonk, dark phonk, night drive, drift phonk
## HASHTAGS
#phonk #darkphonk #nightdrive
## CATEGORY
Music
## VISIBILITY
Public
## AUDIENCE
Not made for kids
## PLAYLIST
Phonk Music
## LANGUAGE
English
## MUSIC
random
## MUSIC_VOLUME
0.65
## FADE_IN
2
## FADE_OUT
3
## LENGTH
03:30
```

`TITLE` and `DESCRIPTION` are required; everything else is optional and
falls back to your Settings defaults. A level-1 heading (`# ...`) starts a
new record, so one file can hold multiple upload jobs - each gets its own
row in the **Jobs** tab with independent video selection. See
`data/sample_upload.md` for a working example. The parser only ever reads
the file; it's never modified.

## Video selection

**Browse Video** picks any single file (`.mp4 .mov .mkv .avi .webm .m4v`).
**Browse Folder** lists the supported videos in a folder and picks the
first one - you can always change it afterward with **Change Video**. Every
job (from a multi-record Markdown file) keeps its own video; nothing is
auto-assigned.

## Music selection

Point at a folder (`.mp3 .wav .m4a .aac .flac`) and choose a mode:

- **Manual** - you pick the exact file.
- **Random** - a random file from the folder.
- **Sequential** - cycles through the folder in order, remembering where it
  left off.
- **Unused Random** - prefers files never used before (tracked in
  `youtube_automator.db`); once everything's been used, it picks randomly
  from the whole folder again.

## Duration

Enter `MM:SS` or `HH:MM:SS`. If the source video is **shorter** than the
target, the app stops and asks you to confirm looping - it never loops
silently. If it's **longer**, it's trimmed; the original file on disk is
never modified.

## Cuts

Splits the target duration into segments (10/15/20/30/60s, minimum 5s each)
instead of one continuous clip - useful as boundaries for transitions.
"Randomize cut points" varies segment lengths using a stored seed, so the
same job re-renders identically. Cuts never skip footage; they only add cut
points within it.

## Transitions

Hard Cut, Crossfade, Fade, or Dip to Black, at 0.25/0.5/1s. If a transition
can't be built reliably (e.g. a segment shorter than the transition itself),
the app falls back to a hard cut and tells you - it never silently changes
what you asked for.

## Rendering

Everything runs through FFmpeg as a subprocess (never more than one at a
time). Output is always MP4 (H.264 + AAC, `+faststart`), keeping your
source resolution/orientation. Quality presets (Fast/Balanced/High) trade
encode time for file size; none of them use the slower x264 presets, to
stay within a 4 GB RAM budget.

## Upload & publishing

**Connect Browser**, then **Upload to YouTube** drives Create -> Upload ->
metadata -> checks -> visibility. By default you get a **Final YouTube
Review** screen and must click **Publish** yourself. **Auto Publish**
(Settings, off by default, with a confirmation warning when you turn it on)
skips that screen and publishes as soon as processing checks pass.

## Troubleshooting

- **"FFmpeg was not found."** - set both paths in Settings (Settings tab or
  the first-run wizard).
- **"The selected video is shorter than the requested duration."** - choose
  Loop Video to loop the source, or Cancel and pick a longer target/video.
- **"YouTube Studio interface appears to have changed. Automation has
  paused."** - YouTube changed something the app looks for. Retry, or
  finish that step manually in the browser window the app is attached to,
  then continue.
- **"Could not connect to Chrome/Edge."** - make sure the browser is
  running with `--remote-debugging-port` set (see Chrome/Edge setup above)
  and that you're signed into YouTube in that window.
- Check the **Logs** tab (or `logs/app.log`) for a running record of what
  the app did; click **Show Technical Details** on any error dialog for the
  underlying exception.
- An unfinished job from a previous crash is detected on the next launch,
  with a choice to Resume, Restart, or Cancel it.

## Copyright & licensing responsibility

**You are responsible for only uploading media you own or are licensed to
use.** This app is a local editing/upload convenience tool - trimming,
looping, volume changes, fades, cuts, and transitions are all it does.
It does **not** implement, and will never implement, Content ID bypass,
copyright-detection evasion, pitch/speed tricks meant to dodge detection,
watermark removal, or any bypass of YouTube's security or copyright
enforcement. Changing a song does not make copyrighted material safe to
upload.

## Building the Windows executable

```
pip install -r requirements.txt
python build.py
```

(or double-click `build.bat`). This produces a folder-based PyInstaller
build at `dist/YouTubePhonkAutomator/YouTubePhonkAutomator.exe` - copy the
whole `YouTubePhonkAutomator` folder to distribute it; Python itself is
bundled, but FFmpeg and the browser are not (see above).

## Testing

`python -m unittest discover -s tests -t .` runs the automated suite
(Markdown parsing, duration/filename validation, FFmpeg command
construction, the job queue, music selection, and metadata mapping - all
pure logic, no FFmpeg/browser binary required). See `MANUAL_TESTING.md` for
the checklist that covers the UI, real FFmpeg rendering, and the live
YouTube upload flow, none of which can be exercised by an automated test
suite alone.
