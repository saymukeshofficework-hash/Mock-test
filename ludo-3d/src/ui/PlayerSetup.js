import { $ } from './overlayUtils.js';
import { showOverlay, hideOverlay } from './overlayUtils.js';
import { COLORS, PLAYER_COLOR_HEX } from '../game/BoardData.js';
import { validatePlayerName, sanitizeName, MAX_NAME_LENGTH } from '../utils/helpers.js';

const DEFAULT_NAMES = ['राहुल', 'प्रिया', 'अमित', 'नेहा'];
const COLOR_LABEL_HI = { RED: 'लाल', GREEN: 'हरा', YELLOW: 'पीला', BLUE: 'नीला' };

export function initPlayerSetup({ onBack, onStart }) {
  const overlay = $('setup-overlay');
  const countButtons = [...document.querySelectorAll('.count-btn')];
  const cardsRoot = $('player-cards');
  const backBtn = $('setup-back');
  const startBtn = $('setup-start');

  let numPlayers = 4;
  const inputs = [];

  function buildCards() {
    cardsRoot.innerHTML = '';
    inputs.length = 0;

    COLORS.forEach((color, i) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.style.setProperty('--card-color', PLAYER_COLOR_HEX[color]);
      card.dataset.index = String(i);

      const swatch = document.createElement('span');
      swatch.className = 'swatch';

      const field = document.createElement('div');
      field.className = 'field';

      const label = document.createElement('label');
      label.htmlFor = `player-name-${i}`;
      label.textContent = `खिलाड़ी ${i + 1} • ${COLOR_LABEL_HI[color]}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = `player-name-${i}`;
      input.maxLength = MAX_NAME_LENGTH;
      input.placeholder = 'खिलाड़ी का नाम लिखें';
      input.value = DEFAULT_NAMES[i];
      input.autocomplete = 'off';

      const error = document.createElement('div');
      error.className = 'field-error';

      field.appendChild(label);
      field.appendChild(input);
      field.appendChild(error);
      card.appendChild(swatch);
      card.appendChild(field);
      cardsRoot.appendChild(card);

      input.addEventListener('input', () => validateCard(i));
      inputs.push({ card, input, error, color });
    });

    updateVisibility();
  }

  function updateVisibility() {
    inputs.forEach(({ card }, i) => { card.hidden = i >= numPlayers; });
  }

  function otherNames(excludeIndex) {
    return inputs
      .filter((_, i) => i < numPlayers && i !== excludeIndex)
      .map(({ input }) => input.value);
  }

  function validateCard(i) {
    const entry = inputs[i];
    const msg = validatePlayerName(entry.input.value, otherNames(i));
    entry.error.textContent = msg;
    entry.card.classList.toggle('error', !!msg);
    return !msg;
  }

  function validateAll() {
    let ok = true;
    for (let i = 0; i < numPlayers; i++) {
      if (!validateCard(i)) ok = false;
    }
    return ok;
  }

  countButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      numPlayers = Number(btn.dataset.count);
      countButtons.forEach((b) => b.classList.toggle('active', b === btn));
      updateVisibility();
    });
  });

  backBtn.addEventListener('click', () => { hideOverlay(overlay); onBack?.(); });

  startBtn.addEventListener('click', () => {
    if (!validateAll()) return;
    const configs = inputs.slice(0, numPlayers).map(({ input, color }) => ({
      color,
      name: sanitizeName(input.value, `खिलाड़ी ${COLOR_LABEL_HI[color]}`)
    }));
    hideOverlay(overlay);
    onStart?.(configs);
  });

  buildCards();

  return {
    show() { showOverlay(overlay); },
    hide() { hideOverlay(overlay); }
  };
}
