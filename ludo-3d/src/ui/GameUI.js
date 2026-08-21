import { $ } from './overlayUtils.js';
import { PLAYER_COLOR_HEX } from '../game/BoardData.js';
import { TOKENS_PER_PLAYER } from '../game/Player.js';

const DIE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function initGameUI({ onRoll, onOpenMenu, onOpenSettings, onResetCamera }) {
  const root = $('game-ui');
  const rollBtn = $('btn-roll');
  const menuBtn = $('btn-menu');
  const settingsBtn = $('btn-settings-ingame');
  const resetCamBtn = $('btn-reset-camera');
  const statusTurn = $('status-turn');
  const statusMessage = $('status-message');
  const chooseHint = $('choose-hint');
  const dieFaceEl = rollBtn.querySelector('.die-face');

  const panels = [0, 1, 2, 3].map((i) => {
    const el = $(`panel-${i}`);
    return {
      el,
      swatch: el.querySelector('.swatch'),
      name: el.querySelector('.name'),
      badge: el.querySelector('.turn-badge'),
      dots: el.querySelector('.token-dots'),
      finishedCount: el.querySelector('.finished-count b')
    };
  });

  rollBtn.addEventListener('click', () => onRoll?.());
  menuBtn.addEventListener('click', () => onOpenMenu?.());
  settingsBtn.addEventListener('click', () => onOpenSettings?.());
  resetCamBtn.addEventListener('click', () => onResetCamera?.());

  function renderPlayers(players) {
    panels.forEach((panel, i) => {
      const player = players[i];
      if (!player) { panel.el.hidden = true; return; }
      panel.el.hidden = false;
      panel.el.style.setProperty('--panel-color', PLAYER_COLOR_HEX[player.color]);
      panel.swatch.style.background = PLAYER_COLOR_HEX[player.color];
      panel.name.textContent = player.name;
      panel.finishedCount.textContent = String(player.finishedCount);

      panel.dots.innerHTML = '';
      for (let t = 0; t < TOKENS_PER_PLAYER; t++) {
        const token = player.tokens[t];
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (token.isFinished) dot.classList.add('finished');
        else if (token.isActive) dot.classList.add('home');
        panel.dots.appendChild(dot);
      }
      panel.el.classList.toggle('finished', player.hasWon);
    });
  }

  function setActivePlayer(seatIndex) {
    panels.forEach((panel, i) => panel.el.classList.toggle('active', i === seatIndex));
  }

  return {
    show() { root.hidden = false; },
    hide() { root.hidden = true; },
    renderPlayers,
    setActivePlayer,
    setTurnText(text, color) {
      statusTurn.textContent = text;
      if (color) statusTurn.style.setProperty('--turn-color', PLAYER_COLOR_HEX[color]);
    },
    setStatusMessage(text) { statusMessage.textContent = text; },
    setRollEnabled(enabled) { rollBtn.disabled = !enabled; },
    setDieFace(value) { dieFaceEl.textContent = DIE_FACES[value] || DIE_FACES[1]; },
    showChooseHint(visible) { chooseHint.hidden = !visible; }
  };
}
