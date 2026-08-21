import { nextPlayerIndex } from './Rules.js';

/**
 * Owns the small piece of state that decides whether a roll earns the
 * current player another turn, or whether play passes to the next seat.
 */
export class TurnManager {
  constructor(playerCount) {
    this.playerCount = playerCount;
  }

  /**
   * @param {number} diceValue
   * @param {boolean} hadLegalMoves whether at least one token could move with this roll
   * @returns {boolean} true if the same player rolls again
   */
  grantsBonusRoll(diceValue, hadLegalMoves) {
    // A six always earns another roll, win or waste — matches standard
    // Ludo rules ("Rolling a six gives the player another roll").
    return diceValue === 6;
  }

  advance(currentIndex) {
    return nextPlayerIndex(currentIndex, this.playerCount);
  }
}
