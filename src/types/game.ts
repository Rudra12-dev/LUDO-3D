export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type GameMode = 'classic' | 'team' | 'ai' | 'pass_and_play';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type BoardTheme = 'royal_cosmos' | 'neon_cyber' | 'ivory_palace';

export type DiceStyle = 'crystal' | 'gold_ingot' | 'neon_prism';

export type Language = 'en' | 'hi';

export interface PlayerSeat {
  id: string;
  name: string;
  color: PlayerColor;
  isBot: boolean;
  botDifficulty: BotDifficulty;
  avatar: string;
  team?: 'A' | 'B'; // For 2v2 Team Mode
  isActive: boolean; // Is this seat playing in this match
}

export interface TokenState {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1 = In Yard, 0..50 = Common Track, 51..56 = Home Column, 57 = Home Finish
  isHome: boolean;
  inYard: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  isBot: boolean;
  botDifficulty: BotDifficulty;
  avatar: string;
  team?: 'A' | 'B';
  tokens: TokenState[];
  rank?: number; // 1st, 2nd, 3rd, 4th
  consecutiveSixes: number;
}

export interface GameSettings {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  boardTheme: BoardTheme;
  diceStyle: DiceStyle;
  soundEnabled: boolean;
  musicEnabled: boolean;
  turnTimerSeconds: number; // 0 = off, 15, 30
  allowStacking: boolean;
  lowPowerMode: boolean;
  language: Language;
}

export interface UserProfile {
  username: string;
  avatar: string;
  email?: string;
  isGuest: boolean;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalCaptures: number;
    tokensFinished: number;
    highestStreak: number;
  };
}

export type GamePhase =
  | 'WAITING_FOR_ROLL'
  | 'ROLLING_DICE'
  | 'WAITING_FOR_TOKEN_SELECT'
  | 'ANIMATING_MOVE'
  | 'GAME_OVER';

export interface MoveAction {
  playerIndex: number;
  tokenIndex: number;
  fromStep: number;
  toStep: number;
  roll: number;
  capturedColor?: PlayerColor;
  capturedTokenIndex?: number;
  reachedHome?: boolean;
}

export interface MoveValidation {
  tokenIndex: number;
  canMove: boolean;
  targetStep: number;
  reason?: string;
  isDeploy?: boolean;
  capturesOpponent?: {
    playerIndex: number;
    tokenIndex: number;
    color: PlayerColor;
  };
}

