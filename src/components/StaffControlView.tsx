import React, { useState } from 'react';
import { ArenaSession, GameModeId } from '../types';
import { GAME_MODES } from '../data/gameModes';
import { formatTime } from '../utils/timeFormat';
import { audioSynth } from '../utils/audioSynthesizer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  Plus, 
  Minus, 
  Volume2, 
  VolumeX, 
  Send, 
  Megaphone, 
  Heart, 
  Sparkles, 
  Clock, 
  Users, 
  Award,
  Radio,
  Sliders,
  Flame,
  Zap,
  Grid,
  Swords,
  Target,
  Skull,
  Timer as TimerIcon
} from 'lucide-react';

interface StaffControlViewProps {
  session: ArenaSession;
  allArenas: ArenaSession[];
  onSelectArena: (arenaId: string) => void;
  onUpdateSession: (updated: Partial<ArenaSession>) => void;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResetSession: () => void;
  onStopSession: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  onSetPresetDuration: (minutes: number) => void;
  onScoreAdjust: (teamId: string, delta: number) => void;
  onLifeAdjust: (teamId: string, delta: number) => void;
  onSendBroadcast: (text: string, type: 'info' | 'warning' | 'alert' | 'success') => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const StaffControlView: React.FC<StaffControlViewProps> = ({
  session,
  allArenas,
  onSelectArena,
  onUpdateSession,
  onStartSession,
  onPauseSession,
  onResetSession,
  onStopSession,
  onAdjustTime,
  onSetPresetDuration,
  onScoreAdjust,
  onLifeAdjust,
  onSendBroadcast,
  soundMuted,
  onToggleSound,
}) => {
  const [broadcastInput, setBroadcastInput] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'alert' | 'success'>('warning');
  const [customClientName, setCustomClientName] = useState(session.clientName);

  const presets = [
    { label: '90s', minutes: 1.5 },
    { label: '3 min', minutes: 3 },
    { label: '5 min', minutes: 5 },
    { label: '15 min', minutes: 15 },
    { label: '20 min', minutes: 20 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
  ];

  const quickMessages = [
    '⚠️ Attention : Fin de session dans 2 minutes !',
    '🎉 Nouveau record battu ! Félicitations !',
    '⚡ Alerte : Prochaine manche dans 30 secondes !',
    '🛑 Pause technique - Restez sur vos positions.',
    '🛡️ Bonus activé : Dalles multiplicatrices x2 !',
  ];

  const handleSendCustomBroadcast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!broadcastInput.trim()) return;
    onSendBroadcast(broadcastInput.trim(), broadcastType);
    setBroadcastInput('');
  };

  const getModeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4 text-red-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'Grid': return <Grid className="w-4 h-4 text-purple-400" />;
      case 'Swords': return <Swords className="w-4 h-4 text-pink-400" />;
      case 'Target': return <Target className="w-4 h-4 text-yellow-400" />;
      case 'Skull': return <Skull className="w-4 h-4 text-orange-400" />;
      default: return <TimerIcon className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div id="staff-control-deck" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Bar: Arena Selector & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Régie Opérateur & Animation</h2>
            <p className="text-xs text-zinc-400 font-condensed">Contrôle en direct du chronomètre et de l'arène</p>
          </div>
        </div>

