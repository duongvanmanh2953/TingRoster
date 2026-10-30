'use client';

import React from 'react';

interface AmbientGlowProps {
  className?: string;
  color?: string;
  size?: number;
}

/**
 * React Bits — AmbientGlow
 * Layered atmospheric ambient backdrops for 3D devices and hero elements.
 */
export function AmbientGlow({
  className = '',
  color = 'rgba(37, 56, 217, 0.18)',
  size = 500,
}: AmbientGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -z-10 rounded-full blur-3xl opacity-70 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, rgba(37, 56, 217, 0) 70%)`, /* taste-skill-ignore: reactbits-ambient-glow */
      }}
    />
  );
}
