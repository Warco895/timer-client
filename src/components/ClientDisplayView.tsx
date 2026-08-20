import React, { useEffect } from 'react';
import { ArenaSession } from '../types';
import { formatTime, getProgressPercentage } from '../utils/timeFormat';
import { GAME_MODES } from '../data/gameModes';
import { 
  Flame, 
  Zap, 
  Grid, 
  Swords, 
  Target, 
  Skull, 
  Timer as TimerIcon, 
  Heart, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sparkles,
  AlertTriangle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InteractivePixelGridDemo } from './InteractivePixelGridDemo';

interface ClientDisplayViewProps {
  session: ArenaSession;
  onTileScore?: (points: number) => void;
  onToggleFullscreen?: () => void;
  soundMuted?: boolean;
  onToggleSound?: () => void;
  showScanlines?: boolean;
}

export const ClientDisplayView: React.FC<ClientDisplayViewProps> = ({
  session,
  onTileScore,
  onToggleFullscreen,
  soundMuted,
  onToggleSound,
  showScanlines = true,
}) => {
  const mode = GAME_MODES.find(m => m.id === session.gameMode) || GAME_MODES[0];
  const totalPercent = getProgressPercentage(session.remainingSeconds, session.totalDurationSeconds);
  const roundPercent = getProgressPercentage(session.roundRemainingSeconds, session.roundTotalSeconds);

  // Trigger confetti when session finishes
  useEffect(() => {
    if (session.status === 'finished') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#ec4899', '#eab308', '#22c55e', '#ffffff'],
        });
      } catch {}
    }
  }, [session.status]);

  const getModeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-6 h-6 text-red-500" />;
      case 'Zap': return <Zap className="w-6 h-6 text-cyan-400" />;
      case 'Grid': return <Grid className="w-6 h-6 text-purple-400" />;
      case 'Swords': return <Swords className="w-6 h-6 text-pink-500" />;
      case 'Target': return <Target className="w-6 h-6 text-yellow-400" />;
      case 'Skull': return <Skull className="w-6 h-6 text-orange-500" />;
      default: return <TimerIcon className="w-6 h-6 text-emerald-400" />;
    }
  };

  const isLowTime = session.remainingSeconds <= 60 && session.remainingSeconds > 0;
  const isWarningTime = session.remainingSeconds <= 300 && session.remainingSeconds > 60;

  const getTimerGlowClass = () => {
    if (session.status === 'finished') return 'text-zinc-500';
    if (isLowTime) return 'text-red-500 glow-red animate-pulse';
    if (isWarningTime) return 'text-amber-400 glow-yellow';
    return 'text-cyan-400 glow-cyan';
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-tech text-sm tracking-wider uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            Session En Cours
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-tech text-sm tracking-wider uppercase animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Session En Pause
          </span>
        );
      case 'briefing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-tech text-sm tracking-wider uppercase">
            Briefing / Échauffement
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-tech text-sm tracking-wider uppercase font-bold">
            <Award className="w-4 h-4" />
            Temps Écoulé !
          </span>
        );
      case 'cleaning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-700/50 border border-zinc-600 text-zinc-300 font-tech text-sm tracking-wider uppercase">
            Nettoyage & Préparation
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-tech text-sm tracking-wider uppercase">
            En Attente de Lancement
          </span>
        );
    }
  };

  return (
    <div 
      id="client-display-screen" 
      className={`relative min-h-[calc(100vh-80px)] w-full flex flex-col justify-between p-4 md:p-8 bg-zinc-950 text-white overflow-hidden select-none pixel-grid-dense ${
        showScanlines ? 'scanlines' : ''
      }`}
    >
      {/* Top Header Row */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 backdrop-blur-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-pink-500/30 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            {getModeIcon(mode.icon)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl md:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-400">
                {session.arenaName}
              </h1>
              {getStatusBadge()}
            </div>
            <p className="font-condensed text-sm text-zinc-400 flex items-center gap-2">
              <span>Client : <strong className="text-zinc-200">{session.clientName || 'Session Arcade'}</strong></span>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">{mode.name}</span>
            </p>
          </div>
        </div>

        {/* Action icons & controls */}
        <div className="flex items-center gap-2.5">
          {onToggleSound && (
            <button
              id="display-sound-toggle-btn"
              type="button"
              onClick={onToggleSound}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title={soundMuted ? 'Activer le son' : 'Couper le son'}
            >
              {soundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>
          )}

          {onToggleFullscreen && (
            <button
              id="display-fullscreen-btn"
              type="button"
              onClick={onToggleFullscreen}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Plein écran (Affichage Salle TV)"
            >
              <Maximize className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Broadcast Banner (if any message active) */}
      {session.currentBroadcast && (
        <div 
          id="client-broadcast-banner"
          className="relative z-20 my-3 p-3.5 rounded-xl bg-gradient-to-r from-red-600/90 via-pink-600/90 to-amber-600/90 border-2 border-yellow-300 shadow-2xl animate-bounce flex items-center justify-center gap-3 text-center"
        >
          <AlertTriangle className="w-6 h-6 text-yellow-300 animate-spin shrink-0" />
          <span className="font-tech font-bold text-lg md:text-xl text-white tracking-wide drop-shadow-md">
            {session.currentBroadcast.text}
          </span>
          <AlertTriangle className="w-6 h-6 text-yellow-300 animate-spin shrink-0" />
        </div>
      )}

      {/* Main Center Area: Huge Chrono & Game Status */}
      <main className="relative z-10 my-auto py-6 flex flex-col items-center justify-center text-center">
        {/* Game Mode Pill */}
        <div className="mb-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700 text-sm font-tech text-zinc-300 shadow-inner">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Mode : <strong className="text-white">{mode.name}</strong> ({mode.category})</span>
        </div>

        {/* Giant Main Digital Clock */}
        <div id="client-main-chrono-display" className="relative select-none my-2">
          <div 
            className={`font-display font-black text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] tracking-tight transition-all duration-300 ${getTimerGlowClass()}`}
          >
            {formatTime(session.remainingSeconds)}
          </div>
          <div className="text-xs sm:text-sm font-condensed tracking-widest uppercase text-zinc-400">
            {session.status === 'finished' ? 'Session Terminée' : 'Temps Total Restant'}
          </div>
        </div>

        {/* Global Session Progress Bar */}
        <div className="w-full max-w-2xl mt-4 px-4">
          <div className="flex justify-between text-xs font-tech text-zinc-400 mb-1.5">
            <span>Progression session ({Math.round(totalPercent)}%)</span>
            <span>Durée totale : {formatTime(session.totalDurationSeconds)}</span>
          </div>
          <div className="h-3.5 w-full bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden p-0.5 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isLowTime 
                  ? 'bg-gradient-to-r from-red-500 to-amber-500' 
                  : 'bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-400'
              }`}
              style={{ width: `${totalPercent}%` }}
            />
          </div>
        </div>

        {/* Round Counter & Sub-Chrono */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-center">
          <div className="px-5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-xs font-condensed uppercase tracking-wider text-zinc-400">Manche / Round</div>
            <div className="font-display font-bold text-2xl text-yellow-400 glow-yellow">
              {session.currentRound} <span className="text-sm text-zinc-500 font-normal">/ {session.totalRounds}</span>
            </div>
          </div>

          <div className="px-5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-xs font-condensed uppercase tracking-wider text-zinc-400">Fin du Round</div>
            <div className="font-display font-bold text-2xl text-cyan-300">
              {formatTime(session.roundRemainingSeconds)}
            </div>
          </div>

          <div className="px-5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="text-xs font-condensed uppercase tracking-wider text-zinc-400">Joueurs Recommandés</div>
            <div className="font-tech font-bold text-xl text-pink-400">
              {mode.recommendedPlayers}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Area: Teams Scores & Lives HUD */}
      <footer className="relative z-10 border-t border-zinc-800/80 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {session.teams.map((team, idx) => (
            <div
              key={team.id}
              id={`team-hud-card-${team.id}`}
              className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur flex items-center justify-between gap-4"
              style={{ borderLeft: `6px solid ${team.color || (idx === 0 ? '#06b6d4' : '#ec4899')}` }}
            >
              {/* Team Info & Lives */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-lg md:text-xl text-white">
                    {team.name}
                  </h3>
                  {team.combo > 1 && (
                    <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-pixel text-[10px] animate-pulse">
                      x{team.combo} COMBO!
                    </span>
                  )}
                </div>

                {/* Lives / Hearts */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs font-condensed text-zinc-400 mr-1">Vies :</span>
                  {Array.from({ length: team.maxLives || 3 }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-5 h-5 transition-transform duration-300 ${
                        i < team.lives
                          ? 'text-red-500 fill-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                          : 'text-zinc-700 fill-zinc-800 scale-90'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Big Score Display */}
              <div className="text-right">
                <div className="text-xs font-condensed uppercase tracking-wider text-zinc-400">Score</div>
                <div 
                  className="font-pixel text-2xl md:text-3xl text-yellow-400 glow-yellow font-bold tracking-tight"
                >
                  {team.score.toLocaleString()} <span className="text-xs font-tech text-zinc-400">PTS</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional mini interactive floor preview at bottom */}
        <div className="mt-4 flex justify-center">
          <InteractivePixelGridDemo
            gameMode={session.gameMode}
            isRunning={session.status === 'running'}
            onTileScore={onTileScore}
            interactive={true}
          />
        </div>
      </footer>
    </div>
  );
};
