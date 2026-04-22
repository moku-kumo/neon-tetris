/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { COLS, INITIAL_DROP_SPEED, ROWS, TETROMINOES } from '../constants';
import { Point, Tetromino, TetrominoType } from '../types';

const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const getRandomTetromino = (): Tetromino => {
  const types: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const type = types[Math.floor(Math.random() * types.length)];
  return TETROMINOES[type];
};

export const useTetris = () => {
  const [board, setBoard] = useState<(TetrominoType | null)[][]>(createEmptyBoard());
  const [activePiece, setActivePiece] = useState<{ pos: Point; tetromino: Tetromino } | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino>(getRandomTetromino());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('tetris-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const dropCounterRef = useRef<number>(0);

  // Collision detection
  const checkCollision = (pos: Point, shape: number[][], currentBoard: (TetrominoType | null)[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && currentBoard[newY][newX] !== null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Move piece
  const movePiece = useCallback((dir: Point) => {
    if (isPaused || isGameOver || !activePiece) return false;

    const newPos = { x: activePiece.pos.x + dir.x, y: activePiece.pos.y + dir.y };
    if (!checkCollision(newPos, activePiece.tetromino.shape, board)) {
      setActivePiece({ ...activePiece, pos: newPos });
      return true;
    }
    return false;
  }, [activePiece, board, isPaused, isGameOver]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (isPaused || isGameOver || !activePiece) return;

    const shape = activePiece.tetromino.shape;
    const size = shape.length;
    const rotated = Array.from({ length: size }, () => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        rotated[x][size - 1 - y] = shape[y][x];
      }
    }

    // Simple wall kick
    let offset = 0;
    if (checkCollision(activePiece.pos, rotated, board)) {
      offset = 1;
      if (checkCollision({ x: activePiece.pos.x + offset, y: activePiece.pos.y }, rotated, board)) {
        offset = -1;
        if (checkCollision({ x: activePiece.pos.x + offset, y: activePiece.pos.y }, rotated, board)) {
          return;
        }
      }
    }

    setActivePiece({
      ...activePiece,
      pos: { ...activePiece.pos, x: activePiece.pos.x + offset },
      tetromino: { ...activePiece.tetromino, shape: rotated },
    });
  }, [activePiece, board, isPaused, isGameOver]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (isPaused || isGameOver || !activePiece) return;

    let newY = activePiece.pos.y;
    while (!checkCollision({ x: activePiece.pos.x, y: newY + 1 }, activePiece.tetromino.shape, board)) {
      newY++;
    }
    
    const finalActivePiece = { ...activePiece, pos: { ...activePiece.pos, y: newY } };
    setActivePiece(finalActivePiece);
    lockPiece(finalActivePiece);
  }, [activePiece, board, isPaused, isGameOver]);

  // Lock piece and clear lines
  const lockPiece = useCallback((currentActivePiece: { pos: Point; tetromino: Tetromino }) => {
    const newBoard = board.map(row => [...row]);
    const { pos, tetromino } = currentActivePiece;

    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = tetromino.type;
          }
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const filledBoard = newBoard.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (filledBoard.length < ROWS) {
      filledBoard.unshift(Array(COLS).fill(null));
    }

    if (linesCleared > 0) {
      const linePoints = [0, 100, 300, 500, 800];
      setScore(prev => prev + linePoints[linesCleared] * level);
      setLines(prev => {
        const total = prev + linesCleared;
        if (Math.floor(total / 10) > Math.floor(prev / 10)) {
          setLevel(l => l + 1);
        }
        return total;
      });
    }

    setBoard(filledBoard);
    spawnPiece();
  }, [board, level]);

  const spawnPiece = useCallback(() => {
    const tetromino = nextPiece;
    const pos = { x: Math.floor(COLS / 2) - Math.floor(tetromino.shape.length / 2), y: -2 };

    if (checkCollision(pos, tetromino.shape, board)) {
      setIsGameOver(true);
      return;
    }

    setActivePiece({ pos, tetromino });
    setNextPiece(getRandomTetromino());
  }, [board, nextPiece]);

  // Game Loop
  useEffect(() => {
    if (isGameOver || isPaused || !activePiece) return;

    const speed = Math.max(100, INITIAL_DROP_SPEED - (level - 1) * 100);

    const update = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;
      dropCounterRef.current += deltaTime;

      if (dropCounterRef.current > speed) {
        if (!movePiece({ x: 0, y: 1 })) {
          lockPiece(activePiece);
        }
        dropCounterRef.current = 0;
      }

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [activePiece, isGameOver, isPaused, level, movePiece, lockPiece]);

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    const first = getRandomTetromino();
    const pos = { x: Math.floor(COLS / 2) - Math.floor(first.shape.length / 2), y: -2 };
    setActivePiece({ pos, tetromino: first });
    setNextPiece(getRandomTetromino());
  };

  const pauseGame = () => setIsPaused(p => !p);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tetris-high-score', score.toString());
    }
  }, [score, highScore]);

  return {
    board,
    activePiece,
    nextPiece,
    score,
    lines,
    level,
    highScore,
    isPaused,
    isGameOver,
    startGame,
    pauseGame,
    movePiece,
    rotatePiece,
    hardDrop,
  };
};
