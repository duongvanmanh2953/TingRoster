'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera } from 'lucide-react';
import { ActionQrScanner } from '@/components/qr/ActionQrScanner';

export default function StudentScanPage() {
  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12 font-sans">
      <div className="flex items-center justify-between">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Tổng quan</span>
        </Link>
        <span className="text-[11px] font-bold text-[#2538D9] bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full">
          Quét QR Thông Minh
        </span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Quét Mã QR Hành Động
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Đưa camera về phía mã QR tại Kiosk lớp học, sân bãi hoặc hóa đơn để hệ thống tự động nhận diện nghiệp vụ.
        </p>
      </div>

      <ActionQrScanner />
    </div>
  );
}
