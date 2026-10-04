import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Music,
  Zap,
  X,
  ShieldAlert,
} from 'lucide-react';
import { GameSettings, Language } from '../../types/game';
import { TRANSLATIONS } from '../../i18n/translations';
import { soundManager } from '../../audio/soundManager';

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onQuit: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  onQuit,
  settings,
  onUpdateSettings,
}) => {
  const t = TRANSLATIONS[settings.language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm glass-panel rounded-2xl p-6 relative border border-amber-500/30 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-xl font-bold gold-gradient-text text-center mb-6">
          {t.pause}
        </h2>

        {/* Toggles & Options */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-medium text-slate-300">
              {t.sound}
            </span>
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
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-medium text-slate-300">
              {t.music}
            </span>
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
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-medium text-slate-300">
              Low Power / 60 FPS
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                onUpdateSettings({
                  ...settings,
                  lowPowerMode: !settings.lowPowerMode,
                });
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                settings.lowPowerMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.resume}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Match</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onQuit();
            }}
            className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.quit}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
