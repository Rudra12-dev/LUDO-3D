import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Camera,
  Pause,
  Smile,
  Dices,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  PlayerState,
  PlayerColor,
  GamePhase,
  GameSettings,
} from '../../types/game';
import { TRANSLATIONS } from '../../i18n/translations';
import { soundManager } from '../../audio/soundManager';

interface GameHUDProps {
  players: PlayerState[];
  activePlayerIndex: number;
  phase: GamePhase;
  currentDiceRoll: number | null;
  onRollDice: () => void;
  canRollDice: boolean;
  isTopDownView: boolean;
  onToggleCamera: () => void;
  onOpenPause: () => void;
  onOpenRules: () => void;
  settings: GameSettings;
  onToggleSound: () => void;
  statusMessage: string | null;
  turnTimeRemaining: number;
}

const COLOR_THEMES: Record<
  PlayerColor,
  {
    border: string;
    bg: string;
    text: string;
    coinBg: string;
    name: string;
  }
> = {
  red: {
    border: 'border-[#dc2626]',
    bg: 'bg-[#dc2626]/20',
    text: 'text-red-400',
    coinBg: 'bg-[#dc2626]',
    name: 'Player 2',
  },
  green: {
    border: 'border-[#16a34a]',
    bg: 'bg-[#16a34a]/20',
    text: 'text-emerald-400',
    coinBg: 'bg-[#16a34a]',
    name: 'Player 3',
  },
  yellow: {
    border: 'border-[#eab308]',
    bg: 'bg-[#eab308]/20',
    text: 'text-amber-400',
    coinBg: 'bg-[#eab308]',
    name: 'Player 4',
  },
  blue: {
    border: 'border-[#0284c7]',
    bg: 'bg-[#0284c7]/20',
    text: 'text-sky-400',
    coinBg: 'bg-[#0284c7]',
    name: 'Player 1',
  },
};

const EMOJIS = ['👑', '🔥', '😂', '😭', '⚡', '❤️'];

