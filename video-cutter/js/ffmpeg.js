// Wraps the vendored @ffmpeg/ffmpeg (WASM, single-thread core) to do the
// real cutting + mixing work. Nothing here ever leaves the browser: the
// core/wasm assets are loaded from vendor/ (same origin) and all input
// files are written into the in-memory FFmpeg filesystem via Blob/File
// data, never uploaded anywhere.

import { FFmpeg } from '../vendor/ffmpeg/index.js';
import { toBlobURL, fetchFile } from '../vendor/util/index.js';

const CORE_BASE = new URL('../vendor/core/', import.meta.url).href;

// Safety net so the UI can never hang forever: some worker failure modes
// (WASM instantiation stalling on a memory-constrained mobile browser, a
// deadlock inside the WASM runtime) don't reliably fire any JS-visible
// error event at all. If a step takes far longer than it plausibly should,
// treat it as failed rather than leaving the user staring at a spinner.
function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(message);
      err.isTimeout = true;
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const LOAD_TIMEOUT_MS = 90_000;
const EXEC_TIMEOUT_MS = 5 * 60_000;

export class VideoEngine {
  constructor() {
    this.ffmpeg = null;
    this.loaded = false;
    this.videoWritten = false;
    this.writtenMusic = new Set();
    this.hasAudio = null;
    this._progressHandlers = new Set();
  }

  async load({ onLog } = {}) {
    if (this.loaded) return;
    this.ffmpeg = new FFmpeg();
    if (onLog) this.ffmpeg.on('log', onLog);
    this.ffmpeg.on('progress', (p) => {
      this._progressHandlers.forEach((fn) => {
        try { fn(p); } catch (_e) { /* ignore listener errors */ }
      });
    });
    const coreURL = await toBlobURL(`${CORE_BASE}ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${CORE_BASE}ffmpeg-core.wasm`, 'application/wasm');
    try {
      await withTimeout(
        this.ffmpeg.load({ coreURL, wasmURL }),
        LOAD_TIMEOUT_MS,
        'The video engine took too long to start. Your device may be low on memory, or this browser may not support it — try closing other tabs/apps, or a different browser.',
      );
    } catch (err) {
      this.terminate();
      throw err;
    }
    this.loaded = true;
  }

  async writeVideo(file) {
    if (this.videoWritten) return;
    const data = await fetchFile(file);
    await this.ffmpeg.writeFile('input.mp4', data);
    this.videoWritten = true;
  }

  /** Probes the source for an audio stream by parsing ffmpeg's own log output. */
  async detectAudio() {
    if (this.hasAudio !== null) return this.hasAudio;
    let logs = '';
    const handler = ({ message }) => { logs += `${message}\n`; };
    this.ffmpeg.on('log', handler);
    try {
      await this.ffmpeg.exec(['-i', 'input.mp4']);
    } catch (_e) {
      // ffmpeg -i with no output always "fails" — that's expected, we only
      // want the stderr stream info it printed along the way.
    }
    this.ffmpeg.off('log', handler);
    this.hasAudio = /Stream #0:\d+.*: Audio/.test(logs);
    return this.hasAudio;
  }

  async writeMusic(id, file) {
    if (this.writtenMusic.has(id)) return;
    const data = await fetchFile(file);
    await this.ffmpeg.writeFile(musicFileName(id), data);
    this.writtenMusic.add(id);
  }

  async processClip(clip, settings, onProgress) {
    const outName = `out_${clip.index}.mp4`;
    const args = buildFfmpegArgs(clip, settings, this.hasAudio, outName);

    const handler = (p) => onProgress && onProgress(p);
    this._progressHandlers.add(handler);
    try {
      const ret = await withTimeout(
        this.ffmpeg.exec(args),
        EXEC_TIMEOUT_MS,
        'Processing this clip took far longer than expected and was stopped. Your device may be low on memory — try a shorter or lower-resolution video.',
      );
      if (ret !== 0) {
        throw new Error(`ffmpeg exited with code ${ret}`);
      }
      const data = await this.ffmpeg.readFile(outName);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      await this.ffmpeg.deleteFile(outName);
      return blob;
    } catch (err) {
      // A timeout means the worker is presumed wedged (still "running" but
      // never going to finish) — reusing it for the next clip would just
      // hang again, so tear it down; the app-level caller reloads a fresh
      // engine on the next export attempt.
      if (err && err.isTimeout) this.terminate();
      throw err;
    } finally {
      this._progressHandlers.delete(handler);
    }
  }

