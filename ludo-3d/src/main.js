import { $ } from './ui/overlayUtils.js';
import { detectWebGL, isCoarsePointer, toast } from './utils/helpers.js';
import { loadSettings, saveGame, loadGame, clearSavedGame, hasSavedGame } from './utils/storage.js';
import { Game } from './game/Game.js';
import { SceneManager } from './scene/SceneManager.js';
import { AudioManager } from './audio/AudioManager.js';

import { initStartScreen } from './ui/StartScreen.js';
import { initPlayerSetup } from './ui/PlayerSetup.js';
import { initHowToPlay } from './ui/HowToPlay.js';
import { initSettings } from './ui/Settings.js';
import { initGameMenu } from './ui/GameMenu.js';
import { initWinnerScreen } from './ui/WinnerScreen.js';
import { initGameUI } from './ui/GameUI.js';

const DEFAULT_PREVIEW_PLAYERS = [
  { color: 'RED', name: 'Red' },
  { color: 'GREEN', name: 'Green' },
  { color: 'YELLOW', name: 'Yellow' },
  { color: 'BLUE', name: 'Blue' }
];

function setLoadingProgress(pct) {
  const fill = $('loading-bar-fill');
  const bar = $('loading-bar-fill').parentElement;
  fill.style.width = `${pct}%`;
  bar.setAttribute('aria-valuenow', String(pct));
}

