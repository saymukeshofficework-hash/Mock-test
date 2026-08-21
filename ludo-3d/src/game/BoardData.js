/**
 * Canonical geometric + logical description of the Ludo board.
 *
 * The board is modeled as a 15x15 grid (rows/cols 0-14). This file is the
 * single source of truth for cell coordinates; both the 3D board builder
 * and the game rules consume it, so visuals and logic can never drift
 * apart.
 *
 * The 52-cell common track below was verified programmatically: all 52
 * cells are unique, every consecutive pair is a valid single-step move
 * (orthogonal or a corner turn), and the four start squares fall exactly
 * 13 cells apart, one adjacent to each base.
 */

export const GRID_SIZE = 15;
export const CENTER = 7;

export const COLORS = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export const PLAYER_COLOR_HEX = {
  RED: '#e63946',
  GREEN: '#2fa84f',
  YELLOW: '#f4c22b',
  BLUE: '#3a86ff'
};

/** Clockwise 52-cell common path, [row, col] pairs. Index 0 sits just outside Red's base. */
export const PATH = [
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0]
];

export const TRACK_LENGTH = PATH.length; // 52

/** Index into PATH where each color's tokens enter the common track. */
export const START_INDEX = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39
};

/** Cells marked with a star: tokens here can never be captured. */
export const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

/** Each color's private 6-cell home stretch, [row, col], leading into the center. */
export const HOME_COLUMNS = {
  RED: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  GREEN: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  YELLOW: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  BLUE: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]]
};

/** Relative-position scheme (per player, independent of color):
 *   0..50  -> common track cell PATH[(START_INDEX[color] + rel) % 52]
 *   51..56 -> HOME_COLUMNS[color][rel - 51]   (56 is the final, "finished" cell)
 */
export const HOME_ENTRY_REL = 51;
export const FINISH_REL = 56;
export const TOTAL_STEPS = 57;

/** 2x2-ish arrangement of the 4 waiting slots inside each color's base, grid coords. */
export const BASE_SLOTS = {
  RED: [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]],
  GREEN: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]],
  YELLOW: [[10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]],
  BLUE: [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]]
};

export const BASE_REGION = {
  RED: { rowMin: 0, rowMax: 5, colMin: 0, colMax: 5 },
  GREEN: { rowMin: 0, rowMax: 5, colMin: 9, colMax: 14 },
  YELLOW: { rowMin: 9, rowMax: 14, colMin: 9, colMax: 14 },
  BLUE: { rowMin: 9, rowMax: 14, colMin: 0, colMax: 5 }
};

/**
 * Convert a token's relative step (0..56, or null while at home) to a
 * world-agnostic grid coordinate [row, col] for rendering.
 */
export function relStepToGrid(color, relStep) {
  if (relStep == null || relStep < 0) return null;
  if (relStep <= 50) {
    const idx = (START_INDEX[color] + relStep) % TRACK_LENGTH;
    return PATH[idx];
  }
  const homeIdx = relStep - HOME_ENTRY_REL;
  return HOME_COLUMNS[color][Math.min(homeIdx, HOME_COLUMNS[color].length - 1)];
}

/** Global track index (0..51) a relative step maps to, or null if in the home column. */
export function relStepToGlobalIndex(color, relStep) {
  if (relStep == null || relStep > 50) return null;
  return (START_INDEX[color] + relStep) % TRACK_LENGTH;
}

export function isSafeRelStep(color, relStep) {
  const g = relStepToGlobalIndex(color, relStep);
  if (g == null) return true; // home column / finished is always safe
  return SAFE_INDICES.has(g);
}
