'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

// Đăng ký plugins chính thức của GSAP
gsap.registerPlugin(ScrollTrigger, useGSAP);

interface LandingMotionProviderProps {
  children: React.ReactNode;
}

export function LandingMotionProvider({ children }: LandingMotionProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Cấu hình Smooth Scrolling (Lenis) tích hợp đồng bộ GSAP Ticker
      let lenis: Lenis | null = null;
      let updateTicker: ((time: number) => void) | null = null;

      if (!prefersReducedMotion) {
        lenis = new Lenis({
          duration: 1.0,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);

        updateTicker = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);
      }

      // 2. Thanh tiến trình cuộn trang bám mép trên
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.15,
          },
        });
      }

      // -------------------------------------------------------------
      // KỊCH BẢN 1: HERO SECTION - MỞ MÀN HIỂN THỊ RÕ NÉT NGAY
      // -------------------------------------------------------------
      const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      heroTl
        .from('.hero-ambient-glow', {
          scale: 0.85,
          opacity: 0,
          duration: 1.0,
        })
        .from(
          '.hero-badge',
          {
            y: -12,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.7'
        )
        .from(
          '.hero-title',
          {
            y: 25,
            opacity: 0,
            duration: 0.65,
          },
          '-=0.4'
        )
        .from(
          '.hero-desc',
          {
            y: 15,
            opacity: 0,
            duration: 0.55,
          },
          '-=0.45'
        )
        .from(
          '.hero-cta',
          {
            y: 12,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.35'
        )
        .from(
          '.hero-trust-item',
          {
            y: 10,
            opacity: 0,
            stagger: 0.08,
            duration: 0.45,
          },
          '-=0.3'
        )
        .from(
          '.hero-image-card',
          {
            y: 30,
            scale: 0.96,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.7'
        )
        .from(
          '.hero-floating-vietqr',
          {
            y: 20,
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(1.5)',
          },
          '-=0.4'
        )
        .from(
          '.hero-floating-attendance',
          {
            y: -15,
            scale: 0.9,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.4)',
          },
          '-=0.4'
        );

      if (!prefersReducedMotion) {
        // Nhịp thở lơ lửng nhẹ nhàng cho 2 badge nổi
        gsap.to('.hero-floating-vietqr', {
          y: '-=6',
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.2,
        });

        gsap.to('.hero-floating-attendance', {
          y: '+=6',
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5,
        });
      }

      // -------------------------------------------------------------
      // KỊCH BẢN 2: PRODUCT SHOWCASE ĐƯỢC QUẢN LÝ BẰNG PINNED TIMELINE RIÊNG
      // (ĐÃ CÓ TRONG ProductShowcaseSection.tsx)
      // -------------------------------------------------------------

      // -------------------------------------------------------------
      // QUY TẮC HIỂN THỊ TỨC THÌ (FAST VIEWPORT ENTRANCE):
      // Khi người dùng cuộn đến đâu, các section lập tức đạt 100% hiển thị
      // hoàn chỉnh ngay tại mép dưới (start: 'top 88%'), không bị trễ mờ!
      // -------------------------------------------------------------

      // KỊCH BẢN 3: PROBLEM VS SOLUTION (SO SÁNH 2 CỰC)
      gsap.fromTo(
        '.problem-solution-header',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.problem-solution-section',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        ['.problem-card-pain', '.problem-card-solution'],
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.problem-solution-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        ['.problem-item-pain', '.problem-item-solution'],
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.problem-solution-section',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // KỊCH BẢN 4: INDUSTRY MODELS (ĐA KHÔNG GIAN)
      gsap.fromTo(
        '.industry-header',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.industry-models-section',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.industry-tab-btn',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.45,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.industry-models-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.industry-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.industry-models-section',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // KỊCH BẢN 5: CORE FEATURE BENTO GRID (HIỂN THỊ ĐẦY ĐỦ NGAY)
      gsap.fromTo(
        '.bento-header',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#tinh-nang',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.bento-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#tinh-nang',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // KỊCH BẢN 6: ROI CALCULATOR
      gsap.fromTo(
        '.roi-header',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#roi-calculator',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.roi-container',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#roi-calculator',
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        }
      );

      // KỊCH BẢN 7: HOW IT WORKS (5 BƯỚC XUẤT HIỆN SẴN SÀNG)
      gsap.fromTo(
        '.how-header',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.how-it-works-section',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.how-progress-bar',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.how-steps-grid',
            start: 'top 86%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.how-step-card',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.how-steps-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // KỊCH BẢN 8: TRANSPARENT PRICING
      gsap.fromTo(
        '.pricing-header',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#bang-gia',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.pricing-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#bang-gia',
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        }
      );

      // KỊCH BẢN 9: TRUST & FAQ ACCORDION
      gsap.fromTo(
        '.faq-header',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.trust-faq-section',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.faq-item',
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.45,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.trust-faq-section',
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        }
      );

      // KỊCH BẢN 10: FINAL CINEMATIC CTA SECTION
      gsap.fromTo(
        '.final-cta-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.final-cta-section',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Tự động làm mới ScrollTrigger sau khi render
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);

      return () => {
        clearTimeout(refreshTimer);
        if (updateTicker) {
          gsap.ticker.remove(updateTicker);
        }
        lenis?.destroy();
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Thanh tiến trình cuộn trang siêu mượt */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2538D9] via-[#6D5CE8] to-[#4F62FF] z-[9999] origin-left scale-x-0 pointer-events-none"
      />
      {children}
    </div>
  );
}
