import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-extrabold tracking-tight',
    lg: 'text-2xl font-black tracking-wider',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Stylized Emblem: Flame + Pine Tree + LoRa Radiating Waves */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-2 border border-emerald-600/40 shadow-md shadow-emerald-950/40 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* LoRa Radiating Waves (Antenna Propagation) */}
          <path
            d="M8 14C12 9 18 6 24 6C30 6 36 9 40 14"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 2"
            opacity="0.85"
          />
          <path
            d="M13 19C16 15.5 20 13.5 24 13.5C28 13.5 32 15.5 35 19"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Forest Pine Tree Shape */}
          <path
            d="M24 14L16 28H21L14 38H34L27 28H32L24 14Z"
            fill="#065f46"
            stroke="#047857"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Stylized Internal Fire Core (Flame) */}
          <path
            d="M24 22C25.5 25 28 27.5 28 31C28 34.5 25.5 37 24 37C22.5 37 20 34.5 20 31C20 28 22.5 25.5 24 22Z"
            fill="url(#fireGradient)"
          />
          <path
            d="M24 28C24.8 29.8 26 31 26 33C26 34.5 24.8 35.5 24 35.5C23.2 35.5 22 34.5 22 33C22 31.5 23.2 30 24 28Z"
            fill="#fef08a"
          />

          {/* Tree Trunk & LoRa Ground Node */}
          <rect x="22.5" y="38" width="3" height="5" rx="1" fill="#78350f" />
          <circle cx="24" cy="45" r="1.5" fill="#10b981" />

          {/* Gradients */}
          <defs>
            <linearGradient id="fireGradient" x1="24" y1="22" x2="24" y2="37" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="0.6" stopColor="#ea580c" />
              <stop offset="1" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pulse dot for LoRa connectivity */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <span
          className={`${titleSizes[size]} leading-tight font-extrabold tracking-wide ${
            light ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          <span className="text-emerald-500">IGNIS</span>{' '}
          <span className="text-amber-500">WATCH</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
            Smart Forest Fire Detection System
          </span>
        )}
      </div>
    </div>
  );
};
