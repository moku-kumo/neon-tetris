/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useCallback } from 'react';
import { Trophy, Play, Pause, RotateCcw, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Zap } from 'lucide-react';
import { useTetris } from './hooks/useTetris';
import { COLORS, COLS, ROWS } from './constants';

export default function App() {
  const {
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
  } = useTetris();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isGameOver) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        movePiece({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        movePiece({ x: 1, y: 0 });
        break;
      case 'ArrowDown':
        movePiece({ x: 0, y: 1 });
        break;
      case 'ArrowUp':
        rotatePiece();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
      case 'p':
      case 'P':
        pauseGame();
        break;
    }
  }, [isGameOver, movePiece, rotatePiece, hardDrop, pauseGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    // Draw active piece
    if (activePiece) {
      const { pos, tetromino } = activePiece;
      tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = pos.y + y;
            const boardX = pos.x + x;
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              displayBoard[boardY][boardX] = tetromino.type;
            }
          }
        });
      });
    }

    return (
      <div className="grid grid-cols-10 gap-0.5 bg-[#111] p-1 border-2 border-white/10 rounded-lg shadow-2xl relative">
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm transition-colors duration-100"
              style={{
                backgroundColor: cell ? COLORS[cell] : 'transparent',
                border: cell ? '2px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.03)',
                boxShadow: cell ? `0 0 15px ${COLORS[cell]}44` : 'none',
              }}
            />
          ))
        )}

        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10"
            >
              <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">GAME OVER</h2>
              <p className="text-white/60 mb-6 font-mono">Final Score: {score}</p>
              <button
                onClick={startGame}
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-white/90 transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" /> RESTART
              </button>
            </motion.div>
          )}

          {isPaused && !isGameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10 text-white"
            >
              <h2 className="text-4xl font-black mb-6 tracking-tighter">PAUSED</h2>
              <button
                onClick={pauseGame}
                className="flex items-center gap-2 bg-cyan-500 text-black px-8 py-3 rounded-full font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                <Play className="w-5 h-5 fill-current" /> RESUME
              </button>
            </motion.div>
          )}

          {!activePiece && !isGameOver && !isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-10"
            >
              <button
                onClick={startGame}
                className="group relative flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95"
              >
                <Play className="w-6 h-6 fill-current" /> START GAME
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-[radial-gradient(circle_at_50%_50%,#111_0%,#000_100%)]">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl">
        
        {/* Left Stats */}
        <div className="hidden lg:flex flex-col gap-4 w-48">
          <StatCard label="SCORE" value={score} icon={<Zap className="w-4 h-4 text-yellow-400" />} color="text-yellow-400" />
          <StatCard label="LEVEL" value={level} icon={<ArrowUp className="w-4 h-4 text-cyan-400" />} color="text-cyan-400" />
          <StatCard label="LINES" value={lines} icon={<Zap className="w-4 h-4 text-purple-400" />} color="text-purple-400" />
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full lg:hidden px-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 tracking-widest font-bold">SCORE</span>
              <span className="text-xl font-black text-yellow-400 tracking-tighter">{score}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-white/40 tracking-widest font-bold">LEVEL</span>
              <span className="text-xl font-black text-cyan-400 tracking-tighter">{level}</span>
            </div>
          </div>

          {renderBoard()}

          {/* Controls Hint / Mobile Controls */}
          <div className="grid grid-cols-3 gap-3 sm:hidden w-full max-w-[280px] mt-2">
             <div/>
             <ControlButton onClick={rotatePiece} icon={<ArrowUp className="w-8 h-8 text-white" />} className="bg-white/10" />
             <div/>
             <ControlButton onClick={() => movePiece({x: -1, y: 0})} icon={<ArrowLeft className="w-8 h-8 text-white" />} />
             <ControlButton onClick={() => movePiece({x: 0, y: 1})} icon={<ArrowDown className="w-8 h-8 text-white" />} />
             <ControlButton onClick={() => movePiece({x: 1, y: 0})} icon={<ArrowRight className="w-8 h-8 text-white" />} />
             <div/>
             <ControlButton onClick={hardDrop} icon={<Zap className="w-8 h-8 text-cyan-400" />} className="bg-cyan-500/10 border-cyan-500/30" />
             <div/>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-4 text-[11px] text-white/30 tracking-widest uppercase font-bold text-center w-full">
            <div className="flex items-center justify-end gap-2"><div className="px-1.5 py-0.5 border border-white/20 rounded">ARROWS</div> MOVE & ROTATE</div>
            <div className="flex items-center justify-start gap-2"><div className="px-1.5 py-0.5 border border-white/20 rounded text-cyan-400 border-cyan-400">SPACE</div> HARD DROP</div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 w-full lg:w-48">
          {/* Next Piece */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-[10px] font-bold text-white/40 tracking-widest mb-4">NEXT PIECE</span>
            <div className="grid grid-cols-4 grid-rows-4 gap-1">
              {nextPiece.shape.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="w-4 h-4 rounded-sm"
                    style={{
                      backgroundColor: cell ? nextPiece.color : 'transparent',
                      border: cell ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      boxShadow: cell ? `0 0 10px ${nextPiece.color}44` : 'none',
                    }}
                  />
                ))
              )}
            </div>
          </div>

          <StatCard label="BEST" value={highScore} icon={<Trophy className="w-4 h-4 text-emerald-400" />} color="text-emerald-400" />

          <button
            onClick={pauseGame}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 font-bold text-sm tracking-widest"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{label}</span>
        {icon}
      </div>
      <span className={`text-2xl font-black ${color} tracking-tighter`}>{value.toLocaleString()}</span>
    </div>
  );
}

function ControlButton({ onClick, icon, className = "" }: { onClick: () => void; icon: React.ReactNode; className?: string }) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`w-16 h-16 rounded-2xl border-2 border-white/10 bg-white/5 flex items-center justify-center active:scale-90 active:bg-white/20 transition-all outline-none touch-none ${className}`}
    >
      {icon}
    </button>
  );
}
