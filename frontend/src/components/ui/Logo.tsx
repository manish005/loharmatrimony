import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  showIcon?: boolean;
}

const sizeMap = {
  sm: { icon: 28, text: "text-sm", sub: "text-[8px]", gap: "gap-1" },
  md: { icon: 36, text: "text-lg", sub: "text-[10px]", gap: "gap-1.5" },
  lg: { icon: 48, text: "text-2xl", sub: "text-xs", gap: "gap-2" },
};

const Logo: React.FC<LogoProps> = ({ size = "md", showTagline = true, showIcon = true }) => {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center ${showIcon ? s.gap : "gap-0"} group shrink-0`}>
      {showIcon && (
        <div className="relative flex-shrink-0">
          <svg
            width={s.icon}
            height={s.icon}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            <circle cx="24" cy="24" r="23" fill="url(#logo-grad)" stroke="url(#logo-gold)" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="18" fill="none" stroke="url(#logo-gold)" strokeWidth="0.6" strokeDasharray="2 2" />
            <g fill="url(#logo-heart)" stroke="url(#logo-gold)" strokeWidth="0.6">
              <rect x="14" y="14" width="7" height="2.5" rx="0.5" />
              <rect x="16.5" y="16.5" width="2" height="12" rx="0.5" />
              <rect x="27" y="22.5" width="2" height="7" rx="0.5" />
              <path d="M28 22.5 Q 32 13 24.5 11 Q 21 10 19 12.5 Q 21 13 22.5 13.5 Q 26 14.5 26.5 18.5 L 28 22.5 Z" />
            </g>
            <circle cx="24" cy="5" r="1.2" fill="url(#logo-gold)" />
            <circle cx="24" cy="43" r="1.2" fill="url(#logo-gold)" />
            <circle cx="5" cy="24" r="1.2" fill="url(#logo-gold)" />
            <circle cx="43" cy="24" r="1.2" fill="url(#logo-gold)" />
            <circle cx="10.5" cy="10.5" r="1" fill="url(#logo-gold)" />
            <circle cx="37.5" cy="10.5" r="1" fill="url(#logo-gold)" />
            <circle cx="10.5" cy="37.5" r="1" fill="url(#logo-gold)" />
            <circle cx="37.5" cy="37.5" r="1" fill="url(#logo-gold)" />

            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#83122e" />
                <stop offset="100%" stopColor="#5c0d21" />
              </linearGradient>
              <linearGradient id="logo-gold" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#b8860b" />
              </linearGradient>
              <linearGradient id="logo-heart" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#f3d78c" />
                <stop offset="100%" stopColor="#d4af37" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-500/30" />
        </div>
      )}

      <div className="flex flex-col leading-none">
        <span className={`font-serif font-extrabold tracking-wider text-maroon-700 dark:text-gold-400 ${s.text}`}>
          LOHAR
        </span>
        <div className="flex items-center gap-1">
          <span className={`font-devanagari font-bold text-slate-500 dark:text-slate-400 ${s.sub}`}>
            समाज
          </span>
          {showTagline && (
            <span className={`font-devanagari text-gold-500 dark:text-gold-400 animate-glow ${s.sub === "text-[8px]" ? "text-[6px]" : "text-[7px]"}`}>
              ॥ विवाह मंडळ ॥
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logo;