  /** Hard-stops the worker (used for Cancel). A fresh load() is required after this. */
  terminate() {
    try { this.ffmpeg && this.ffmpeg.terminate(); } catch (_e) { /* already dead */ }
    this.ffmpeg = null;
    this.loaded = false;
    this.videoWritten = false;
    this.writtenMusic = new Set();
    this.hasAudio = null;
    this._progressHandlers = new Set();
  }
}

function musicFileName(id) {
  return `music_${id}.mp3`;
}

/**
 * Builds the ffmpeg argument list for one clip.
 *
 * Fast path: the very first clip (start=0) with no music and "keep original
 * audio" needs no decoding at all -> pure stream copy (-c copy).
 *
 * Every other clip starts at a non-zero offset that will rarely land
 * exactly on a source keyframe. Stream-copying video cannot begin mid-GOP —
 * without decoding, ffmpeg can only start at the keyframe at-or-before the
 * requested time, silently pulling in extra seconds *before* the intended
 * cut (verified: a clip requested as 20s starting at t=80 came out 33s
 * long, its content starting ~13s early at the previous keyframe). That
 * would overlap adjacent clips, which is unacceptable for boundaries the
 * user is told are exact. So every clip after the first re-encodes video
 * (fast x264 preset) to guarantee an accurate start point — the one case
 * where correctness requires re-encoding even though no audio mixing is
 * involved.
 */
export function buildFfmpegArgs(clip, settings, hasAudio, outName) {
  const start = clip.start.toFixed(3);
  const dur = Math.max(clip.duration, 0.05).toFixed(3);
  const args = ['-ss', start, '-t', dur, '-i', 'input.mp4'];

  const musicName = clip.musicId ? musicFileName(clip.musicId) : null;
  if (musicName) {
    if (settings.loopShortMusic) args.push('-stream_loop', '-1');
    args.push('-i', musicName);
  }

  // Only a clip starting exactly at 0 is guaranteed to start on a keyframe
  // (every video begins with one there), so only that clip is eligible for
  // video stream copy.
  const canCopyVideo = clip.start <= 0.0005;
  const simpleCopy = canCopyVideo && !musicName && settings.originalAudioMode === 'keep';
  if (simpleCopy) {
    args.push('-map', '0:v');
    if (hasAudio) args.push('-map', '0:a');
    args.push('-c', 'copy', '-avoid_negative_ts', 'make_zero', '-t', dur, outName);
    return args;
  }

  if (canCopyVideo) {
    args.push('-map', '0:v', '-c:v', 'copy');
  } else {
    args.push('-map', '0:v', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p');
  }

  const musicVol = clamp01(settings.musicVolume).toFixed(2);
  const origVol = clamp01(settings.originalVolume).toFixed(2);
  const keepOriginal = settings.originalAudioMode !== 'mute' && hasAudio;

  if (musicName) {
    if (keepOriginal) {
      const originalGain = settings.originalAudioMode === 'reduce' ? origVol : '1.00';
      args.push(
        '-filter_complex',
        `[0:a]volume=${originalGain}[a0];[1:a]volume=${musicVol}[a1];[a0][a1]amix=inputs=2:duration=longest:dropout_transition=0[aout]`,
      );
    } else {
      args.push('-filter_complex', `[1:a]volume=${musicVol}[aout]`);
    }
    args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000');
  } else if (keepOriginal) {
    // Stream-copying audio while video is being decoded/re-encoded from the
    // same non-zero seek point hits the same "extra content before the cut"
    // problem as copying video does — verified: with -c:a copy here the
    // audio track came out 33s long from a 20s request. So audio is only
    // ever stream-copied when video is too (i.e. clip.start === 0).
    if (settings.originalAudioMode === 'reduce' || !canCopyVideo) {
      const gain = settings.originalAudioMode === 'reduce' ? origVol : '1.00';
      args.push('-map', '0:a', '-filter:a', `volume=${gain}`, '-c:a', 'aac', '-b:a', '192k');
    } else {
      args.push('-map', '0:a', '-c:a', 'copy');
    }
  } else {
    args.push('-an');
  }

  args.push('-avoid_negative_ts', 'make_zero', '-t', dur, outName);
  return args;
}

function clamp01(v) {
  const n = Number(v);
  if (!isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
