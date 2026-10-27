'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tv,
  Users,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Building2,
  Sparkles,
  QrCode,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';

interface GroupItem {
  id: string;
  name: string;
  slug: string;
  groupType: string;
  defaultFee: number;
  _count?: {
    members: number;
  };
}

export default function KioskIndexPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setGroups(data.data);
          // If only 1 group exists, auto redirect
          if (data.data.length === 1) {
            router.push(`/kiosk/${data.data[0].id}`);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans p-4 sm:p-8 selection:bg-[#2538D9] selection:text-white">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#1E283D]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Bảng điều khiển</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Kiosk Tablet Sẵn sàng</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full py-10 space-y-8 flex-1">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2538D9] to-[#6D5CE8] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#2538D9]/25">
            <Tv className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Màn Hình Kiosk Tự Điểm Danh & Thu Phí
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Đặt máy tính bảng (iPad / Tablet) tại cửa lớp hoặc sân thể thao để học sinh, hội viên tự tìm tên, điểm danh và quét mã VietQR tự động.
          </p>
        </div>

        {/* Groups selection grid */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <CircularProgress size={32} sx={{ color: '#2538D9' }} />
            <p className="text-xs text-slate-400">Đang tải danh sách lớp học & CLB...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200">
              Chọn Lớp học hoặc CLB để khởi chạy chế độ Kiosk:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => router.push(`/kiosk/${group.id}`)}
                  className="bg-[#131A2B] border border-[#1E283D] hover:border-[#2538D9]/60 hover:bg-[#162035] transition-all rounded-2xl p-5 flex items-center justify-between gap-4 cursor-pointer group shadow-sm"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2538D9]/25 text-indigo-300 border border-[#2538D9]/40 uppercase">
                        {group.groupType === 'CLASS'
                          ? 'Lớp học'
                          : group.groupType === 'SPORTS_CLUB'
                          ? 'CLB Thể thao'
                          : 'Phòng trọ'}
                      </span>
                      {group._count && (
                        <span className="text-xs text-slate-400 font-mono">
                          {group._count.members} học viên
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {group.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Chạm để mở giao diện Tablet toàn màn hình
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-[#2538D9] group-hover:bg-[#1E2DB8] flex items-center justify-center text-white flex-shrink-0 transition-colors shadow-xs">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-[#131A2B] border border-[#1E283D] rounded-2xl text-xs text-slate-400 space-y-2">
            <p>Chưa có lớp học hoặc CLB nào được tạo.</p>
            <Link href="/groups" className="text-indigo-400 font-bold hover:underline">
              + Tạo lớp học mới ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
