/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { 
  UserPlus, 
  Clock, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Pause, 
  Play, 
  PlusCircle, 
  LogOut, 
  Bell, 
  Users, 
  Sparkles, 
  Flame, 
  Filter, 
  Volume2, 
  Trash2, 
  RefreshCw,
  QrCode,
  Tag,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ClientEntry, ClientCheckoutHistory } from '../types';
import { audioSynth } from '../utils/audioSynthesizer';

interface ClientTimeTrackerViewProps {
  clients: ClientEntry[];
  checkouts: ClientCheckoutHistory[];
  onAddClient: (client: Omit<ClientEntry, 'id' | 'entryTimestamp' | 'remainingSeconds' | 'status'> & { customDurationMinutes?: number }) => void;
  onExtendClientTime: (id: string, additionalMinutes: number) => void;
  onTogglePauseClient: (id: string) => void;
  onCheckoutClient: (id: string) => void;
  onDeleteClient: (id: string) => void;
  onCallClient: (client: ClientEntry) => void;
  onBatchExtend: (minutes: number) => void;
  soundMuted: boolean;
}

export const ClientTimeTrackerView: React.FC<ClientTimeTrackerViewProps> = ({
  clients,
  checkouts,
  onAddClient,
  onExtendClientTime,
  onTogglePauseClient,
  onCheckoutClient,
  onDeleteClient,
  onCallClient,
  onBatchExtend,
  soundMuted,
}) => {
  // Form State
  const [clientName, setClientName] = useState('');
  const [braceletNumber, setBraceletNumber] = useState('');
  const [playersCount, setPlayersCount] = useState<number>(2);
  const [assignedArena, setAssignedArena] = useState('Toutes Salles');
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(60); // 1 hour default!
  const [notes, setNotes] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'expired' | 'paused'>('all');
  const [showCheckoutsDrawer, setShowCheckoutsDrawer] = useState(false);

  // Quick preset durations
  const DURATION_PRESETS = [
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '1 Heure (60 min)', minutes: 60, isPrimary: true },
    { label: '1h30 (90 min)', minutes: 90 },
    { label: '2 Heures (120 min)', minutes: 120 },
  ];

  // Room options
  const ARENA_OPTIONS = [
    'Toutes Salles',
    'Sol Interactif A',
    'Sol Interactif B',
    'Salle Matrix Alpha',
    'Salle Pixel Beta',
    'Arcade & VR',
    'Grande Arène',
  ];

  // Quick submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    onAddClient({
      clientName: clientName.trim(),
      braceletNumber: braceletNumber.trim() ? (braceletNumber.startsWith('#') ? braceletNumber : `#${braceletNumber}`) : undefined,
      playersCount: Math.max(1, playersCount),
      assignedArena,
      totalDurationMinutes: selectedDurationMinutes,
      totalDurationSeconds: selectedDurationMinutes * 60,
      notes: notes.trim() || undefined,
    });

    // Reset name & notes, suggest next bracelet
    setClientName('');
    setNotes('');
    // Auto increment bracelet if it was a number
    if (braceletNumber && !isNaN(Number(braceletNumber.replace('#', '')))) {
      const nextNum = Number(braceletNumber.replace('#', '')) + 1;
      setBraceletNumber(nextNum < 10 ? `#0${nextNum}` : `#${nextNum}`);
    }
  };

  // Format seconds into HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hours > 0) {
      return `${isNegative ? '+' : ''}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${isNegative ? '+' : ''}${pad(minutes)}:${pad(seconds)}`;
  };

  // Format entry/exit clock time (e.g. "14:30")
  const formatClockTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Filtered clients list
  const filteredClients = clients.filter(c => {
    // Search matching
    const matchesSearch = 
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.braceletNumber && c.braceletNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.assignedArena && c.assignedArena.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Status filtering
    if (statusFilter === 'active') return c.status === 'active' && c.remainingSeconds > 600;
    if (statusFilter === 'warning') return c.status === 'active' && c.remainingSeconds <= 600 && c.remainingSeconds > 0;
    if (statusFilter === 'expired') return c.remainingSeconds <= 0 || c.status === 'expired';
    if (statusFilter === 'paused') return c.status === 'paused';

    return true;
  });

  // Summary counts
  const totalActivePlayers = clients
    .filter(c => c.status !== 'completed')
    .reduce((sum, c) => sum + (c.playersCount || 1), 0);

  const warningCount = clients.filter(c => c.status === 'active' && c.remainingSeconds <= 600 && c.remainingSeconds > 0).length;
  const expiredCount = clients.filter(c => c.remainingSeconds <= 0).length;
  const pausedCount = clients.filter(c => c.status === 'paused').length;

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 p-3 sm:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      {/* 🚀 QUICK REGISTRATION & 1-HOUR LAUNCHER BAR */}
      <section className="bg-zinc-900/90 border-2 border-cyan-500/50 rounded-2xl p-4 sm:p-6 shadow-xl shadow-cyan-950/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-black">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-wide flex items-center gap-2">
                NOUVEAU CLIENT <span className="text-cyan-400">· COMPTE À REBOURS 1 HEURE</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Notez le nom du client et déclenchez instantanément son chrono de 60 minutes.
              </p>
            </div>
          </div>

          {/* Quick preset badges */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-bold px-2">Durée :</span>
            {DURATION_PRESETS.map(preset => (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => setSelectedDurationMinutes(preset.minutes)}
                className={`px-2.5 py-1 rounded-lg text-xs font-tech font-bold transition-all ${
                  selectedDurationMinutes === preset.minutes
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          
          {/* Client Name Input */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
              Nom du Client / Groupe *
            </label>
            <div className="relative">
              <input
                id="client-name-input"
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Ex: Lucas, Famille Dupont, Alex..."
                required
                autoFocus
                className="w-full bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-bold text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-3 top-3 text-[10px] text-zinc-500 font-mono">Entrée ↵</span>
            </div>
          </div>

          {/* Bracelet / Dossard Number */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Bracelet / Dossard
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                id="client-bracelet-input"
                type="text"
                value={braceletNumber}
                onChange={e => setBraceletNumber(e.target.value)}
                placeholder="#01"
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-cyan-300 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Players Count */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Joueurs
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <select
                id="client-players-count"
                value={playersCount}
                onChange={e => setPlayersCount(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(num => (
                  <option key={num} value={num}>{num} joueur{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Room / Arena */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Zone / Salle
            </label>
            <select
              id="client-arena-zone"
              value={assignedArena}
              onChange={e => setAssignedArena(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm font-bold text-zinc-300 focus:outline-none cursor-pointer"
            >
              {ARENA_OPTIONS.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          {/* Launch Button */}
          <div className="lg:col-span-2">
            <button
              id="launch-client-timer-btn"
              type="submit"
              disabled={!clientName.trim()}
              className={`w-full py-2.5 px-4 rounded-xl font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                clientName.trim()
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black shadow-cyan-500/25 active:scale-95 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <Play className="w-4 h-4 fill-black" />
              LANCER 1H
            </button>
          </div>

        </form>
      </section>

      {/* 📊 SUMMARY COUNTERS & CONTROL TOOLBAR */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-400">Clients Actifs</div>
              <div className="text-base font-black text-white">{clients.length} <span className="text-xs text-zinc-400 font-normal">({totalActivePlayers} pers.)</span></div>
            </div>
          </div>

          {warningCount > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl px-3.5 py-2 flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <div>
                <div className="text-[10px] uppercase font-mono text-amber-300/80">Fin &lt; 10 min</div>
                <div className="text-base font-black">{warningCount} client{warningCount > 1 ? 's' : ''}</div>
              </div>
            </div>
          )}

          {expiredCount > 0 && (
            <div className="bg-red-950/60 border border-red-500/80 rounded-xl px-3.5 py-2 flex items-center gap-2 text-red-400 animate-pulse">
              <Flame className="w-4 h-4" />
              <div>
                <div className="text-[10px] uppercase font-mono text-red-300/90 font-bold">Temps Dépassé</div>
                <div className="text-base font-black">{expiredCount} client{expiredCount > 1 ? 's' : ''}</div>
              </div>
            </div>
          )}

          {pausedCount > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 flex items-center gap-2 text-zinc-400">
              <Pause className="w-3.5 h-3.5" />
              <div className="text-xs font-bold">{pausedCount} en pause</div>
            </div>
          )}
        </div>

        {/* Global Batch Controls & History Toggle */}
        <div className="flex items-center gap-2">
          {/* Batch extend button */}
          <div className="dropdown relative group">
            <button
              id="batch-actions-btn"
              type="button"
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              +10 min à Tous
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-xl z-20 w-44">
              <button
                type="button"
                onClick={() => onBatchExtend(5)}
                className="px-3 py-1.5 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg font-tech"
              >
                +5 min à tous les actifs
              </button>
              <button
                type="button"
                onClick={() => onBatchExtend(10)}
                className="px-3 py-1.5 text-left text-xs text-cyan-300 hover:text-cyan-200 hover:bg-zinc-800 rounded-lg font-tech font-bold"
              >
                +10 min à tous les actifs
              </button>
              <button
                type="button"
                onClick={() => onBatchExtend(15)}
                className="px-3 py-1.5 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg font-tech"
              >
                +15 min à tous les actifs
              </button>
            </div>
          </div>

          {/* History Drawer Toggle */}
          <button
            id="toggle-checkouts-btn"
            type="button"
            onClick={() => setShowCheckoutsDrawer(!showCheckoutsDrawer)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              showCheckoutsDrawer
                ? 'bg-zinc-800 border-zinc-600 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            Sorties du Jour ({checkouts.length})
          </button>
        </div>

      </section>

      {/* 🔍 SEARCH & STATUS FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tous ({clients.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            En cours ({clients.filter(c => c.status === 'active' && c.remainingSeconds > 600).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            Fin proche &lt;10m ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'expired'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-zinc-400 hover:text-red-300'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Dépassé ({expiredCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paused')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'paused'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            En Pause ({pausedCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            id="search-client-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher nom, bracelet..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* 📋 ACTIVE CLIENT CARDS GRID */}
      {filteredClients.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Clock className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-zinc-300">Aucun client ne correspond aux critères</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            Utilisez la barre du haut pour saisir le nom d'un client et lancer un compte à rebours de 1 heure.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const isExpired = client.remainingSeconds <= 0;
            const isWarning = client.remainingSeconds <= 600 && client.remainingSeconds > 0;
            const isCritical = client.remainingSeconds <= 60 && client.remainingSeconds > 0;
            const isPaused = client.status === 'paused';

            // Calculate percentage elapsed
            const totalSec = client.totalDurationSeconds || 3600;
            const elapsedSec = totalSec - client.remainingSeconds;
            const percentElapsed = Math.min(100, Math.max(0, (elapsedSec / totalSec) * 100));

            // Scheduled exit time
            const exitTimestamp = client.entryTimestamp + (totalSec * 1000);

            return (
              <div
                key={client.id}
                id={`client-card-${client.id}`}
                className={`rounded-2xl border-2 transition-all p-4 flex flex-col justify-between gap-4 relative overflow-hidden ${
                  isExpired
                    ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-950/40'
                    : isCritical
                    ? 'bg-amber-950/40 border-amber-400 animate-pulse'
                    : isWarning
                    ? 'bg-zinc-900 border-amber-500/70 shadow-md shadow-amber-950/20'
                    : isPaused
                    ? 'bg-zinc-900/70 border-zinc-700 opacity-90'
                    : 'bg-zinc-900/90 border-zinc-800 hover:border-cyan-500/50'
                }`}
              >
                {/* Header: Name, Bracelet & Zone */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-black text-lg text-white">
                          {client.clientName}
                        </span>
                        {client.braceletNumber && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                            {client.braceletNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Users className="w-3 h-3 text-cyan-400" />
                          {client.playersCount} joueur{client.playersCount > 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span className="text-zinc-400">{client.assignedArena || 'Toutes Salles'}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isExpired ? (
                        <span className="px-2 py-1 rounded-md bg-red-500 text-white font-mono text-xs font-black animate-pulse flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-white" />
                          DÉPASSÉ
                        </span>
                      ) : isWarning ? (
                        <span className="px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          &lt; 10 MIN
                        </span>
                      ) : isPaused ? (
                        <span className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 font-mono text-xs font-bold">
                          EN PAUSE
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                          EN JEU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ⏱️ BIG DIGITAL TIMER */}
                  <div className="my-2.5 bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/90 text-center relative">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-0.5">
                      {isExpired ? 'Temps de Dépassement' : 'Temps Restant (sur 1h)'}
                    </div>

                    <div
                      className={`font-mono font-black text-3xl sm:text-4xl tracking-tight ${
                        isExpired
                          ? 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                          : isCritical
                          ? 'text-amber-400 animate-pulse'
                          : isWarning
                          ? 'text-amber-300'
                          : 'text-cyan-300'
                      }`}
                    >
                      {formatTime(client.remainingSeconds)}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          isExpired
                            ? 'bg-red-500'
                            : isWarning
                            ? 'bg-amber-400'
                            : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                        }`}
                        style={{ width: `${percentElapsed}%` }}
                      />
                    </div>

                    {/* Schedule Timestamps */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1.5">
                      <span>Entrée : <strong className="text-zinc-300">{formatClockTime(client.entryTimestamp)}</strong></span>
                      <span>Sortie prévue : <strong className="text-zinc-300">{formatClockTime(exitTimestamp)}</strong></span>
                    </div>
                  </div>

                  {client.notes && (
                    <p className="text-xs text-zinc-400 italic bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50 mb-2">
                      💬 {client.notes}
                    </p>
                  )}
                </div>

                {/* 🎮 ACTION CONTROLS */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  {/* Extension Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onExtendClientTime(client.id, 5)}
                      className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-tech font-bold transition-colors text-center"
                      title="Ajouter 5 minutes"
                    >
                      +5 min
                    </button>
                    <button
                      type="button"
                      onClick={() => onExtendClientTime(client.id, 15)}
                      className="py-1.5 px-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-tech font-bold transition-colors text-center"
                      title="Ajouter 15 minutes (prolongation)"
                    >
                      +15 min
                    </button>
                    <button
                      type="button"
                      onClick={() => onExtendClientTime(client.id, 30)}
                      className="py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-tech font-bold transition-colors text-center"
                      title="Ajouter 30 minutes"
                    >
                      +30 min
                    </button>
                  </div>

                  {/* Operational Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Pause / Play */}
                    <button
                      type="button"
                      onClick={() => onTogglePauseClient(client.id)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center justify-center gap-1 ${
                        isPaused
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                      title={isPaused ? 'Reprendre le chronomètre' : 'Mettre en pause le chronomètre'}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-black" /> : <Pause className="w-3.5 h-3.5" />}
                      {isPaused ? 'Reprendre' : 'Pause'}
                    </button>

                    {/* Audio Call / Alert Client */}
                    <button
                      type="button"
                      onClick={() => onCallClient(client)}
                      className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-amber-950/50 hover:text-amber-300 hover:border-amber-500/40 border border-zinc-700 text-zinc-300 text-xs font-tech font-bold transition-colors flex items-center gap-1"
                      title="Déclencher un bip et une annonce vocale pour appeler ce client"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      Appel
                    </button>

                    {/* Checkout / Sortie */}
                    <button
                      type="button"
                      onClick={() => onCheckoutClient(client.id)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-tech font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                      title="Valider la sortie du client et libérer le bracelet"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sortie
                    </button>

                    {/* Delete entry */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer la session de ${client.clientName} ?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors"
                      title="Supprimer la session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📦 CHECKOUTS DRAWER / COMPLETED SESSIONS */}
      {showCheckoutsDrawer && (
        <section className="mt-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-bold text-white">
                Historique des Sorties Validées Aujourd'hui ({checkouts.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowCheckoutsDrawer(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Fermer ✕
            </button>
          </div>

          {checkouts.length === 0 ? (
            <p className="text-xs text-zinc-500">Aucune sortie validée pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="pb-2">Client</th>
                    <th className="pb-2">Bracelet</th>
                    <th className="pb-2">Joueurs</th>
                    <th className="pb-2">Heure Entrée</th>
                    <th className="pb-2">Heure Sortie</th>
                    <th className="pb-2">Durée Réelle</th>
                    <th className="pb-2">Dépassement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {checkouts.map(item => (
                    <tr key={item.id} className="text-zinc-300 hover:bg-zinc-800/40">
                      <td className="py-2.5 font-bold text-white">{item.clientName}</td>
                      <td className="py-2.5 font-mono text-cyan-400">{item.braceletNumber || '—'}</td>
                      <td className="py-2.5">{item.playersCount}</td>
                      <td className="py-2.5 font-mono text-zinc-400">{item.entryTime}</td>
                      <td className="py-2.5 font-mono text-zinc-400">{item.exitTime}</td>
                      <td className="py-2.5 font-mono text-zinc-200">{item.actualDurationMinutes} min</td>
                      <td className="py-2.5">
                        {item.overtimeMinutes > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold">
                            +{item.overtimeMinutes} min
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-mono">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

    </div>
  );
};
