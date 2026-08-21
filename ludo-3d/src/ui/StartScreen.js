import { $, showOverlay, hideOverlay } from './overlayUtils.js';

export function initStartScreen({ onPlay, onContinue, onHowToPlay, onSettings, onClickSound }) {
  const screen = $('start-screen');
  const playBtn = $('btn-play');
  const continueBtn = $('btn-continue');
  const htpBtn = $('btn-how-to-play');
  const settingsBtn = $('btn-settings');
  const aboutBtn = $('btn-about');
  const aboutOverlay = $('about-overlay');
  const aboutClose = $('about-close');

  const withClick = (fn) => () => { onClickSound?.(); fn?.(); };

  playBtn.addEventListener('click', withClick(onPlay));
  continueBtn.addEventListener('click', withClick(onContinue));
  htpBtn.addEventListener('click', withClick(onHowToPlay));
  settingsBtn.addEventListener('click', withClick(onSettings));
  aboutBtn.addEventListener('click', withClick(() => showOverlay(aboutOverlay)));
  aboutClose.addEventListener('click', withClick(() => hideOverlay(aboutOverlay)));

  return {
    show() { screen.hidden = false; },
    hide() { screen.hidden = true; },
    setContinueVisible(visible) { continueBtn.hidden = !visible; }
  };
}
