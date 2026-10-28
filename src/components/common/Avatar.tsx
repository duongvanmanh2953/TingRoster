'use client';

import React, { useState } from 'react';
import { User, Check, Sparkles, Smile, Shield, X } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';
export type AgeGroupType = 'KID' | 'TEEN' | 'ADULT' | 'SENIOR';

export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  gender: GenderType;
  ageGroup: AgeGroupType;
  label: string;
}

// 12 Curated high-resolution avatar presets categorized by Gender & Age
export const AVATAR_PRESETS: AvatarPreset[] = [
  // 1. Bé trai (KID - MALE, 6-11 tuổi)
  {
    id: 'kid-boy-1',
    name: 'Bé trai 1',
    url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    gender: 'MALE',
    ageGroup: 'KID',
    label: 'Bé trai (Tiểu học)',
  },
  {
    id: 'kid-boy-2',
    name: 'Bé trai 2',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    gender: 'MALE',
    ageGroup: 'KID',
    label: 'Bé trai (Mầm non)',
  },
  // 2. Bé gái (KID - FEMALE, 6-11 tuổi)
  {
    id: 'kid-girl-1',
    name: 'Bé gái 1',
    url: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=150&auto=format&fit=crop&q=80',
    gender: 'FEMALE',
    ageGroup: 'KID',
    label: 'Bé gái (Tiểu học)',
  },
  {
    id: 'kid-girl-2',
    name: 'Bé gái 2',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=150&auto=format&fit=crop&q=80',
    gender: 'FEMALE',
    ageGroup: 'KID',
    label: 'Bé gái (Mầm non)',
  },
  // 3. Thiếu niên Nam (TEEN - MALE, 12-17 tuổi)
  {
    id: 'teen-boy-1',
    name: 'Học sinh Nam 1',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    gender: 'MALE',
    ageGroup: 'TEEN',
    label: 'Nam (Cấp 2 - Cấp 3)',
  },
  {
    id: 'teen-boy-2',
    name: 'Học sinh Nam 2',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    gender: 'MALE',
    ageGroup: 'TEEN',
    label: 'Nam (Thể thao/CLB)',
  },
  // 4. Thiếu niên Nữ (TEEN - FEMALE, 12-17 tuổi)
  {
    id: 'teen-girl-1',
    name: 'Học sinh Nữ 1',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    gender: 'FEMALE',
    ageGroup: 'TEEN',
    label: 'Nữ (Cấp 2 - Cấp 3)',
  },
  {
    id: 'teen-girl-2',
    name: 'Học sinh Nữ 2',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gender: 'FEMALE',
    ageGroup: 'TEEN',
    label: 'Nữ (Học sinh gương mẫu)',
  },
  // 5. Nam Trưởng thành (ADULT - MALE, 18+ tuổi)
  {
    id: 'adult-male-1',
    name: 'Nam 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gender: 'MALE',
    ageGroup: 'ADULT',
    label: 'Nam (Trưởng thành)',
  },
  {
    id: 'adult-male-2',
    name: 'Nam 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    gender: 'MALE',
    ageGroup: 'ADULT',
    label: 'Nam (Chủ phòng / Huấn luyện viên)',
  },
  // 6. Nữ Trưởng thành (ADULT - FEMALE, 18+ tuổi)
  {
    id: 'adult-female-1',
    name: 'Nữ 1',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    gender: 'FEMALE',
    ageGroup: 'ADULT',
    label: 'Nữ (Trưởng thành)',
  },
  {
    id: 'adult-female-2',
    name: 'Nữ 2',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    gender: 'FEMALE',
    ageGroup: 'ADULT',
    label: 'Nữ (Giáo viên / Phụ huynh)',
  },
];

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  status?: AvatarStatus;
  gender?: GenderType | string | null;
  age?: number | null;
  ageGroup?: AgeGroupType | string | null;
  shape?: 'circle' | 'rounded';
  className?: string;
  bordered?: boolean;
  onClick?: () => void;
}

