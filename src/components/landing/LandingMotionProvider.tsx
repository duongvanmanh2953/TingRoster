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
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          smoothWheel: true,
        });

        // Kết nối sự kiện cuộn Lenis tới ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Nguồn nhịp chính xác qua GSAP ticker
        updateTicker = (time: number) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(updateTicker);
        gsap.ticker.lagSmoothing(0);
      }

      // 2. Thanh tiến trình cuộn trang toàn cục (Global Scroll Progress Bar)
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

      // -------------------------------------------------------------
      // KỊCH BẢN 1: HERO SECTION ENTRANCE + SCRUBBED 3D PARALLAX
      // -------------------------------------------------------------
      const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      heroTl
        .from('.hero-ambient-glow', {
          scale: 0.8,
          opacity: 0,
          duration: 1.4,
          ease: 'power2.out',
        })
        .from(
          '.hero-badge',
          {
            y: -16,
            opacity: 0,
            duration: 0.6,
          },
          '-=1.0'
        )
        .from(
          '.hero-title',
          {
            y: 35,
            opacity: 0,
            duration: 0.85,
          },
          '-=0.45'
        )
        .from(
          '.hero-desc',
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          '-=0.55'
        )
        .from(
          '.hero-cta',
          {
            y: 18,
            opacity: 0,
            scale: 0.96,
            duration: 0.6,
          },
          '-=0.45'
        )
        .from(
          '.hero-trust-item',
          {
            y: 16,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
          },
          '-=0.35'
        )
        .from(
          '.hero-image-card',
          {
            y: 45,
            scale: 0.94,
            opacity: 0,
            duration: 1.0,
            ease: 'power3.out',
          },
          '-=0.9'
        )
        .from(
          '.hero-floating-vietqr',
          {
            y: 30,
            scale: 0.88,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.6)',
          },
          '-=0.4'
        )
        .from(
          '.hero-floating-attendance',
          {
            y: -20,
            scale: 0.88,
            opacity: 0,
            duration: 0.7,
            ease: 'back.out(1.5)',
          },
          '-=0.5'
        );

      if (!prefersReducedMotion) {
        // Nhịp thở lơ lửng nhẹ nhàng (Idle Float) cho 2 badge nổi
        gsap.to('.hero-floating-vietqr', {
          y: '-=6',
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5,
        });

        gsap.to('.hero-floating-attendance', {
          y: '+=6',
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.8,
        });

        // DIỄN HOẠT CUỘN CHUỘT (SCRUB) RỜI KHỎI HERO:
        // Khi người dùng cuộn chuột xuống, Hero visual nghiêng 3D và trôi lùi tạo độ sâu
        const heroScrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero-image-card',
            start: 'top 60%',
            end: 'bottom top',
            scrub: 1,
          },
        });

        heroScrollTl
          .to('.hero-image-card', {
            y: 70,
            scale: 0.94,
            ease: 'none',
          }, 0)
          .to('.hero-floating-vietqr', {
            y: -40,
            x: -25,
            scale: 0.9,
            opacity: 0.6,
            ease: 'none',
          }, 0)
          .to('.hero-floating-attendance', {
            y: -50,
            scale: 0.9,
            opacity: 0.6,
            ease: 'none',
          }, 0)
          .to('.hero-ambient-glow', {
            y: 120,
            scale: 1.2,
            opacity: 0.15,
            ease: 'none',
          }, 0);
      }

      // -------------------------------------------------------------
      // KỊCH BẢN 2: PRODUCT SHOWCASE ĐÃ ĐƯỢC PIN TRONG ProductShowcaseSection
      // -------------------------------------------------------------

      // -------------------------------------------------------------
      // KỊCH BẢN 3: PROBLEM VS SOLUTION (SCRUB THEO NHỊP CUỘN CHUỘT)
      // -------------------------------------------------------------
      const compareTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.problem-solution-section',
          start: 'top 80%',
          end: 'bottom 85%',
          scrub: 1,
        },
      });

      compareTl
        .from('.problem-solution-header', {
          y: 25,
          opacity: 0,
          duration: 0.3,
        }, 0)
        // Cực Trái (Nỗi đau thủ công): trượt vào từ mép trái theo độ cuộn
        .fromTo('.problem-card-pain',
          { x: -70, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: 'none' },
          0.1
        )
        .fromTo('.problem-item-pain',
          { x: -25, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.15, duration: 0.5, ease: 'none' },
          0.2
        )
        // Cực Phải (Giải pháp TingRoster): trượt vào từ mép phải theo độ cuộn
        .fromTo('.problem-card-solution',
          { x: 70, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: 'none' },
          0.15
        )
        .fromTo('.problem-item-solution',
          { x: 25, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.15, duration: 0.5, ease: 'none' },
          0.25
        );

      // -------------------------------------------------------------
      // KỊCH BẢN 4: INDUSTRY MODELS (SCRUB KHI VÀO VIEWPORT)
      // -------------------------------------------------------------
      const industryTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.industry-models-section',
          start: 'top 78%',
          end: 'bottom 85%',
          scrub: 0.8,
        },
      });

      industryTl
        .from('.industry-header', {
          y: 30,
          opacity: 0,
          duration: 0.3,
        }, 0)
        .fromTo('.industry-tab-btn',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'none' },
          0.1
        )
        .fromTo('.industry-card',
          { y: 45, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'none' },
          0.25
        );

      // -------------------------------------------------------------
      // KỊCH BẢN 5: CORE FEATURE BENTO GRID (SCRUB STAGGER)
      // -------------------------------------------------------------
      const bentoTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#tinh-nang',
          start: 'top 80%',
          end: 'bottom 85%',
          scrub: 1,
        },
      });

      bentoTl
        .from('.bento-header', {
          y: 30,
          opacity: 0,
          duration: 0.3,
        }, 0)
        .fromTo('.bento-card',
          { y: 50, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 0.8, ease: 'none' },
          0.1
        );

      // -------------------------------------------------------------
      // KỊCH BẢN 6: ROI CALCULATOR
      // -------------------------------------------------------------
      const roiTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#roi-calculator',
          start: 'top 80%',
          end: 'bottom 85%',
          scrub: 0.8,
        },
      });

      roiTl
        .from('.roi-header', {
          y: 30,
          opacity: 0,
          duration: 0.3,
        }, 0)
        .fromTo('.roi-container',
          { y: 45, scale: 0.96, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'none' },
          0.1
        )
        .fromTo('.roi-metric-item',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'none' },
          0.25
        );

      // -------------------------------------------------------------
      // KỊCH BẢN 7: HOW IT WORKS (TIA SÁNG TIẾN TRÌNH VẼ THEO CUỘN)
      // -------------------------------------------------------------
      const howTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.how-it-works-section',
          start: 'top 78%',
          end: 'bottom 80%',
          scrub: 1,
        },
      });

      howTl
        .from('.how-header', {
          y: 25,
          opacity: 0,
          duration: 0.2,
        }, 0)
        // Tia sáng nối ngang giữa 5 bước kéo dài theo độ cuộn chuột
        .fromTo('.how-progress-bar',
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', duration: 1 },
          0.1
        )
        // 5 thẻ bước nhảy sáng lần lượt khi tia sáng chạm tới
        .fromTo('.how-step-card',
          { y: 35, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.18, duration: 0.7, ease: 'none' },
          0.1
        );

      // -------------------------------------------------------------
      // KỊCH BẢN 8: TRANSPARENT PRICING CARDS
      // -------------------------------------------------------------
      const pricingTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#bang-gia',
          start: 'top 78%',
          end: 'bottom 85%',
          scrub: 0.8,
        },
      });

      pricingTl
        .from('.pricing-header', {
          y: 25,
          opacity: 0,
          duration: 0.2,
        }, 0)
        .fromTo('.pricing-card',
          { y: 45, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 0.6, ease: 'none' },
          0.1
        );

      // -------------------------------------------------------------
      // KỊCH BẢN 9: TRUST & VERIFIED FAQ ACCORDION
      // -------------------------------------------------------------
      const faqTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.trust-faq-section',
          start: 'top 80%',
          end: 'bottom 85%',
          scrub: 0.8,
        },
      });

      faqTl
        .from('.faq-header', {
          y: 25,
          opacity: 0,
          duration: 0.2,
        }, 0)
        .fromTo('.faq-item',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'none' },
          0.1
        );

      // -------------------------------------------------------------
      // KỊCH BẢN 10: FINAL CINEMATIC CTA SECTION (CỰC QUANG NỞ RỘNG KHI CUỘN)
      // -------------------------------------------------------------
      const finalCtaTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.final-cta-section',
          start: 'top 85%',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      finalCtaTl
        .fromTo('.final-cta-card',
          { scale: 0.92, y: 50, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'none' },
          0
        )
        .fromTo('.final-cta-glow',
          { scale: 0.7, opacity: 0.1 },
          { scale: 1.4, opacity: 0.55, duration: 0.8, ease: 'none' },
          0.1
        )
        .fromTo('.final-cta-badge',
          { y: -10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'none' },
          0.2
        )
        .fromTo('.final-cta-title',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'none' },
          0.25
        )
        .fromTo('.final-cta-desc',
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'none' },
          0.3
        )
        .fromTo('.final-cta-buttons',
          { y: 15, scale: 0.95, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'none' },
          0.35
        );

      // Làm mới lại tính toán vị trí của ScrollTrigger sau khi render
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);

      // Cleanup function cho ticker và timeout
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
