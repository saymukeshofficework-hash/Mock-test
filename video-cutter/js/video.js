// Video metadata reading + clip-boundary math. No FFmpeg here — this module
// only touches the browser's native <video> element, which is fast and
// avoids loading the WASM engine just to inspect a file.

export const CLIP_SECONDS = 80;

/**
 * Reads duration/resolution from a video File using a hidden <video> element.
 * Returns the object URL too, so callers can reuse it as the preview src
 * instead of creating a second one.
 */
export function readVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.muted = true;
    el.playsInline = true;

    const cleanup = () => {
      el.onloadedmetadata = null;
      el.onerror = null;
    };

    el.onloadedmetadata = () => {
      const meta = {
        url,
        duration: el.duration,
        width: el.videoWidth,
        height: el.videoHeight,
      };
      cleanup();
      if (!isFinite(meta.duration) || meta.duration <= 0) {
        // Some MP4s (bad moov atom placement) report Infinity until seeked.
        el.currentTime = 1e9;
        el.ontimeupdate = () => {
          el.ontimeupdate = null;
          meta.duration = el.duration && isFinite(el.duration) ? el.duration : meta.duration;
          resolve(meta);
        };
        return;
      }
      resolve(meta);
    };
    el.onerror = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error('video-metadata-failed'));
    };
    el.src = url;
  });
}

/**
 * Splits a total duration into sequential 80-second clips. The final clip
 * is whatever remains (never discarded, never padded).
 */
export function computeClips(totalDuration, clipSeconds = CLIP_SECONDS) {
  const clips = [];
  const EPSILON = 0.001;
  let start = 0;
  let index = 1;
  while (start < totalDuration - EPSILON) {
    const end = Math.min(start + clipSeconds, totalDuration);
    clips.push({
      index,
      start,
      end,
      duration: Math.max(0, end - start),
      musicId: null,
      status: 'pending', // pending | processing | done | error | cancelled
      progress: 0,
      error: null,
      blob: null,
      blobUrl: null,
      outputName: null,
    });
    start = end;
    index += 1;
  }
  return clips;
}

export function formatTime(totalSeconds) {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return '--:--';
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function formatBytes(bytes) {
  if (!isFinite(bytes)) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i += 1;
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function sanitizeBaseName(filename) {
  const base = filename.replace(/\.[^/.]+$/, '');
  const safe = base
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return safe || 'video';
}

export function buildClipFilename(baseName, index, total) {
  const digits = Math.max(2, String(total).length);
  return `${sanitizeBaseName(baseName)}_clip_${String(index).padStart(digits, '0')}.mp4`;
}
