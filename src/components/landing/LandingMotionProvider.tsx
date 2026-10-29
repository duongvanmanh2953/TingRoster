'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import AOS from 'aos';
import 'aos/dist/aos.css';
import gsap from 'gsap';

interface LandingMotionProviderProps {
  children: React.ReactNode;
}

export function LandingMotionProvider({ children }: LandingMotionProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Initialize Lenis Smooth Scroll (skipped if reduced motion)
    let lenis: Lenis | null = null;
    let rafId: number;

    if (!prefersReducedMotion) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    // 2. Initialize AOS (Animate on Scroll)
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      disable: prefersReducedMotion,
    });

    // 3. GSAP Hero Timeline
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate Hero Elements smoothly without blocking interaction
      tl.from('.hero-badge', {
        y: -15,
        opacity: 0,
        duration: 0.5,
      })
        .from(
          '.hero-headline',
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.3'
        )
        .from(
          '.hero-subtext',
          {
            y: 15,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-cta-buttons',
          {
            y: 12,
            opacity: 0,
            duration: 0.4,
          },
          '-=0.2'
        )
        .from(
          '.hero-device-suite',
          {
            y: 35,
            opacity: 0,
            scale: 0.98,
            duration: 0.7,
          },
          '-=0.3'
        );
    }, containerRef);

    return () => {
      if (lenis) {
        cancelAnimationFrame(rafId);
        lenis.destroy();
      }
      ctx.revert();
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
