'use client';

import React, { useState } from 'react';

export interface BankInfo {
  code: string;
  shortName: string;
  name: string;
  color: string;
  bgLight: string;
}

export const POPULAR_BANKS: Record<string, BankInfo> = {
  MB: {
    code: 'MB',
    shortName: 'MBBank',
    name: 'Ngân hàng Quân Đội',
    color: '#002B7F',
    bgLight: 'rgba(0, 43, 127, 0.08)',
  },
  VCB: {
    code: 'VCB',
    shortName: 'Vietcombank',
    name: 'Ngoại Thương Việt Nam',
    color: '#005D30',
    bgLight: 'rgba(0, 93, 48, 0.08)',
  },
  TCB: {
    code: 'TCB',
    shortName: 'Techcombank',
    name: 'Kỹ Thương Việt Nam',
    color: '#ED1B24',
    bgLight: 'rgba(237, 27, 36, 0.08)',
  },
  ACB: {
    code: 'ACB',
    shortName: 'ACB',
    name: 'Á Châu',
    color: '#0055A5',
    bgLight: 'rgba(0, 85, 165, 0.08)',
  },
  VPB: {
    code: 'VPB',
    shortName: 'VPBank',
    name: 'Việt Nam Thịnh Vượng',
    color: '#009639',
    bgLight: 'rgba(0, 150, 57, 0.08)',
  },
  TPB: {
    code: 'TPB',
    shortName: 'TPBank',
    name: 'Tiên Phong',
    color: '#551C7E',
    bgLight: 'rgba(85, 28, 126, 0.08)',
  },
  BIDV: {
    code: 'BIDV',
    shortName: 'BIDV',
    name: 'Đầu Tư & Phát Triển Việt Nam',
    color: '#006A72',
    bgLight: 'rgba(0, 106, 114, 0.08)',
  },
  ICB: {
    code: 'ICB',
    shortName: 'VietinBank',
    name: 'Công Thương Việt Nam',
    color: '#00478F',
    bgLight: 'rgba(0, 71, 143, 0.08)',
  },
  VIB: {
    code: 'VIB',
    shortName: 'VIB',
    name: 'Quốc Tế Việt Nam',
    color: '#004B87',
    bgLight: 'rgba(0, 75, 135, 0.08)',
  },
  STB: {
    code: 'STB',
    shortName: 'Sacombank',
    name: 'Sài Gòn Thương Tín',
    color: '#004A99',
    bgLight: 'rgba(0, 74, 153, 0.08)',
  },
  HDB: {
    code: 'HDB',
    shortName: 'HDBank',
    name: 'Phát Triển TP.HCM',
    color: '#E30613',
    bgLight: 'rgba(227, 6, 19, 0.08)',
  },
  MSB: {
    code: 'MSB',
    shortName: 'MSB',
    name: 'Hàng Hải Việt Nam',
    color: '#EB2127',
    bgLight: 'rgba(235, 33, 39, 0.08)',
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
    bgLight: 'rgba(37, 56, 217, 0.08)',
  };

  // Heights matched directly to standard font and button sizes without bulky padding
  const sizeStyles = {
    xs: {
      height: 'h-5',
      text: 'text-[10px]',
    },
    sm: {
      height: 'h-6',
      text: 'text-xs',
    },
    md: {
      height: 'h-8',
      text: 'text-xs',
    },
    lg: {
      height: 'h-10',
      text: 'text-sm',
    },
  }[size];

  // Official VietQR / Napas bank logo URL
  const logoUrl = `https://api.vietqr.io/img/${normalizedId}.png`;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Official bank logo rendered directly with zero extra padding */}
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 bg-transparent p-0 overflow-hidden ${sizeStyles.height}`}
        title={`${bank.shortName} - ${bank.name}`}
      >
        {!imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={bank.shortName}
            className={`w-auto ${sizeStyles.height} object-contain select-none block`}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center gap-1 font-bold px-1">
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
