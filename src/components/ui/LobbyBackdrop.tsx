import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Heart } from 'lucide-react';

export const LobbyBackdrop: React.FC = () => {
  // Generate random warm bokeh particles to simulate candle/fairy lights
  const bokehParticles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 17) % 96}%`,
      top: `${(i * 23) % 90}%`,
      size: 16 + (i % 5) * 14,
      duration: 3 + (i % 4) * 2,
      delay: (i % 3) * 1.2,
      opacity: 0.15 + (i % 4) * 0.08,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#0d0907] overflow-hidden pointer-events-none select-none">
      {/* Warm Ambient Tabletop Wooden Floor Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a1810_0%,_#160c07_55%,_#090503_100%)] opacity-90" />

      {/* Subtle Woodgrain Overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(212, 175, 55, 0.05) 0px,
            rgba(212, 175, 55, 0.05) 2px,
            transparent 2px,
            transparent 8px
          )`,
        }}
      />

      {/* Floating Warm Golden Bokeh Lights (Lantern / fairy lights from photo) */}
      {bokehParticles.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -18, 0],
            opacity: [p.opacity, p.opacity * 1.7, p.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full pointer-events-none blur-md bg-amber-400"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}

      {/* Top Lantern Glow Bloom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.22)_0%,_rgba(217,119,6,0.08)_50%,_transparent_75%)] blur-2xl" />

      {/* Side Vignette Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60" />

      {/* Handcrafted Board Tabletop Silhouette with authentic colors from photo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 sm:opacity-40 scale-90 sm:scale-100 pointer-events-none">
        <div className="relative w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-2xl bg-[#f5ede0] border-8 border-[#3d271d] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-2 sm:p-4 rotate-2">
          {/* 4 Quadrants from photo */}
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-2 sm:gap-4">
            {/* Top Left: Amber Yellow */}
            <div className="rounded-xl border-4 border-[#b45309] bg-[#d97706]/35 p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-900 tracking-wider">
                YARD
              </span>
              <div className="grid grid-cols-2 gap-2 place-items-center">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-amber-500 shadow-sm border border-amber-300"
                  />
                ))}
              </div>
            </div>

            {/* Top Right: Sapphire Blue */}
            <div className="rounded-xl border-4 border-[#1d4ed8] bg-[#2563eb]/35 p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-900 tracking-wider">
                YARD
              </span>
              <div className="grid grid-cols-2 gap-2 place-items-center">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-blue-500 shadow-sm border border-blue-300"
                  />
                ))}
              </div>
            </div>

            {/* Bottom Left: Ruby Red */}
            <div className="rounded-xl border-4 border-[#b91c1c] bg-[#dc2626]/35 p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-red-900 tracking-wider">
                YARD
              </span>
              <div className="grid grid-cols-2 gap-2 place-items-center">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-red-500 shadow-sm border border-red-300"
                  />
                ))}
              </div>
            </div>

            {/* Bottom Right: Emerald Green */}
            <div className="rounded-xl border-4 border-[#047857] bg-[#059669]/35 p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-900 tracking-wider">
                YARD
              </span>
              <div className="grid grid-cols-2 gap-2 place-items-center">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm border border-emerald-300"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center Crown Crest like the photo */}
          <div className="absolute inset-0 m-auto w-20 sm:w-24 h-20 sm:h-24 rounded-xl bg-[#2e1d13] border-2 border-amber-400/80 flex flex-col items-center justify-center shadow-xl">
            <span className="text-amber-400 text-xs sm:text-sm font-display font-extrabold tracking-widest">
              LUDO
            </span>
            <span className="text-[8px] text-amber-300/80 uppercase">
              Classic
            </span>
          </div>
        </div>
      </div>

      {/* Nostalgic Motto tags inspired directly by the uploaded photo */}
      <div className="absolute top-4 left-6 hidden lg:block opacity-75">
        <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-amber-500/20 backdrop-blur-sm text-xs text-amber-200/90 font-serif">
          Good Times · Great Moves <Heart className="w-3 h-3 inline text-rose-400 fill-current ml-1" />
          <p className="text-[10px] text-amber-300/60 font-sans mt-0.5">
            Every roll brings us closer
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 hidden lg:block opacity-85">
        <div className="px-3.5 py-2 rounded-xl bg-black/50 border border-amber-500/30 backdrop-blur-sm text-right">
          <span className="text-amber-400 font-display font-black text-sm tracking-wider">
            ROYAL LUDO
          </span>
          <p className="text-[11px] text-amber-200/80 italic font-serif">
            "More than a game, it's a memory."
          </p>
        </div>
      </div>
    </div>
  );
};
