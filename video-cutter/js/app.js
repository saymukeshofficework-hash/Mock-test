import { readVideoMetadata, computeClips, formatTime, formatBytes, buildClipFilename, sanitizeBaseName } from './video.js';
import { readAudioMetadata, makeMusicId, moveItem, autoAssignMusic } from './audio.js';
import { VideoEngine } from './ffmpeg.js';

// ---------------------------------------------------------------------
// State
// ---------------------------------------------------------------------

const state = {
  video: null, // { file, url, name, size, duration, width, height }
  musicLibrary: [], // [{ id, file, name, duration, url }]
  clips: [],
  settings: {
    originalAudioMode: 'reduce', // keep | mute | reduce
    originalVolume: 0.2,
    musicVolume: 1.0,
    loopShortMusic: true,
    overflowBehavior: 'repeat', // repeat | none | manual
  },
  exporting: false,
  cancelRequested: false,
  previewingClipIndex: null,
};

const engine = new VideoEngine();

// ---------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

const el = {
  newProjectBtn: $('newProjectBtn'),
  statusDot: $('statusDot'),
  statusText: $('statusText'),
  globalProgressWrap: $('globalProgressWrap'),
  globalProgressFill: $('globalProgressFill'),
  globalProgressLabel: $('globalProgressLabel'),
  debugDetails: $('debugDetails'),
  debugLog: $('debugLog'),

  videoInput: $('videoInput'),
  loadVideoBtn: $('loadVideoBtn'),
  videoInfo: $('videoInfo'),
  videoPreview: $('videoPreview'),
  metaName: $('metaName'),
  metaSize: $('metaSize'),
  metaDuration: $('metaDuration'),
  metaResolution: $('metaResolution'),
  largeFileWarning: $('largeFileWarning'),
  generateClipsBtn: $('generateClipsBtn'),

  musicInput: $('musicInput'),
  addMusicBtn: $('addMusicBtn'),
  musicEmptyHint: $('musicEmptyHint'),
  musicList: $('musicList'),

  audioSettingsCard: $('audioSettingsCard'),
  originalVolumeRow: $('originalVolumeRow'),
  originalVolume: $('originalVolume'),
  originalVolumeLabel: $('originalVolumeLabel'),
  musicVolume: $('musicVolume'),
  musicVolumeLabel: $('musicVolumeLabel'),
  loopShortMusic: $('loopShortMusic'),
  reassignBtn: $('reassignBtn'),

  clipsCard: $('clipsCard'),
  clipsCount: $('clipsCount'),
  clipsList: $('clipsList'),
  sharedPreview: $('sharedPreview'),
  sharedPreviewLabel: $('sharedPreviewLabel'),
  sharedPreviewVideo: $('sharedPreviewVideo'),
  sharedPreviewStop: $('sharedPreviewStop'),

  exportCard: $('exportCard'),
  exportAllBtn: $('exportAllBtn'),
  cancelExportBtn: $('cancelExportBtn'),
  cancelConfirm: $('cancelConfirm'),
  cancelConfirmYes: $('cancelConfirmYes'),
  cancelConfirmNo: $('cancelConfirmNo'),
  exportProgress: $('exportProgress'),
  exportProgressLabel: $('exportProgressLabel'),
  exportProgressFill: $('exportProgressFill'),
  exportResults: $('exportResults'),
  exportResultsSummary: $('exportResultsSummary'),
  downloadAllBtn: $('downloadAllBtn'),

  resetConfirm: $('resetConfirm'),
  resetConfirmYes: $('resetConfirmYes'),
  resetConfirmNo: $('resetConfirmNo'),
};

const previewMusicAudio = new Audio();
previewMusicAudio.preload = 'auto';

// ---------------------------------------------------------------------
// Status / errors
// ---------------------------------------------------------------------

function setStatus(text, kind = 'idle') {
  el.statusText.textContent = text;
  el.statusDot.className = `status-dot ${kind === 'idle' ? '' : kind}`.trim();
}

function logDebug(line) {
  el.debugDetails.hidden = false;
  el.debugLog.textContent += `${line}\n`;
  el.debugLog.scrollTop = el.debugLog.scrollHeight;
}

