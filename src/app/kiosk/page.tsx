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
  ExternalLink
} from 'lucide-react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
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
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans p-4 sm:p-8 selection:bg-emerald-500 selection:text-white">
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
          <span className="w-2 h-2 rounded-full bg-emerald-400 ting-badge-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Kiosk Tablet Sẵn sàng</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full py-10 space-y-8 flex-1">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <Tv className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Màn Hình Kiosk Tự Điểm Danh & Thu Phí
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Đặt máy tính bảng (iPad / Tablet) tại cửa lớp hoặc sân thể thao để học sinh, hội viên tự tìm tên, điểm danh và quét mã VietQR tự động.
          </p>
        </div>

        {/* Groups selection grid */}
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <CircularProgress color="success" size={32} />
            <p className="text-xs text-slate-400">Đang tải danh sách lớp học & CLB...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-300">
              Chọn Lớp học hoặc CLB để khởi chạy chế độ Kiosk:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="bg-[#0F1626] border border-[#1E283D] hover:border-emerald-500/40 transition-all rounded-2xl group cursor-pointer"
                  onClick={() => router.push(`/kiosk/${group.id}`)}
                >
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
                          {group.groupType === 'CLASS'
                            ? 'Lớp học'
                            : group.groupType === 'SPORTS_CLUB'
                            ? 'CLB Thể thao'
                            : 'Phòng trọ'}
                        </span>
                        {group._count && (
                          <span className="text-xs text-slate-400">
                            {group._count.members} học viên
                          </span>
                        )}
                      </div>
                      <Typography variant="h6" className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {group.name}
                      </Typography>
                      <p className="text-[11px] text-slate-400">
                        Chạm để mở giao diện iPad toàn màn hình
                      </p>
                    </div>

                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      className="flex-shrink-0"
                      endIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Bật Kiosk
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="ting-card p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Chưa có lớp học hoặc CLB nào</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Bạn cần tạo ít nhất một lớp học hoặc câu lạc bộ trước khi kích hoạt màn hình Kiosk tự check-in.
              </p>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/groups')}
              startIcon={<Users className="w-4 h-4" />}
            >
              Tạo lớp học ngay
            </Button>
          </div>
        )}
      </div>

      <footer className="text-center py-4 text-[11px] text-slate-500 border-t border-[#1E283D] max-w-4xl mx-auto w-full">
        TingRoster Kiosk Mode • Tương thích mọi màn hình cảm ứng iPad, Android Tablet & Desktop
      </footer>
    </div>
  );
}
