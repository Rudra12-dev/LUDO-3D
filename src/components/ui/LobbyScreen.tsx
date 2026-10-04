import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Bot,
  User,
  Volume2,
  VolumeX,
  Music,
  Clock,
  Sparkles,
  Play,
  Settings,
  BookOpen,
  Languages,
  LogOut,
  Trophy,
  Shield,
  Layers,
} from 'lucide-react';
import {
  GameMode,
  PlayerColor,
  PlayerSeat,
  GameSettings,
  UserProfile,
  Language,
  BoardTheme,
  DiceStyle,
  BotDifficulty,
} from '../../types/game';
import { TRANSLATIONS } from '../../i18n/translations';
import { soundManager } from '../../audio/soundManager';

interface LobbyScreenProps {
  userProfile: UserProfile;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onStartGame: (seats: PlayerSeat[]) => void;
  onOpenRules: () => void;
  onLogout: () => void;
  onToggleLanguage: () => void;
}

const DEFAULT_SEATS: PlayerSeat[] = [
  {
    id: 'p0',
    name: 'Player 1',
    color: 'blue',
    isBot: false,
    botDifficulty: 'medium',
    avatar: '👑',
    team: 'A',
    isActive: true,
  },
  {
    id: 'p1',
    name: 'Player 2',
    color: 'red',
    isBot: true,
    botDifficulty: 'medium',
    avatar: '🦁',
    team: 'B',
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Player 3',
    color: 'green',
    isBot: true,
    botDifficulty: 'hard',
    avatar: '💎',
    team: 'A',
    isActive: true,
  },
  {
    id: 'p3',
    name: 'Player 4',
    color: 'yellow',
    isBot: true,
    botDifficulty: 'easy',
    avatar: '🦅',
    team: 'B',
    isActive: true,
  },
];

const COLOR_THEMES: Record<
  PlayerColor,
  {
    bg: string;
    border: string;
    text: string;
    accent: string;
    label: string;
  }