        {/* Arena Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          {allArenas.map(arena => (
            <button
              key={arena.id}
              id={`select-arena-btn-${arena.id}`}
              type="button"
              onClick={() => onSelectArena(arena.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-semibold transition-all flex items-center gap-2 ${
                arena.id === session.id
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${arena.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
              {arena.arenaName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Controls (Timer + Presets) & Right Side (Teams + Soundboard + Messages) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timer & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Chrono Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-condensed uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Chronomètre Principal ({session.arenaName})
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-tech font-bold uppercase ${
                session.status === 'running' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                session.status === 'paused' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                session.status === 'finished' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                'bg-zinc-800 text-zinc-400'
              }`}>
                {session.status}
              </span>
            </div>

            {/* Giant Digits */}
            <div className="text-center my-4">
              <div 
                className={`font-display font-black text-6xl sm:text-7xl md:text-8xl tracking-tight transition-colors ${
                  session.remainingSeconds <= 60 && session.remainingSeconds > 0
                    ? 'text-red-400 glow-red animate-pulse'
                    : session.remainingSeconds <= 300
                    ? 'text-amber-400 glow-yellow'
                    : 'text-cyan-400 glow-cyan'
                }`}
              >
                {formatTime(session.remainingSeconds)}
              </div>
              <div className="text-xs font-tech text-zinc-500 mt-1">
                Round {session.currentRound} / {session.totalRounds} • Round restant : {formatTime(session.roundRemainingSeconds)}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {session.status === 'running' ? (
                <button
                  id="staff-pause-btn"
                  type="button"
                  onClick={onPauseSession}
                  className="py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-tech font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                >
                  <Pause className="w-5 h-5 fill-black" />
                  PAUSE
                </button>
              ) : (
                <button
                  id="staff-start-btn"
                  type="button"
                  onClick={onStartSession}
                  className="py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-black" />
                  DÉMARRER
                </button>
              )}

              <button
                id="staff-reset-btn"
                type="button"
                onClick={onResetSession}
                className="py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-tech font-bold text-sm flex items-center justify-center gap-2 border border-zinc-700 transition-transform active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                RESET
              </button>

              <button
                id="staff-stop-btn"
                type="button"
                onClick={onStopSession}
                className="py-3.5 px-4 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 font-tech font-bold text-sm flex items-center justify-center gap-2 border border-red-800/60 transition-transform active:scale-95"
              >
                <Square className="w-4 h-4 fill-red-400" />
                STOP
              </button>

