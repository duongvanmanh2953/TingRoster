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

  const pixelMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  };

  const px = pixelMap[size || 'md'];

  return (
    <div
      className={`${sizeMap[size || 'md']} flex-shrink-0 transition-transform duration-200 hover:scale-105 rounded-xl overflow-hidden shadow-md shadow-[#2538D9]/25 border border-[#2538D9]/20 bg-[#0B0F19] relative flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
    >
      {/* High-Resolution Creative 3D TingRoster PNG Emblem */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="TingRoster"
        width={px}
        height={px}
        className="w-full h-full object-cover scale-[1.24] transform drop-shadow-md select-none pointer-events-none"
      />
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
