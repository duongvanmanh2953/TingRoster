'use client';

import React, { useState } from 'react';

export interface BankInfo {
  code: string;
  shortName: string;
  name: string;
  color: string;
  bgLight: string;
  logoFallback?: string;
}

export const POPULAR_BANKS: Record<string, BankInfo> = {
  MB: {
    code: 'MB',
    shortName: 'MBBank',
    name: 'Ngân hàng Quân Đội',
    color: '#002B7F',
    bgLight: 'rgba(0, 43, 127, 0.12)',
  },
  VCB: {
    code: 'VCB',
    shortName: 'Vietcombank',
    name: 'Ngoại Thương Việt Nam',
    color: '#005D30',
    bgLight: 'rgba(0, 93, 48, 0.12)',
  },
  TCB: {
    code: 'TCB',
    shortName: 'Techcombank',
    name: 'Kỹ Thương Việt Nam',
    color: '#ED1B24',
    bgLight: 'rgba(237, 27, 36, 0.12)',
  },
  ACB: {
    code: 'ACB',
    shortName: 'ACB',
    name: 'Á Châu',
    color: '#0055A5',
    bgLight: 'rgba(0, 85, 165, 0.12)',
  },
  VPB: {
    code: 'VPB',
    shortName: 'VPBank',
    name: 'Việt Nam Thịnh Vượng',
    color: '#009639',
    bgLight: 'rgba(0, 150, 57, 0.12)',
  },
  TPB: {
    code: 'TPB',
    shortName: 'TPBank',
    name: 'Tiên Phong',
    color: '#551C7E',
    bgLight: 'rgba(85, 28, 126, 0.12)',
  },
  BIDV: {
    code: 'BIDV',
    shortName: 'BIDV',
    name: 'Đầu Tư & Phát Triển Việt Nam',
    color: '#006A72',
    bgLight: 'rgba(0, 106, 114, 0.12)',
  },
  ICB: {
    code: 'ICB',
    shortName: 'VietinBank',
    name: 'Công Thương Việt Nam',
    color: '#00478F',
    bgLight: 'rgba(0, 71, 143, 0.12)',
  },
  VIB: {
    code: 'VIB',
    shortName: 'VIB',
    name: 'Quốc Tế Việt Nam',
    color: '#004B87',
    bgLight: 'rgba(0, 75, 135, 0.12)',
  },
  STB: {
    code: 'STB',
    shortName: 'Sacombank',
    name: 'Sài Gòn Thương Tín',
    color: '#004A99',
    bgLight: 'rgba(0, 74, 153, 0.12)',
  },
  HDB: {
    code: 'HDB',
    shortName: 'HDBank',
    name: 'Phát Triển TP.HCM',
    color: '#E30613',
    bgLight: 'rgba(227, 6, 19, 0.12)',
  },
  MSB: {
    code: 'MSB',
    shortName: 'MSB',
    name: 'Hàng Hải Việt Nam',
    color: '#EB2127',
    bgLight: 'rgba(235, 33, 39, 0.12)',
  },
};

interface BankLogoProps {
  bankId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
  badgeOnly?: boolean;
}

export function BankLogo({
  bankId = 'MB',
  size = 'md',
  showName = false,
  className = '',
  badgeOnly = false,
}: BankLogoProps) {
  const [imageError, setImageError] = useState(false);
  const normalizedId = (bankId || 'MB').toUpperCase();
  const bank = POPULAR_BANKS[normalizedId] || {
    code: normalizedId,
    shortName: normalizedId,
    name: normalizedId,
    color: '#2538D9',
    bgLight: 'rgba(37, 56, 217, 0.12)',
  };

  // Dimensions optimized for standard horizontal bank logos without any restrictive padding
  const sizeStyles = {
    xs: {
      height: 'h-6',
      minWidth: 'min-w-[46px]',
      maxWidth: 'max-w-[70px]',
      padding: 'px-1.5 py-0.5',
      rounded: 'rounded-md',
      text: 'text-[10px]',
    },
    sm: {
      height: 'h-7',
      minWidth: 'min-w-[58px]',
      maxWidth: 'max-w-[88px]',
      padding: 'px-2 py-0.5',
      rounded: 'rounded-lg',
      text: 'text-xs',
    },
    md: {
      height: 'h-9',
      minWidth: 'min-w-[76px]',
      maxWidth: 'max-w-[120px]',
      padding: 'px-2.5 py-1',
      rounded: 'rounded-xl',
      text: 'text-xs',
    },
    lg: {
      height: 'h-11',
      minWidth: 'min-w-[96px]',
      maxWidth: 'max-w-[150px]',
      padding: 'px-3 py-1',
      rounded: 'rounded-xl',
      text: 'text-sm',
    },
  }[size];

  // Official VietQR bank logos in clean PNG format
  const logoUrl = `https://api.vietqr.io/img/${normalizedId}.png`;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Mandatory pure #FFFFFF background container in all modes (light and dark) without dark mode background overrides */}
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-2xs transition-transform hover:scale-[1.02] ${sizeStyles.height} ${sizeStyles.minWidth} ${sizeStyles.maxWidth} ${sizeStyles.padding} ${sizeStyles.rounded} overflow-hidden`}
        style={{ backgroundColor: '#FFFFFF' }}
        title={`${bank.shortName} - ${bank.name}`}
      >
        {!imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={bank.shortName}
            className="w-auto h-full max-h-full object-contain filter drop-shadow-2xs select-none"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center gap-1 font-bold">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: bank.color }}
            />
            <span
              className={`font-black tracking-tight font-mono leading-none ${sizeStyles.text}`}
              style={{ color: bank.color }}
            >
              {bank.shortName}
            </span>
          </div>
        )}
      </div>

      {showName && !badgeOnly && (
        <div className="min-w-0">
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block leading-tight truncate">
            {bank.shortName}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight truncate">
            {bank.name}
          </span>
        </div>
      )}
    </div>
  );
}
