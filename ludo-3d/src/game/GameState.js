import { Player } from './Player.js';

/** Game phases, driving what the UI/scene are allowed to do. */
export const Phase = Object.freeze({
  READY_TO_ROLL: 'ready-to-roll',
  ROLLING: 'rolling',
  AWAITING_SELECTION: 'awaiting-selection',
  MOVING: 'moving',
  GAME_OVER: 'game-over'
});

/**
 * Plain, serializable snapshot of an in-progress match. Kept separate
 * from Game.js (which owns turn flow / rules orchestration) so the
 * data shape and its save/load story stay simple to reason about.
 */
export class GameState {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.diceValue = null;
    this.phase = Phase.READY_TO_ROLL;
    this.winner = null;
    this.legalMoves = []; // token ids legal to move this turn
    this.turnCount = 0;
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  toJSON() {
    return {
      players: this.players.map((p) => p.toJSON()),
      currentPlayerIndex: this.currentPlayerIndex,
      diceValue: this.diceValue,
      phase: this.phase,
      winner: this.winner,
      turnCount: this.turnCount
    };
  }

  static fromJSON(data) {
    const players = data.players.map(Player.fromJSON);
    const state = new GameState(players);
    state.currentPlayerIndex = data.currentPlayerIndex;
    state.diceValue = data.diceValue;
    state.phase = data.phase === Phase.GAME_OVER ? Phase.GAME_OVER : Phase.READY_TO_ROLL;
    state.winner = data.winner;
    state.turnCount = data.turnCount || 0;
    return state;
  }
}
