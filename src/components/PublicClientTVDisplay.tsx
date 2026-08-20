/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Clock, 
  Users, 
  AlertTriangle, 
  Flame, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { ClientEntry } from '../types';

interface PublicClientTVDisplayProps {
  clients: ClientEntry[];
  soundMuted: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
}

export const PublicClientTVDisplay: React.FC<PublicClientTVDisplayProps> = ({
  clients,
  soundMuted,
  onToggleSound,
  onToggleFullscreen,
}) => {
  const [currentClock, setCurrentClock] = useState('');

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      setCurrentClock(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (remainingSec: number) => {
    const isNegative = remainingSec < 0;
    const absSeconds = Math.abs(remainingSec);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${isNegative ? '+' : ''}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${isNegative ? '+' : ''}${pad(minutes)}:${pad(seconds)}`;
  };

  const activeClients = clients.filter(c => c.status !== 'completed');

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 sm:p-8 min-h-[calc(100vh-65px)] select-none">
      
      {/* TV Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/30">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wider flex items-center gap-2">
              PIXEL ARENA <span className="text-cyan-400">· TEMPS DE JEU</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-tech">
              Écran de suivi en direct des sessions clients (1 Heure)
            </p>
          </div>
        </div>

        {/* Live Clock & Total Players */}
        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-2 text-right">
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">Heure Actuelle</div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-300">{currentClock}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title={soundMuted ? 'Activer le son' : 'Couper le son'}
            >
              {soundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Plein Écran TV"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main TV Screen: Client Tiles Grid */}
      <main className="flex-1 my-6">
        {activeClients.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-zinc-900/30 rounded-3xl border border-zinc-800/80">
            <Clock className="w-20 h-20 text-zinc-700 mb-4 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-display font-black text-zinc-300">
              Aucun joueur actuellement en jeu
            </h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-md">
              Les prochaines sessions démarrées depuis la régie apparaîtront automatiquement ici en grand format.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {activeClients.map(client => {
              const isExpired = client.remainingSeconds <= 0;
              const isWarning = client.remainingSeconds <= 600 && client.remainingSeconds > 0;
              const isCritical = client.remainingSeconds <= 60 && client.remainingSeconds > 0;
              const isPaused = client.status === 'paused';

              const totalSec = client.totalDurationSeconds || 3600;
              const elapsedSec = totalSec - client.remainingSeconds;
              const percentElapsed = Math.min(100, Math.max(0, (elapsedSec / totalSec) * 100));

              return (
                <div
                  key={client.id}
                  className={`rounded-3xl border-3 p-5 sm:p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                    isExpired
                      ? 'bg-red-950/60 border-red-500 shadow-2xl shadow-red-900/40 animate-pulse'
                      : isCritical
                      ? 'bg-amber-950/50 border-amber-400 shadow-xl'
                      : isWarning
                      ? 'bg-zinc-900/95 border-amber-500/80'
                      : isPaused
                      ? 'bg-zinc-900/60 border-zinc-700 opacity-80'
                      : 'bg-zinc-900/90 border-cyan-500/40 hover:border-cyan-400'
                  }`}
                >
                  {/* Top: Name & Bracelet */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">
                            {client.clientName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                          {client.braceletNumber && (
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                              Bracelet {client.braceletNumber}
                            </span>
                          )}
                          <span>•</span>
                          <span className="text-zinc-300 font-medium">{client.assignedArena || 'Arène Pixel'}</span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {isExpired ? (
                        <div className="px-2.5 py-1 rounded-xl bg-red-500 text-white font-mono text-xs font-black flex items-center gap-1 shadow-lg">
                          <Flame className="w-4 h-4 fill-white" />
                          FIN DE SESSION
                        </div>
                      ) : isWarning ? (
                        <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          &lt; 10 MIN
                        </div>
                      ) : null}
                    </div>

                    {/* Giant Digital Countdown */}
                    <div className="my-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                      <div className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1">
                        {isExpired ? 'Temps Dépassé' : 'Temps Restant'}
                      </div>
                      
                      <div
                        className={`font-mono font-black text-4xl sm:text-5xl tracking-tight ${
                          isExpired
                            ? 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]'
                            : isCritical
                            ? 'text-amber-400 animate-pulse'
                            : isWarning
                            ? 'text-amber-300'
                            : 'text-cyan-300'
                        }`}
                      >
                        {formatTimer(client.remainingSeconds)}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            isExpired
                              ? 'bg-red-500'
                              : isWarning
                              ? 'bg-amber-400'
                              : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400'
                          }`}
                          style={{ width: `${percentElapsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {client.playersCount} joueur{client.playersCount > 1 ? 's' : ''}
                    </span>
                    <span className="font-mono text-zinc-400">
                      Session de {client.totalDurationMinutes} min
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Banner */}
      <footer className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Système de contrôle actif en temps réel</span>
        </div>
        <div>
          <span>Pour toute prolongation (+15m / +30m), rendez-vous à l'accueil</span>
        </div>
      </footer>

    </div>
  );
};
