import React, { useState } from 'react';
import { SessionHistoryItem } from '../types';
import { Trophy, Award, Calendar, Share2, Sparkles, Download, Printer, Users } from 'lucide-react';

interface HistoryAndLeaderboardProps {
  history: SessionHistoryItem[];
  onAddSampleHistory?: () => void;
}

export const HistoryAndLeaderboardView: React.FC<HistoryAndLeaderboardProps> = ({
  history,
}) => {
  const [selectedSession, setSelectedSession] = useState<SessionHistoryItem | null>(history[0] || null);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div id="history-leaderboard-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Classements & Certificats de Session</h2>
            <p className="text-xs text-zinc-400 font-condensed">Historique des scores des clients et badges souvenirs à emporter</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: History List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Dernières Sessions Jouées
          </h3>

          <div className="space-y-3">
            {history.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedSession(item)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                  selectedSession?.id === item.id
                    ? 'bg-zinc-900 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-white">{item.clientName}</h4>
                    {item.highScoreBeaten && (
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-pixel text-[9px] animate-pulse">
                        🏆 RECORD !
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 font-condensed flex items-center gap-3 mt-1">
                    <span>{item.arenaName}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-semibold">{item.gameMode}</span>
                    <span>•</span>
                    <span>{item.playedAt}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-condensed text-zinc-400 uppercase">Score Total</div>
                  <div className="font-pixel text-xl text-yellow-400 font-bold glow-yellow">
                    {item.totalScore.toLocaleString()} PTS
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Printable Client Certificate / Summary Card (5 Cols) */}
        <div className="lg:col-span-5">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-pink-400" />
            Fiche Score & Diplôme Joueur
          </h3>

          {selectedSession ? (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-cyan-500/50 shadow-2xl relative overflow-hidden space-y-6 print:border-black print:text-black">
              {/* Retro Glow Header */}
              <div className="text-center border-b border-zinc-800 pb-4">
                <div className="font-pixel text-xs text-pink-400 tracking-widest uppercase mb-1">
                  ★ PIXEL ARENA CERTIFICATE ★
                </div>
                <h2 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400">
                  {selectedSession.clientName}
                </h2>
                <p className="text-xs font-condensed text-zinc-400 mt-1">
                  Défi : <strong className="text-white">{selectedSession.gameMode}</strong> ({selectedSession.arenaName})
                </p>
              </div>

              {/* Big Score Stamp */}
              <div className="text-center py-4 bg-zinc-950/80 rounded-2xl border border-zinc-800">
                <div className="text-xs font-tech text-zinc-400 uppercase tracking-widest">Score Réalisé</div>
                <div className="font-pixel text-3xl md:text-4xl text-yellow-400 glow-yellow font-black my-1">
                  {selectedSession.totalScore.toLocaleString()}
                </div>
                <div className="text-xs font-condensed text-emerald-400 font-bold">
                  {selectedSession.highScoreBeaten ? '★ Meilleur score de la semaine ! ★' : 'Performance validée par la régie'}
                </div>
              </div>

              {/* Teams breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-tech text-zinc-400">Détail des Équipes :</div>
                {selectedSession.teamsResult.map(t => (
                  <div key={t.name} className="flex justify-between items-center text-xs font-condensed p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="font-semibold text-white">Rang #{t.rank} • {t.name}</span>
                    <span className="font-pixel text-yellow-400 font-bold">{t.score} PTS</span>
                  </div>
                ))}
              </div>

              {/* Print Button */}
              <div className="pt-2 flex justify-center gap-3 print:hidden">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer / Exporter le Certificat
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-500 text-sm font-condensed">
              Sélectionnez une session dans la liste pour afficher la fiche
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