export const GameHUD: React.FC<GameHUDProps> = ({
  players,
  activePlayerIndex,
  phase,
  currentDiceRoll,
  onRollDice,
  canRollDice,
  isTopDownView,
  onToggleCamera,
  onOpenPause,
  onOpenRules,
  settings,
  onToggleSound,
  statusMessage,
  turnTimeRemaining,
}) => {
  const t = TRANSLATIONS[settings.language];
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [activeReaction, setActiveReaction] = useState<{
    playerIdx: number;
    emoji: string;
  } | null>(null);

  const activePlayer = players[activePlayerIndex];

  const handleSendReaction = (emoji: string) => {
    soundManager.playClick();
    setActiveReaction({ playerIdx: activePlayerIndex, emoji });
    setShowEmojiMenu(false);
    setTimeout(() => setActiveReaction(null), 2500);
  };

  // Find player indices based on classic positions:
  // Red = top-left, Green = top-right, Blue = bottom-left, Yellow = bottom-right
  const getPlayerByColor = (color: PlayerColor) => {
    const idx = players.findIndex((p) => p.color === color);
    if (idx !== -1) return { player: players[idx], index: idx };
    return null;
  };

  const pRed = getPlayerByColor('red');
  const pGreen = getPlayerByColor('green');
  const pBlue = getPlayerByColor('blue');
  const pYellow = getPlayerByColor('yellow');

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 sm:p-4 select-none">
      {/* Top Header Row with Player Cards & Utility Bar */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left: Red Player (Player 2) */}
        {pRed ? (
          <div className="relative pointer-events-auto">
            <ClassicCornerPlayerCard
              player={pRed.player}
              isActive={activePlayerIndex === pRed.index}
              timer={activePlayerIndex === pRed.index ? turnTimeRemaining : null}
              timerMax={settings.turnTimerSeconds}
              coinSide="left"
              defaultLabel="Player 2"
            />
            {activeReaction?.playerIdx === pRed.index && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1.4 }}
                exit={{ opacity: 0 }}
                className="absolute -top-6 left-6 text-2xl z-30 pointer-events-none"
              >
                {activeReaction.emoji}
              </motion.div>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Top Center Controls & Status Bar */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto text-center px-1">
          {/* Mini Utility Control Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-sky-500/30 shadow-lg">
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleCamera();
              }}
              title={t.toggleCam}
              className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isTopDownView
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-sky-300 hover:bg-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isTopDownView ? '2D View' : '3D View'}
              </span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onToggleSound();
              }}
              title={settings.soundEnabled ? t.soundOn : t.soundMuted}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenRules();
              }}
              title={t.rules}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenPause();
              }}
              title={t.pause}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Notification Banner */}
          <AnimatePresence mode="wait">
            {statusMessage && (
              <motion.div
                key={statusMessage}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-sky-400/50 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{statusMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top-Right: Green Player (Player 3) */}
        {pGreen ? (
          <div className="relative pointer-events-auto">
            <ClassicCornerPlayerCard
              player={pGreen.player}
              isActive={activePlayerIndex === pGreen.index}
              timer={activePlayerIndex === pGreen.index ? turnTimeRemaining : null}
              timerMax={settings.turnTimerSeconds}
              coinSide="right"
              defaultLabel="Player 3"
            />
            {activeReaction?.playerIdx === pGreen.index && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1.4 }}
                exit={{ opacity: 0 }}
                className="absolute -top-6 right-6 text-2xl z-30 pointer-events-none"
              >
                {activeReaction.emoji}
              </motion.div>
            )}
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Bottom Row with Bottom-Left (Blue), Center Roll Button, and Bottom-Right (Yellow) */}
      <div className="w-full flex items-end justify-between">
        {/* Bottom-Left: Blue Player (Player 1) */}
        {pBlue ? (
          <div className="relative pointer-events-auto">
            <ClassicCornerPlayerCard
              player={pBlue.player}
              isActive={activePlayerIndex === pBlue.index}
              timer={activePlayerIndex === pBlue.index ? turnTimeRemaining : null}
              timerMax={settings.turnTimerSeconds}
              coinSide="left"
              defaultLabel="Player 1"
            />
            {activeReaction?.playerIdx === pBlue.index && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1.4 }}
                exit={{ opacity: 0 }}
                className="absolute -top-6 left-6 text-2xl z-30 pointer-events-none"
              >
                {activeReaction.emoji}
              </motion.div>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Center Dice Roll HUD */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto pb-1">
          {/* Reaction menu button */}
          <div className="relative">
            <AnimatePresence>
              {showEmojiMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute bottom-11 -left-20 flex items-center gap-1.5 p-2 rounded-2xl bg-slate-900/95 border border-sky-400/40 backdrop-blur-md shadow-2xl z-40"
                >
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendReaction(emoji)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sky-500/20 text-lg transition-transform hover:scale-125 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowEmojiMenu(!showEmojiMenu)}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-sky-400/40 text-amber-300 shadow-md transition-colors cursor-pointer"
              title="Emoji Reaction"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Roll Button / Dice Display matching table.jpg */}
          {canRollDice ? (
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[11px] shadow-md uppercase tracking-wider flex items-center gap-1"
              >
                <span>👉 {activePlayer?.name}: {settings.language === 'hi' ? 'आपकी बारी!' : "It's your turn!"}</span>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(2,132,199,0.5)',
                    '0 0 30px rgba(56,189,248,0.9)',
                    '0 0 15px rgba(2,132,199,0.5)',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                onClick={() => onRollDice()}
                className="py-2.5 px-5 sm:px-7 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-xl border border-sky-300 cursor-pointer"
              >
                <Dices className="w-5 h-5 text-amber-300" />
                <span>{t.rollDice}</span>
                <span className="hidden sm:inline text-[10px] font-sans opacity-80">
                  (Space)
                </span>
              </motion.button>
            </div>
          ) : (
            <div className="py-2 px-4 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2">
              {phase === 'ROLLING_DICE' ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span>Rolling...</span>
                </>
              ) : phase === 'WAITING_FOR_TOKEN_SELECT' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>
                    Rolled{' '}
                    <strong className="text-amber-300 text-sm">
                      {currentDiceRoll}
                    </strong>
                    ! Pick a token
                  </span>
                </>
              ) : activePlayer?.isBot ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>{activePlayer.name} thinking...</span>
                </>
              ) : (
                <span>Next Turn</span>
              )}
            </div>
          )}
        </div>

        {/* Bottom-Right: Yellow Player (Player 4) */}
        {pYellow ? (
          <div className="relative pointer-events-auto">
            <ClassicCornerPlayerCard
              player={pYellow.player}
              isActive={activePlayerIndex === pYellow.index}
              timer={activePlayerIndex === pYellow.index ? turnTimeRemaining : null}
              timerMax={settings.turnTimerSeconds}
              coinSide="right"
              defaultLabel="Player 4"
              currentDiceRoll={currentDiceRoll}
            />
            {activeReaction?.playerIdx === pYellow.index && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1.4 }}
                exit={{ opacity: 0 }}
                className="absolute -top-6 right-6 text-2xl z-30 pointer-events-none"
              >
                {activeReaction.emoji}
              </motion.div>
            )}
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

