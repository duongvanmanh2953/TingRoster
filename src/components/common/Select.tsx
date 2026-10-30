'use client';

import React, { forwardRef } from 'react';
import {
  FormControl,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeContext';

export interface TingSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TingSelectProps {
  label?: string;
  value?: string | number;
  defaultValue?: string | number;
  options?: TingSelectOption[];
  children?: React.ReactNode;
  icon?: React.ReactNode;
  sizeVariant?: 'sm' | 'md';
  size?: 'small' | 'medium';
  error?: string;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TingSelect = forwardRef<HTMLDivElement, TingSelectProps>(
  (
    {
      label,
      value,
      defaultValue,
      options,
      children,
      icon,
      sizeVariant,
      size = 'small',
      error,
      className = '',
      containerClassName = '',
      disabled = false,
      name,
      required = false,
      placeholder,
      fullWidth = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const { isDark } = useTheme();
    const isSm = sizeVariant ? sizeVariant === 'sm' : size === 'small';

    const handleChange = (e: SelectChangeEvent<unknown>) => {
      if (onChange) {
        const syntheticEvent = {
          target: {
            value: String(e.target.value),
            name: e.target.name || name,
          },
          currentTarget: {
            value: String(e.target.value),
            name: e.target.name || name,
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={`relative inline-flex flex-col ${containerClassName} ${fullWidth ? 'w-full' : ''}`} ref={ref}>
        {label && (
          <label className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5 flex items-center gap-1">
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <FormControl
          size={isSm ? 'small' : 'medium'}
          error={!!error}
          disabled={disabled}
          fullWidth={fullWidth}
          className={className}
        >
          <MuiSelect
            value={value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''}
            onChange={(e: any) => handleChange(e)}
            name={name}
            displayEmpty={!!placeholder}
            IconComponent={() => (
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none mr-2.5" />
            )}
            startAdornment={
              icon ? (
                <InputAdornment position="start" sx={{ ml: 1, mr: -0.5 }}>
                  <span className="text-slate-400 dark:text-slate-500 flex items-center justify-center">
                    {icon}
                  </span>
                </InputAdornment>
              ) : null
            }
            sx={{
              height: isSm ? 38 : 44,
              fontSize: isSm ? '0.8125rem' : '0.875rem',
              fontWeight: 500,
              backgroundColor: isDark ? '#111726' : '#FFFFFF',
              color: isDark ? '#F8FAFC' : '#101828',
              borderRadius: '0.625rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: error
                  ? '#F43F5E'
                  : isDark
                  ? '#1E293B'
                  : '#E4E7EC',
                borderWidth: '1.5px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: error
                  ? '#F43F5E'
                  : isDark
                  ? '#334155'
                  : '#CBD5E1',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2538D9 !important',
                borderWidth: '2px',
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(37, 56, 217, 0.15)',
              },
              '& .MuiSelect-select': {
                paddingTop: isSm ? '8px' : '10px',
                paddingBottom: isSm ? '8px' : '10px',
                paddingLeft: icon ? '8px' : '12px',
                paddingRight: '32px !important',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              },
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    borderRadius: '0.75rem',
                    border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
                    backgroundColor: isDark ? '#111726' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#101828',
                    boxShadow: isDark
                      ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                      : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    mt: 0.5,
                    maxHeight: 280,
                    '& .MuiList-root': {
                      padding: '4px',
                    },
                    '& .MuiMenuItem-root': {
                      borderRadius: '0.5rem',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      padding: '8px 12px',
                      margin: '2px 0',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#F1F5F9',
                      },
                      '&.Mui-selected': {
                        backgroundColor: isDark
                          ? 'rgba(37, 56, 217, 0.25)'
                          : 'rgba(37, 56, 217, 0.08)',
                        color: isDark ? '#60A5FA' : '#2538D9',
                        fontWeight: 700,
                        '&:hover': {
                          backgroundColor: isDark
                            ? 'rgba(37, 56, 217, 0.35)'
                            : 'rgba(37, 56, 217, 0.14)',
                        },
                      },
                    },
                  },
                },
              },
            }}
            {...props}
          >
            {placeholder && (
              <MenuItem value="" disabled sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                {placeholder}
              </MenuItem>
            )}

            {options
              ? options.map((opt: TingSelectOption) => (
                  <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.icon && <span className="mr-2 inline-flex items-center">{opt.icon}</span>}
                    {opt.label}
                  </MenuItem>
                ))
              : children}
          </MuiSelect>
        </FormControl>

        {error && (
          <FormHelperText error sx={{ fontSize: '0.75rem', fontWeight: 500, mt: 0.5 }}>
            {error}
          </FormHelperText>
        )}
      </div>
    );
  }
);

TingSelect.displayName = 'TingSelect';
