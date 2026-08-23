# Manual Testing Checklist

The automated suite (`python -m unittest discover -s tests -t .`) covers
pure logic only: Markdown parsing, duration/filename validation, FFmpeg
command/filter-graph construction, the job queue, music selection, and
YouTube metadata mapping. It does **not** and cannot cover real FFmpeg
rendering, the live Tkinter UI, or an actual YouTube upload - those need a
human on a real Windows machine with FFmpeg and a signed-in browser. Work
through this list before calling a release done; check off only what you
actually ran, not what you expect to work.

## Launch & setup

- [ ] `python app.py` (or the packaged `.exe`) launches without error
- [ ] First-run wizard appears on a fresh install and all 9 steps work
- [ ] FFmpeg/FFprobe paths save and persist across restart
- [ ] Output folder and default music folder save and persist
- [ ] Browser choice (Chrome/Edge) and profile save and persist

## Markdown

- [ ] Browse .MD loads `data/sample_upload.md` and shows correct metadata
- [ ] A multi-record Markdown file creates one row per record in Jobs
- [ ] Missing TITLE or DESCRIPTION shows a friendly error, not a crash
- [ ] A Markdown file with Hindi/Unicode text displays correctly
- [ ] The source .md file is unchanged on disk after loading

## Video selection

- [ ] Browse Video accepts mp4/mov/mkv/avi/webm/m4v
- [ ] Browse Video rejects/ignores an unsupported file type
- [ ] Browse Folder lists and picks a video from a folder
- [ ] Duration/resolution/FPS/codec/audio shown match the actual file
- [ ] Each job in a multi-record file can have its own different video
- [ ] Change Video on the Jobs tab updates only that one job

## Music selection

- [ ] Browse Folder scans and lists mp3/wav/m4a/aac/flac files
- [ ] Manual mode picks the exact file selected
- [ ] Random mode picks a file from the folder
- [ ] Sequential mode cycles through files in order across repeated renders
- [ ] Unused Random avoids previously-used files while unused ones remain

## Duration & short/long video handling

- [ ] MM:SS and HH:MM:SS are both accepted
- [ ] "00:00" and negative/garbage input are rejected with a friendly error
- [ ] A video shorter than the target shows the short-video dialog
      (Cancel / Loop Video) and never loops silently
- [ ] Loop Video actually loops the source to reach the target length
- [ ] A video longer than the target is trimmed, original file untouched

## Audio

- [ ] Remove original audio actually removes it in the output
- [ ] Add music mixes in the selected track
- [ ] Music volume, fade in, fade out are audible/visible in the waveform
- [ ] Music shorter than the target loops to fill the duration

## Editing

- [ ] Add cuts produces a segmented render (visually distinct cut points)
- [ ] Randomize cut points changes segment lengths but stays reproducible
      for the same seed
- [ ] Each transition type (Hard Cut, Crossfade, Fade, Dip to Black) renders
      correctly at each duration (0.25/0.5/1s)
- [ ] A transition that can't be built (e.g. very short segments) falls
      back to a hard cut and the app tells you why

## Rendering & preview

- [ ] CREATE VIDEO shows the Edit Plan Preview before rendering
- [ ] Progress bar advances during rendering and the UI stays responsive
- [ ] Only one FFmpeg process runs at a time (check Task Manager)
- [ ] Output filename is sanitized from the title and never overwrites an
      existing file (uses `_001`, `_002`, ...)
- [ ] PREVIEW VIDEO opens the rendered file in the system's default player
- [ ] A rendering failure shows a friendly error with technical details
      available

## Browser & YouTube upload

- [ ] Connect Browser succeeds against a real Chrome/Edge window launched
      with `--remote-debugging-port` and signed into YouTube
- [ ] Connect Browser fails with a friendly message when nothing is
      listening on that port
- [ ] Upload to YouTube opens YouTube Studio and starts the upload
- [ ] Title, description, tags, playlist, audience, visibility from the
      Markdown are all filled correctly (nothing lands in the wrong field)
- [ ] HASHTAGS from the Markdown appear appended to the description
- [ ] Final YouTube Review shows the exact data about to be published
- [ ] Publish only happens after clicking Publish (Preview Before Publish
      default ON)
- [ ] Enabling Auto Publish shows the warning dialog before it takes effect
- [ ] With Auto Publish ON, the upload publishes without the review screen
- [ ] If YouTube Studio's UI doesn't match what the app expects, it stops
      with "YouTube Studio interface appears to have changed. Automation
      has paused." instead of clicking the wrong thing
- [ ] The resulting YouTube URL is correct and saved to History

## History & crash recovery

- [ ] History lists past jobs with correct video/music/duration/status
- [ ] Open Video / Open Output Folder / Retry all work
- [ ] Deleting a history entry never deletes the source video/music files
- [ ] Force-quitting the app mid-render, then relaunching, shows the
      "unfinished job" prompt (Resume/Restart/Cancel) and all three options
      behave correctly

## Resource usage (4 GB RAM target)

- [ ] App idle memory usage is reasonable (check Task Manager)
- [ ] Memory does not grow unbounded while scanning a large music folder
- [ ] Memory does not grow unbounded during a long render
- [ ] Only one FFmpeg process and one browser instance are ever running
