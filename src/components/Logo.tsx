import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  theme = 'light',
  className = '',
  onClick,
}) => {
  // Dimension tokens
  const iconDimensions = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  }[size];

  const titleSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl sm:text-5xl',
  }[size];

  const badgeSizes = {
    xs: 'text-[9px] px-1 py-0.2',
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-0.5',
    xl: 'text-xs px-2.5 py-1',
  }[size];

  const taglineSizes = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  const isDark = theme === 'dark';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Brand Icon Vector Image */}
      <div
        className={`${iconDimensions} relative overflow-hidden shadow-md shadow-indigo-500/20 flex items-center justify-center transition-transform duration-200 ${
          onClick ? 'group-hover:scale-105' : ''
        }`}
      >
        <img
          src="/logo.svg"
          alt="ZekaPark Logo"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Logotype Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight font-['Outfit',sans-serif] ${titleSizes} ${
                isDark
                  ? 'text-white'
                  : 'bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 bg-clip-text text-transparent'
              }`}
            >
              Zeka<span className="text-emerald-500">Park</span>
            </span>

            <span
              className={`font-extrabold rounded-full border shrink-0 ${badgeSizes} ${
                isDark
                  ? 'bg-white/10 text-indigo-300 border-white/20'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              BİLSEM
            </span>
          </div>

          {showTagline && (
            <p
              className={`font-semibold uppercase tracking-widest mt-0.5 ${taglineSizes} ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Bilişsel Zeka Platformu
            </p>
          )}
        </div>
      )}
    </div>
  );
};