const COLOR_PALETTES = [
  { bg: 'bg-blue-100 text-[#2538D9] border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900' },
  { bg: 'bg-indigo-100 text-[#4353EB] border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900' },
  { bg: 'bg-violet-100 text-[#6D5CE8] border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900' },
  { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900' },
  { bg: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900' },
  { bg: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900' },
  { bg: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900' },
  { bg: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900' },
];

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'TR';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
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

/**
 * Intelligent avatar selection based on Gender & Age/AgeGroup
 */
export function getDefaultAvatarUrl(
  gender?: GenderType | string | null,
  age?: number | null,
  ageGroup?: AgeGroupType | string | null,
  name?: string | null
): string | null {
  const normalizedGender: GenderType =
    gender === 'FEMALE' || gender === 'NU' || gender === 'NỮ'
      ? 'FEMALE'
      : gender === 'MALE' || gender === 'NAM'
      ? 'MALE'
      : (name?.includes('Thị') || name?.includes('Mai') || name?.includes('Lan') || name?.includes('Vy') || name?.includes('Linh'))
      ? 'FEMALE'
      : (name?.includes('Văn') || name?.includes('Minh') || name?.includes('Hoàng') || name?.includes('Quân') || name?.includes('Đạt'))
      ? 'MALE'
      : 'OTHER';

  let resolvedAgeGroup: AgeGroupType = 'TEEN';
  if (ageGroup) {
    resolvedAgeGroup = ageGroup as AgeGroupType;
  } else if (typeof age === 'number') {
    if (age <= 11) resolvedAgeGroup = 'KID';
    else if (age <= 18) resolvedAgeGroup = 'TEEN';
    else if (age <= 55) resolvedAgeGroup = 'ADULT';
    else resolvedAgeGroup = 'SENIOR';
  }

  // Filter candidate presets
  const matches = AVATAR_PRESETS.filter(
    (p) => (normalizedGender === 'OTHER' || p.gender === normalizedGender) && p.ageGroup === resolvedAgeGroup
  );

  if (matches.length > 0) {
    const idx = getColorIndex(name) % matches.length;
    return matches[idx].url;
  }

  // Fallback to any gender match
  const genderMatches = AVATAR_PRESETS.filter((p) => p.gender === normalizedGender);
  if (genderMatches.length > 0) {
    return genderMatches[0].url;
  }

  return null;
}

export function Avatar({
  src,
  name = 'Thành viên',
  size = 'md',
  status = 'none',
  gender,
  age,
  ageGroup,
  shape = 'circle',
  className = '',
  bordered = false,
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeConfig = SIZE_STYLES[size];
  const colorPalette = COLOR_PALETTES[getColorIndex(name)];
  const initials = getInitials(name);

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  const statusBg = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
    none: '',
  }[status];

  // Resolve source: explicit src > smart gender/age preset > null (fallback initials)
  const resolvedSrc = src || getDefaultAvatarUrl(gender, age, ageGroup, name);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-shrink-0 ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
    >
      <div
        className={`${sizeConfig.container} ${roundedClass} flex items-center justify-center select-none overflow-hidden ${
          bordered ? 'ring-2 ring-white dark:ring-slate-900 shadow-xs' : ''
        } ${colorPalette.bg} border`}
      >
        {resolvedSrc && !imgError ? (
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
          className={`absolute bottom-0 right-0 ${sizeConfig.status} ${roundedClass} ${statusBg} ring-white dark:ring-slate-900`}
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
  members: Array<{ name: string; src?: string | null; gender?: GenderType | string | null; age?: number | null }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}) {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className={`flex items-center -space-x-1.5 overflow-hidden ${className}`}>
      {visible.map((m, idx) => (
        <Avatar
          key={idx}
          name={m.name}
          src={m.src}
          gender={m.gender}
          age={m.age}
          size={size}
          bordered
          className="hover:z-10 transition-transform duration-150 hover:scale-105"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`${SIZE_STYLES[size].container} rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-xs z-0`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

/**
 * Interactive Avatar & Gender/Age Picker Modal
 */
export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  currentGender = 'OTHER',
  currentAgeGroup = 'TEEN',
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  currentGender?: GenderType;
  currentAgeGroup?: AgeGroupType;
  onSelect: (data: { avatarUrl: string; gender: GenderType; ageGroup: AgeGroupType }) => void;
}) {
  const [selectedGender, setSelectedGender] = useState<GenderType>(currentGender);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroupType>(currentAgeGroup);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatarUrl || '');

  if (!isOpen) return null;

  const filteredPresets = AVATAR_PRESETS.filter((p) => {
    const matchGender = selectedGender === 'OTHER' || p.gender === selectedGender;
    const matchAge = p.ageGroup === selectedAgeGroup;
    return matchGender && matchAge;
  });

  const handleSave = () => {
    onSelect({
      avatarUrl: selectedUrl,
      gender: selectedGender,
      ageGroup: selectedAgeGroup,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#2538D9] dark:text-indigo-400">
              <Smile className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#101828] dark:text-[#F8FAFC]">
              Chọn Avatar, Giới tính & Độ tuổi mặc định
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Chọn Giới tính */}
        <div>
          <label className="text-xs font-bold text-[#101828] dark:text-slate-200 mb-1.5 block">
            1. Giới tính
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'MALE', label: 'Nam' },
              { id: 'FEMALE', label: 'Nữ' },
              { id: 'OTHER', label: 'Tất cả / Khác' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGender(g.id as GenderType)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                  selectedGender === g.id
                    ? 'bg-[#2538D9] text-white border-[#2538D9] shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Chọn Độ tuổi / Phân khúc */}
        <div>
          <label className="text-xs font-bold text-[#101828] dark:text-slate-200 mb-1.5 block">
            2. Độ tuổi mặc định
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'KID', label: 'Mầm non/Tiểu học (3-11 tuổi)' },
              { id: 'TEEN', label: 'Cấp 2/Cấp 3 (12-17 tuổi)' },
              { id: 'ADULT', label: 'Người lớn (18+ tuổi)' },
              { id: 'SENIOR', label: 'Cao niên (>55 tuổi)' },
            ].map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAgeGroup(a.id as AgeGroupType)}
                className={`p-2 rounded-lg text-[11px] font-bold border transition-all text-center leading-tight ${
                  selectedAgeGroup === a.id
                    ? 'bg-[#2538D9] text-white border-[#2538D9] shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Danh sách Avatar đề xuất */}
        <div>
          <label className="text-xs font-bold text-[#101828] dark:text-slate-200 mb-2 block flex items-center justify-between">
            <span>3. Chọn ảnh đại diện tương thích</span>
            <span className="text-[10px] text-slate-500 font-normal">({filteredPresets.length} gợi ý)</span>
          </label>
          <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
            {filteredPresets.map((preset) => {
              const isPicked = selectedUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedUrl(preset.url)}
                  className={`group relative p-1 rounded-xl border-2 transition-all flex flex-col items-center ${
                    isPicked
                      ? 'border-[#2538D9] ring-2 ring-[#2538D9]/20'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-1 truncate max-w-full">
                    {preset.name}
                  </span>
                  {isPicked && (
                    <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#2538D9] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold bg-[#2538D9] hover:bg-[#1E2DB8] text-white rounded-lg shadow-xs transition-all"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default Avatar;
