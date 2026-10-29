'use client';

import React, { useState } from 'react';
import {
  Users2,
  CalendarCheck,
  Receipt,
  GraduationCap,
  Trophy,
  Building2,
  Layers,
  Sparkles
} from 'lucide-react';
import { parseEnabledModules } from '@/lib/spaces/constants';

interface SpaceAvatarProps {
  name: string;
  logoUrl?: string | null;
  themeColor?: string | null;
  enabledModules?: string | null;
  groupType?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SpaceAvatar({
  name,
  logoUrl,
  themeColor = '#2538D9',
  enabledModules,
  groupType,
  size = 'md',
  className = '',
}: SpaceAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 rounded-md text-[10px]',
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-14 h-14 rounded-2xl text-base',
    xl: 'w-20 h-20 rounded-3xl text-xl font-black',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }[size];

  // Primary: Custom uploaded logo with clean contain fit
  if (logoUrl && !imgError) {
    return (
      <div
        className={`relative flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-2xs overflow-hidden select-none ${sizeClasses} ${className}`}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback 1: Derive icon based on type or enabled modules
  const modules = parseEnabledModules(enabledModules);
  const color = themeColor || '#2538D9';

  // Get Initials (up to 2 letters)
  const getInitials = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  // Pick semantic icon if appropriate
  let ModuleIcon = Layers;
  if (groupType === 'CLASS' || modules.includes('attendance') && modules.includes('members')) {
    ModuleIcon = GraduationCap;
  } else if (groupType === 'SPORTS_CLUB') {
    ModuleIcon = Trophy;
  } else if (groupType === 'RENTAL') {
    ModuleIcon = Building2;
  } else if (modules.includes('invoices') && !modules.includes('attendance')) {
    ModuleIcon = Receipt;
  } else if (modules.includes('attendance')) {
    ModuleIcon = CalendarCheck;
  } else if (modules.includes('members')) {
    ModuleIcon = Users2;
  }

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 font-bold select-none text-white shadow-2xs transition-transform ${sizeClasses} ${className}`}
      style={{
        backgroundColor: color,
        boxShadow: `0 4px 14px 0 ${color}25`,
      }}
      title={name}
    >
      {/* Show initials for smaller/avatar sizes if preferred, or the domain icon */}
      {size === 'xl' || size === 'lg' ? (
        <div className="flex flex-col items-center justify-center">
          <ModuleIcon className={iconSizes} />
        </div>
      ) : (
        <span className="font-extrabold tracking-tight font-mono">{initials}</span>
      )}
    </div>
  );
}
