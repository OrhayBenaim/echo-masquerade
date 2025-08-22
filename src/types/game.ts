export type Role = 'Spy' | 'Guest' | 'Assassin' | 'Watcher';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  isHost: boolean;
  isAlive: boolean;
  connection?: any; // PeerJS connection
}

export interface GameState {
  phase: 'lobby' | 'role-assignment' | 'round' | 'voting' | 'results' | 'game-over';
  round: number;
  timeRemaining: number;
  players: Player[];
  votes: Record<string, string>; // playerId -> targetId
  eliminatedPlayer?: string;
  winner?: string;
  roomId: string;
}

export interface Echo {
  id: string;
  content: string;
  type: 'RoleHint' | 'EventTease' | 'AlibiFrame';
  isTruth: boolean;
  round: number;
}

export interface PrivateMessage {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: number;
}

export interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  roundDuration: number;
  maxPrivateMessagesPerRound: number;
  maxMessageLength: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  minPlayers: 5,
  maxPlayers: 14,
  roundDuration: 240, // 4 minutes
  maxPrivateMessagesPerRound: 2,
  maxMessageLength: 140
};

export const ROLE_DESCRIPTIONS = {
  Spy: "Infiltrate and dominate. Work with other spies to eliminate guests.",
  Guest: "Stay vigilant. Identify and vote out the spies to survive.",
  Assassin: "One target, one chance. Eliminate your assigned target to win.",
  Watcher: "Observe and expose. Find and eliminate a spy or assassin to win."
} as const;

export const WIN_CONDITIONS = {
  Spy: "Spies equal or outnumber remaining players",
  Guest: "All spies and assassins are eliminated",
  Assassin: "Successfully eliminate your assigned target",
  Watcher: "Successfully eliminate a spy or assassin"
} as const;