'use client';

import React from 'react';

interface TiltedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
}

export function TiltedCard({
  children,
  className = '',
  maxTilt,
  perspective,
  ...props
}: TiltedCardProps) {
  return (
    <div
      className={`relative rounded-xl transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
