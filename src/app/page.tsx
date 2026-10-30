'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingMotionProvider } from '@/components/landing/LandingMotionProvider';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection';
import { ProblemSolutionSection } from '@/components/landing/ProblemSolutionSection';
import { IndustryModelsSection } from '@/components/landing/IndustryModelsSection';
import { FeatureBentoSection } from '@/components/landing/FeatureBentoSection';
import { RoiCalculatorSection } from '@/components/landing/RoiCalculatorSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TrustFaqSection } from '@/components/landing/TrustFaqSection';
import { FinalCtaSection } from '@/components/landing/FinalCtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function HomePage() {
  const router = useRouter();
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  // 1-Click Demo Instant Login Handler
  const handleInstantDemoLogin = async () => {
    setIsDemoLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@tingroster.vn', password: '123456' }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  return (
    <LandingMotionProvider>
      <div className="min-h-[100dvh] bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F8FAFC] antialiased selection:bg-[#2538D9] selection:text-white transition-colors">
        {/* SECTION 00: Navigation Header */}
        <LandingHeader onInstantDemo={handleInstantDemoLogin} isDemoLoggingIn={isDemoLoggingIn} />

        {/* SECTION 01: Cinematic Hero with 3D Interactive Console */}
        <HeroSection onInstantDemo={handleInstantDemoLogin} isDemoLoggingIn={isDemoLoggingIn} />

        {/* SECTION 02: Product Showcase (3D Dual Devices: Laptop & Floating Smartphone) */}
        <ProductShowcaseSection />

        {/* SECTION 03: Pain Points / Problem to Solution */}
        <ProblemSolutionSection />

        {/* SECTION 04: One Platform, Multiple Models */}
        <IndustryModelsSection />

        {/* SECTION 05: Feature Bento Grid */}
        <FeatureBentoSection />

        {/* SECTION 06: Operational Efficiency Calculator */}
        <RoiCalculatorSection onInstantDemo={handleInstantDemoLogin} isDemoLoggingIn={isDemoLoggingIn} />

        {/* SECTION 07: How It Works */}
        <HowItWorksSection />

        {/* SECTION 08: Pricing with React Bits SpotlightCards */}
        <PricingSection onInstantDemo={handleInstantDemoLogin} />

        {/* SECTION 09: Trust & FAQ */}
        <TrustFaqSection />

        {/* SECTION 10: Final Cinematic CTA */}
        <FinalCtaSection onInstantDemo={handleInstantDemoLogin} isDemoLoggingIn={isDemoLoggingIn} />

        {/* SECTION 11: Footer */}
        <LandingFooter />
      </div>
    </LandingMotionProvider>
  );
}
