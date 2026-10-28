'use client';

import React from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useLanguage, type Locale } from './LanguageContext';
import { useTheme } from '@/components/theme/ThemeContext';

export interface LanguageSwitchProps {
  variant?: 'select' | 'compact' | 'pill' | 'icon';
  className?: string;
}

export function LanguageSwitch({ variant = 'select', className = '' }: LanguageSwitchProps) {
  const { locale, setLocale } = useLanguage();
  const { isDark } = useTheme();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLocale(event.target.value as Locale);
  };

  const isCompact = variant === 'compact' || variant === 'icon';

  return (
    <FormControl size="small" className={className}>
      <Select
        value={locale}
        onChange={handleChange}
        displayEmpty
        aria-label="Chọn ngôn ngữ / Select language"
        renderValue={(selected) => (
          <div className="flex items-center gap-1.5 leading-none select-none">
            {!isCompact && (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline leading-none">
                {selected === 'vi' ? 'Tiếng Việt' : 'English'}
              </span>
            )}
          </div>
        )}
        sx={{
          height: 36,
          bgcolor: isDark ? '#111726' : '#FFFFFF',
          color: isDark ? '#F8FAFC' : '#101828',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: '0.5rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? '#1E293B' : '#E4E7EC',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? '#334155' : '#CBD5E1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2538D9',
            borderWidth: '1.5px',
          },
          '& .MuiSelect-select': {
            py: '6px',
            px: '10px',
            pr: '26px !important',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiSvgIcon-root': {
            color: isDark ? '#94A3B8' : '#64748B',
            right: '4px',
            fontSize: '1.1rem',
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                bgcolor: isDark ? '#111726' : '#FFFFFF',
                border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  py: 1,
                  px: 1.5,
                  gap: 1.5,
                  '&:hover': {
                    bgcolor: isDark ? '#1E293B' : '#F1F5F9',
                  },
                  '&.Mui-selected': {
                    bgcolor: isDark ? '#1E293B' : '#EFF6FF',
                    color: '#2538D9',
                    fontWeight: 700,
                  },
                },
              },
            },
          },
        }}
      >
        <MenuItem value="vi">
          <span>Tiếng Việt</span>
        </MenuItem>
        <MenuItem value="en">
          <span>English</span>
        </MenuItem>
      </Select>
    </FormControl>
  );
}
