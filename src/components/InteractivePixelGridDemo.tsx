import React, { useState, useEffect, useCallback } from 'react';
import { GameModeId } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface InteractivePixelGridProps {
  gameMode: GameModeId;
  isRunning: boolean;
  onTileScore?: (points: number) => void;
  interactive?: boolean;
}

type TileType = 'safe' | 'danger' | 'bonus' | 'active' | 'coin';

interface Tile {
  id: number;
  type: TileType;
  points: number;
  highlighted: boolean;
}

export const InteractivePixelGridDemo: React.FC<InteractivePixelGridProps> = ({
  gameMode,
  isRunning,
  onTileScore,
  interactive = true,
}) => {
  const ROWS = 6;
  const COLS = 8;
  const TOTAL_TILES = ROWS * COLS;

  const generateInitialGrid = useCallback((): Tile[] => {
    const tiles: Tile[] = [];
    for (let i = 0; i < TOTAL_TILES; i++) {
      tiles.push({
        id: i,
        type: 'safe',
        points: 10,
        highlighted: false,
      });
    }
    return tiles;
  }, [TOTAL_TILES]);

  const [grid, setGrid] = useState<Tile[]>(generateInitialGrid);
  const [steppedCount, setSteppedCount] = useState<number>(0);

  // Dynamic tile pattern update based on game mode & running state
  useEffect(() => {
    if (!isRunning) {
      // Idle ambient pattern
      const interval = setInterval(() => {
        setGrid(prev =>
          prev.map((tile, idx) => ({
            ...tile,
            type: (idx + Math.floor(Date.now() / 800)) % 5 === 0 ? 'active' : 'safe',
            highlighted: false,
          }))
        );
      }, 800);
      return () => clearInterval(interval);
    }

    // Active gameplay simulation
    const interval = setInterval(() => {
      setGrid(prev => {
        return prev.map(tile => {
          const rand = Math.random();
          let nextType: TileType = 'safe';

          if (gameMode === 'floor_is_lava') {
            if (rand < 0.35) nextType = 'danger'; // Red lava
            else if (rand < 0.45) nextType = 'bonus'; // Blue safe spot
            else nextType = 'safe';
          } else if (gameMode === 'pixel_rush') {
            if (rand < 0.25) nextType = 'active'; // Glowing cyan target
            else if (rand < 0.3) nextType = 'coin'; // Gold bonus
            else nextType = 'safe';
          } else if (gameMode === 'color_blast') {
            if (rand < 0.3) nextType = 'active'; // Cyan
            else if (rand < 0.6) nextType = 'danger'; // Magenta/Red
            else nextType = 'safe';
          } else {
            if (rand < 0.2) nextType = 'active';
            else if (rand < 0.3) nextType = 'danger';
            else nextType = 'safe';
          }

          return {
            ...tile,
            type: nextType,
            points: nextType === 'coin' ? 50 : nextType === 'bonus' ? 30 : 10,
          };
        });
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isRunning, gameMode]);

  const handleTileClick = (index: number) => {
    if (!interactive || !isRunning) return;
    const tile = grid[index];

    if (tile.type === 'danger') {
      audioSynth.playLifeLost();
      onTileScore?.(-50);
    } else if (tile.type === 'coin' || tile.type === 'bonus') {
      audioSynth.playScoreGain();
      onTileScore?.(tile.points || 50);
    } else if (tile.type === 'active') {
      audioSynth.playScoreGain();
      onTileScore?.(20);
    } else {
      audioSynth.playClick();
      onTileScore?.(10);
    }

    setSteppedCount(c => c + 1);

    // Visual pulse
    setGrid(prev =>
      prev.map((t, idx) =>
        idx === index ? { ...t, highlighted: true } : t
      )
    );

    setTimeout(() => {
      setGrid(prev =>
        prev.map((t, idx) =>
          idx === index ? { ...t, highlighted: false } : t
        )
      );
    }, 200);
  };

  const getTileClasses = (tile: Tile) => {
    let base = 'transition-all duration-300 rounded border flex items-center justify-center cursor-pointer select-none font-pixel text-[10px] ';

    if (tile.highlighted) {
      return base + 'bg-white border-white scale-105 shadow-lg shadow-cyan-400/50 text-black';
    }

    switch (tile.type) {
      case 'danger':
        return base + 'bg-red-950/80 border-red-500/80 text-red-300 shadow-[inset_0_0_12px_rgba(239,68,68,0.5)] hover:bg-red-900';
      case 'active':
        return base + 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[inset_0_0_12px_rgba(6,182,212,0.6)] animate-pulse hover:bg-cyan-900';
      case 'bonus':
        return base + 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[inset_0_0_12px_rgba(52,211,153,0.6)] hover:bg-emerald-900';
      case 'coin':
        return base + 'bg-amber-950/80 border-yellow-400 text-yellow-200 shadow-[inset_0_0_12px_rgba(250,204,21,0.7)] hover:bg-amber-900';
      case 'safe':
      default:
        return base + 'bg-zinc-900/60 border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400';
    }
  };

  return (
    <div id="pixel-grid-interactive-container" className="flex flex-col items-center">
      <div className="grid grid-cols-8 gap-1.5 p-2 bg-zinc-950/90 rounded-xl border border-zinc-800/80 shadow-2xl backdrop-blur max-w-full">
        {grid.map((tile, idx) => (
          <button
            key={tile.id}
            id={`tile-btn-${tile.id}`}
            type="button"
            onClick={() => handleTileClick(idx)}
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${getTileClasses(tile)}`}
            title={tile.type}
          >
            {tile.type === 'danger' && '🔥'}
            {tile.type === 'coin' && '⭐'}
            {tile.type === 'bonus' && '🛡️'}
            {tile.type === 'active' && '⚡'}
          </button>
        ))}
      </div>
      {interactive && (
        <div className="mt-2 flex items-center justify-between w-full max-w-md px-2 text-xs font-condensed text-zinc-400">
          <span>Simulation sol interactif (cliquez pour tester)</span>
          <span className="text-cyan-400 font-semibold">{steppedCount} dalles touchées</span>
        </div>
      )}
    </div>
  );
};
