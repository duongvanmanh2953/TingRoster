'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  QrCode,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Receipt,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { TiltedCard } from '@/components/reactbits/TiltedCard';
import { AmbientGlow } from '@/components/reactbits/AmbientGlow';
import { formatVND } from '@/lib/utils';

export function ProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'KIOSK' | 'RECON' | 'REPORTS'>('RECON');

  return (
    <section id="san-pham" className="scroll-reveal py-24 sm:py-32 relative overflow-hidden bg-slate-50/50 dark:bg-[#070A11] w-full">
      <AmbientGlow className="top-1/3 left-1/4" size={600} color="rgba(37, 56, 217, 0.12)" />
      <AmbientGlow className="bottom-10 right-1/4" size={500} color="rgba(16, 185, 129, 0.1)" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#2538D9] dark:text-blue-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Trải nghiệm sản phẩm thực tế</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-normal leading-tight">
            Giao diện trực quan, vận hành chuẩn xác
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Được thiết kế tối ưu cho mọi thiết bị: từ màn hình máy tính quản lý tại trung tâm đến điện thoại của học viên và phụ huynh.
          </p>

          {/* Interactive Feature Tabs */}
          <div className="pt-4 inline-flex items-center p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('RECON')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'RECON'
                  ? 'bg-[#2538D9] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Đối soát Napas 24/7</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('KIOSK')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'KIOSK'
                  ? 'bg-[#2538D9] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Check-in Kiosk QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('REPORTS')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'REPORTS'
                  ? 'bg-[#2538D9] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dòng tiền & Công nợ</span>
            </button>
          </div>
        </div>

        {/* 3D Dual-Device Composition: Laptop + Floating Smartphone */}
        <div className="relative max-w-6xl mx-auto">
          {/* Main Desktop / Laptop Mockup Frame */}
          <TiltedCard maxTilt={5} perspective={1400} className="w-full">
            <div className="rounded-2xl bg-white dark:bg-[#0E1526] p-4 sm:p-6" data-ui>
              {/* Fake Browser Toolbar */}
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-3 text-xs text-slate-400 font-medium hidden sm:inline">
                    https://app.tingroster.vn/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Webhook 24/7 Kết nối an toàn</span>
                </div>
              </div>

              {/* Tab 1: Napas 24/7 Reconciliation Screen */}
              {activeTab === 'RECON' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Tổng thu hôm nay</span>
                      <span className="text-xl sm:text-2xl font-black text-[#2538D9] dark:text-blue-400 block">
                        {formatVND(14850000)}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Đã khớp tự động</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                        100% (23/23 GD)
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Tốc độ gạch nợ</span>
                      <span className="text-xl sm:text-2xl font-black text-[#101828] dark:text-white block">
                        0.18 giây
                      </span>
                    </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="overflow-x-auto rounded-xl">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="py-2.5 px-3">Thời gian</th>
                          <th className="py-2.5 px-3">Thành viên / Học viên</th>
                          <th className="py-2.5 px-3">Số tiền</th>
                          <th className="py-2.5 px-3">Cú pháp Napas</th>
                          <th className="py-2.5 px-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="text-[#101828] dark:text-slate-200">
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500">19:42:10</td>
                          <td className="py-2.5 px-3 font-semibold">Nguyễn Minh Anh</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">+{formatVND(600000)}</td>
                          <td className="py-2.5 px-3 font-semibold">TR84920</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                              Đã gạch nợ
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500">19:38:05</td>
                          <td className="py-2.5 px-3 font-semibold">Trần Hoàng Nam</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">+{formatVND(600000)}</td>
                          <td className="py-2.5 px-3 font-semibold">TR84921</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                              Đã gạch nợ
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 text-slate-500">19:15:22</td>
                          <td className="py-2.5 px-3 font-semibold">CLB Pickleball Thủ Đức</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">+{formatVND(1600000)}</td>
                          <td className="py-2.5 px-3 font-semibold">TR72911</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                              Đã gạch nợ
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Kiosk QR Check-in Screen */}
              {activeTab === 'KIOSK' && (
                <div className="py-8 text-center space-y-6">
                  <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-4">
                    <span className="text-xs font-bold text-[#2538D9] dark:text-blue-400 block">
                      KIOSK ĐIỂM DANH TỰ PHỤC VỤ
                    </span>
                    <h3 className="text-xl font-black text-[#101828] dark:text-white">
                      Đưa mã QR của bạn trước camera
                    </h3>
                    <div className="w-48 h-48 mx-auto rounded-xl bg-white dark:bg-slate-900 p-3 flex items-center justify-center">
                      <QrCode className="w-36 h-36 text-[#2538D9]" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tự động ghi nhận giờ đến, cập nhật công nợ và thông báo tới phụ huynh qua ứng dụng.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Reports & Aging Debt */}
              {activeTab === 'REPORTS' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Báo cáo tuổi nợ (Aging)</span>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Nợ dưới 7 ngày</span>
                          <span className="font-bold text-emerald-600">{formatVND(1200000)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Nợ 8 - 30 ngày</span>
                          <span className="font-bold text-amber-600">{formatVND(600000)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Nợ quá 30 ngày</span>
                          <span className="font-bold text-rose-600">0 ₫</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Tuân thủ Kế toán Hộ kinh doanh</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Hỗ trợ xuất bảng kê Mẫu 01-1/BK-HDKD theo Thông tư 40/2021/TT-BTC và sổ S1-HKD, S2-HKD theo Thông tư 88/2021 sẵn sàng nộp thuế.
                      </p>
                      <span className="text-xs font-bold text-[#2538D9] dark:text-blue-400 block pt-1">
                        Xuất file Excel chỉ với 1 click
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TiltedCard>

          {/* Floating Smartphone Mockup (Layered 3D Perspective) */}
          <div className="hidden lg:block absolute -right-6 -bottom-10 w-72 z-20">
            <TiltedCard maxTilt={10} perspective={1000}>
              <div className="rounded-3xl bg-slate-900 p-3 text-white" data-ui>
                {/* Notch & Phone Header */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />
                <div className="space-y-3 p-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Cổng học viên</span>
                    <span className="text-emerald-400 font-bold">● Trực tuyến</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 space-y-2 text-center">
                    <span className="text-xs text-slate-400">Học phí tháng này</span>
                    <span className="text-xl font-black text-white block">600.000 ₫</span>
                    <div className="w-28 h-28 mx-auto bg-white p-2 rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-slate-900" />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Quét qua mọi ứng dụng ngân hàng</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/70 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Đã ghi nhận điểm danh: 19:30</span>
                  </div>
                </div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </div>
    </section>
  );
}