/**
 * Authentic Corner Player Card matching table.jpg:
 * Blue framed rounded rectangle with metallic coin + profile name box.
 */
const ClassicCornerPlayerCard: React.FC<{
  player: PlayerState;
  isActive: boolean;
  timer: number | null;
  timerMax: number;
  coinSide: 'left' | 'right';
  defaultLabel: string;
  currentDiceRoll?: number | null;
}> = ({ player, isActive, timer, timerMax, coinSide, defaultLabel, currentDiceRoll }) => {
  const theme = COLOR_THEMES[player.color];
  const homeCount = player.tokens.filter((t) => t.isHome || t.step >= 57).length;

  return (
    <div
      className={`rounded-2xl p-1.5 sm:p-2 bg-[#0284c7] border-2 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.5)] ${
        isActive
          ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105'
          : 'border-sky-300/60 opacity-90'
      }`}
    >
      {/* Coin Element */}
      {coinSide === 'left' && (
        <CoinElement
          color={player.color}
          homeCount={homeCount}
          isActive={isActive}
        />
      )}

      {/* Profile / Name Box (pinkish-white inner box from table.jpg) */}
      <div className="w-18 sm:w-24 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-[#fee2e2] to-[#ffedd5] border border-amber-300/80 p-1 flex flex-col justify-center text-center shadow-inner">
        <span className="text-[10px] sm:text-xs font-black text-slate-800 truncate">
          {player.name || defaultLabel}
        </span>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span className="text-[9px] font-bold text-slate-600 font-mono">
            {homeCount}/4 Home
          </span>
          {player.isBot && (
            <span className="text-[8px] px-1 py-0.2 rounded bg-slate-700 text-white font-mono">
              BOT
            </span>
          )}
        </div>
      </div>

      {coinSide === 'right' && (
        <CoinElement
          color={player.color}
          homeCount={homeCount}
          isActive={isActive}
        />
      )}
    </div>
  );
};

// Round coin with concentric rings and center star
const CoinElement: React.FC<{
  color: PlayerColor;
  homeCount: number;
  isActive: boolean;
}> = ({ color, isActive }) => {
  const theme = COLOR_THEMES[color];

  return (
    <div
      className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full ${theme.coinBg} border-2 border-white flex items-center justify-center shadow-md ${
        isActive ? 'ring-2 ring-amber-400 ring-offset-1 animate-pulse' : ''
      }`}
    >
      {/* Concentric Inner Ring */}
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/60 flex items-center justify-center">
        {/* Embossed 5-pointed star icon */}
        <span className="text-white text-xs sm:text-sm drop-shadow">★</span>
      </div>
    </div>
  );
};
