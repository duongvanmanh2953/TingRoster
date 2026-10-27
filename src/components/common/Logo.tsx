import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'horizontal' | 'mark' | 'icon';
  theme?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export function LogoMark({ size = 'md', className = '' }: { size?: LogoProps['size']; className?: string }) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  const iconSizeMap = {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
  };

  const s = iconSizeMap[size || 'md'];

  return (
    <div
      className={`${sizeMap[size || 'md']} rounded-xl bg-gradient-to-tr from-[#2538D9] via-[#4353EB] to-[#6D5CE8] flex items-center justify-center text-white font-black shadow-md shadow-[#2538D9]/25 flex-shrink-0 relative overflow-hidden transition-transform duration-200 hover:scale-105 ${className}`}
    >
      {/* Subtle sheen highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none" />
      
      {/* Brand Icon SVG: Modern geometric multi-layered Ting spark / roster check */}
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <path
          d="M12 2L3 7L12 12L21 7L12 2Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M3 12L12 17L21 12"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 17L12 22L21 17"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Glowing spark dot representing VietQR "Ting!" */}
        <circle cx="12" cy="7" r="1.5" fill="#FFE17D" />
      </svg>
    </div>
  );
}

export function Logo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  showBadge = false,
  badgeText = 'VIETQR SAAS',
  showTagline = false,
  className = '',
  href,
}: LogoProps) {
  const isDark = theme === 'dark';

  const textSizeMap = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />

      {variant !== 'icon' && variant !== 'mark' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-extrabold tracking-tight ${textSizeMap[size]} ${
                isDark ? 'text-white' : 'text-[#101828]'
              }`}
            >
              Ting<span className="text-[#2538D9]">Roster</span>
            </span>

            {showBadge && (
              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
                  isDark
                    ? 'bg-[#2538D9]/30 text-indigo-200 border border-[#2538D9]/50'
                    : 'bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {showTagline && (
            <p
              className={`text-[11px] font-medium leading-none mt-1 ${
                isDark ? 'text-slate-400' : 'text-[#475467]'
              }`}
            >
              Điểm danh một chạm • Thu phí tự động
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2538D9] rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
