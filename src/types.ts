export type GameModeId = 
  | 'floor_is_lava'
  | 'pixel_rush'
  | 'matrix_memory'
  | 'color_blast'
  | 'steal_the_light'
  | 'boss_battle'
  | 'free_play';

export interface ClientEntry {
  id: string;
  clientName: string;
  braceletNumber?: string;
  playersCount: number;
  assignedArena?: string; // e.g. "Salle 1", "Sol Interactif", "Toutes Salles"
  
  // Timing
  entryTimestamp: number; // Date.now() when started
  totalDurationMinutes: number; // e.g. 60 min (1 hour)
  totalDurationSeconds: number; // total in seconds (3600)
  remainingSeconds: number; // countdown remaining (can go negative for overtime)
  
  status: 'active' | 'paused' | 'expired' | 'completed';
  pausedAt?: number | null;
  notes?: string;
  
  // Alerts fired tracker
  alert10MinFired?: boolean;
  alert5MinFired?: boolean;
  alertExpiredFired?: boolean;
}

export interface ClientCheckoutHistory {
  id: string;
  clientName: string;
  braceletNumber?: string;
  playersCount: number;
  assignedArena?: string;
  entryTime: string;
  exitTime: string;
  purchasedMinutes: number;
  actualDurationMinutes: number;
  overtimeMinutes: number;
  completedAt: number;
}

export interface GameMode {
  id: GameModeId;
  name: string;
  category: string;
  description: string;
  icon: string;
  defaultRoundSeconds: number;
  recommendedPlayers: string;
  accentColor: string;
}

export type ArenaStatus = 'idle' | 'briefing' | 'running' | 'paused' | 'finished' | 'cleaning';

export interface Team {
  id: string;
  name: string;
  color: string; // hex or tailwind name
  score: number;
  lives: number; // 0 to 5
  maxLives: number;
  combo: number; // 1x, 2x, etc.
}

export interface BroadcastMessage {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: number;
  durationSeconds: number;
}

export interface ArenaSession {
  id: string;
  arenaId: string;
  arenaName: string;
  roomType: 'sol_interactif' | 'arcade_vr' | 'laser_pixel' | 'matrix_arena';
  status: ArenaStatus;
  
  // Timing (in seconds)
  totalDurationSeconds: number;
  remainingSeconds: number;
  currentRound: number;
  totalRounds: number;
  roundRemainingSeconds: number;
  roundTotalSeconds: number;
  
  // Game & Teams
  gameMode: GameModeId;
  clientName: string;
  teams: Team[];
  isMatchVs: boolean; // 2 teams competing or single co-op team
  
  // Messages & Broadcasts
  currentBroadcast?: BroadcastMessage | null;
  
  // Settings
  soundEnabled: boolean;
  voiceAnnouncements: boolean;
  lastUpdated: number;
}

export interface Booking {
  id: string;
  clientName: string;
  phone?: string;
  playersCount: number;
  arenaId: string;
  scheduledTime: string; // e.g. "14:30"
  durationMinutes: number;
  gameMode: GameModeId;
  notes?: string;
  status: 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
}

export interface SessionHistoryItem {
  id: string;
  arenaName: string;
  clientName: string;
  gameMode: string;
  playedAt: string;
  durationMinutes: number;
  totalScore: number;
  teamsResult: { name: string; score: number; rank: number }[];
  highScoreBeaten: boolean;
}

export type VisualTheme = 'cyberpunk' | 'retro_arcade' | 'matrix_green' | 'lava_flame' | 'clean_dark';
