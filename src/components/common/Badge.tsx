'use client';

import React from 'react';
import Badge, { BadgeProps } from '@mui/material/Badge';
import Chip, { ChipProps } from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

// Pulse Dot Badge (for live indicators like VietQR Auto, Webhook listening, etc.)
export const TingPulseBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#10B981',
    color: '#10B981',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.4s infinite ease-in-out',
      border: '1.5px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(0.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

export interface TingBadgeProps extends BadgeProps {
  pulse?: boolean;
}

export function TingBadge({ pulse, children, ...props }: TingBadgeProps) {
  if (pulse) {
    return (
      <TingPulseBadge variant="dot" {...props}>
        {children}
      </TingPulseBadge>
    );
  }
  return <Badge {...props}>{children}</Badge>;
}

// Financial and Operational Status configuration conforming to AGENTS.md
export type StatusType =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERPAID'
  | 'VOID'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'OVERDUE'
  | 'PROCESSING'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PRESENT'
  | 'ABSENT'
  | 'EXCUSED'
  | 'LATE';

const STATUS_CONFIG: Record<
  StatusType,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  ACTIVE: {
    label: 'Đang hoạt động',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  INACTIVE: {
    label: 'Ngừng hoạt động',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  UNPAID: {
    label: 'Chưa đóng',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  PARTIAL: {
    label: 'Đóng thiếu',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  PAID: {
    label: 'Đã đóng đủ',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  OVERDUE: {
    label: 'Quá hạn',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300 font-bold',
    border: 'border-rose-300 dark:border-rose-800',
    dot: 'bg-rose-600 animate-pulse',
  },
  OVERPAID: {
    label: 'Đóng thừa',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
  },
  VOID: {
    label: 'Đã hủy',
    bg: 'bg-slate-50 dark:bg-slate-900',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  CANCELLED: {
    label: 'Đã hủy bỏ',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  PENDING: {
    label: 'Chờ duyệt',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  PROCESSING: {
    label: 'Đang xử lý',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500 animate-pulse',
  },
  EXPIRED: {
    label: 'Hết hạn',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-500',
  },
  SUCCESS: {
    label: 'Thành công',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    label: 'Thất bại',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  PRESENT: {
    label: 'Có mặt',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  ABSENT: {
    label: 'Vắng mặt',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
  EXCUSED: {
    label: 'Có phép',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
  },
  LATE: {
    label: 'Đi muộn',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
};

export interface TingStatusChipProps {
  status: StatusType | string;
  label?: string;
  size?: 'small' | 'medium';
  showDot?: boolean;
  className?: string;
}

export function TingStatusChip({
  status,
  label,
  size = 'small',
  showDot = true,
  className = '',
}: TingStatusChipProps) {
  const config = STATUS_CONFIG[status as StatusType] || {
    label: label || status,
    bg: 'bg-slate-50 dark:bg-slate-900',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  };

  const displayLabel = label || config.label;

  return (
    <Chip
      size={size}
      variant="outlined"
      label={
        <span className="flex items-center gap-1.5 font-bold tracking-tight">
          {showDot && (
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
          )}
          <span>{displayLabel}</span>
        </span>
      }
      className={`border ${config.bg} ${config.text} ${config.border} ${className}`}
      sx={{
        height: size === 'small' ? '22px' : '28px',
        borderWidth: '1px',
        '& .MuiChip-label': {
          paddingLeft: '8px',
          paddingRight: '8px',
          fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
        },
      }}
    />
  );
}

// Simple helper for general tags (e.g. "Hôm nay", "Auto", "PRO", "VietQR Napas")
export interface TingTagProps extends ChipProps {
  variantStyle?: 'brand' | 'success' | 'warning' | 'info' | 'neutral';
}

export function TingTag({
  variantStyle = 'neutral',
  label,
  size = 'small',
  sx,
  ...rest
}: TingTagProps) {
  const styleMap = {
    brand: {
      bgcolor: '#2538D9',
      color: '#FFFFFF',
      fontWeight: 700,
    },
    success: {
      bgcolor: 'rgba(16, 185, 129, 0.15)',
      color: '#10B981',
      fontWeight: 700,
    },
    warning: {
      bgcolor: 'rgba(245, 158, 11, 0.15)',
      color: '#F59E0B',
      fontWeight: 700,
    },
    info: {
      bgcolor: 'rgba(37, 56, 217, 0.1)',
      color: '#2538D9',
      fontWeight: 700,
    },
    neutral: {
      bgcolor: 'rgba(255, 255, 255, 0.12)',
      color: '#E2E8F0',
      fontWeight: 600,
    },
  };

  return (
    <Chip
      size={size}
      label={label}
      sx={{
        borderRadius: '4px',
        fontSize: size === 'small' ? '0.625rem' : '0.75rem',
        height: size === 'small' ? '18px' : '24px',
        ...styleMap[variantStyle],
        ...sx,
      }}
      {...rest}
    />
  );
}

export { Badge, Chip };
