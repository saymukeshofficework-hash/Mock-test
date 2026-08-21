import { $, showOverlay, hideOverlay } from './overlayUtils.js';

export function initHowToPlay() {
  const overlay = $('htp-overlay');
  const closeBtn = $('htp-close');
  closeBtn.addEventListener('click', () => hideOverlay(overlay));

  return {
    open() { showOverlay(overlay); },
    close() { hideOverlay(overlay); }
  };
}
