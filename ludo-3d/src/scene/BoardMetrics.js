import { GRID_SIZE } from '../game/BoardData.js';

/** Shared world-space constants so board, tokens, and dice always agree on scale. */
export const CELL_SIZE = 1;
export const BOARD_WORLD_SIZE = GRID_SIZE * CELL_SIZE;
export const HALF_BOARD = BOARD_WORLD_SIZE / 2;

export const PLATFORM_TOP_Y = 0;
export const BOARD_SURFACE_Y = 0.12;
export const CELL_PLATE_TOP_Y = 0.16;
export const BASE_PLATE_TOP_Y = 0.2;
export const TOKEN_REST_Y = CELL_PLATE_TOP_Y;

export function cellToWorld(row, col) {
  const x = col * CELL_SIZE - HALF_BOARD + CELL_SIZE / 2;
  const z = row * CELL_SIZE - HALF_BOARD + CELL_SIZE / 2;
  return { x, z };
}

/** Grid coordinates may be fractional (e.g. base waiting slots at .5). */
export function gridToWorld(row, col) {
  const x = col * CELL_SIZE - HALF_BOARD + CELL_SIZE / 2;
  const z = row * CELL_SIZE - HALF_BOARD + CELL_SIZE / 2;
  return { x, z };
}
