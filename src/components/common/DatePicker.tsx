'use client';

import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { Calendar } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useTheme } from '@/components/theme/ThemeContext';

export interface TingDatePickerProps {
  label?: string;
  value?: string | Date | null;
  onChange?: (dateString: string, date: Date | null) => void;
  placeholder?: string;
  sizeVariant?: 'sm' | 'md';
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  containerClassName?: string;
  formatPattern?: string;
}

export function TingDatePicker({
  label,
  value,
  onChange,
  placeholder = 'Chọn ngày',
  sizeVariant = 'sm',
  error,
  disabled = false,
  minDate,
  maxDate,
  className = '',
  containerClassName = '',
  formatPattern = 'dd/MM/yyyy',
}: TingDatePickerProps) {
  const { isDark } = useTheme();
  const isSm = sizeVariant === 'sm';

  // Parse string or Date
  const parsedValue: Date | null = React.useMemo(() => {
    if (!value) return null;
    if (value instanceof Date) return isValid(value) ? value : null;
    try {
      const d = parseISO(value);
      return isValid(d) ? d : null;
    } catch {
      return null;
    }
  }, [value]);

  const handleChange = (newDate: Date | null) => {
    if (!onChange) return;
    if (newDate && isValid(newDate)) {
      const dateString = format(newDate, 'yyyy-MM-dd');
      onChange(dateString, newDate);
    } else {
      onChange('', null);
    }
  };

  return (
    <div className={`relative inline-flex flex-col ${containerClassName}`}>
      {label && (
        <label className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5 flex items-center gap-1">
          {label}
        </label>
      )}

      <MuiDatePicker
        value={parsedValue}
        onChange={handleChange}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        format={formatPattern}
        slots={{
          openPickerIcon: () => <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />,
        }}
        slotProps={{
          textField: {
            size: isSm ? 'small' : 'medium',
            error: !!error,
            className,
            sx: {
              '& .MuiOutlinedInput-root': {
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
                '& .MuiInputBase-input': {
                  padding: isSm ? '8px 12px' : '10px 14px',
                  color: isDark ? '#F8FAFC' : '#101828',
                },
              },
            },
          },
          popper: {
            sx: {
              '& .MuiPaper-root': {
                borderRadius: '0.75rem',
                border: isDark ? '1px solid #1E293B' : '1px solid #E4E7EC',
                backgroundColor: isDark ? '#111726' : '#FFFFFF',
                color: isDark ? '#F8FAFC' : '#101828',
                boxShadow: isDark
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                '& .MuiPickersCalendarHeader-root': {
                  color: isDark ? '#F8FAFC' : '#101828',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  color: isDark ? '#94A3B8' : '#64748B',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                },
                '& .MuiPickersDay-root': {
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: isDark ? '#F8FAFC' : '#101828',
                  borderRadius: '0.5rem',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#2538D9 !important',
                    color: '#FFFFFF !important',
                    fontWeight: 700,
                    '&:hover': {
                      backgroundColor: '#1E2DB8 !important',
                    },
                  },
                  '&.MuiPickersDay-today': {
                    borderColor: '#2538D9',
                    borderWidth: '1.5px',
                  },
                },
              },
            },
          },
        }}
      />

      {error && <p className="text-xs font-medium text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
