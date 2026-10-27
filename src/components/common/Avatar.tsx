import React, { useState } from 'react';
import Image from 'next/image';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  status?: AvatarStatus;
  shape?: 'circle' | 'rounded';
  className?: string;
  bordered?: boolean;
}

// Deterministic pleasing palette for initials
const COLOR_PALETTES = [
  { bg: 'bg-blue-100 text-[#2538D9] border-blue-200' },
  { bg: 'bg-indigo-100 text-[#4353EB] border-indigo-200' },
  { bg: 'bg-violet-100 text-[#6D5CE8] border-violet-200' },
  { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { bg: 'bg-teal-100 text-teal-700 border-teal-200' },
  { bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  { bg: 'bg-rose-100 text-rose-700 border-rose-200' },
  { bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
];

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'TR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  // For Vietnamese names like "Nguyễn Văn A" -> parts[0][0] + parts[last][0] => "NA"
  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return `${first}${last}`.toUpperCase();
}

function getColorIndex(name?: string | null): number {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % COLOR_PALETTES.length;
}

const SIZE_STYLES: Record<AvatarSize, { container: string; text: string; status: string; px: number }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-1.5 h-1.5 ring-1', px: 24 },
  sm: { container: 'w-8 h-8', text: 'text-xs', status: 'w-2 h-2 ring-1.5', px: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm font-semibold', status: 'w-2.5 h-2.5 ring-2', px: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base font-bold', status: 'w-3 h-3 ring-2', px: 48 },
  xl: { container: 'w-16 h-16', text: 'text-xl font-bold', status: 'w-3.5 h-3.5 ring-2', px: 64 },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl font-black', status: 'w-4 h-4 ring-2', px: 80 },
};

export function Avatar({
  src,
  name = 'Thành viên',
  size = 'md',
  status = 'none',
  shape = 'circle',
  className = '',
  bordered = false,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeConfig = SIZE_STYLES[size];
  const colorPalette = COLOR_PALETTES[getColorIndex(name)];
  const initials = getInitials(name);

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  const statusBg = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
    none: '',
  }[status];

  // Curated deterministic avatar photos for key demo users if no custom src is provided
  const resolvedSrc = src || (
    name?.includes('Nguyễn Văn Minh')
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : name?.includes('Nguyễn Văn A')
      ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
      : name?.includes('Trần Thị B')
      ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      : name?.includes('Lê Minh C')
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      : name?.includes('Phạm Thị D')
      ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
      : name?.includes('Hoàng Văn E')
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      : null
  );

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`${sizeConfig.container} ${roundedClass} flex items-center justify-center select-none overflow-hidden ${
          bordered ? 'ring-2 ring-white shadow-sm' : ''
        } ${colorPalette.bg} border`}
      >
        {resolvedSrc && !imgError ? (
          // Use standard img or Next Image with unoptimized attribute to handle external CDNs smoothly
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedSrc}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className={`${sizeConfig.text} font-bold tracking-tight`}>
            {initials}
          </span>
        )}
      </div>

      {status !== 'none' && (
        <span
          className={`absolute bottom-0 right-0 ${sizeConfig.status} ${roundedClass} ${statusBg} ring-white`}
          title={`Trạng thái: ${status}`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  members,
  max = 4,
  size = 'sm',
  className = '',
}: {
  members: Array<{ name: string; src?: string | null }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}) {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className={`flex items-center -space-x-2 overflow-hidden ${className}`}>
      {visible.map((m, idx) => (
        <Avatar
          key={idx}
          name={m.name}
          src={m.src}
          size={size}
          bordered
          className="hover:z-10 transition-transform duration-150 hover:scale-105"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`${SIZE_STYLES[size].container} rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm z-0`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

export default Avatar;