function friendlyError(err) {
  logDebug(String(err && err.stack ? err.stack : err));
  const msg = String(err && err.message ? err.message : err);
  if (/memory|out of memory|allocation/i.test(msg)) {
    return 'This video is very large and may exceed your browser’s available memory. Try a shorter or lower-resolution video.';
  }
  if (/metadata-failed/i.test(msg)) {
    return 'The video could not be read. Please try another MP4 file.';
  }
  if (/audio-metadata-failed/i.test(msg)) {
    return 'One of the music files could not be read. Please try another MP3 file.';
  }
  if (/ffmpeg exited|exec/i.test(msg)) {
    return 'This clip could not be processed. Please try another MP4 or check the technical details below.';
  }
  return 'Something went wrong while processing. Please try again, or check the technical details below.';
}

function showGlobalProgress(fraction) {
  el.globalProgressWrap.hidden = false;
  const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
  el.globalProgressFill.style.width = `${pct}%`;
  el.globalProgressLabel.textContent = `${pct}%`;
}
function hideGlobalProgress() {
  el.globalProgressWrap.hidden = true;
}

// ---------------------------------------------------------------------
// Video loading
// ---------------------------------------------------------------------

el.loadVideoBtn.addEventListener('click', () => el.videoInput.click());
el.videoInput.addEventListener('change', async () => {
  const file = el.videoInput.files && el.videoInput.files[0];
  el.videoInput.value = '';
  if (!file) return;
  await loadVideo(file);
});

async function loadVideo(file) {
  setStatus('Reading video metadata...', 'busy');
  try {
    if (state.video && state.video.url) URL.revokeObjectURL(state.video.url);
    const meta = await readVideoMetadata(file);
    state.video = {
      file,
      url: meta.url,
      name: file.name,
      size: file.size,
      duration: meta.duration,
      width: meta.width,
      height: meta.height,
    };
    resetClipsAndOutputs();
    engine.videoWritten = false;
    engine.hasAudio = null;
    renderVideoInfo();
    setStatus('Ready. Generate 80-second clips whenever you’re ready.', 'ok');
  } catch (err) {
    setStatus(friendlyError(err), 'error');
  }
}

function renderVideoInfo() {
  const v = state.video;
  el.videoInfo.hidden = !v;
  if (!v) return;
  el.videoPreview.src = v.url;
  el.metaName.textContent = v.name;
  el.metaSize.textContent = formatBytes(v.size);
  el.metaDuration.textContent = formatTime(v.duration);
  el.metaResolution.textContent = `${v.width} × ${v.height}`;

  const ONE_GB = 1024 ** 3;
  if (v.size > ONE_GB) {
    el.largeFileWarning.hidden = false;
    el.largeFileWarning.textContent = '⚠️ This video is very large and may exceed your browser’s available memory. For best results, try a shorter or lower-resolution video.';
  } else {
    el.largeFileWarning.hidden = true;
  }
}

el.generateClipsBtn.addEventListener('click', () => {
  if (!state.video) return;
  setStatus('Creating clip list...', 'busy');
  state.clips = computeClips(state.video.duration);
  autoAssignMusic(state.clips, state.musicLibrary, state.settings.overflowBehavior);
  el.audioSettingsCard.hidden = false;
  el.clipsCard.hidden = false;
  el.exportCard.hidden = false;
  renderClipsList();
  setStatus(`${state.clips.length} clip${state.clips.length === 1 ? '' : 's'} ready. Assign music, then export.`, 'ok');
});

// ---------------------------------------------------------------------
// Music library
// ---------------------------------------------------------------------

el.addMusicBtn.addEventListener('click', () => el.musicInput.click());
el.musicInput.addEventListener('change', async () => {
  const files = Array.from(el.musicInput.files || []);
  el.musicInput.value = '';
  if (!files.length) return;
  setStatus('Reading music files...', 'busy');
  for (const file of files) {
    try {
      const meta = await readAudioMetadata(file);
      state.musicLibrary.push({
        id: makeMusicId(),
        file,
        name: file.name,
        duration: meta.duration,
        url: meta.url,
      });
    } catch (err) {
      logDebug(`Failed to read ${file.name}: ${err}`);
    }
  }
  renderMusicList();
  if (state.clips.length) {
    autoAssignMusic(state.clips, state.musicLibrary, state.settings.overflowBehavior);
    renderClipsList();
  }
  setStatus(`${state.musicLibrary.length} music track${state.musicLibrary.length === 1 ? '' : 's'} in library.`, 'ok');
});

