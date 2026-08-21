import { $, showOverlay, hideOverlay } from './overlayUtils.js';
import { confirmDialog } from './Dialog.js';

export function initGameMenu({ onResume, onRestart, onMainMenu, settings, howToPlay }) {
  const overlay = $('game-menu-overlay');
  const resumeBtn = $('menu-resume');
  const restartBtn = $('menu-restart');
  const settingsBtn = $('menu-settings');
  const htpBtn = $('menu-htp');
  const mainBtn = $('menu-main');

  resumeBtn.addEventListener('click', () => { hideOverlay(overlay); onResume?.(); });
  // Close the menu before opening a nested overlay — both share the same
  // z-index and stack by DOM order, so leaving the menu open behind
  // settings/how-to-play would silently swallow clicks on the panel below it.
  settingsBtn.addEventListener('click', () => { hideOverlay(overlay); settings.open(); });
  htpBtn.addEventListener('click', () => { hideOverlay(overlay); howToPlay.open(); });

  restartBtn.addEventListener('click', async () => {
    const ok = await confirmDialog('Restart the current game?');
    if (ok) { hideOverlay(overlay); onRestart?.(); }
  });

  mainBtn.addEventListener('click', async () => {
    const ok = await confirmDialog('Return to the main menu? Your progress will be saved.');
    if (ok) { hideOverlay(overlay); onMainMenu?.(); }
  });

  return {
    open() { showOverlay(overlay); },
    close() { hideOverlay(overlay); },
    isOpen() { return !overlay.hidden; }
  };
}
