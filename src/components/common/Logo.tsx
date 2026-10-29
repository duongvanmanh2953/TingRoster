import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  variant?: 'full' | 'horizontal' | 'mark' | 'icon' | 'stacked';
  theme?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export function LogoMark({
  size = 'md',
  className = '',
}: {
  size?: LogoProps['size'];
  className?: string;
}) {
  const pixelMap = {
    xs: 26,
    sm: 34,
    md: 42,
    lg: 52,
    xl: 64,
  };

  const px = pixelMap[size || 'md'];

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
      style={{ width: px, height: px }}
    >
      {/* High-Resolution Isolated Transparent 3D TingRoster Emblem */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-icon.png"
        alt="TingRoster"
        width={px}
        height={px}
        className="w-full h-full object-contain filter drop-shadow-sm select-none pointer-events-none"
      />
    </div>
  );
}

export function Logo({
  variant = 'horizontal',
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
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  // Stacked variant (emblem on top, text and tagline centered below like original brand mark)
  if (variant === 'stacked') {
    const stackedContent = (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        <LogoMark size={size} className="mb-2" />
        <div className="flex flex-col items-center">
          <span className={`font-black tracking-tight ${textSizeMap[size]} leading-tight`}>
            <span className={isDark ? 'text-[rgb(65 104 255)]' : 'text-white'}>Ting</span>
            <span className="text-[#6242E8] dark:text-[#7C65F8]">Roster</span>
          </span>
          {showBadge && badgeText && (
            <span
              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider mt-1 ${
                isDark
                  ? 'bg-[#6242E8]/25 text-indigo-300 border border-[#6242E8]/40'
                  : 'bg-[#6242E8]/10 text-[#6242E8] border border-[#6242E8]/20'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
        {showTagline && (
          <p
            className={`text-xs font-medium tracking-tight mt-1.5 ${
              isDark ? 'text-slate-300' : 'text-[#475467]'
            }`}
          >
            Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.
          </p>
        )}
      </div>
    );

    if (href) {
      return (
        <Link
          href={href}
          className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6242E8] rounded-xl"
        >
          {stackedContent}
        </Link>
      );
    }
    return stackedContent;
  }

  // Icon / Mark only
  if (variant === 'icon' || variant === 'mark') {
    if (href) {
      return (
        <Link
          href={href}
          className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6242E8] rounded-xl"
        >
          <LogoMark size={size} className={className} />
        </Link>
      );
    }
    return <LogoMark size={size} className={className} />;
  }

  // Horizontal / Full variant (side-by-side)
  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />

      <div className="flex flex-col justify-center">
        <span className={`font-black tracking-tight ${textSizeMap[size]} leading-none`}>
          <span className={isDark ? 'text-[rgb(65 104 255)]' : 'text-white'}>Ting</span>
          <span className="text-[#6242E8] dark:text-[#7C65F8]">Roster</span>
        </span>

        {showBadge && badgeText && (
          <div className="flex items-center mt-1">
            <span
              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider leading-none ${
                isDark
                  ? 'bg-[#6242E8]/25 text-indigo-300 border border-[#6242E8]/40'
                  : 'bg-[#6242E8]/10 text-[#6242E8] border border-[#6242E8]/20'
              }`}
            >
              {badgeText}
            </span>
          </div>
        )}

        {showTagline && (
          <p
            className={`text-[11px] font-medium leading-none mt-1 tracking-tight ${
              isDark ? 'text-slate-400' : 'text-[#475467]'
            }`}
          >
            Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6242E8] rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
