import React from 'react';
import { motion } from 'motion/react';
import { X, Star, Shield, Dices, Trophy, ArrowRight } from 'lucide-react';
import { Language } from '../../types/game';
import { TRANSLATIONS } from '../../i18n/translations';
import { soundManager } from '../../audio/soundManager';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg glass-panel rounded-2xl p-6 relative border border-amber-500/30 shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-xl font-bold gold-gradient-text text-center mb-1">
          {t.rules}
        </h2>
        <p className="text-xs text-amber-200/70 text-center mb-6">
          Royal Cosmos Championship Guidelines
        </p>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Rule 1 */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-white text-xs mb-0.5">
                1. Deploying & Extra Turns
              </strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                You must roll a <strong className="text-amber-300">6</strong> to deploy a token from your sanctuary onto your start tile. Rolling a 6 grants a bonus turn! However, rolling{' '}
                <span className="text-rose-400 font-semibold">three consecutive 6s</span> forfeits the turn immediately.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-white text-xs mb-0.5">
                2. Captures & Safe Star Tiles
              </strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Landing on an opponent's token sends it back to their sanctuary and awards you an extra roll! However, tiles marked with the <strong className="text-amber-300">8-pointed Gold Star</strong> and initial Start tiles are protected cosmic zones where no captures can occur.
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-white text-xs mb-0.5">
                3. The Home Stretch & Cosmic Singularity
              </strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                After completing the 52-tile circuit, tokens enter their private colored home runway. An <strong className="text-amber-300">exact count</strong> is required to enter the final Cosmic Singularity (Home). Reaching home gives a bonus turn!
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-white text-xs mb-0.5">
                4. Victory Conditions
              </strong>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                In Classic Mode, the first commander to guide all 4 tokens home wins. In Team Mode (2v2), both allied commanders must coordinate to bring all 8 tokens into the core!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-amber-400 transition-colors"
        >
          Understood, Commander
        </button>
      </motion.div>
    </div>
  );
};
