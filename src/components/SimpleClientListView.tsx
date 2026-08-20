/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, 
  Clock, 
  Search, 
  Play, 
  Pause, 
  Plus, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  CheckCircle2,
  Users,
  Timer
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynthesizer';
import confetti from 'canvas-confetti';

export interface SimpleClient {
  id: string;
  name: string;
  entryTimestamp: number; // Date.now()
  durationMinutes: number; // 60 default
  targetEndTime: number; // Date.now() + durationMs (permet de garder le compte exact même si la page est fermée ou rechargée)
  isPaused: boolean;
  pausedRemainingSeconds?: number;
  alert5MinFired?: boolean;
  alertExpiredFired?: boolean;
}

export interface CheckoutRecord {
  id: string;
  name: string;
  entryTime: string;
  exitTime: string;
  totalDurationMinutes: number;
  completedAt: number;
}

const STORAGE_KEY_CLIENTS = 'pixel_simple_clients_exact_v3';
const STORAGE_KEY_CHECKOUTS = 'pixel_simple_checkouts_exact_v3';

export function SimpleClientListView() {
  const [clients, setClients] = useState<SimpleClient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLIENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => {
          if (!c.targetEndTime) {
            c.targetEndTime = (c.entryTimestamp || Date.now()) + ((c.durationMinutes || 60) * 60 * 1000);
          }
          return c;
        });
      }
    } catch {}
    return [];
  });

  const [checkouts, setCheckouts] = useState<CheckoutRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHECKOUTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [nameInput, setNameInput] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundMuted, setSoundMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [, setTick] = useState(0); // Force re-render every second

  // Calcul du temps restant en temps réel (exacte à la seconde même après F5 / refresh)
  const getRemainingSeconds = (client: SimpleClient): number => {
    if (client.isPaused) {
      return client.pausedRemainingSeconds ?? 0;
    }
    return Math.round((client.targetEndTime - Date.now()) / 1000);
  };

  // Persistence automatique
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    } catch {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKOUTS, JSON.stringify(checkouts));
    } catch {}
  }, [checkouts]);

  // Horloge 1s pour actualiser l'affichage & déclencher alertes
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);

      // Gestion des alertes sonores
      setClients(prev => {
        let changed = false;
        const nextList = prev.map(client => {
          if (client.isPaused) return client;
          const rem = Math.round((client.targetEndTime - Date.now()) / 1000);

          let alert5 = client.alert5MinFired;
          let alertExp = client.alertExpiredFired;

          if (!soundMuted) {
            if (rem === 300 && !alert5) {
              alert5 = true;
              changed = true;
              audioSynth.playWarningAlert();
              audioSynth.speak(`Attention ${client.name}, il reste 5 minutes.`);
            } else if (rem === 0 && !alertExp) {
              alertExp = true;
              changed = true;
              audioSynth.playTimesUpBuzzer();
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
              setTimeout(() => {
                audioSynth.speak(`Temps écoulé pour ${client.name} !`);
              }, 500);
            }
          }

          if (alert5 !== client.alert5MinFired || alertExp !== client.alertExpiredFired) {
            return { ...client, alert5MinFired: alert5, alertExpiredFired: alertExp };
          }
          return client;
        });

        return changed ? nextList : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [soundMuted]);

  // Ajouter un nouveau client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) return;

    const now = Date.now();
    const totalMs = durationMinutes * 60 * 1000;

    const newClient: SimpleClient = {
      id: `client-${now}`,
      name: cleanName,
      entryTimestamp: now,
      durationMinutes: durationMinutes,
      targetEndTime: now + totalMs,
      isPaused: false,
      pausedRemainingSeconds: durationMinutes * 60,
      alert5MinFired: false,
      alertExpiredFired: false,
    };

    setClients(prev => [newClient, ...prev]);
    setNameInput('');
    audioSynth.playSessionStart();
  };

  // Retirer des minutes (-5m, -10m, -15m)
  const handleSubtractMinutes = (id: string, mins: number) => {
    audioSynth.playScoreGain();
    const subMs = mins * 60 * 1000;

    setClients(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            durationMinutes: Math.max(0, c.durationMinutes - mins),
            targetEndTime: c.isPaused ? c.targetEndTime : c.targetEndTime - subMs,
            pausedRemainingSeconds: c.isPaused 
              ? (c.pausedRemainingSeconds ?? 0) - (mins * 60) 
              : c.pausedRemainingSeconds,
          };
        }
        return c;
      })
    );
  };

  // Pause / Reprendre
  const handleTogglePause = (id: string) => {
    audioSynth.playClick();
    const now = Date.now();

    setClients(prev =>
      prev.map(c => {
        if (c.id === id) {
          if (!c.isPaused) {
            // Pause
            const remSec = Math.round((c.targetEndTime - now) / 1000);
            return { ...c, isPaused: true, pausedRemainingSeconds: remSec };
          } else {
            // Resume
            const remSec = c.pausedRemainingSeconds ?? 0;
            return { ...c, isPaused: false, targetEndTime: now + (remSec * 1000) };
          }
        }
        return c;
      })
    );
  };

  // Sortie validée
  const handleCheckout = (client: SimpleClient) => {
    audioSynth.playClick();
    const now = new Date();
    const entry = new Date(client.entryTimestamp);
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatH = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const spentMinutes = Math.round((Date.now() - client.entryTimestamp) / 60000);

    const record: CheckoutRecord = {
      id: `chk-${Date.now()}`,
      name: client.name,
      entryTime: formatH(entry),
      exitTime: formatH(now),
      totalDurationMinutes: spentMinutes,
      completedAt: Date.now(),
    };

    setCheckouts(prev => [record, ...prev]);
    setClients(prev => prev.filter(c => c.id !== client.id));
  };

  // Supprimer un client
  const handleDelete = (id: string) => {
    audioSynth.playClick();
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Réinitialiser TOUT
  const handleResetAll = () => {
    if (confirm('Voulez-vous vraiment TOUT RÉINITIALISER ?\nTous les clients en cours et l’historique des sorties seront effacés.')) {
      setClients([]);
      setCheckouts([]);
      localStorage.removeItem(STORAGE_KEY_CLIENTS);
      localStorage.removeItem(STORAGE_KEY_CHECKOUTS);
      audioSynth.playTimesUpBuzzer();
    }
  };

  // Formats d'affichage
  const formatTimer = (sec: number) => {
    const isNegative = sec < 0;
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${isNegative ? '+' : ''}${pad(h)}:${pad(remM)}:${pad(s)}`;
    }
    return `${isNegative ? '+' : ''}${pad(m)}:${pad(s)}`;
  };

  const formatClock = (timestamp: number) => {
    const d = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = clients.length;
  const expiredCount = clients.filter(c => getRemainingSeconds(c) <= 0).length;
  const warningCount = clients.filter(c => {
    const r = getRemainingSeconds(c);
    return r > 0 && r <= 600;
  }).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans p-3 sm:p-6 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-5">
        
        {/* HEADER BAR */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-black shadow-lg shadow-cyan-500/20">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Chronomètre Clients
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/40">
                  1 Heure
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Contrôle du temps passé • Sauvegardé automatiquement (reste exact après actualisation)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton Réinitialiser Tout */}
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Effacer tous les clients et remettre à zéro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundMuted;
                setSoundMuted(next);
                audioSynth.setMuted(next);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              {soundMuted ? 'Son coupé' : 'Son activé'}
            </button>

            {/* History Toggle */}
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showHistory 
                  ? 'bg-zinc-800 border-zinc-600 text-white' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Sorties ({checkouts.length})
            </button>
          </div>
        </header>

        {/* ➕ AJOUTER UN CLIENT & DÉMARRER 1 HEURE */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <form onSubmit={handleAddClient} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            
            {/* Input Nom */}
            <div className="flex-1 relative">
              <input
                id="add-client-name"
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Entrez le nom du client (ex: Lucas, Famille Dupont, Alex...)"
                required
                autoFocus
                className="w-full bg-zinc-950 border-2 border-zinc-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-base font-semibold text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Durée Preset (1h par défaut) */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setDurationMinutes(30)}
                className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  durationMinutes === 30 ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                30 min
              </button>
              <button
                type="button"
                onClick={() => setDurationMinutes(60)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  durationMinutes === 60 ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1 Heure (60 min)
              </button>
              <button
                type="button"
                onClick={() => setDurationMinutes(90)}
                className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  durationMinutes === 90 ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1h30
              </button>
            </div>

            {/* Bouton Démarrer */}
            <button
              id="submit-add-client-btn"
              type="submit"
              disabled={!nameInput.trim()}
              className={`py-3 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
                nameInput.trim()
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/25 active:scale-98'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <Play className="w-4 h-4 fill-black" />
              DÉMARRER {durationMinutes} MIN
            </button>

          </form>
        </section>

        {/* 📊 BARRE D'ÉTAT & RECHERCHE */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Compteurs */}
          <div className="flex items-center gap-3">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              {activeCount} client{activeCount > 1 ? 's' : ''} à l'intérieur
            </span>

            {warningCount > 0 && (
              <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                {warningCount} proche fin (&lt; 10m)
              </span>
            )}

            {expiredCount > 0 && (
              <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/50 px-2.5 py-1 rounded-lg border border-red-500/50 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {expiredCount} temps dépassé
              </span>
            )}
          </div>

          {/* Recherche */}
          {clients.length > 3 && (
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrer par nom..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* 📋 LISTE DES CLIENTS ACTIFS */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredClients.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <Clock className="w-12 h-12 text-zinc-700 mb-3" />
              <p className="text-base font-semibold text-zinc-400">Aucun client en cours</p>
              <p className="text-xs text-zinc-500 mt-1">
                Notez un nom ci-dessus et cliquez sur « Démarrer » pour lancer le compte à rebours de 1h.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              
              {/* Entête de liste */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-950/60 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                <div className="col-span-4">Nom du Client</div>
                <div className="col-span-2">Heure d'entrée</div>
                <div className="col-span-3 text-center">Temps Restant (sur {filteredClients[0]?.durationMinutes || 60}m)</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Lignes clients */}
              {filteredClients.map(client => {
                const remainingSeconds = getRemainingSeconds(client);
                const isExpired = remainingSeconds <= 0;
                const isWarning = remainingSeconds > 0 && remainingSeconds <= 600;
                const exitTime = client.targetEndTime;

                return (
                  <div
                    key={client.id}
                    id={`client-row-${client.id}`}
                    className={`p-4 transition-colors flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center ${
                      isExpired
                        ? 'bg-red-950/30 hover:bg-red-950/40 border-l-4 border-red-500'
                        : isWarning
                        ? 'bg-amber-950/20 hover:bg-amber-950/30 border-l-4 border-amber-500'
                        : client.isPaused
                        ? 'bg-zinc-900/40 hover:bg-zinc-900/60 opacity-80'
                        : 'hover:bg-zinc-800/40 border-l-4 border-cyan-500'
                    }`}
                  >
                    
                    {/* Nom & Statut */}
                    <div className="sm:col-span-4 flex items-center gap-2.5 w-full">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        isExpired
                          ? 'bg-red-500 animate-ping'
                          : isWarning
                          ? 'bg-amber-400'
                          : client.isPaused
                          ? 'bg-zinc-600'
                          : 'bg-emerald-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-bold text-white truncate">
                          {client.name}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                          <span>Fin prévue : <strong>{formatClock(exitTime)}</strong></span>
                          {client.isPaused && (
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                              EN PAUSE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Heure d'entrée */}
                    <div className="sm:col-span-2 text-xs font-mono text-zinc-300">
                      <span className="sm:hidden text-zinc-500 mr-2">Entrée :</span>
                      {formatClock(client.entryTimestamp)}
                    </div>

                    {/* Compte à rebours principal */}
                    <div className="sm:col-span-3 sm:text-center w-full">
                      <div
                        className={`font-mono font-black text-2xl sm:text-3xl tracking-tight inline-flex items-center gap-2 ${
                          isExpired
                            ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                            : isWarning
                            ? 'text-amber-300'
                            : 'text-cyan-300'
                        }`}
                      >
                        {formatTimer(remainingSeconds)}
                        {isExpired && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500 text-white animate-pulse">
                            DÉPASSÉ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Boutons d'actions rapides */}
                    <div className="sm:col-span-3 flex items-center justify-end gap-1.5 w-full pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                      
                      {/* -5 min / -10 min / -15 min */}
                      <button
                        type="button"
                        onClick={() => handleSubtractMinutes(client.id, 5)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-950/50 border border-zinc-700/60 hover:border-amber-500/40 text-xs font-bold text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Retirer 5 minutes"
                      >
                        -5m
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubtractMinutes(client.id, 10)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-950/50 border border-zinc-700/60 hover:border-amber-500/40 text-xs font-bold text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Retirer 10 minutes"
                      >
                        -10m
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubtractMinutes(client.id, 15)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-950/50 border border-zinc-700/60 hover:border-amber-500/40 text-xs font-bold text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Retirer 15 minutes"
                      >
                        -15m
                      </button>

                      {/* Pause / Reprendre */}
                      <button
                        type="button"
                        onClick={() => handleTogglePause(client.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          client.isPaused
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}
                        title={client.isPaused ? 'Reprendre le chrono' : 'Mettre en pause'}
                      >
                        {client.isPaused ? <Play className="w-3.5 h-3.5 fill-black" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>

                      {/* Sortie validée */}
                      <button
                        type="button"
                        onClick={() => handleCheckout(client)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Valider la sortie du client"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Sortie
                      </button>

                      {/* Supprimer */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Supprimer ${client.name} de la liste ?`)) {
                            handleDelete(client.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}
        </section>

        {/* 📜 HISTORIQUE DES SORTIES */}
        {showHistory && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Historique des sorties validées aujourd'hui ({checkouts.length})
              </h2>
              {checkouts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Effacer l’historique des sorties du jour ?')) {
                      setCheckouts([]);
                    }
                  }}
                  className="text-xs text-zinc-500 hover:text-red-400 cursor-pointer"
                >
                  Effacer tout
                </button>
              )}
            </div>

            {checkouts.length === 0 ? (
              <p className="text-xs text-zinc-500">Aucune sortie enregistrée pour l'instant.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                      <th className="pb-2">Nom du Client</th>
                      <th className="pb-2">Entrée</th>
                      <th className="pb-2">Sortie</th>
                      <th className="pb-2">Temps total passé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {checkouts.map(item => (
                      <tr key={item.id} className="text-zinc-300">
                        <td className="py-2 font-bold text-white">{item.name}</td>
                        <td className="py-2 font-mono text-zinc-400">{item.entryTime}</td>
                        <td className="py-2 font-mono text-zinc-400">{item.exitTime}</td>
                        <td className="py-2 font-mono text-cyan-300">{item.totalDurationMinutes} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
