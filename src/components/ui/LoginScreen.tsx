import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  User,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { UserProfile, Language } from '../../types/game';
import { TRANSLATIONS } from '../../i18n/translations';
import { soundManager } from '../../audio/soundManager';

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onQuickPlay?: (profile: UserProfile) => void;
  language: Language;
  onToggleLanguage: () => void;
}

const AVATARS = ['👑', '🦁', '⚔️', '🦅', '💎', '🔥', '🐉', '✨', '⚡'];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onQuickPlay,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('Player 1');
  const [selectedAvatar, setSelectedAvatar] = useState('👑');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = (isGuest: boolean, emailVal?: string): UserProfile => ({
    username: username.trim() || 'Player 1',
    avatar: selectedAvatar,
    email: emailVal,
    isGuest,
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalCaptures: 0,
      tokensFinished: 0,
      highestStreak: 0,
    },
  });

  const handleInstantPlay = () => {
    soundManager.playClick();
    const prof = getProfile(true);
    if (onQuickPlay) {
      onQuickPlay(prof);
    } else {
      onLoginSuccess(prof);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    if (!email || !email.includes('@')) {
      setError(language === 'hi' ? 'कृपया मान्य ईमेल दर्ज करें' : 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters');
      return;
    }

    const profile = getProfile(false, email);
    onLoginSuccess(profile);
  };

  const handleGuestLogin = () => {
    soundManager.playClick();
    const guestProfile = getProfile(true);
    onLoginSuccess(guestProfile);
  };

  const handleGoogleLogin = () => {
    soundManager.playClick();
    const googleProfile: UserProfile = {
      username: username || 'Player 1',
      avatar: selectedAvatar || '👑',
      email: 'player@ludo.app',
      isGuest: false,
      stats: {
        gamesPlayed: 3,
        gamesWon: 2,
        totalCaptures: 14,
        tokensFinished: 8,
        highestStreak: 2,
      },
    };
    onLoginSuccess(googleProfile);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 pointer-events-none">
      {/* Top Bar with Language Toggle */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleLanguage();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-slate-800 transition-colors shadow-lg cursor-pointer"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
      </div>

      {/* Main Glass Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 pointer-events-auto relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <Crown className="w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide gold-gradient-text">
            {t.appTitle}
          </h1>
          <p className="text-xs text-amber-200/70 mt-1 tracking-widest uppercase">
            {t.appSubtitle}
          </p>
        </div>

        {/* Avatar Picker */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-2">
            {t.selectAvatar}
          </label>
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setSelectedAvatar(av);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all cursor-pointer ${
                  selectedAvatar === av
                    ? 'bg-amber-500/25 border-2 border-amber-400 scale-110 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                    : 'bg-slate-900/60 border border-slate-700 hover:border-slate-500'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Big Instant Play Button at top */}
          <button
            type="button"
            onClick={handleInstantPlay}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-extrabold text-sm tracking-wider uppercase shadow-[0_4px_20px_rgba(16,185,129,0.45)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.65)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mb-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{language === 'hi' ? '⚡ तुरंत खेलें (Play Now)' : '⚡ PLAY NOW (Instant Game)'}</span>
          </button>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.username}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={16}
                required
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                placeholder="Commander Name"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              placeholder="commander@cosmos.galaxy"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900/80 border border-slate-700 focus:border-amber-400 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {isRegister ? t.createAccount : t.login}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] text-slate-400 uppercase tracking-widest">
            {language === 'hi' ? 'या' : 'or'}
          </span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Alternative Login Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t.continueWithGoogle}</span>
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.playAsGuest}</span>
          </button>
        </div>

        {/* Toggle Register / Login */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setIsRegister(!isRegister);
            }}
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            {isRegister
              ? language === 'hi'
                ? 'पहले से खाता है? लॉगिन करें'
                : 'Already have an account? Login'
              : language === 'hi'
                ? 'नया खाता बनाएं'
                : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
