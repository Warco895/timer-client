import React from 'react';
import { 
  Users, 
  Tv, 
  Sliders, 
  Monitor, 
  Calendar, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Gamepad2,
  Sparkles,
  Clock
} from 'lucide-react';
import { ArenaSession } from '../types';

export type ActiveTab = 'clients' | 'tv' | 'display' | 'staff' | 'multi' | 'bookings' | 'history';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeClientsCount: number;
  expiredClientsCount: number;
  arenas: ArenaSession[];
  selectedArenaId: string;
  onSelectArena: (id: string) => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  activeClientsCount,
  expiredClientsCount,
  arenas,
  selectedArenaId,
  onSelectArena,
  soundMuted,
  onToggleSound,
  onToggleFullscreen,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 border-b border-zinc-800/90 backdrop-blur px-3 sm:px-6 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-yellow-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base md:text-lg tracking-wider text-white">
                PIXEL<span className="text-cyan-400">ARENA</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-pixel text-[8px]">
                TIMER 1H
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-condensed -mt-0.5">Gestion des Clients & Compte à Rebours</p>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
          {/* PRIMARY: CLIENTS CONTROLLER (1H TIMER) */}
          <button
            id="nav-tab-clients"
            type="button"
            onClick={() => onTabChange('clients')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'clients'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black shadow-md shadow-cyan-500/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Chronomètre Clients (1h)
            {activeClientsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                expiredClientsCount > 0 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : activeTab === 'clients' ? 'bg-black text-cyan-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {activeClientsCount}
              </span>
            )}
          </button>

          {/* PUBLIC TV SCREEN */}
          <button
            id="nav-tab-tv"
            type="button"
            onClick={() => onTabChange('tv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tv'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Écran Public TV
          </button>

          <button
            id="nav-tab-display"
            type="button"
            onClick={() => onTabChange('display')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'display'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Écran Salle Solo
          </button>

          <button
            id="nav-tab-staff"
            type="button"
            onClick={() => onTabChange('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Régie Salles
          </button>

          <button
            id="nav-tab-multi"
            type="button"
            onClick={() => onTabChange('multi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'multi'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Multi-Arènes
          </button>

          <button
            id="nav-tab-bookings"
            type="button"
            onClick={() => onTabChange('bookings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Planning
          </button>

          <button
            id="nav-tab-history"
            type="button"
            onClick={() => onTabChange('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Scores & Certificats
          </button>
        </nav>

        {/* Global Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Arena quick select */}
          <select
            id="navbar-arena-selector"
            value={selectedArenaId}
            onChange={e => onSelectArena(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-cyan-300 font-tech focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {arenas.map(a => (
              <option key={a.id} value={a.id}>
                {a.arenaName} ({a.status === 'running' ? '⏱️ Actif' : 'Libre'})
              </option>
            ))}
          </select>

          {/* Sound Toggle */}
          <button
            id="nav-sound-btn"
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              soundMuted
                ? 'bg-zinc-900 border-red-500/40 text-red-400 hover:bg-zinc-800'
                : 'bg-zinc-900 border-cyan-500/40 text-cyan-400 hover:bg-zinc-800'
            }`}
            title={soundMuted ? 'Activer le son' : 'Couper le son'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen button */}
          <button
            id="nav-fullscreen-btn"
            type="button"
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Plein écran (Affichage Salle TV)"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

