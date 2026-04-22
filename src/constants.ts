/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tetromino, TetrominoType } from './types';

export const COLS = 10;
export const ROWS = 20;
export const INITIAL_DROP_SPEED = 800;
export const MIN_DROP_SPEED = 100;
export const SPEED_INCREMENT = 0.9; // Multiply speed by this every level

export const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0f0',
    glow: 'rgba(0, 240, 240, 0.5)',
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0',
    glow: 'rgba(0, 0, 240, 0.5)',
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000',
    glow: 'rgba(240, 160, 0, 0.5)',
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000',
    glow: 'rgba(240, 240, 0, 0.5)',
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000',
    glow: 'rgba(0, 240, 0, 0.5)',
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0',
    glow: 'rgba(160, 0, 240, 0.5)',
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000',
    glow: 'rgba(240, 0, 0, 0.5)',
  },
};

export const COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0',
  J: '#0000f0',
  L: '#f0a000',
  O: '#f0f000',
  S: '#00f000',
  T: '#a000f0',
  Z: '#f00000',
};
