'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface SmartBackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
  variant?: 'ghost' | 'tinted' | 'white';
}

/**
 * SmartBackButton provides resilient navigation:
 * Checks if user came from inside the application on the same origin.
 * If yes, calls router.back(); if direct URL or external origin, safely falls back to fallbackUrl.
 */
export function SmartBackButton({
  fallbackUrl = '/dashboard',
  label = 'Quay lại',
  className = '',
  variant = 'tinted',
}: SmartBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      const isInternal = referrer && referrer.startsWith(window.location.origin);
      // If there's internal history length > 1 and referrer from same origin
      if (isInternal && window.history.length > 1) {
        router.back();
        return;
      }
    }
    router.push(fallbackUrl);
  };

  const variantStyles = {
    tinted: 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
    white: 'bg-white hover:bg-slate-50 text-slate-800 shadow-xs border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 ${variantStyles} ${className}`}
      aria-label={label}
      title={label}
    >
      <div className="w-5 h-5 rounded-lg bg-white/80 dark:bg-slate-900/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
        <ArrowLeft className="w-3.5 h-3.5" />
      </div>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
