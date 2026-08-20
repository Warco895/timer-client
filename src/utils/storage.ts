import { ArenaSession, Booking, SessionHistoryItem, ClientEntry, ClientCheckoutHistory } from '../types';

export const INITIAL_CLIENTS: ClientEntry[] = [
  {
    id: 'client-1',
    clientName: 'Lucas & Thomas',
    braceletNumber: '#01',
    playersCount: 2,
    assignedArena: 'Sol Interactif A',
    entryTimestamp: Date.now() - (15 * 60 * 1000), // entered 15 min ago
    totalDurationMinutes: 60,
    totalDurationSeconds: 3600,
    remainingSeconds: 2700, // 45 min left
    status: 'active',
    alert10MinFired: false,
    alert5MinFired: false,
    alertExpiredFired: false,
  },
  {
    id: 'client-2',
    clientName: 'Famille Dupont',
    braceletNumber: '#04',
    playersCount: 4,
    assignedArena: 'Sol Interactif B',
    entryTimestamp: Date.now() - (53 * 60 * 1000), // entered 53 min ago
    totalDurationMinutes: 60,
    totalDurationSeconds: 3600,
    remainingSeconds: 420, // 7 min left (warning state!)
    status: 'active',
    alert10MinFired: true,
    alert5MinFired: false,
    alertExpiredFired: false,
  },
  {
    id: 'client-3',
    clientName: 'Groupe Sarah (Anniv)',
    braceletNumber: '#12',
    playersCount: 6,
    assignedArena: 'Grande Arène',
    entryTimestamp: Date.now() - (64 * 60 * 1000), // entered 64 min ago
    totalDurationMinutes: 60,
    totalDurationSeconds: 3600,
    remainingSeconds: -240, // 4 min OVERTIME!
    status: 'expired',
    alert10MinFired: true,
    alert5MinFired: true,
    alertExpiredFired: true,
  },
];

export const INITIAL_CHECKOUTS: ClientCheckoutHistory[] = [
  {
    id: 'chk-1',
    clientName: 'Maxime & Julie',
    braceletNumber: '#07',
    playersCount: 2,
    assignedArena: 'Sol Interactif A',
    entryTime: '13:00',
    exitTime: '14:02',
    purchasedMinutes: 60,
    actualDurationMinutes: 62,
    overtimeMinutes: 2,
    completedAt: Date.now() - (3600 * 1000 * 2),
  },
  {
    id: 'chk-2',
    clientName: 'Benoit V.',
    braceletNumber: '#15',
    playersCount: 1,
    assignedArena: 'Arcade VR',
    entryTime: '11:30',
    exitTime: '12:30',
    purchasedMinutes: 60,
    actualDurationMinutes: 60,
    overtimeMinutes: 0,
    completedAt: Date.now() - (3600 * 1000 * 4),
  }
];

export const INITIAL_ARENAS: ArenaSession[] = [
  {
    id: 'arena-1',
    arenaId: 'arena-1',
    arenaName: 'Salle Matrix Alpha',
    roomType: 'sol_interactif',
    status: 'idle',
    totalDurationSeconds: 1800, // 30 mins
    remainingSeconds: 1800,
    currentRound: 1,
    totalRounds: 5,
    roundRemainingSeconds: 120,
    roundTotalSeconds: 120,
    gameMode: 'floor_is_lava',
    clientName: 'Groupe Les Pixel Warriors',
    isMatchVs: true,
    teams: [
      {
        id: 'team-cyan',
        name: 'Équipe Cyan',
        color: '#06b6d4',
        score: 1450,
        lives: 3,
        maxLives: 3,
        combo: 2,
      },
      {
        id: 'team-pink',
        name: 'Équipe Magenta',
        color: '#ec4899',
        score: 1620,
        lives: 2,
        maxLives: 3,
        combo: 3,
      },
    ],
    soundEnabled: true,
    voiceAnnouncements: true,
    lastUpdated: Date.now(),
  },
  {
    id: 'arena-2',
    arenaId: 'arena-2',
    arenaName: 'Salle Pixel Beta',
    roomType: 'sol_interactif',
    status: 'running',
    totalDurationSeconds: 2700, // 45 mins
    remainingSeconds: 1420,
    currentRound: 3,
    totalRounds: 6,
    roundRemainingSeconds: 65,
    roundTotalSeconds: 90,
    gameMode: 'pixel_rush',
    clientName: 'Anniversaire Lucas (8 pers.)',
    isMatchVs: false,
    teams: [
      {
        id: 'team-gold',
        name: 'Team Lucas & Friends',
        color: '#eab308',
        score: 4890,
        lives: 3,
        maxLives: 3,
        combo: 5,
      },
    ],
    soundEnabled: true,
    voiceAnnouncements: true,
    lastUpdated: Date.now(),
  },
  {
    id: 'arena-3',
    arenaId: 'arena-3',
    arenaName: 'Salle Lava Gamma',
    roomType: 'sol_interactif',
    status: 'paused',
    totalDurationSeconds: 1800,
    remainingSeconds: 620,
    currentRound: 4,
    totalRounds: 4,
    roundRemainingSeconds: 40,
    roundTotalSeconds: 120,
    gameMode: 'color_blast',
    clientName: 'Team Building TechCorp',
    isMatchVs: true,
    teams: [
      {
        id: 'team-red',
        name: 'Devs Cyber',
        color: '#ef4444',
        score: 3200,
        lives: 1,
        maxLives: 3,
        combo: 1,
      },
      {
        id: 'team-green',
        name: 'Design Matrix',
        color: '#22c55e',
        score: 3450,
        lives: 3,
        maxLives: 3,
        combo: 4,
      },
    ],
    soundEnabled: true,
    voiceAnnouncements: true,
    lastUpdated: Date.now(),
  },
  {
    id: 'arena-4',
    arenaId: 'arena-4',
    arenaName: 'Salle Boss Arena Delta',
    roomType: 'matrix_arena',
    status: 'idle',
    totalDurationSeconds: 3600, // 60 mins
    remainingSeconds: 3600,
    currentRound: 1,
    totalRounds: 8,
    roundRemainingSeconds: 180,
    roundTotalSeconds: 180,
    gameMode: 'boss_battle',
    clientName: 'Réservation Libre',
    isMatchVs: false,
    teams: [
      {
        id: 'team-solo',
        name: 'Escouade Pixel',
        color: '#a855f7',
        score: 0,
        lives: 3,
        maxLives: 3,
        combo: 1,
      },
    ],
    soundEnabled: true,
    voiceAnnouncements: false,
    lastUpdated: Date.now(),
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    clientName: 'Famille Moreau',
    phone: '06 12 34 56 78',
    playersCount: 5,
    arenaId: 'arena-1',
    scheduledTime: '14:30',
    durationMinutes: 30,
    gameMode: 'floor_is_lava',
    notes: '2 enfants + 3 adultes - Découverte Pixel Arena',
    status: 'confirmed',
  },
  {
    id: 'b-2',
    clientName: 'Anniversaire Lucas',
    phone: '06 98 76 54 32',
    playersCount: 8,
    arenaId: 'arena-2',
    scheduledTime: '15:15',
    durationMinutes: 45,
    gameMode: 'pixel_rush',
    notes: 'Goûter anniversaire prévu ensuite',
    status: 'in_progress',
  },
  {
    id: 'b-3',
    clientName: 'Team Building Capgemini',
    phone: '07 55 44 33 22',
    playersCount: 12,
    arenaId: 'arena-3',
    scheduledTime: '16:30',
    durationMinutes: 60,
    gameMode: 'color_blast',
    notes: 'Tournoi inter-équipes avec classement final',
    status: 'arrived',
  },
  {
    id: 'b-4',
    clientName: 'BDE Université Gaming',
    phone: '06 44 22 11 00',
    playersCount: 6,
    arenaId: 'arena-4',
    scheduledTime: '18:00',
    durationMinutes: 45,
    gameMode: 'boss_battle',
    notes: 'Défi hardcore mode Boss',
    status: 'confirmed',
  },
];

