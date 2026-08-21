import { $, showOverlay, hideOverlay } from './overlayUtils.js';
import { loadSettings, saveSettings } from '../utils/storage.js';

export function initSettings({ onChange }) {
  const overlay = $('settings-overlay');
  const closeBtn = $('settings-close');
  const soundInput = $('setting-sound');
  const musicInput = $('setting-music');
  const cameraInput = $('setting-camera');
  const fullscreenInput = $('setting-fullscreen');
  const qualityGroup = $('setting-quality');
  const qualityButtons = [...qualityGroup.querySelectorAll('button')];

  let settings = loadSettings();

  function applyToUI() {
    soundInput.checked = settings.sound;
    musicInput.checked = settings.music;
    cameraInput.checked = settings.cameraMovement;
    fullscreenInput.checked = !!document.fullscreenElement;
    qualityButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.quality === settings.animationQuality));
  }

  function persistAndNotify() {
    saveSettings(settings);
    onChange?.(settings);
  }

  soundInput.addEventListener('change', () => { settings.sound = soundInput.checked; persistAndNotify(); });
  musicInput.addEventListener('change', () => { settings.music = musicInput.checked; persistAndNotify(); });
  cameraInput.addEventListener('change', () => { settings.cameraMovement = cameraInput.checked; persistAndNotify(); });

  qualityButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      settings.animationQuality = btn.dataset.quality;
      applyToUI();
      persistAndNotify();
    });
  });

  fullscreenInput.addEventListener('change', async () => {
    try {
      if (fullscreenInput.checked) await document.documentElement.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      /* Fullscreen may be blocked (e.g. iOS Safari) — checkbox will resync below. */
    }
  });

  document.addEventListener('fullscreenchange', () => { fullscreenInput.checked = !!document.fullscreenElement; });

  closeBtn.addEventListener('click', () => hideOverlay(overlay));

  applyToUI();

  return {
    open() { applyToUI(); showOverlay(overlay); },
    close() { hideOverlay(overlay); },
    getSettings() { return { ...settings }; },
    apply() { persistAndNotify(); }
  };
}
