import React from 'react';

interface RevoxLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  inverted?: boolean;
}

export const RevoxLogo: React.FC<RevoxLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  inverted = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Emblem */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="45%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Golden Ribbon Arcs */}
          <path
            d="M20 54C20 40 32 26 48 24C62 22 75 29 82 38C74 34 62 33 52 38C38 45 32 58 35 70C25 67 20 61 20 54Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M38 72C48 76 60 74 72 66C66 69 58 70 50 68C44 66 40 62 38 56V72Z"
            fill="url(#goldGrad)"
          />

          {/* Silver/Titanium "R" Body */}
          <path
            d="M38 28H62C72 28 80 35 80 44C80 52 74 58 66 60L80 78H66L54 62H48V78H38V28ZM48 52H60C64 52 68 49 68 45C68 41 64 38 60 38H48V52Z"
            fill="url(#silverGrad)"
          />

          {/* Phone Silhouette Inside R */}
          <rect
            x="48"
            y="41"
            width="10"
            height="18"
            rx="2.5"
            stroke="url(#goldGrad)"
            strokeWidth="1.8"
            fill="none"
          />
          <line x1="51" y1="43" x2="55" y2="43" stroke="url(#goldGrad)" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Typography Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-[0.18em] font-extrabold uppercase leading-none font-['Poppins']">
          <span className={`${textSizes[size]} ${inverted ? 'text-white' : 'text-[#0F172A]'}`}>REV</span>
          <span className={`${textSizes[size]} text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500`}>O</span>
          <span className={`${textSizes[size]} ${inverted ? 'text-white' : 'text-[#0F172A]'}`}>X</span>
        </div>
        
        {showTagline && (
          <div className="flex flex-col mt-0.5">
            <span className={`text-[8px] tracking-[0.22em] font-semibold uppercase ${inverted ? 'text-slate-400' : 'text-slate-500'}`}>
              Certified Refurbished
            </span>
            <span className="text-[7px] tracking-[0.1em] text-amber-600 font-medium italic">
              Smart Choice, Better Value
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
