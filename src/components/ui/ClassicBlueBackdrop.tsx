import React from 'react';

/**
 * Background matching table.jpg:
 * Deep Royal Blue with diagonal geometric Ludo board watermark patterns,
 * soft vignette, and cyan/sapphire lighting.
 */
export const ClassicBlueBackdrop: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#0a2e5c] overflow-hidden pointer-events-none select-none">
      {/* Radial Gradient Base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1d5999_0%,_#0d396d_45%,_#061a38_100%)] opacity-95" />

      {/* Diagonal Subtle Ludo Board Blueprint Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.08) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.08) 75%)
          `,
          backgroundSize: '120px 120px',
          backgroundPosition: '0 0, 0 60px, 60px -60px, -60px 0px',
        }}
      />

      {/* Repeated faint tilted boards overlay like in table.jpg */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="ludo-pattern"
            width="240"
            height="240"
            patternTransform="rotate(35 0 0)"
            patternUnits="userSpaceOnUse"
          >
            {/* Outline of small ludo board */}
            <rect
              x="20"
              y="20"
              width="90"
              height="90"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              rx="4"
            />
            <rect
              x="26"
              y="26"
              width="34"
              height="34"
              fill="rgba(255,255,255,0.04)"
              stroke="#93c5fd"
              strokeWidth="1"
            />
            <circle cx="36" cy="36" r="4" fill="rgba(255,255,255,0.12)" />
            <circle cx="50" cy="36" r="4" fill="rgba(255,255,255,0.12)" />
            <circle cx="36" cy="50" r="4" fill="rgba(255,255,255,0.12)" />
            <circle cx="50" cy="50" r="4" fill="rgba(255,255,255,0.12)" />

            <rect
              x="70"
              y="26"
              width="34"
              height="34"
              fill="rgba(255,255,255,0.04)"
              stroke="#93c5fd"
              strokeWidth="1"
            />
            <circle cx="80" cy="36" r="4" fill="rgba(255,255,255,0.12)" />
            <circle cx="94" cy="36" r="4" fill="rgba(255,255,255,0.12)" />
            <circle cx="80" cy="50" r="4" fill="rgba(255,255,255,0.12)" />
            <circle cx="94" cy="50" r="4" fill="rgba(255,255,255,0.12)" />

            {/* Corner arrow */}
            <path
              d="M 65 30 L 65 55 M 60 38 L 65 30 L 70 38"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1"
            />

            {/* Adjacent board */}
            <rect
              x="140"
              y="140"
              width="90"
              height="90"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              rx="4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ludo-pattern)" />
      </svg>

      {/* Top & Bottom Vignette Shadow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/55 pointer-events-none" />

      {/* Soft Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
