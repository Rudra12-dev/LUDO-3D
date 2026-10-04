import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Home,
  Share2,
  Sparkles,
  Award,
  Crown,
} from 'lucide-react';
import {
  PlayerState,
  PlayerColor,
  GameSettings,
  UserProfile,
} from '../../types/game';
import { TRANSLATIONS } from '../../i18n/translations';
import { soundManager } from '../../audio/soundManager';

interface VictoryScreenProps {
  winnerPlayer?: PlayerState;
  winningTeam?: 'A' | 'B';
  players: PlayerState[];
  settings: GameSettings;
  userProfile: UserProfile;
  totalCaptures: number;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  winnerPlayer,
  winningTeam,
  players,
  settings,
  userProfile,
  totalCaptures,
  onRematch,
  onReturnToLobby,
}) => {
  const t = TRANSLATIONS[settings.language];
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    soundManager.playVictoryFanfare();

    // Trigger multiple bursts of golden and cosmic confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ['#d4af37', '#fef08a', '#ef4444', '#10b981', '#3b82f6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: ['#d4af37', '#fef08a', '#ef4444', '#10b981', '#3b82f6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleShare = () => {
    soundManager.playClick();
    const title = 'Royal Ludo 3D - Cosmic Victory';
    const text = `I just won a match in Royal Ludo 3D as ${
      winnerPlayer ? winnerPlayer.name : 'Team ' + winningTeam
    }! 👑 Play now!`;

    if (navigator.share) {
      navigator.share({ title, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-8">
      {/* Top Victory Announcement */}
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full text-center pointer-events-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs uppercase tracking-widest font-bold mb-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{winningTeam ? t.teamVictory : t.winner}</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-black gold-gradient-text tracking-wide drop-shadow-lg">
          {winningTeam
            ? `TEAM ${winningTeam} DOMINATES!`
            : `${winnerPlayer?.name?.toUpperCase()} CROWNED!`}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          {winningTeam
            ? 'Cosmic harmony achieved by the supreme alliance'
            : 'The Cosmic Singularity bows to the new galactic champion'}
        </p>
      </motion.div>

      {/* Bottom Summary Glass Card & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full max-w-lg mx-auto glass-panel rounded-2xl p-5 sm:p-6 pointer-events-auto shadow-2xl"
      >
        {/* Match Statistics */}
        <div className="grid grid-cols-3 gap-2.5 text-center mb-5 pb-4 border-b border-amber-500/20">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
              {t.tokensHome}
            </span>
            <strong className="text-base sm:text-lg font-bold text-amber-300 font-mono">
              4 / 4
            </strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
              {t.captures}
            </span>
            <strong className="text-base sm:text-lg font-bold text-rose-400 font-mono">
              {totalCaptures}
            </strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
              Career Wins
            </span>
            <strong className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
              {userProfile.stats.gamesWon}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onRematch();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.4)] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.rematch}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToLobby();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.lobby}</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full sm:w-auto p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title={t.share}
          >
            <Share2 className="w-4 h-4" />
            <span className="sm:hidden">{t.share}</span>
          </button>
        </div>

        {copied && (
          <p className="text-[11px] text-amber-300 text-center mt-2.5">
            {t.copiedShare}
          </p>
        )}
      </motion.div>
    </div>
  );
};
