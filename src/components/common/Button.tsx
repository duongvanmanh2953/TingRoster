'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md' | 'icon-lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  target?: string;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#2538D9] hover:bg-[#1E2DB8] active:bg-[#19249E] text-white border border-transparent shadow-xs focus-visible:ring-[#2538D9]',
  secondary:
    'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 text-slate-900 dark:text-slate-100 border border-transparent focus-visible:ring-slate-400',
  outline:
    'bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/80 active:bg-slate-100 dark:active:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs focus-visible:ring-slate-400',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 active:bg-slate-200 dark:active:bg-slate-700 text-slate-700 dark:text-slate-300 border border-transparent focus-visible:ring-slate-400',
  destructive:
    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white border border-transparent shadow-xs focus-visible:ring-rose-500',
  link:
    'bg-transparent text-[#2538D9] dark:text-indigo-400 hover:underline active:text-[#1E2DB8] p-0 border border-transparent shadow-none focus-visible:ring-[#2538D9]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 min-w-[32px]',
  md: 'h-10 px-4 text-sm font-semibold rounded-xl gap-2 min-w-[40px]',
  lg: 'h-12 px-5 text-base font-bold rounded-xl gap-2.5 min-w-[48px]',
  'icon-sm': 'w-8 h-8 p-0 rounded-lg flex items-center justify-center min-w-[32px]',
  'icon-md': 'w-10 h-10 p-0 rounded-xl flex items-center justify-center min-w-[40px] sm:min-w-[40px] min-h-[40px]',
  'icon-lg': 'w-12 h-12 p-0 rounded-xl flex items-center justify-center min-w-[48px] min-h-[48px]',
};

export const TingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      href,
      target,
      fullWidth = false,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap select-none transition-all duration-150 ease-in-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed touch-manipulation active:scale-[0.98]';

    const combinedClasses = [
      baseClasses,
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="shrink-0 flex items-center text-current">{leftIcon}</span>
        )}
        {children && <span className="truncate">{children}</span>}
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center text-current">{rightIcon}</span>
        )}
      </>
    );

    if (href && !disabled && !isLoading) {
      return (
        <Link href={href} target={target} className={combinedClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

TingButton.displayName = 'TingButton';
