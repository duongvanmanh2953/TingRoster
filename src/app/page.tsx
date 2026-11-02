import React from 'react';
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
  return (
    <LandingMotionProvider>
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B0F19] text-[#101828] dark:text-[#F8FAFC] antialiased selection:bg-[#2538D9] selection:text-white transition-colors">
        {/* SECTION 00: Navigation Header */}
        <LandingHeader />

        {/* SECTION 01: Hero with High-End Lifestyle Visual */}
        <HeroSection />

        {/* SECTION 02: Product in Action (Multi-Device Laptop & Smartphone) */}
        <ProductShowcaseSection />

        {/* SECTION 03: Problem vs Solution Storytelling */}
        <ProblemSolutionSection />

        {/* SECTION 04: One Platform, Multiple Industry Spaces */}
        <IndustryModelsSection />

        {/* SECTION 05: Core Feature Bento Grid */}
        <FeatureBentoSection />

        {/* SECTION 06: Operational ROI & Recovery Calculator */}
        <RoiCalculatorSection />

        {/* SECTION 07: Step-by-Step How It Works */}
        <HowItWorksSection />

        {/* SECTION 08: Transparent Pricing */}
        <PricingSection />

        {/* SECTION 09: Trust & Verified FAQ */}
        <TrustFaqSection />

        {/* SECTION 10: Final Cinematic CTA */}
        <FinalCtaSection />

        {/* SECTION 11: Footer */}
        <LandingFooter />
      </div>
    </LandingMotionProvider>
  );
}
