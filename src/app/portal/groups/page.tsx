'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users2,
  CalendarCheck,
  Receipt,
  MessageSquare,
  Building,
  GraduationCap,
  Trophy,
  Phone,
  Mail,
  User,
  ArrowRight
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

interface JoinedGroup {
  memberId: string;
  groupId: string;
  name: string;
  slug: string;
  groupType: 'CLASS' | 'SPORTS_CLUB' | 'RENTAL';
  defaultFee: number;
  billingCycle: string;
  description?: string;
  owner: {
    name: string;
    bankId: string;
    bankAccountNo: string;
    bankAccountName: string;
  };
}

export default function MemberGroupsPage() {
  const [groups, setGroups] = useState<JoinedGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setGroups(res.data.joinedGroups || []);
        }
      })
      .catch((err) => console.error('Fetch groups error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải danh sách nhóm & lớp học...</p>
      </div>
    );
  }

  const getGroupIcon = (type: string) => {
    if (type === 'CLASS') return <GraduationCap className="w-5 h-5 text-blue-600" />;
    if (type === 'SPORTS_CLUB') return <Trophy className="w-5 h-5 text-amber-600" />;
    return <Building className="w-5 h-5 text-indigo-600" />;
  };

  const getGroupTypeName = (type: string) => {
    if (type === 'CLASS') return 'Lớp học giáo dục';
    if (type === 'SPORTS_CLUB') return 'Câu lạc bộ thể thao';
    return 'Phòng trọ / Căn hộ mini';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[#2538D9]" />
            <h1 className="text-xl font-bold text-[#111827] dark:text-white">Không Gian & Nhóm Đang Tham Gia</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Một tài khoản người dùng có thể tham gia nhiều không gian độc lập với quyền lợi và biểu phí riêng biệt.
          </p>
        </div>

        <Link
          href="/portal/join"
          className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>+ Nhập mã tham gia</span>
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-12 text-center space-y-4">
          <Users2 className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Chưa tham gia không gian nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nhập mã kích hoạt hoặc mã lời mời nhận được từ giáo viên/chủ cơ sở để bắt đầu.
            </p>
          </div>
          <Link
            href="/portal/join"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2538D9] text-white text-xs font-bold hover:bg-[#1E2DB8] transition-colors shadow-xs"
          >
            <span>Nhập mã tham gia ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.map((group) => (
            <div
              key={group.groupId}
              className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]">
                      {getGroupIcon(group.groupType)}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {getGroupTypeName(group.groupType)}
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap select-none">
                    Đang hoạt động
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#111827] dark:text-white mt-3">{group.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{group.description || 'Chưa có thông tin mô tả chi tiết'}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B] text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block">Người phụ trách</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{group.owner.name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Biểu phí áp dụng</span>
                    <span className="font-semibold text-[#2538D9] font-mono">
                      {formatVND(group.defaultFee)} / {group.billingCycle === 'MONTHLY' ? 'tháng' : 'buổi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
                <Link
                  href={`/portal/chat?groupId=${group.groupId}`}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat nhóm</span>
                </Link>

                <Link
                  href={`/portal/groups/${group.groupId}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Mở không gian</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
