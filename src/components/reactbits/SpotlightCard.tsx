'use client';

import React from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * Standard Surface Card with refined border and subtle elevation.
 * Replaces ReactBits cursor glare with clean, professional SaaS surface styling.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor,
  ...props
}: SpotlightCardProps) {
  return (
    <div
      className={`relative rounded-xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 transition-all ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
