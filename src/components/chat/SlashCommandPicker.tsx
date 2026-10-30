'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Calendar,
  CalendarCheck,
  Users,
  FolderOpen,
  Vote,
  Megaphone,
  CreditCard,
  BarChart3,
  Search,
  Sparkles
} from 'lucide-react';

export interface SlashCommand {
  id: string;
  command: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  roleRequired?: 'ANY' | 'ADMIN_OR_OWNER';
  color: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'poll',
    command: '/poll',
    title: 'Tạo Bình Chọn Nhóm',
    description: 'Tạo khảo sát hoặc câu hỏi bình chọn trực quan với nhiều phương án',
    icon: Vote,
    roleRequired: 'ANY',
    color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/50',
  },
  {
    id: 'notice',
    command: '/notice',
    title: 'Gửi Thông Báo Quan Trọng',
    description: 'Phát thông báo có mức độ ưu tiên và ghim lên đầu nhóm chat',
    icon: Megaphone,
    roleRequired: 'ADMIN_OR_OWNER',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
  },
  {
    id: 'schedule',
    command: '/schedule',
    title: 'Chia Sẻ Lịch Hoạt Động',
    description: 'Gửi thẻ lịch học, lịch thi đấu hoặc ca hoạt động sắp tới của nhóm',
    icon: Calendar,
    roleRequired: 'ANY',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
  },
  {
    id: 'attendance',
    command: '/attendance',
    title: 'Thông Tin Điểm Danh',
    description: 'Chia sẻ trạng thái và số lượng có mặt của phiên điểm danh hiện tại',
    icon: CalendarCheck,
    roleRequired: 'ANY',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    id: 'payment',
    command: '/payment',
    title: 'Chia Sẻ Khoản Thu & VietQR',
    description: 'Gửi thẻ liên kết Cổng tra cứu và thanh toán học phí/tiền quỹ nhóm',
    icon: CreditCard,
    roleRequired: 'ANY',
    color: 'text-[#2538D9] bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    id: 'members',
    command: '/members',
    title: 'Xem Danh Sách Thành Viên',
    description: 'Xem sĩ số và các thành viên đang hoạt động trong nhóm',
    icon: Users,
    roleRequired: 'ANY',
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/50',
  },
  {
    id: 'files',
    command: '/files',
    title: 'Tài Liệu & Tệp Nhóm',
    description: 'Xem toàn bộ tài liệu, ảnh và tệp đã chia sẻ trong nhóm',
    icon: FolderOpen,
    roleRequired: 'ANY',
    color: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
  },
  {
    id: 'report',
    command: '/report',
    title: 'Báo Cáo Hoạt Động',
    description: 'Xem báo cáo tài chính, công nợ và điểm danh (Dành cho Quản trị)',
    icon: BarChart3,
    roleRequired: 'ADMIN_OR_OWNER',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
  },
  {
    id: 'help',
    command: '/help',
    title: 'Trợ Giúp Lệnh Chat',
    description: 'Xem hướng dẫn sử dụng toàn bộ các lệnh slash command trong TingRoster',
    icon: HelpCircle,
    roleRequired: 'ANY',
    color: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
  },
];

interface SlashCommandPickerProps {
  filterText: string;
  isOwnerOrAdmin: boolean;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

export function SlashCommandPicker({
  filterText,
  isOwnerOrAdmin,
  onSelect,
  onClose,
}: SlashCommandPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cleanFilter = filterText.replace('/', '').toLowerCase().trim();

  const filtered = SLASH_COMMANDS.filter((cmd) => {
    if (cmd.roleRequired === 'ADMIN_OR_OWNER' && !isOwnerOrAdmin) {
      return false;
    }
    if (!cleanFilter) return true;
    return (
      cmd.command.toLowerCase().includes(cleanFilter) ||
      cmd.title.toLowerCase().includes(cleanFilter) ||
      cmd.description.toLowerCase().includes(cleanFilter)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        if (filtered[selectedIndex]) {
          e.preventDefault();
          onSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) {
    return (
      <div className="absolute bottom-full mb-2 left-0 w-full sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-30">
        <p className="text-xs text-slate-400 text-center py-2">
          Không tìm thấy lệnh phù hợp với &quot;{cleanFilter}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-full mb-2 left-0 w-full sm:w-[420px] max-h-80 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-30">
      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2538D9]" />
          Lệnh nghiệp vụ nhanh
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Dùng ↑↓ để chọn • Enter để chèn
        </span>
      </div>

      <div className="space-y-0.5 mt-1">
        {filtered.map((cmd, idx) => {
          const Icon = cmd.icon;
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={cmd.id}
              type="button"
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cmd.color}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {cmd.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {cmd.command}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {cmd.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
