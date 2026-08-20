import React from 'react';
import { ArenaSession } from '../types';
import { formatTime, getProgressPercentage } from '../utils/timeFormat';
import { GAME_MODES } from '../data/gameModes';
import { Play, Pause, RotateCcw, Plus, ExternalLink, Monitor, Clock } from 'lucide-react';

interface MultiArenaViewProps {
  arenas: ArenaSession[];
  onSelectArena: (arenaId: string) => void;
  onStartArena: (arenaId: string) => void;
  onPauseArena: (arenaId: string) => void;
  onResetArena: (arenaId: string) => void;
  onAddMinutes: (arenaId: string, minutes: number) => void;
  onOpenClientDisplay: (arenaId: string) => void;
}

export const MultiArenaView: React.FC<MultiArenaViewProps> = ({
  arenas,
  onSelectArena,
  onStartArena,
  onPauseArena,
  onResetArena,
  onAddMinutes,
  onOpenClientDisplay,
}) => {
  return (
    <div id="multi-arena-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Supervision Multi-Salles (4 Arènes)</h2>
            <p className="text-xs text-zinc-400 font-condensed">Vue d'ensemble et contrôle simultané du complexe Pixel Arena</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-tech text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {arenas.filter(a => a.status === 'running').length} Salles Actives
          </span>
          <span>•</span>
          <span className="text-zinc-400">
            {arenas.filter(a => a.status === 'idle').length} Salles Libres
          </span>
        </div>
      </div>

      {/* Grid of 4 Arenas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {arenas.map(arena => {
          const mode = GAME_MODES.find(m => m.id === arena.gameMode) || GAME_MODES[0];
          const percent = getProgressPercentage(arena.remainingSeconds, arena.totalDurationSeconds);
          const isLowTime = arena.remainingSeconds <= 60 && arena.remainingSeconds > 0;

          return (
            <div
              key={arena.id}
              id={`multi-card-arena-${arena.id}`}
              className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all shadow-xl flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-white">{arena.arenaName}</h3>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-tech uppercase font-semibold ${
                      arena.status === 'running' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      arena.status === 'paused' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      arena.status === 'finished' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {arena.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-condensed mt-0.5">
                    Groupe : <strong className="text-zinc-200">{arena.clientName || 'Libre'}</strong> • {mode.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenClientDisplay(arena.id)}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-cyan-400 text-xs font-tech flex items-center gap-1 hover:border-cyan-500/40 transition-colors"
                  title="Afficher en plein écran joueur"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Écran
                </button>
              </div>

              {/* Center Digital Clock */}
              <div className="text-center py-2 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <div 
                  className={`font-display font-black text-4xl sm:text-5xl tracking-tight ${
                    isLowTime 
                      ? 'text-red-400 glow-red animate-pulse' 
                      : arena.status === 'running' 
                      ? 'text-cyan-400 glow-cyan' 
                      : 'text-zinc-400'
                  }`}
                >
                  {formatTime(arena.remainingSeconds)}
                </div>
                <div className="text-[11px] font-tech text-zinc-500 mt-0.5">
                  Round {arena.currentRound}/{arena.totalRounds} • Total : {formatTime(arena.totalDurationSeconds)}
                </div>

                {/* Progress Mini Bar */}
                <div className="w-4/5 mx-auto mt-2 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Teams mini score overview */}
              <div className="flex items-center justify-between text-xs font-tech px-2 text-zinc-400">
                {arena.teams.map(t => (
                  <span key={t.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <strong className="text-white">{t.name}</strong>: {t.score} pts ({t.lives} ❤️)
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                {arena.status === 'running' ? (
                  <button
                    type="button"
                    onClick={() => onPauseArena(arena.id)}
                    className="py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-tech font-bold flex items-center justify-center gap-1"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartArena(arena.id)}
                    className="py-2 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-tech font-bold flex items-center justify-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-emerald-400" /> Start
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onResetArena(arena.id)}
                  className="py-2 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-tech flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>

                <button
                  type="button"
                  onClick={() => onAddMinutes(arena.id, 5)}
                  className="py-2 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-tech flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-cyan-400" /> +5m
                </button>

                <button
                  type="button"
                  onClick={() => onSelectArena(arena.id)}
                  className="py-2 px-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-cyan-500/20"
                >
                  Régie
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