function renderMusicList() {
  const has = state.musicLibrary.length > 0;
  el.musicEmptyHint.hidden = has;
  el.musicList.hidden = !has;
  el.musicList.innerHTML = state.musicLibrary.map((m, i) => `
    <li class="music-item" draggable="true" data-index="${i}">
      <span class="music-drag-handle" aria-hidden="true" title="Drag to reorder">☰</span>
      <div class="music-item-main">
        <div class="music-item-name">${i + 1}. ${escapeHtml(m.name)}</div>
        <div class="music-item-meta">${formatTime(m.duration)}</div>
      </div>
      <div class="music-item-actions">
        <div class="reorder-btns">
          <button class="btn btn-ghost btn-sm btn-icon-only" data-action="music-up" data-index="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move ${escapeHtml(m.name)} up">↑</button>
          <button class="btn btn-ghost btn-sm btn-icon-only" data-action="music-down" data-index="${i}" ${i === state.musicLibrary.length - 1 ? 'disabled' : ''} aria-label="Move ${escapeHtml(m.name)} down">↓</button>
        </div>
        <button class="btn btn-ghost btn-sm btn-icon-only" data-action="music-play" data-index="${i}" aria-label="Preview ${escapeHtml(m.name)}">▶</button>
        <button class="btn btn-ghost btn-sm btn-icon-only" data-action="music-remove" data-index="${i}" aria-label="Remove ${escapeHtml(m.name)}">✕</button>
      </div>
    </li>
  `).join('');
}

el.musicList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  const action = btn.dataset.action;
  if (action === 'music-remove') {
    const [removed] = state.musicLibrary.splice(index, 1);
    if (removed) URL.revokeObjectURL(removed.url);
    state.clips.forEach((c) => { if (c.musicId === removed.id) c.musicId = null; });
    renderMusicList();
    renderClipsList();
  } else if (action === 'music-up' && index > 0) {
    state.musicLibrary = moveItem(state.musicLibrary, index, index - 1);
    renderMusicList();
  } else if (action === 'music-down' && index < state.musicLibrary.length - 1) {
    state.musicLibrary = moveItem(state.musicLibrary, index, index + 1);
    renderMusicList();
  } else if (action === 'music-play') {
    const track = state.musicLibrary[index];
    if (!track) return;
    if (previewMusicAudio.src === track.url && !previewMusicAudio.paused) {
      previewMusicAudio.pause();
      btn.textContent = '▶';
    } else {
      previewMusicAudio.src = track.url;
      previewMusicAudio.currentTime = 0;
      previewMusicAudio.play().catch(() => {});
      Array.from(el.musicList.querySelectorAll('[data-action="music-play"]')).forEach((b) => { b.textContent = '▶'; });
      btn.textContent = '⏸';
    }
  }
});
previewMusicAudio.addEventListener('ended', () => {
  Array.from(el.musicList.querySelectorAll('[data-action="music-play"]')).forEach((b) => { b.textContent = '▶'; });
});

// Drag-and-drop reordering (desktop pointer). Arrow buttons above cover
// touch devices where drag reordering is unreliable.
let dragFromIndex = null;
el.musicList.addEventListener('dragstart', (e) => {
  const li = e.target.closest('.music-item');
  if (!li) return;
  dragFromIndex = Number(li.dataset.index);
  li.classList.add('dragging');
});
el.musicList.addEventListener('dragend', (e) => {
  const li = e.target.closest('.music-item');
  if (li) li.classList.remove('dragging');
  dragFromIndex = null;
});
el.musicList.addEventListener('dragover', (e) => {
  e.preventDefault();
});
el.musicList.addEventListener('drop', (e) => {
  e.preventDefault();
  const li = e.target.closest('.music-item');
  if (!li || dragFromIndex === null) return;
  const toIndex = Number(li.dataset.index);
  if (toIndex === dragFromIndex) return;
  state.musicLibrary = moveItem(state.musicLibrary, dragFromIndex, toIndex);
  renderMusicList();
});

