'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LandingMotionProviderProps {
  children: React.ReactNode;
}

export function LandingMotionProvider({ children }: LandingMotionProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Elements Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-headline', {
        y: 24,
        opacity: 0,
        duration: 0.7,
      })
        .from(
          '.hero-subtext',
          {
            y: 16,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          '.hero-cta-buttons',
          {
            y: 12,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-operational-console',
          {
            y: 28,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.4'
        );

      // 2. Staggered Entrance for Key Section Elements across the page
      const interactiveControls = containerRef.current?.querySelectorAll(
        'h2, section, .scroll-reveal, .motion-step, .motion-card'
      );

      if (interactiveControls && interactiveControls.length > 0) {
        gsap.from(Array.from(interactiveControls), {
          y: 16,
          opacity: 0.85,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power2.out',
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return <div ref={containerRef} className="w-full">{children}</div>;
}
