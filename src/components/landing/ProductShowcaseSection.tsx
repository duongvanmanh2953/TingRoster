'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Laptop, 
  Smartphone, 
  Layers, 
  CheckCircle2, 
  QrCode, 
  TrendingUp, 
  Users, 
  FileText,
  Calendar,
  CreditCard,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function ProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'reconciliation' | 'members'>('attendance');

  return (
    <section id="giai-phap" className="py-20 sm:py-28 bg-white dark:bg-[#0B0F19] border-y border-[#E4E7EC] dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-medium">
            <span>Sản phẩm trong thực tế</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Vận hành mượt mà trên mọi thiết bị
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Từ máy tính để bàn của người quản lý đến điện thoại thông minh của học viên, TingRoster đồng bộ dữ liệu thời gian thực không độ trễ.
          </p>

          {/* Interactive Feature Selector */}
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-[#2538D9] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              1. Điểm danh QR Kiosk & Mobile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reconciliation')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'reconciliation'
                  ? 'bg-[#2538D9] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              2. Tự động đối soát VietQR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-[#2538D9] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              3. Quản lý hội viên & Lịch học
            </button>
          </div>
        </div>

        {/* Multi-Device Showcase Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Visual: Laptop on Desk with Live UI Overlay */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#E4E7EC] dark:border-slate-800 shadow-xl bg-slate-900 group">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/images/landing/devices/laptop_desk.jpg"
                  alt="Không gian làm việc với laptop quản trị TingRoster"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center"
                />
                {/* Darkening layer */}
                <div className="absolute inset-0 bg-slate-950/40" />

                {/* Simulated live app UI placed on the laptop screen area */}
                <div className="absolute inset-x-8 inset-y-6 sm:inset-x-12 sm:inset-y-10 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between text-left">
                  
                  {/* Mockup Topbar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        TingRoster • Lớp Toán 12A & CLB Cầu Lông
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      Đang kết nối VietQR 24/7
                    </span>
                  </div>

                  {/* Mockup Dashboard Body based on activeTab */}
                  {activeTab === 'attendance' && (
                    <div className="py-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#101828] dark:text-white">Điểm danh ngày hôm nay</p>
                        <span className="text-[11px] text-slate-400">Ca 18:00 - 19:30</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {[
                          { name: 'Nguyễn Văn An', time: '17:58', status: 'Có mặt (Quét QR)' },
                          { name: 'Trần Thị Mai', time: '18:02', status: 'Có mặt (Quét QR)' },
                          { name: 'Lê Hoàng Nam', time: '18:05', status: 'Có mặt (Điểm danh bù)' },
                        ].map((m, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                            <span className="font-medium text-[#101828] dark:text-slate-200">{m.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">{m.time}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 font-medium">
                                {m.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'reconciliation' && (
                    <div className="py-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#101828] dark:text-white">Nhật ký biến động VietQR Napas</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Khớp tự động 100%</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {[
                          { desc: 'MBBank • ND: TR8921 NGUYEN VAN AN', amount: '+600.000 đ', bill: 'Gạch nợ HĐ HP-10' },
                          { desc: 'Techcombank • ND: TR8921 TRAN THI MAI', amount: '+600.000 đ', bill: 'Gạch nợ HĐ HP-11' },
                          { desc: 'Vietcombank • ND: CAULONG LE HOANG NAM', amount: '+50.000 đ', bill: 'Vé ca sân ngày 31/10' },
                        ].map((tx, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                            <div>
                              <p className="font-medium text-[11px] text-[#101828] dark:text-slate-200">{tx.desc}</p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{tx.bill}</p>
                            </div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{tx.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'members' && (
                    <div className="py-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#101828] dark:text-white">Danh sách thành viên & Hạn học phí</p>
                        <span className="text-[11px] text-slate-400">42 thành viên</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {[
                          { name: 'Vũ Đức Minh', phone: '0966•••899', fee: 'Đã đóng đủ', color: 'emerald' },
                          { name: 'Phạm Quỳnh Anh', phone: '0944•••677', fee: 'Còn thiếu 200k', color: 'amber' },
                          { name: 'Hoàng Quốc Bảo', phone: '0912•••345', fee: 'Chưa đóng', color: 'rose' },
                        ].map((mb, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                            <div>
                              <p className="font-medium text-[11px] text-[#101828] dark:text-slate-200">{mb.name}</p>
                              <p className="text-[10px] text-slate-400">{mb.phone}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              mb.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' :
                              mb.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60' :
                              'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                            }`}>
                              {mb.fee}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mockup Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Cập nhật trực tiếp qua Webhook Napas</span>
                    <span className="font-medium text-[#2538D9] dark:text-[#4F62FF]">Xem chi tiết &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Visual: Smartphone Scanning QR */}
          <div className="lg:col-span-5 relative space-y-4 text-left">
            <div className="relative rounded-2xl overflow-hidden border border-[#E4E7EC] dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/landing/devices/smartphone_qr.jpg"
                  alt="Thành viên quét mã VietQR điểm danh và thanh toán bằng smartphone"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-600/90 text-[11px] font-medium mb-1">
                    <QrCode className="w-3 h-3" />
                    <span>Check-in một chạm</span>
                  </span>
                  <p className="text-sm font-semibold">Thành viên quét mã tại quầy hoặc Kiosk</p>
                  <p className="text-xs text-slate-300">Không cần cài đặt ứng dụng phức tạp, quét trực tiếp bằng camera điện thoại.</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-[#E4E7EC] dark:border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-[#4F62FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#101828] dark:text-white">Cơ chế Zero-Custody an toàn tuyệt đối</h3>
                <p className="text-xs text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
                  TingRoster không giữ tiền trung gian. Mọi khoản đóng học phí hoặc mua vé vào sân được chuyển thẳng vào tài khoản ngân hàng của bạn ngay lập tức.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
