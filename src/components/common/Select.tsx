'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface TingSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: TingSelectOption[];
  icon?: React.ReactNode;
  sizeVariant?: 'sm' | 'md';
  error?: string;
  containerClassName?: string;
}

export const TingSelect = forwardRef<HTMLSelectElement, TingSelectProps>(
  (
    {
      label,
      options,
      children,
      icon,
      sizeVariant = 'sm',
      error,
      className = '',
      containerClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isSm = sizeVariant === 'sm';

    return (
      <div className={`relative inline-flex flex-col ${containerClassName}`}>
        {label && (
          <label className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5 flex items-center gap-1">
            {label}
            {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative inline-flex items-center w-full">
          {icon && (
            <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            disabled={disabled}
            className={`
              w-full appearance-none rounded-lg font-medium transition-all
              bg-white dark:bg-[#111726] 
              border text-[#101828] dark:text-[#F8FAFC]
              ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-[#E4E7EC] dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#2538D9] focus:ring-[#2538D9]/20'}
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isSm ? 'h-9 text-xs pl-3 pr-8' : 'h-10 text-xs sm:text-sm pl-3.5 pr-9'}
              ${icon ? (isSm ? 'pl-8' : 'pl-9') : ''}
              ${className}
            `}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-white dark:bg-[#111726] text-[#101828] dark:text-[#F8FAFC] py-1.5"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-2.5 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>

        {error && (
          <p className="text-[11px] font-medium text-rose-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

TingSelect.displayName = 'TingSelect';
