import { $, showOverlay, hideOverlay } from './overlayUtils.js';

/** Reusable "Restart the current game? YES / CANCEL" style confirmation. */
export function confirmDialog(message) {
  const overlay = $('confirm-overlay');
  const msgEl = $('confirm-message');
  const yesBtn = $('confirm-yes');
  const cancelBtn = $('confirm-cancel');

  msgEl.textContent = message;
  showOverlay(overlay);

  return new Promise((resolve) => {
    const cleanup = (result) => {
      hideOverlay(overlay);
      yesBtn.removeEventListener('click', onYes);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    };
    const onYes = () => cleanup(true);
    const onCancel = () => cleanup(false);
    yesBtn.addEventListener('click', onYes);
    cancelBtn.addEventListener('click', onCancel);
  });
}
