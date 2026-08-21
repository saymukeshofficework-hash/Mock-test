/**
 * Pure dice logic. Genuinely random, and completely decoupled from the
 * 3D animation that visualizes the roll (see scene/DiceView.js). The
 * result is generated first; the animation is purely cosmetic.
 */
export class Dice {
  roll() {
    return 1 + Math.floor(Math.random() * 6);
  }
}
