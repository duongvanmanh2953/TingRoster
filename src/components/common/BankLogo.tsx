'use client';

import React, { useState } from 'react';
import Image from 'next/image';

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
    bgLight: 'rgba(0, 43, 127, 0.15)',
  },
  VCB: {
    code: 'VCB',
    shortName: 'Vietcombank',
    name: 'Ngoại Thương Việt Nam',
    color: '#005D30',
    bgLight: 'rgba(0, 93, 48, 0.15)',
  },
  TCB: {
    code: 'TCB',
    shortName: 'Techcombank',
    name: 'Kỹ Thương Việt Nam',
    color: '#ED1B24',
    bgLight: 'rgba(237, 27, 36, 0.15)',
  },
  ACB: {
    code: 'ACB',
    shortName: 'ACB',
    name: 'Á Châu',
    color: '#0055A5',
    bgLight: 'rgba(0, 85, 165, 0.15)',
  },
  VPB: {
    code: 'VPB',
    shortName: 'VPBank',
    name: 'Việt Nam Thịnh Vượng',
    color: '#009639',
    bgLight: 'rgba(0, 150, 57, 0.15)',
  },
  TPB: {
    code: 'TPB',
    shortName: 'TPBank',
    name: 'Tiên Phong',
    color: '#551C7E',
    bgLight: 'rgba(85, 28, 126, 0.15)',
  },
  BIDV: {
    code: 'BIDV',
    shortName: 'BIDV',
    name: 'Đầu Tư & Phát Triển Việt Nam',
    color: '#006A72',
    bgLight: 'rgba(0, 106, 114, 0.15)',
  },
  ICB: {
    code: 'ICB',
    shortName: 'VietinBank',
    name: 'Công Thương Việt Nam',
    color: '#00478F',
    bgLight: 'rgba(0, 71, 143, 0.15)',
  },
  VIB: {
    code: 'VIB',
    shortName: 'VIB',
    name: 'Quốc Tế Việt Nam',
    color: '#004B87',
    bgLight: 'rgba(0, 75, 135, 0.15)',
  },
  STB: {
    code: 'STB',
    shortName: 'Sacombank',
    name: 'Sài Gòn Thương Tín',
    color: '#004A99',
    bgLight: 'rgba(0, 74, 153, 0.15)',
  },
};

interface BankLogoProps {
  bankId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function BankLogo({
  bankId = 'MB',
  size = 'md',
  showName = false,
  className = '',
}: BankLogoProps) {
  const [imageError, setImageError] = useState(false);
  const normalizedId = (bankId || 'MB').toUpperCase();
  const bank = POPULAR_BANKS[normalizedId] || {
    code: normalizedId,
    shortName: normalizedId,
    name: normalizedId,
    color: '#10B981',
    bgLight: 'rgba(16, 185, 129, 0.15)',
  };

  const sizeDimensions = {
    xs: { width: 18, height: 18, text: 'text-[9px]', px: 'w-4 h-4' },
    sm: { width: 24, height: 24, text: 'text-[10px]', px: 'w-6 h-6' },
    md: { width: 32, height: 32, text: 'text-xs', px: 'w-8 h-8' },
    lg: { width: 44, height: 44, text: 'text-sm', px: 'w-11 h-11' },
  }[size];

  const logoUrl = `https://api.vietqr.io/img/${normalizedId}.png`;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeDimensions.px} rounded-lg bg-white p-0.5 border border-slate-200/20 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden relative`}
        style={{ minWidth: sizeDimensions.width, minHeight: sizeDimensions.height }}
      >
        {!imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={bank.shortName}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <span
            className={`font-black ${sizeDimensions.text} font-mono`}
            style={{ color: bank.color }}
          >
            {bank.code.slice(0, 3)}
          </span>
        )}
      </div>

      {showName && (
        <div className="min-w-0">
          <span className="font-bold text-xs text-white block leading-tight truncate">
            {bank.shortName}
          </span>
          <span className="text-[10px] text-slate-400 block leading-tight truncate">
            {bank.name}
          </span>
        </div>
      )}
    </div>
  );
}
