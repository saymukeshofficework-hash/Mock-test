import { GameState, Phase } from './GameState.js';
import { Player } from './Player.js';
import { Dice } from './Dice.js';
import { TurnManager } from './TurnManager.js';
import * as Rules from './Rules.js';
import { EventEmitter } from '../utils/helpers.js';

/**
 * Central orchestrator tying rules + state + turn flow together.
 * Framework-agnostic: the 3D scene and the DOM UI both just listen to
 * events emitted here and call the small public API below. Movement is
 * committed to state synchronously (so game logic stays simple and
 * deterministic); callers drive the pacing of *visual* animation and
 * tell Game.js when an animation has finished via afterDiceAnimation()
 * / afterMoveAnimation() so the turn only advances once the board has
 * caught up visually.
 */
export class Game extends EventEmitter {
  constructor() {
    super();
    this.dice = new Dice();
    /** @type {GameState|null} */
    this.state = null;
    /** @type {TurnManager|null} */
    this.turnManager = null;
    this._pendingMove = null; // move info awaiting animation completion
  }

  /** @param {{color:string,name:string}[]} playerConfigs in seat order */
  newGame(playerConfigs) {
    const players = playerConfigs.map((cfg, i) => new Player(cfg.color, cfg.name, i));
    this.state = new GameState(players);
    this.turnManager = new TurnManager(players.length);
    this.emit('stateReady', this.state);
    this.emit('turnChanged', { player: this.state.currentPlayer, turnCount: this.state.turnCount });
    return this.state;
  }

  loadState(savedJSON) {
    this.state = GameState.fromJSON(savedJSON);
    this.turnManager = new TurnManager(this.state.players.length);
    this.emit('stateReady', this.state);
    this.emit('turnChanged', { player: this.state.currentPlayer, turnCount: this.state.turnCount });
    return this.state;
  }

  serialize() {
    return this.state ? this.state.toJSON() : null;
  }

  // ---------------------------------------------------------------------
  // Dice roll
  // ---------------------------------------------------------------------

  rollDice() {
    if (!this.state || this.state.phase !== Phase.READY_TO_ROLL) return null;
    const value = this.dice.roll();
    this.state.diceValue = value;
    this.state.phase = Phase.ROLLING;
    const legalMoves = Rules.getLegalMoves(this.state.currentPlayer, value, this.state.players);
    this.state.legalMoves = legalMoves.map((m) => m.token.id);
    this.emit('diceRolled', { value, player: this.state.currentPlayer, legalMoves });
    return value;
  }

  /** Called once the 3D dice has finished its roll animation. */
  afterDiceAnimation() {
    if (!this.state || this.state.phase !== Phase.ROLLING) return;
    const legalMoves = Rules.getLegalMoves(this.state.currentPlayer, this.state.diceValue, this.state.players);

    if (legalMoves.length === 0) {
      this.emit('noLegalMoves', { player: this.state.currentPlayer, value: this.state.diceValue });
      this._resolveTurnEnd(false);
      return;
    }

    if (legalMoves.length === 1) {
      this.state.phase = Phase.AWAITING_SELECTION;
      this.emit('legalMoves', { moves: legalMoves, autoSelect: legalMoves[0].token.id });
      // Auto-play the only possible move after a brief beat handled by the caller.
      return;
    }

    this.state.phase = Phase.AWAITING_SELECTION;
    this.emit('legalMoves', { moves: legalMoves, autoSelect: null });
  }

  // ---------------------------------------------------------------------
  // Token selection / movement
  // ---------------------------------------------------------------------

  selectToken(tokenId) {
    if (!this.state || this.state.phase !== Phase.AWAITING_SELECTION) return null;
    if (!this.state.legalMoves.includes(tokenId)) return null;

    const player = this.state.currentPlayer;
    const token = player.tokens.find((t) => t.id === tokenId);
    if (!token) return null;

    const diceValue = this.state.diceValue;
    const fromRelStep = token.relStep; // null if entering from home
    const wasHome = token.isHome;

    if (wasHome) {
      token.enterBoard(0);
    } else {
      token.advance(diceValue);
    }

    const captures = wasHome ? [] : Rules.findCaptures(token, token.relStep, this.state.players);
    const captureInfo = captures.map((t) => ({ tokenId: t.id, color: t.color, fromRelStep: t.relStep }));
    captures.forEach((t) => t.sendHome());

    const enteredHome = token.isFinished;
    this.state.phase = Phase.MOVING;

    this._pendingMove = { tokenId, diceValue };

    this.emit('tokenMoved', {
      tokenId,
      color: token.color,
      wasHome,
      fromRelStep,
      toRelStep: token.relStep,
      captures: captureInfo,
      enteredHome
    });

    return { token, captures: captureInfo, enteredHome };
  }

  /** Called once the 3D token (and any captured tokens) finish animating. */
  afterMoveAnimation() {
    if (!this.state || this.state.phase !== Phase.MOVING) return;
    const diceValue = this._pendingMove?.diceValue ?? this.state.diceValue;
    this._pendingMove = null;

    const winner = Rules.checkWinner(this.state.players);
    if (winner) {
      this.state.winner = winner.color;
      this.state.phase = Phase.GAME_OVER;
      this.emit('gameOver', { winner });
      return;
    }

    this._resolveTurnEnd(true, diceValue);
  }

  // ---------------------------------------------------------------------
  // Turn resolution
  // ---------------------------------------------------------------------

  _resolveTurnEnd(moved, diceValueOverride) {
    const diceValue = diceValueOverride ?? this.state.diceValue;
    const bonus = this.turnManager.grantsBonusRoll(diceValue, moved);

    this.state.diceValue = null;
    this.state.legalMoves = [];

    if (bonus) {
      this.state.phase = Phase.READY_TO_ROLL;
      this.emit('turnContinues', { player: this.state.currentPlayer });
      return;
    }

    this.state.currentPlayerIndex = this.turnManager.advance(this.state.currentPlayerIndex);
    this.state.turnCount += 1;
    this.state.phase = Phase.READY_TO_ROLL;
    this.emit('turnChanged', { player: this.state.currentPlayer, turnCount: this.state.turnCount });
  }

  reset(playerConfigs) {
    this._pendingMove = null;
    return this.newGame(playerConfigs);
  }
}
