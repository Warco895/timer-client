import React, { useState } from 'react';
import { Booking, GameModeId } from '../types';
import { GAME_MODES } from '../data/gameModes';
import { Calendar, Plus, Play, CheckCircle2, User, Clock, Phone, Users, Sparkles, Trash2 } from 'lucide-react';

interface BookingQueueViewProps {
  bookings: Booking[];
  onAddBooking: (booking: Omit<Booking, 'id'>) => void;
  onDeleteBooking: (id: string) => void;
  onLaunchBookingInArena: (booking: Booking) => void;
}

export const BookingQueueView: React.FC<BookingQueueViewProps> = ({
  bookings,
  onAddBooking,
  onDeleteBooking,
  onLaunchBookingInArena,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [playersCount, setPlayersCount] = useState(4);
  const [arenaId, setArenaId] = useState('arena-1');
  const [scheduledTime, setScheduledTime] = useState('15:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [gameMode, setGameMode] = useState<GameModeId>('floor_is_lava');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    onAddBooking({
      clientName: clientName.trim(),
      phone: phone.trim() || undefined,
      playersCount,
      arenaId,
      scheduledTime,
      durationMinutes,
      gameMode,
      notes: notes.trim() || undefined,
      status: 'confirmed',
    });

    setClientName('');
    setPhone('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div id="booking-queue-view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Planning & File d'Attente Clients</h2>
            <p className="text-xs text-zinc-400 font-condensed">Gérez les créneaux, arrivées clients et lancement direct en arène</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Réservation
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-cyan-500/40 shadow-2xl space-y-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Enregistrer une nouvelle session client
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-tech text-zinc-400 block mb-1">Nom du client / Groupe</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="ex: Famille Martin"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-tech text-zinc-400 block mb-1">Téléphone (facultatif)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="06 XX XX XX XX"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-tech text-zinc-400 block mb-1">Nombre de joueurs</label>
              <input
                type="number"
                min="1"
                max="20"
                value={playersCount}
                onChange={e => setPlayersCount(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-tech text-zinc-400 block mb-1">Arène attribuée</label>
              <select
                value={arenaId}
                onChange={e => setArenaId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              >
                <option value="arena-1">Salle Matrix Alpha (Sol Interactif)</option>
                <option value="arena-2">Salle Pixel Beta (Sol & Mur)</option>
                <option value="arena-3">Salle Lava Gamma (Arène Sensorielle)</option>
                <option value="arena-4">Salle Boss Arena Delta (Matrix)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-tech text-zinc-400 block mb-1">Heure prévue</label>
              <input
                type="text"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                placeholder="ex: 15:30"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-tech text-zinc-400 block mb-1">Durée de session</label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              >
                <option value={15}>15 Minutes (Découverte)</option>
                <option value={30}>30 Minutes (Standard)</option>
                <option value={45}>45 Minutes (Intense)</option>
                <option value={60}>60 Minutes (Tournoi / Anniv)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-tech text-zinc-400 block mb-1">Mode de Jeu Initial</label>
              <select
                value={gameMode}
                onChange={e => setGameMode(e.target.value as GameModeId)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              >
                {GAME_MODES.map(gm => (
                  <option key={gm.id} value={gm.id}>
                    {gm.name} ({gm.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-tech text-zinc-400 block mb-1">Notes / Particularités</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="ex: Anniversaire 10 ans"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-condensed focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-tech hover:bg-zinc-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs shadow-md shadow-cyan-500/20"
              >
                Confirmer la réservation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map(item => {
          const gm = GAME_MODES.find(m => m.id === item.gameMode) || GAME_MODES[0];
          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg text-yellow-400">{item.scheduledTime}</span>
                    <h3 className="font-display font-bold text-base text-white">{item.clientName}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-condensed mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {item.playersCount} Joueurs
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-400" />
                      {item.durationMinutes} min
                    </span>
                    {item.phone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          {item.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-[10px] font-tech uppercase font-bold ${
                  item.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  item.status === 'arrived' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs font-condensed text-zinc-300 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500">Jeu :</span> <strong className="text-cyan-400">{gm.name}</strong>
                  {item.notes && <p className="text-[11px] text-zinc-400 mt-0.5 italic">"{item.notes}"</p>}
                </div>
                <div className="text-right text-[11px] font-tech text-zinc-400">
                  {item.arenaId === 'arena-1' && 'Salle Alpha'}
                  {item.arenaId === 'arena-2' && 'Salle Beta'}
                  {item.arenaId === 'arena-3' && 'Salle Gamma'}
                  {item.arenaId === 'arena-4' && 'Salle Delta'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => onDeleteBooking(item.id)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  title="Supprimer la réservation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onLaunchBookingInArena(item)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-tech font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Charger & Lancer en Salle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