              <button
                id="staff-sound-toggle-btn"
                type="button"
                onClick={onToggleSound}
                className={`py-3.5 px-4 rounded-xl font-tech font-bold text-sm flex items-center justify-center gap-2 border transition-colors ${
                  soundMuted 
                    ? 'bg-zinc-800 border-red-500/50 text-red-400' 
                    : 'bg-zinc-800 border-cyan-500/50 text-cyan-400'
                }`}
              >
                {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {soundMuted ? 'MUET' : 'SON ON'}
              </button>
            </div>

            {/* Quick Adjust Time (+1m, +5m, -1m, -5m) */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80">
              <div className="text-xs font-condensed text-zinc-400 mb-2">Ajustement rapide du temps :</div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onAdjustTime(60)}
                  className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-tech font-semibold text-zinc-200 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> +1 Min
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustTime(300)}
                  className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-tech font-semibold text-zinc-200 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> +5 Min
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustTime(-60)}
                  className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-tech font-semibold text-zinc-200 flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5 text-amber-400" /> -1 Min
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustTime(-300)}
                  className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-tech font-semibold text-zinc-200 flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5 text-amber-400" /> -5 Min
                </button>
              </div>
            </div>

            {/* Preset Durations */}
            <div className="mt-4">
              <div className="text-xs font-condensed text-zinc-400 mb-2">Préconfigurations de durée de session :</div>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onSetPresetDuration(p.minutes)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-cyan-950 border border-zinc-800 hover:border-cyan-500/50 text-xs font-tech text-zinc-300 hover:text-cyan-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Game Modes Selector */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Sélection du Jeu & Mode Pixel
              </h3>
              <span className="text-xs font-tech text-cyan-400">
                Mode actuel : {GAME_MODES.find(m => m.id === session.gameMode)?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GAME_MODES.map(gm => {
                const isSelected = session.gameMode === gm.id;
                return (
                  <button
                    key={gm.id}
                    id={`mode-select-btn-${gm.id}`}
                    type="button"
                    onClick={() => onUpdateSession({ gameMode: gm.id, roundTotalSeconds: gm.defaultRoundSeconds, roundRemainingSeconds: gm.defaultRoundSeconds })}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                      {getModeIcon(gm.icon)}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-sm text-white">{gm.name}</div>
                      <div className="text-[11px] font-condensed text-zinc-400 leading-tight mt-0.5">{gm.category} • {gm.defaultRoundSeconds}s / round</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scores, Broadcasts & Soundboard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Teams & Score / Lives Management */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                Gestion Équipes & Scores
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customClientName}
                  onChange={e => setCustomClientName(e.target.value)}
                  onBlur={() => onUpdateSession({ clientName: customClientName })}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-condensed w-36"
                  placeholder="Nom du groupe"
                />
              </div>
            </div>

            <div className="space-y-3">
              {session.teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                  style={{ borderLeft: `4px solid ${team.color || (idx === 0 ? '#06b6d4' : '#ec4899')}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display font-bold text-sm text-white">{team.name}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: team.maxLives || 3 }).map((_, i) => (
                          <Heart
                            key={i}
                            className={`w-4 h-4 ${
                              i < team.lives ? 'text-red-500 fill-red-500' : 'text-zinc-700 fill-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-pixel text-xl text-yellow-400 font-bold">{team.score} PTS</div>
                    </div>
                  </div>

                  {/* Score & Life Adjust Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onScoreAdjust(team.id, 50)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-tech text-emerald-400 font-semibold"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => onScoreAdjust(team.id, 100)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-tech text-emerald-400 font-semibold"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => onScoreAdjust(team.id, -50)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-tech text-red-400 font-semibold"
                      >
                        -50
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLifeAdjust(team.id, 1)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-tech text-pink-400 flex items-center gap-1"
                        title="Ajouter 1 vie"
                      >
                        <Heart className="w-3 h-3 fill-pink-400" /> +1
                      </button>
                      <button
                        type="button"
                        onClick={() => onLifeAdjust(team.id, -1)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-tech text-zinc-400 flex items-center gap-1"
                        title="Retirer 1 vie"
                      >
                        <Heart className="w-3 h-3" /> -1
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soundboard SFX */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              Soundboard & Cues Audio Direct
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { audioSynth.playCountdownTick(false); }}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-tech text-zinc-300 hover:text-cyan-400 transition-colors"
              >
                ⏱️ Bip 3-2-1
              </button>
              <button
                type="button"
                onClick={() => { audioSynth.playSessionStart(); }}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-tech text-zinc-300 hover:text-emerald-400 transition-colors"
              >
                🚀 Fanfare Départ
              </button>
              <button
                type="button"
                onClick={() => { audioSynth.playWarningAlert(); }}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-tech text-zinc-300 hover:text-amber-400 transition-colors"
              >
                🚨 Sirène Alerte
              </button>
              <button
                type="button"
                onClick={() => { audioSynth.playTimesUpBuzzer(); }}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-tech text-zinc-300 hover:text-red-400 transition-colors"
              >
                🔔 Buzzer Fin
              </button>
              <button
                type="button"
                onClick={() => { audioSynth.playVictoryFanfare(); }}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-tech text-zinc-300 hover:text-yellow-400 transition-colors"
              >
                🏆 Victoire
              </button>
              <button
                type="button"
                onClick={() => { audioSynth.speak('Attention, il reste cinq minutes de session !'); }}
                className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-tech text-zinc-300 hover:text-purple-400 transition-colors"
              >
                🗣️ Voix "5 min"
              </button>
            </div>
          </div>

          {/* Broadcast Message to Screen */}
          <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              Flash Message Écran Joueurs
            </h3>

            <form onSubmit={handleSendCustomBroadcast} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={broadcastInput}
                  onChange={e => setBroadcastInput(e.target.value)}
                  placeholder="Écrire une annonce à diffuser sur l'écran..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 font-condensed focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Envoyer
                </button>
              </div>

              {/* Quick Preset Messages */}
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-condensed text-zinc-400">Messages prédéfinis :</div>
                <div className="flex flex-wrap gap-1.5">
                  {quickMessages.map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSendBroadcast(msg, 'warning')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-[11px] font-condensed text-zinc-300 text-left hover:border-zinc-700 transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
