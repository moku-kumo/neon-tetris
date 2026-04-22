/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Point = {
  x: number;
  y: number;
};

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  glow: string;
}

export interface GameState {
  board: (TetrominoType | null)[][];
  activePiece: {
    pos: Point;
    tetromino: Tetromino;
  } | null;
  nextPiece: Tetromino;
  score: number;
  lines: number;
  level: number;
  isPaused: boolean;
  isGameOver: boolean;
}