// ---------------------------------------------------------------------
// Audio settings
// ---------------------------------------------------------------------

document.querySelectorAll('input[name="originalAudioMode"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      state.settings.originalAudioMode = radio.value;
      el.originalVolumeRow.hidden = radio.value !== 'reduce';
      renderClipsList();
    }
  });
});
el.originalVolumeRow.hidden = state.settings.originalAudioMode !== 'reduce';

el.originalVolume.addEventListener('input', () => {
  state.settings.originalVolume = Number(el.originalVolume.value) / 100;
  el.originalVolumeLabel.textContent = `${el.originalVolume.value}%`;
  renderClipsList();
});
el.musicVolume.addEventListener('input', () => {
  state.settings.musicVolume = Number(el.musicVolume.value) / 100;
  el.musicVolumeLabel.textContent = `${el.musicVolume.value}%`;
  renderClipsList();
});
el.loopShortMusic.addEventListener('change', () => {
  state.settings.loopShortMusic = el.loopShortMusic.checked;
});
document.querySelectorAll('input[name="overflowBehavior"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) state.settings.overflowBehavior = radio.value;
  });
});
el.reassignBtn.addEventListener('click', () => {
  autoAssignMusic(state.clips, state.musicLibrary, state.settings.overflowBehavior);
  renderClipsList();
  setStatus('Music re-assigned sequentially.', 'ok');
});

// ---------------------------------------------------------------------
// Clips list
// ---------------------------------------------------------------------

