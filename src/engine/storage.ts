import { UserProfile, GameSettings, PlayerState, GamePhase } from '../types/game';

const PROFILE_KEY = 'royal_ludo_user_profile';
const SETTINGS_KEY = 'royal_ludo_settings';
const AUTOSAVE_KEY = 'royal_ludo_active_match';

export const DEFAULT_PROFILE: UserProfile = {
  username: 'CosmicRuler',
  avatar: '👑',
  isGuest: true,
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    totalCaptures: 0,
    tokensFinished: 0,
    highestStreak: 0,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'classic',
  playerCount: 4,
  boardTheme: 'royal_cosmos',
  diceStyle: 'crystal',
  soundEnabled: false,
  musicEnabled: false,
  turnTimerSeconds: 15,
  allowStacking: false,
  lowPowerMode: false,
  language: 'en',
};

export interface SavedMatchState {
  players: PlayerState[];
  activePlayerIndex: number;
  phase: GamePhase;
  currentDiceRoll: number | null;
  settings: GameSettings;
  timestamp: number;
}

export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    }
  } catch {}
  return DEFAULT_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function loadGameSettings(): GameSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure ambient music/drone is disabled
      return { ...DEFAULT_SETTINGS, ...parsed, musicEnabled: false };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function saveActiveMatch(state: SavedMatchState | null): void {
  try {
    if (!state) {
      localStorage.removeItem(AUTOSAVE_KEY);
    } else {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
    }
  } catch {}
}

export function loadActiveMatch(): SavedMatchState | null {
  try {
    const data = localStorage.getItem(AUTOSAVE_KEY);
    if (data) {
      const match = JSON.parse(data);
      // Valid if less than 24 hours old
      if (Date.now() - match.timestamp < 24 * 60 * 60 * 1000) {
        return match;
      }
    }
  } catch {}
  return null;
}

export function recordMatchStats(won: boolean, captures: number, finishedTokens: number) {
  const profile = loadUserProfile();
  profile.stats.gamesPlayed += 1;
  if (won) {
    profile.stats.gamesWon += 1;
  }
  profile.stats.totalCaptures += captures;
  profile.stats.tokensFinished += finishedTokens;
  saveUserProfile(profile);
}