> = {
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    text: 'text-red-400',
    accent: '#ef4444',
    label: 'Ruby Red',
  },
  green: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    accent: '#10b981',
    label: 'Emerald Green',
  },
  yellow: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    accent: '#f59e0b',
    label: 'Amber Yellow',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    accent: '#3b82f6',
    label: 'Sapphire Blue',
  },
};

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  userProfile,
  settings,
  onUpdateSettings,
  onStartGame,
  onOpenRules,
  onLogout,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[settings.language];
  const [seats, setSeats] = useState<PlayerSeat[]>(() => {
    // Fill first seat with user profile
    const initial = [...DEFAULT_SEATS];
    initial[0] = {
      ...initial[0],
      name: userProfile.username,
      avatar: userProfile.avatar,
      isBot: false,
    };
    return initial;
  });

  const [activeTab, setActiveTab] = useState<'seats' | 'settings'>('seats');

  // Handle Mode changes
  const handleSelectMode = (mode: GameMode) => {
    soundManager.playClick();
    const updated = { ...settings, mode };

    if (mode === 'ai') {
      // 1 Human, rest Bots
      setSeats((prev) =>
        prev.map((s, idx) => ({
          ...s,
          isBot: idx !== 0,
        }))
      );
    } else if (mode === 'pass_and_play') {
      // All Humans
      setSeats((prev) =>
        prev.map((s) => ({
          ...s,
          isBot: false,
        }))
      );
    } else if (mode === 'team') {
      updated.playerCount = 4;
      setSeats((prev) =>
        prev.map((s, idx) => ({
          ...s,
          isActive: true,
          team: idx === 0 || idx === 2 ? 'A' : 'B',
        }))
      );
    }

    onUpdateSettings(updated);
  };

  const handlePlayerCount = (count: 2 | 3 | 4) => {
    soundManager.playClick();
    onUpdateSettings({ ...settings, playerCount: count });
    setSeats((prev) =>
      prev.map((s, idx) => ({
        ...s,
        isActive: idx < count,
      }))
    );
  };

  const handleUpdateSeat = (idx: number, updates: Partial<PlayerSeat>) => {
    setSeats((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updates };
      return copy;
    });
  };

  const handleStart = () => {
    soundManager.playClick();
    const activeSeats = seats.filter((s, idx) => idx < settings.playerCount);
    onStartGame(activeSeats);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col pointer-events-none p-3 sm:p-6 overflow-y-auto">
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between pb-3 pointer-events-auto border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            {userProfile.avatar}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{userProfile.username}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                LVL {Math.max(1, Math.floor(userProfile.stats.gamesWon / 2) + 1)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>
                {t.gamesWon}:{' '}
                <strong className="text-amber-400 font-mono">
                  {userProfile.stats.gamesWon}
                </strong>
              </span>
              <span>·</span>
              <span>
                {t.captures}:{' '}
                <strong className="text-amber-400 font-mono">
                  {userProfile.stats.totalCaptures}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Nav Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenRules();
            }}
            title={t.rules}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleLanguage();
            }}
            title="Toggle Language"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {settings.language === 'en' ? 'हिन्दी' : 'EN'}
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onLogout();
            }}
            title={t.quit}
            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Lobby Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto py-4 pointer-events-auto flex flex-col justify-between">
        {/* Game Mode Selector Cards */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
            Select Battle Mode
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              {
                id: 'classic' as GameMode,
                title: t.classicMode,
                desc: t.classicDesc,
                icon: Trophy,
              },
              {
                id: 'team' as GameMode,
                title: t.teamMode,
                desc: t.teamDesc,
                icon: Shield,
              },
              {
                id: 'ai' as GameMode,
                title: t.aiMode,
                desc: t.aiDesc,
                icon: Bot,
              },
              {
                id: 'pass_and_play' as GameMode,
                title: t.passAndPlay,
                desc: t.passDesc,
                icon: Users,
              },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = settings.mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMode(m.id)}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                      : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">
                      {m.title}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {m.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Player Count & Tab Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Player Count Buttons (Only for non-team mode) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">{t.playerCount}:</span>
            <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  disabled={settings.mode === 'team'}
                  onClick={() => handlePlayerCount(count as 2 | 3 | 4)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    settings.playerCount === count
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white disabled:opacity-40'
                  }`}
                >
                  {count}P
                </button>
              ))}
            </div>
          </div>

          {/* Sub Navigation (Seats vs Settings) */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('seats');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'seats'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Seats & Bots</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('settings');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Match Settings</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Seats & Player Configuration */}
        {activeTab === 'seats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {seats.slice(0, settings.playerCount).map((seat, sIdx) => {
              const theme = COLOR_THEMES[seat.color];
              return (
                <div
                  key={seat.id}
                  className={`glass-panel rounded-xl p-3.5 border ${theme.border} relative overflow-hidden transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}
                    >
                      Seat {sIdx + 1} ({theme.label})
                    </span>
                    {settings.mode === 'team' && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          seat.team === 'A'
                            ? 'bg-amber-500/30 text-amber-300'
                            : 'bg-cyan-500/30 text-cyan-300'
                        }`}
                      >
                        Team {seat.team}
                      </span>
                    )}
                  </div>

                  {/* Seat Name & Avatar */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-700 flex items-center justify-center shrink-0">
                      {seat.avatar}
                    </span>
                    <input
                      type="text"
                      value={seat.name}
                      onChange={(e) =>
                        handleUpdateSeat(sIdx, { name: e.target.value })
                      }
                      maxLength={14}
                      className="w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Human vs Bot Toggle */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Player Type:</span>
                      <div className="flex items-center bg-slate-900/80 p-0.5 rounded-md border border-slate-800">
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            handleUpdateSeat(sIdx, { isBot: false });
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            !seat.isBot
                              ? 'bg-amber-500/30 text-amber-300'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.human}
                        </button>
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            handleUpdateSeat(sIdx, { isBot: true });
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            seat.isBot
                              ? 'bg-amber-500/30 text-amber-300'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.bot}
                        </button>
                      </div>
                    </div>

                    {/* Bot Difficulty if bot */}
                    {seat.isBot && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400">Difficulty:</span>
                        <select
                          value={seat.botDifficulty}
                          onChange={(e) => {
                            soundManager.playClick();
                            handleUpdateSeat(sIdx, {
                              botDifficulty: e.target.value as BotDifficulty,
                            });
                          }}
                          className="bg-slate-900 text-xs text-amber-300 border border-slate-700 rounded px-2 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="easy">{t.easy}</option>
                          <option value="medium">{t.medium}</option>
                          <option value="hard">{t.hard}</option>
                        </select>
                      </div>
                    )}

                    {/* Team assignment switcher for Team Mode */}
                    {settings.mode === 'team' && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400">Team:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              handleUpdateSeat(sIdx, { team: 'A' });
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                              seat.team === 'A'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Team A
                          </button>
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              handleUpdateSeat(sIdx, { team: 'B' });
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                              seat.team === 'B'
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Team B
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Match Settings */}
        {activeTab === 'settings' && (
          <div className="glass-panel rounded-2xl p-4 sm:p-6 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Board Theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t.boardTheme}
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'royal_cosmos' as BoardTheme, name: 'Royal Cosmos' },
                  { id: 'neon_cyber' as BoardTheme, name: 'Neon Cyber' },
                  { id: 'ivory_palace' as BoardTheme, name: 'Ivory Palace' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      soundManager.playClick();
                      onUpdateSettings({ ...settings, boardTheme: th.id });
                    }}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer ${
                      settings.boardTheme === th.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dice Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t.diceStyle}
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'crystal' as DiceStyle, name: 'Crystal Prism' },
                  { id: 'gold_ingot' as DiceStyle, name: 'Gold Bullion' },
                  { id: 'neon_prism' as DiceStyle, name: 'Neon Obsidian' },
                ].map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      soundManager.playClick();
                      onUpdateSettings({ ...settings, diceStyle: ds.id });
                    }}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer ${
                      settings.diceStyle === ds.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {ds.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio & Timers */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.turnTimer}
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 15, 30].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        soundManager.playClick();
                        onUpdateSettings({
                          ...settings,
                          turnTimerSeconds: sec,
                        });
                      }}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                        settings.turnTimerSeconds === sec
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec === 0 ? t.off : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-300">{t.sound}</span>
                <button
                  onClick={() => {
                    soundManager.setSoundEnabled(!settings.soundEnabled);
                    onUpdateSettings({
                      ...settings,
                      soundEnabled: !settings.soundEnabled,
                    });
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    settings.soundEnabled
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">{t.music}</span>
                <button
                  onClick={() => {
                    soundManager.setMusicEnabled(!settings.musicEnabled);
                    onUpdateSettings({
                      ...settings,
                      musicEnabled: !settings.musicEnabled,
                    });
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    settings.musicEnabled
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <Music className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Big Start Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-display font-black text-base sm:text-lg tracking-widest uppercase shadow-[0_6px_30px_rgba(16,185,129,0.55)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.8)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{settings.language === 'hi' ? '⚡ खेल शुरू करें (PLAY NOW)' : '⚡ PLAY NOW (START GAME)'}</span>
            <Play className="w-5 h-5 fill-current" />
          </button>
        </div>
      </main>
    </div>
  );
};