async function boot() {
  setLoadingProgress(15);

  if (!detectWebGL()) {
    $('loading-screen').hidden = true;
    $('webgl-fallback').hidden = false;
    return;
  }

  const game = new Game();
  const audio = new AudioManager();
  let lastPlayerConfigs = null;
  let sceneManager;

  try {
    sceneManager = new SceneManager($('scene-canvas'));
  } catch (err) {
    console.error('Failed to initialize 3D renderer', err);
    $('loading-screen').hidden = true;
    $('webgl-fallback').hidden = false;
    return;
  }

  setLoadingProgress(55);

  const settings = loadSettings();
  applySettings(settings);

  sceneManager.start();
  sceneManager.initGame(DEFAULT_PREVIEW_PLAYERS.map((cfg, i) => ({ ...cfg, seatIndex: i, tokens: previewTokens() })));
  sceneManager.setAutoRotate(settings.cameraMovement);

  setLoadingProgress(85);

  // -- one-time audio unlock on first user gesture (autoplay policies) ----
  const unlockAudio = () => { audio.unlock(); document.removeEventListener('pointerdown', unlockAudio); };
  document.addEventListener('pointerdown', unlockAudio, { once: true });

  function applySettings(s) {
    audio.setSoundEnabled(s.sound);
    audio.setMusicEnabled(s.music);
    sceneManager?.setQuality(s.animationQuality);
    sceneManager?.setAutoRotate(s.cameraMovement);
  }

  function previewTokens() {
    // Minimal shape compatible with TokenManager.initTokens (only reads .tokens[].id/state/relStep/indexInPlayer)
    return Array.from({ length: 4 }, (_, i) => ({ id: `preview_${i}_${Math.random()}`, indexInPlayer: i, isHome: true, isActive: false, isFinished: false, state: 'home', relStep: null }));
  }

  // ---------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------

  const howToPlay = initHowToPlay();
  const settingsUI = initSettings({ onChange: applySettings });

  const startScreen = initStartScreen({
    onPlay: () => { startScreen.hide(); playerSetup.show(); },
    onContinue: () => resumeSavedGame(),
    onHowToPlay: () => howToPlay.open(),
    onSettings: () => settingsUI.open(),
    onClickSound: () => audio.playClick()
  });
  startScreen.setContinueVisible(hasSavedGame());

  const playerSetup = initPlayerSetup({
    onBack: () => { playerSetup.hide(); startScreen.show(); },
    onStart: (configs) => startNewGame(configs)
  });

  const gameUI = initGameUI({
    onRoll: () => { audio.playClick(); game.rollDice(); },
    onOpenMenu: () => gameMenu.open(),
    onOpenSettings: () => settingsUI.open(),
    onResetCamera: () => sceneManager.resetCamera()
  });

  const gameMenu = initGameMenu({
    settings: settingsUI,
    howToPlay,
    onResume: () => {},
    onRestart: () => startNewGame(lastPlayerConfigs),
    onMainMenu: () => goToMainMenu()
  });

  const winnerScreen = initWinnerScreen({
    onPlayAgain: () => startNewGame(lastPlayerConfigs),
    onMainMenu: () => goToMainMenu()
  });

  // ---------------------------------------------------------------------
  // Game <-> Scene <-> UI wiring
  // ---------------------------------------------------------------------

  sceneManager.on('tokenClicked', (tokenId) => {
    if (game.state?.phase !== 'awaiting-selection') return;
    if (!game.state.legalMoves.includes(tokenId)) {
      toast('यह टोकन अभी नहीं चल सकता');
      return;
    }
    game.selectToken(tokenId);
  });

  game.on('stateReady', (state) => {
    sceneManager.initGame(state.players);
    gameUI.renderPlayers(state.players);
    gameUI.setRollEnabled(true);
    gameUI.setStatusMessage('पासा फेंकें');
    gameUI.showChooseHint(false);
    sceneManager.clearHighlight();
    sceneManager.setClickEnabled(false);
  });

  game.on('turnChanged', ({ player }) => {
    gameUI.renderPlayers(game.state.players);
    gameUI.setActivePlayer(player.seatIndex);
    gameUI.setTurnText(`${player.name} की बारी`, player.color);
    gameUI.setStatusMessage('पासा फेंकें');
    gameUI.setRollEnabled(true);
    gameUI.showChooseHint(false);
    sceneManager.clearHighlight();
    sceneManager.setClickEnabled(false);
    audio.playTurnChange();
    persistGame();
  });

  game.on('turnContinues', ({ player }) => {
    gameUI.renderPlayers(game.state.players);
    gameUI.setTurnText(`${player.name} की बारी`, player.color);
    gameUI.setStatusMessage('आपने 6 फेंका! फिर से फेंकें');
    gameUI.setRollEnabled(true);
    gameUI.showChooseHint(false);
    sceneManager.clearHighlight();
    sceneManager.setClickEnabled(false);
    persistGame();
  });

  game.on('diceRolled', async ({ value }) => {
    gameUI.setRollEnabled(false);
    gameUI.setStatusMessage('पासा घूम रहा है…');
    audio.playDiceRoll();
    await sceneManager.rollDice(value, settingsUI.getSettings().animationQuality);
    gameUI.setDieFace(value);
    game.afterDiceAnimation();
  });

  game.on('noLegalMoves', ({ value }) => {
    gameUI.setStatusMessage(`${value} आया — कोई चाल संभव नहीं`);
    toast('कोई चाल संभव नहीं');
  });

  game.on('legalMoves', ({ moves, autoSelect }) => {
    const ids = moves.map((m) => m.token.id);
    sceneManager.highlightTokens(ids);
    sceneManager.setClickEnabled(true);
    gameUI.showChooseHint(moves.length > 1);
    gameUI.setStatusMessage(moves.length > 1 ? 'चलाने के लिए एक टोकन चुनें' : 'टोकन चल रहा है…');
    if (autoSelect) {
      window.setTimeout(() => game.selectToken(autoSelect), 280);
    }
  });

  game.on('tokenMoved', async ({ tokenId, color, wasHome, fromRelStep, toRelStep, captures, enteredHome }) => {
    sceneManager.setClickEnabled(false);
    sceneManager.clearHighlight();
    gameUI.showChooseHint(false);
    gameUI.setStatusMessage('टोकन चल रहा है…');
    audio.playMoveStep();

    await sceneManager.animateMove({ tokenId, color, wasHome, fromRelStep, toRelStep });

    if (captures.length) {
      audio.playCapture();
      toast(captures.length > 1 ? 'टोकन पकड़े गए!' : 'टोकन पकड़ा गया!');
      await Promise.all(captures.map((c) => sceneManager.animateCapture(c.tokenId, c.color)));
    }

    if (enteredHome) {
      audio.playHomeEntry();
      toast('टोकन घर पहुंच गया!');
    }

    gameUI.renderPlayers(game.state.players);
    game.afterMoveAnimation();
  });

  game.on('gameOver', ({ winner }) => {
    gameUI.hide();
    audio.playWin();
    clearSavedGame();
    sceneManager.setAutoRotate(true);
    sceneManager.focusOnWinner(winner.color);
    winnerScreen.show(winner);
  });

  function startNewGame(configs) {
    if (!configs) return;
    lastPlayerConfigs = configs;
    game.newGame(configs);
    playerSetup.hide();
    winnerScreen.hide();
    startScreen.hide();
    gameUI.show();
    sceneManager.resetCamera();
  }

  function resumeSavedGame() {
    const saved = loadGame();
    if (!saved) { toast('कोई सेव किया गया गेम नहीं मिला'); return; }
    try {
      game.loadState(saved.state);
      lastPlayerConfigs = saved.state.players.map((p) => ({ color: p.color, name: p.name }));
      startScreen.hide();
      gameUI.show();
      sceneManager.resetCamera();
    } catch (err) {
      console.error('Corrupted save, starting fresh', err);
      clearSavedGame();
      toast('सेव किया गया गेम लोड नहीं हो सका');
    }
  }

  function persistGame() {
    if (!game.state) return;
    saveGame(game.serialize());
    startScreen.setContinueVisible(true);
  }

  function goToMainMenu() {
    persistGame();
    gameUI.hide();
    winnerScreen.hide();
    startScreen.show();
    startScreen.setContinueVisible(hasSavedGame());
    sceneManager.initGame(DEFAULT_PREVIEW_PLAYERS.map((cfg, i) => ({ ...cfg, seatIndex: i, tokens: previewTokens() })));
    sceneManager.setAutoRotate(true);
  }

  if (import.meta.env.DEV) {
    window.__LUDO_DEBUG__ = { game, sceneManager, audio };
  }

  // ---------------------------------------------------------------------
  // Rotate-device hint (small screens, portrait)
  // ---------------------------------------------------------------------

  const rotateHint = $('rotate-hint');
  let rotateDismissed = false;
  rotateHint.addEventListener('click', () => { rotateDismissed = true; rotateHint.hidden = true; });

  function checkOrientation() {
    if (rotateDismissed) return;
    const portraitAndNarrow = isCoarsePointer() && window.innerWidth < 480 && window.innerHeight > window.innerWidth * 1.3;
    const gameVisible = !$('game-ui').hidden;
    rotateHint.hidden = !(portraitAndNarrow && gameVisible);
  }
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);
  setInterval(checkOrientation, 1500);

  // ---------------------------------------------------------------------
  // Reveal
  // ---------------------------------------------------------------------

  setLoadingProgress(100);
  window.setTimeout(() => {
    $('loading-screen').hidden = true;
    startScreen.show();
  }, 260);
}

boot().catch((err) => {
  console.error('Ludo 3D failed to start', err);
  const loading = $('loading-screen');
  if (loading) loading.hidden = true;
  $('webgl-fallback').hidden = false;
});