export const INITIAL_HISTORY: SessionHistoryItem[] = [
  {
    id: 'h-1',
    arenaName: 'Salle Matrix Alpha',
    clientName: 'Les Invincibles',
    gameMode: 'The Floor is Lava',
    playedAt: 'Aujourd\'hui 11:30',
    durationMinutes: 30,
    totalScore: 5820,
    teamsResult: [
      { name: 'Équipe Cyan', score: 3120, rank: 1 },
      { name: 'Équipe Magenta', score: 2700, rank: 2 },
    ],
    highScoreBeaten: true,
  },
  {
    id: 'h-2',
    arenaName: 'Salle Pixel Beta',
    clientName: 'Team Cyber Ninja',
    gameMode: 'Pixel Rush Speed',
    playedAt: 'Aujourd\'hui 10:15',
    durationMinutes: 45,
    totalScore: 7450,
    teamsResult: [
      { name: 'Ninja Squad', score: 7450, rank: 1 },
    ],
    highScoreBeaten: false,
  },
  {
    id: 'h-3',
    arenaName: 'Salle Lava Gamma',
    clientName: 'Famille Dubois',
    gameMode: 'Matrix Memory',
    playedAt: 'Hier 17:45',
    durationMinutes: 30,
    totalScore: 4200,
    teamsResult: [
      { name: 'Parents', score: 1900, rank: 2 },
      { name: 'Ados', score: 2300, rank: 1 },
    ],
    highScoreBeaten: false,
  },
];

const STORAGE_KEYS = {
  CLIENTS: 'pixel_arena_clients_active_v1',
  CHECKOUTS: 'pixel_arena_checkouts_history_v1',
  ARENAS: 'pixel_arena_sessions_v1',
  BOOKINGS: 'pixel_arena_bookings_v1',
  HISTORY: 'pixel_arena_history_v1',
  ACTIVE_ARENA_ID: 'pixel_arena_active_id_v1',
  THEME: 'pixel_arena_theme_v1',
};

export function loadClients(): ClientEntry[] {
  if (typeof window === 'undefined') return INITIAL_CLIENTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_CLIENTS;
}

export function saveClients(clients: ClientEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch {}
}

export function loadCheckouts(): ClientCheckoutHistory[] {
  if (typeof window === 'undefined') return INITIAL_CHECKOUTS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CHECKOUTS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_CHECKOUTS;
}

export function saveCheckouts(checkouts: ClientCheckoutHistory[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKOUTS, JSON.stringify(checkouts));
  } catch {}
}

export function loadArenas(): ArenaSession[] {
  if (typeof window === 'undefined') return INITIAL_ARENAS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ARENAS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_ARENAS;
}

export function saveArenas(arenas: ArenaSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ARENAS, JSON.stringify(arenas));
  } catch {}
}

export function loadBookings(): Booking[] {
  if (typeof window === 'undefined') return INITIAL_BOOKINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_BOOKINGS;
}

export function saveBookings(bookings: Booking[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch {}
}

export function loadHistory(): SessionHistoryItem[] {
  if (typeof window === 'undefined') return INITIAL_HISTORY;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return INITIAL_HISTORY;
}

export function saveHistory(history: SessionHistoryItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {}
}
