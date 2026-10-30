'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Lenis from 'lenis';

interface LandingMotionProviderProps {
  children: React.ReactNode;
}

export function LandingMotionProvider({ children }: LandingMotionProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let updateTicker: ((time: number) => void) | null = null;

    if (!prefersReducedMotion) {
      // 1. Initialize Lenis Smooth Scroll with Butter-Smooth Inertia
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      // Connect Lenis scroll events to ScrollTrigger updates
      lenis.on('scroll', ScrollTrigger.update);

      // Single source of truth for animation loop: GSAP Ticker
      updateTicker = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      // 2. Global Scroll Progress Bar
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2,
          },
        });
      }

      // 3. Hero Elements Entrance
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-headline', {
        y: 32,
        opacity: 0,
        duration: 0.9,
      })
        .from(
          '.hero-subtext',
          {
            y: 20,
            opacity: 0,
            duration: 0.75,
          },
          '-=0.6'
        )
        .from(
          '.hero-cta-buttons',
          {
            y: 16,
            opacity: 0,
            duration: 0.65,
          },
          '-=0.5'
        )
        .from(
          '.hero-operational-console',
          {
            y: 36,
            opacity: 0,
            duration: 0.95,
          },
          '-=0.5'
        );

      if (!prefersReducedMotion) {
        // 4. Parallax depth on Hero Console while scrolling
        gsap.to('.hero-operational-console', {
          y: 45,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-operational-console',
            start: 'top 60%',
            end: 'bottom top',
            scrub: 1,
          },
        });

        // 5. ScrollTrigger Stagger Entrances for Major Sections
        const revealSections = containerRef.current?.querySelectorAll<HTMLElement>('.scroll-reveal');
        revealSections?.forEach((sec) => {
          gsap.fromTo(
            sec,
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        // 6. Stagger Cards Animation (Customer stories, feature items, metrics)
        const cardGroups = containerRef.current?.querySelectorAll<HTMLElement>('.stagger-cards');
        cardGroups?.forEach((group) => {
          const children = group.children;
          if (children.length > 0) {
            gsap.fromTo(
              Array.from(children),
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: group,
                  start: 'top 82%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }
        });
      }

      // Ensure ScrollTrigger measures proper layout after assets initialize
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
    }, containerRef);

    return () => {
      if (updateTicker) {
        gsap.ticker.remove(updateTicker);
      }
      lenis?.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Scroll Progress Bar */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-1 bg-[#2538D9] z-[9999] origin-left scale-x-0 pointer-events-none"
      />
      {children}
    </div>
  );
}