function resetClipsAndOutputs() {
  stopSharedPreview();
  state.clips.forEach((c) => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
  state.clips = [];
  el.clipsCard.hidden = true;
  el.audioSettingsCard.hidden = true;
  el.exportCard.hidden = true;
  el.exportResults.hidden = true;
  el.exportProgress.hidden = true;
}

function musicOptionsHtml(selectedId) {
  const none = `<option value="" ${!selectedId ? 'selected' : ''}>— No music —</option>`;
  const opts = state.musicLibrary.map((m) => `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('');
  return none + opts;
}

function clipMixSummary(clip) {
  const s = state.settings;
  const parts = [];
  if (s.originalAudioMode === 'mute') parts.push('Original audio: muted');
  else if (s.originalAudioMode === 'reduce') parts.push(`Original audio: ${Math.round(s.originalVolume * 100)}%`);
  else parts.push('Original audio: 100% (kept)');
  if (clip.musicId) {
    parts.push(`Music: ${Math.round(s.musicVolume * 100)}%`);
    const track = state.musicLibrary.find((m) => m.id === clip.musicId);
    if (track && track.duration < clip.duration) {
      parts.push(s.loopShortMusic ? 'looping to fill clip' : 'ends early (no loop)');
    } else if (track && track.duration > clip.duration) {
      parts.push('trimmed to clip length');
    }
  }
  return parts.join(' · ');
}

function renderClipsList() {
  el.clipsCount.textContent = `${state.clips.length} clip${state.clips.length === 1 ? '' : 's'}`;
  el.clipsList.innerHTML = state.clips.map((clip) => `
    <li class="clip-card" data-index="${clip.index}">
      <div class="clip-card-head">
        <div>
          <div class="clip-title">Clip ${String(clip.index).padStart(2, '0')}</div>
          <div class="clip-range">${formatTime(clip.start)} → ${formatTime(clip.end)} · ${formatTime(clip.duration)}</div>
        </div>
        <span class="clip-badge ${clip.status}">${clipStatusLabel(clip)}</span>
      </div>

      <div class="clip-row">
        <label for="music-select-${clip.index}">Music</label>
        <select class="music-select" id="music-select-${clip.index}" data-action="clip-music" data-index="${clip.index}">
          ${musicOptionsHtml(clip.musicId)}
        </select>
      </div>
      <p class="clip-mix-summary">${clipMixSummary(clip)}</p>

      ${clip.status === 'processing' ? `
        <div class="clip-progress-wrap">
          <div class="progress-track"><div class="progress-fill" id="clip-progress-fill-${clip.index}" style="width:${Math.round((clip.progress || 0) * 100)}%"></div></div>
        </div>
      ` : ''}
      ${clip.status === 'error' ? `<p class="clip-error-text">${escapeHtml(clip.error || 'Processing failed.')}</p>` : ''}
      ${clip.status === 'done' && clip.blobUrl ? `<video class="clip-video" controls playsinline src="${clip.blobUrl}"></video>` : ''}

      <div class="clip-actions">
        <button class="btn btn-ghost btn-sm" data-action="clip-preview" data-index="${clip.index}">▶ Preview Mix</button>
        ${clip.status === 'done' ? `<button class="btn btn-secondary btn-sm" data-action="clip-download" data-index="${clip.index}">Download</button>` : ''}
      </div>
    </li>
  `).join('');
}

function clipStatusLabel(clip) {
  switch (clip.status) {
    case 'processing': return 'Processing…';
    case 'done': return 'Done';
    case 'error': return 'Error';
    case 'cancelled': return 'Cancelled';
    default: return 'Pending';
  }
}

el.clipsList.addEventListener('change', (e) => {
  const select = e.target.closest('select[data-action="clip-music"]');
  if (!select) return;
  const index = Number(select.dataset.index);
  const clip = state.clips.find((c) => c.index === index);
  if (!clip) return;
  clip.musicId = select.value || null;
  const li = select.closest('.clip-card');
  const summary = li && li.querySelector('.clip-mix-summary');
  if (summary) summary.textContent = clipMixSummary(clip);
});

el.clipsList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  const clip = state.clips.find((c) => c.index === index);
  if (!clip) return;
  if (btn.dataset.action === 'clip-preview') {
    togglePreview(clip);
  } else if (btn.dataset.action === 'clip-download') {
    downloadClip(clip);
  }
});

// ---------------------------------------------------------------------
// Approximate clip preview (source video seeked + music element, synced
// via JS). Not frame-accurate — that's only guaranteed by the real
// ffmpeg export — but it lets users audition a mix before spending time
// exporting.
// ---------------------------------------------------------------------

let previewRAF = null;

function togglePreview(clip) {
  if (state.previewingClipIndex === clip.index) {
    stopSharedPreview();
    return;
  }
  startSharedPreview(clip);
}

function startSharedPreview(clip) {
  if (!state.video) return;
  stopSharedPreview();
  state.previewingClipIndex = clip.index;

  el.sharedPreview.hidden = false;
  el.sharedPreviewLabel.textContent = `Previewing Clip ${String(clip.index).padStart(2, '0')} (approximate mix, not frame-accurate)`;
  el.sharedPreviewVideo.src = state.video.url;

  const s = state.settings;
  el.sharedPreviewVideo.muted = s.originalAudioMode === 'mute';
  el.sharedPreviewVideo.volume = s.originalAudioMode === 'reduce' ? s.originalVolume : 1;

  const track = clip.musicId ? state.musicLibrary.find((m) => m.id === clip.musicId) : null;
  if (track) {
    previewMusicAudio.src = track.url;
    previewMusicAudio.currentTime = 0;
    previewMusicAudio.volume = s.musicVolume;
  } else {
    previewMusicAudio.pause();
    previewMusicAudio.removeAttribute('src');
  }

  const onLoaded = () => {
    el.sharedPreviewVideo.currentTime = clip.start;
    el.sharedPreviewVideo.play().catch(() => {});
    if (track) previewMusicAudio.play().catch(() => {});
  };
  if (el.sharedPreviewVideo.readyState >= 1) onLoaded();
  else el.sharedPreviewVideo.addEventListener('loadedmetadata', onLoaded, { once: true });

  const tick = () => {
    if (state.previewingClipIndex !== clip.index) return;
    if (el.sharedPreviewVideo.currentTime >= clip.end - 0.05) {
      stopSharedPreview();
      return;
    }
    previewRAF = requestAnimationFrame(tick);
  };
  previewRAF = requestAnimationFrame(tick);

  previewMusicAudio.onended = () => {
    if (state.previewingClipIndex === clip.index && s.loopShortMusic) {
      previewMusicAudio.currentTime = 0;
      previewMusicAudio.play().catch(() => {});
    }
  };

  updatePreviewButtons();
}

function stopSharedPreview() {
  if (previewRAF) cancelAnimationFrame(previewRAF);
  previewRAF = null;
  el.sharedPreviewVideo.pause();
  previewMusicAudio.pause();
  previewMusicAudio.onended = null;
  state.previewingClipIndex = null;
  el.sharedPreview.hidden = true;
  updatePreviewButtons();
}

function updatePreviewButtons() {
  el.clipsList.querySelectorAll('[data-action="clip-preview"]').forEach((btn) => {
    const idx = Number(btn.dataset.index);
    btn.textContent = state.previewingClipIndex === idx ? '⏸ Stop Preview' : '▶ Preview Mix';
  });
}

el.sharedPreviewStop.addEventListener('click', stopSharedPreview);

// ---------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------

el.exportAllBtn.addEventListener('click', exportAll);

async function exportAll() {
  if (!state.video || !state.clips.length || state.exporting) return;
  stopSharedPreview();
  state.exporting = true;
  state.cancelRequested = false;
  el.exportAllBtn.disabled = true;
  el.cancelExportBtn.hidden = false;
  el.exportResults.hidden = true;
  el.exportProgress.hidden = false;

  try {
    if (!engine.loaded) {
      setStatus('Loading FFmpeg engine…', 'busy');
      showGlobalProgress(0.05);
      await engine.load({ onLog: (l) => logDebug(`[ffmpeg] ${l.message}`) });
      showGlobalProgress(1);
      hideGlobalProgress();
    }

    setStatus('Reading video into the processing engine…', 'busy');
    await engine.writeVideo(state.video.file);
    await engine.detectAudio();

    const neededMusicIds = new Set(state.clips.map((c) => c.musicId).filter(Boolean));
    for (const id of neededMusicIds) {
      const track = state.musicLibrary.find((m) => m.id === id);
      if (track) await engine.writeMusic(id, track.file);
    }

    const total = state.clips.length;
    for (let i = 0; i < total; i += 1) {
      const clip = state.clips[i];
      if (state.cancelRequested) {
        clip.status = 'cancelled';
        renderClipsList();
        continue;
      }
      clip.status = 'processing';
      clip.progress = 0;
      renderClipsList();
      const musicLabel = clip.musicId ? 'Mixing music…' : 'Encoding clip…';
      updateExportProgress(i, total, `Processing Clip ${i + 1} of ${total} — ${musicLabel}`);

      try {
        const blob = await engine.processClip(clip, state.settings, (p) => {
          clip.progress = Math.max(0, Math.min(1, p.progress || 0));
          updateExportProgress(i + clip.progress, total, `Processing Clip ${i + 1} of ${total} — ${musicLabel}`);
          const fill = document.getElementById(`clip-progress-fill-${clip.index}`);
          if (fill) fill.style.width = `${Math.round(clip.progress * 100)}%`;
        });
        clip.blob = blob;
        if (clip.blobUrl) URL.revokeObjectURL(clip.blobUrl);
        clip.blobUrl = URL.createObjectURL(blob);
        clip.outputName = buildClipFilename(state.video.name, clip.index, total);
        clip.status = 'done';
        clip.progress = 1;
      } catch (err) {
        if (state.cancelRequested) {
          clip.status = 'cancelled';
        } else {
          clip.status = 'error';
          clip.error = friendlyError(err);
        }
      }
      renderClipsList();
    }

    if (state.cancelRequested) {
      setStatus('Processing cancelled. Clips already exported are still available.', 'idle');
    } else {
      const doneCount = state.clips.filter((c) => c.status === 'done').length;
      setStatus('All videos exported successfully.', 'ok');
      el.exportResultsSummary.textContent = `✓ Processing complete — ${doneCount} of ${total} video${total === 1 ? '' : 's'} ready`;
      el.exportResults.hidden = false;
    }
  } catch (err) {
    // Cancelling during setup (engine load / video write / music write, all
    // outside the per-clip try/catch below) also aborts those in-flight
    // calls, which throw here rather than inside the per-clip handler.
    if (state.cancelRequested) {
      setStatus('Processing cancelled.', 'idle');
    } else {
      setStatus(friendlyError(err), 'error');
    }
  } finally {
    state.exporting = false;
    state.cancelRequested = false;
    el.exportAllBtn.disabled = false;
    el.cancelExportBtn.hidden = true;
    el.cancelConfirm.hidden = true;
    el.exportProgress.hidden = true;
    hideGlobalProgress();
  }
}

function updateExportProgress(currentIndexFraction, total, label) {
  el.exportProgressLabel.textContent = label;
  const pct = Math.round(Math.min(1, currentIndexFraction / total) * 100);
  el.exportProgressFill.style.width = `${pct}%`;
}

el.cancelExportBtn.addEventListener('click', () => {
  el.cancelConfirm.hidden = false;
});
el.cancelConfirmNo.addEventListener('click', () => {
  el.cancelConfirm.hidden = true;
});
el.cancelConfirmYes.addEventListener('click', () => {
  el.cancelConfirm.hidden = true;
  state.cancelRequested = true;
  setStatus('Cancelling…', 'busy');
  engine.terminate();
});

function downloadClip(clip) {
  if (!clip.blobUrl) return;
  const a = document.createElement('a');
  a.href = clip.blobUrl;
  a.download = clip.outputName || `clip_${clip.index}.mp4`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

el.downloadAllBtn.addEventListener('click', async () => {
  const done = state.clips.filter((c) => c.status === 'done' && c.blob);
  if (!done.length) return;
  if (typeof JSZip === 'undefined') {
    setStatus('ZIP library unavailable — use the individual Download buttons instead.', 'error');
    return;
  }
  setStatus('Building ZIP file…', 'busy');
  try {
    const zip = new JSZip();
    done.forEach((c) => zip.file(c.outputName, c.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.video ? sanitizeBaseName(state.video.name) : 'clips'}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setStatus('ZIP download started.', 'ok');
  } catch (err) {
    setStatus(friendlyError(err), 'error');
  }
});

// ---------------------------------------------------------------------
// Reset / New Project
// ---------------------------------------------------------------------

el.newProjectBtn.addEventListener('click', () => {
  const hasWork = state.video || state.musicLibrary.length || state.clips.some((c) => c.status === 'done');
  if (hasWork) {
    el.resetConfirm.hidden = false;
  } else {
    doReset();
  }
});
el.resetConfirmNo.addEventListener('click', () => { el.resetConfirm.hidden = true; });
el.resetConfirmYes.addEventListener('click', () => {
  el.resetConfirm.hidden = true;
  doReset();
});

function doReset() {
  stopSharedPreview();
  if (state.exporting) {
    state.cancelRequested = true;
    engine.terminate();
  }
  if (state.video && state.video.url) URL.revokeObjectURL(state.video.url);
  state.musicLibrary.forEach((m) => URL.revokeObjectURL(m.url));
  state.clips.forEach((c) => { if (c.blobUrl) URL.revokeObjectURL(c.blobUrl); });

  state.video = null;
  state.musicLibrary = [];
  state.clips = [];
  state.exporting = false;
  state.cancelRequested = false;

  el.videoInfo.hidden = true;
  el.videoPreview.removeAttribute('src');
  el.clipsCard.hidden = true;
  el.audioSettingsCard.hidden = true;
  el.exportCard.hidden = true;
  el.exportResults.hidden = true;
  el.exportProgress.hidden = true;
  el.debugLog.textContent = '';
  el.debugDetails.hidden = true;

  renderMusicList();
  setStatus('Ready. Load a video to begin.', 'idle');
}

// ---------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------
// Global safety net: never leave the UI silently stuck.
// ---------------------------------------------------------------------

window.addEventListener('error', (e) => {
  logDebug(`Uncaught error: ${e.message}`);
});
window.addEventListener('unhandledrejection', (e) => {
  logDebug(`Unhandled promise rejection: ${e.reason}`);
});
