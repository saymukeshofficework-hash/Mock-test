import { $, showOverlay, hideOverlay } from './overlayUtils.js';
import { PLAYER_COLOR_HEX } from '../game/BoardData.js';

function spawnConfetti(count = 60) {
  const colors = Object.values(PLAYER_COLOR_HEX);
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 4200);
  }
}

export function initWinnerScreen({ onPlayAgain, onMainMenu }) {
  const overlay = $('winner-screen');
  const nameEl = $('winner-name');
  const againBtn = $('winner-again');
  const mainBtn = $('winner-menu');

  againBtn.addEventListener('click', () => { hideOverlay(overlay); onPlayAgain?.(); });
  mainBtn.addEventListener('click', () => { hideOverlay(overlay); onMainMenu?.(); });

  return {
    show(player) {
      nameEl.textContent = player.name;
      nameEl.style.color = PLAYER_COLOR_HEX[player.color];
      showOverlay(overlay);
      spawnConfetti(prefersFewerParticles() ? 24 : 60);
    },
    hide() { hideOverlay(overlay); }
  };
}

function prefersFewerParticles() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
