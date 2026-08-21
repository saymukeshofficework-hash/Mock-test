import { FINISH_REL, HOME_ENTRY_REL, relStepToGlobalIndex, isSafeRelStep } from './BoardData.js';

/**
 * Stateless Ludo rules. Every function here is a pure computation over
 * plain data (players/tokens) — no rendering, no DOM, no randomness.
 * This keeps the rules deterministic and independently testable.
 */

/**
 * @returns {Array<{token: Token, newRelStep: number, entersHome: boolean, capturesFinishing: boolean}>}
 */
export function getLegalMoves(player, diceValue, allPlayers) {
  const moves = [];
  for (const token of player.tokens) {
    if (token.isFinished) continue;

    if (token.isHome) {
      if (diceValue === 6) {
        moves.push({ token, newRelStep: 0, entersHome: false });
      }
      continue;
    }

    // active token
    const newRelStep = token.relStep + diceValue;
    if (newRelStep > FINISH_REL) continue; // must land exactly on final cell, no overshoot
    moves.push({ token, newRelStep, entersHome: newRelStep === FINISH_REL });
  }
  return moves;
}

export function canMoveToken(token, diceValue, allPlayers) {
  if (token.isFinished) return false;
  if (token.isHome) return diceValue === 6;
  return token.relStep + diceValue <= FINISH_REL;
}

/**
 * Given a token about to land on `newRelStep`, find any opposing tokens
 * that would be captured (sent back to their base).
 */
export function findCaptures(movingToken, newRelStep, allPlayers) {
  if (newRelStep > 50) return []; // home column / finish is always private, no captures there
  if (isSafeRelStep(movingToken.color, newRelStep)) return [];

  const targetGlobalIndex = relStepToGlobalIndex(movingToken.color, newRelStep);
  const captured = [];

  for (const player of allPlayers) {
    if (player.color === movingToken.color) continue;
    for (const token of player.tokens) {
      if (!token.isActive) continue;
      const g = relStepToGlobalIndex(token.color, token.relStep);
      if (g === targetGlobalIndex) captured.push(token);
    }
  }
  return captured;
}

export function checkWinner(players) {
  return players.find((p) => p.hasWon) || null;
}

/** Ranking order in which players finished (for a future podium view / stats). */
export function getFinishOrder(players) {
  return players.filter((p) => p.hasWon);
}

export function nextPlayerIndex(currentIndex, playerCount) {
  return (currentIndex + 1) % playerCount;
}

export { FINISH_REL, HOME_ENTRY_REL };
