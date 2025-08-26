export type Role = "Spy" | "Guest" | "Assassin" | "Watcher";

export interface Player {
  id: string;
  name: string;
  fakeName: string;
  role?: Role;
  target?: string;
  isHost: boolean;
  isAlive: boolean;
  isRevealed: boolean;
  connection?: any; // PeerJS connection
}

export interface GameState {
  phase:
    | "lobby"
    | "role-assignment"
    | "round"
    | "action"
    | "voting"
    | "results"
    | "game-over";
  round: number;
  timeRemaining: number;
  players: Player[];
  votes: Record<string, string>; // playerId -> targetId
  skippedRound?: Record<string, boolean>; // playerId -> has skipped
  actions?: Record<
    string,
    { type: "watch" | "assassinate" | "extract"; targetId?: string }
  >; // playerId -> action
  actionResults?: Array<{
    actorName: string;
    actorFakeName: string;
    action: string;
    targetName?: string;
    targetFakeName?: string;
    result: string;
  }>;
  revealedPlayer?: string;
  winner?: string;
  roomId: string;
}

export interface Echo {
  id: string;
  content: string;
  type: "RoleHint" | "EventTease" | "AlibiFrame";
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
  votingDuration: number;
  actionDuration: number;
  maxMessageLength: number;
  resultsDuration: number;
  roleAssignmentDuration: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  minPlayers: 4,
  maxPlayers: 14,
  roundDuration: 240,
  votingDuration: 60,
  actionDuration: 30,
  maxPrivateMessagesPerRound: 20,
  maxMessageLength: 140,
  resultsDuration: 30,
  roleAssignmentDuration: 10,
};

export const ROLE_DESCRIPTIONS = {
  Spy: "Infiltrate and dominate. Work with other spies to steal information.",
  Guest:
    "Stay vigilant. Identify and vote out the spies and assassins to survive.",
  Assassin: "One target, one chance. Eliminate your assigned target to win.",
  Watcher: "Observe and expose. Find and eliminate a spy or assassin to win.",
} as const;

export const WIN_CONDITIONS = {
  Spy: "Successfully reveal the target, you only have 1 chance",
  Guest: "All spies and assassins are eliminated",
  Assassin: "Successfully eliminate your assigned target",
  Watcher: "Successfully eliminate all the spies and assassins",
} as const;
