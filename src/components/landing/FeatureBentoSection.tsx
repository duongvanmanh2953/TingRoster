'use client';

import React from 'react';
import Image from 'next/image';
import { 
  QrCode, 
  CreditCard, 
  Calendar, 
  Users, 
  MessageSquare, 
  FileCheck, 
  BarChart3, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export function FeatureBentoSection() {
  return (
    <section id="tinh-nang" className="py-20 sm:py-28 bg-[#F5F7FB] dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="bento-header text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-medium">
            <span>Tính năng đã kiểm chứng</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Bộ công cụ vận hành hoàn chỉnh trong một nền tảng
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Mọi tính năng đều được xây dựng từ bài toán thực tế của các lớp học, sân bãi thể thao và cơ sở dịch vụ tại Việt Nam.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Feature 1: Large Visual Feature - VietQR Napas Reconciliation (Span 7) */}
          <div className="bento-card lg:col-span-7 p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-[#4F62FF] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#101828] dark:text-white">
                Tự động đối soát giao dịch VietQR 24/7
              </h3>
              <p className="text-sm text-[#475467] dark:text-slate-400 leading-relaxed font-normal max-w-xl">
                Tích hợp trực tiếp với cổng Webhook VietQR SePay & Casso. Khi học viên chuyển khoản với mã nội dung duy nhất, hóa đơn tự động chuyển trạng thái <span className="font-semibold text-emerald-600 dark:text-emerald-400">Đã đóng đủ</span> chỉ trong 3 giây.
              </p>
            </div>

            {/* In-Card Visual Preview */}
            <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300">Biến động số dư VietQR</span>
                <span className="text-emerald-600 font-medium">Khớp tự động</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-[#101828] dark:text-white">MB • TR8921 NGUYEN VAN AN</span>
                </div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">+600.000 đ</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-[#101828] dark:text-white">VCB • CAULONG TRAN THI MAI</span>
                </div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">+50.000 đ</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Lifestyle Split Card - QR Check-in & Member Portal (Span 5) */}
          <div className="bento-card lg:col-span-5 p-8 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex flex-col justify-between text-left">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#6D5CE8] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-[#101828] dark:text-white">
                Điểm danh QR 1 chạm tại cơ sở
              </h3>
              <p className="text-sm text-[#475467] dark:text-slate-400 leading-relaxed font-normal">
                Màn hình Kiosk tự phục vụ hiển thị mã QR động. Học viên hoặc hội viên quét bằng điện thoại, hệ thống tự động ghi nhận giờ vào ca và trừ số buổi học.
              </p>
            </div>

            <div className="mt-6 relative rounded-xl overflow-hidden aspect-[16/9] border border-slate-200 dark:border-slate-800">
              <Image
                src="/images/landing/lifestyle/members_checkin.jpg"
                alt="Hội viên quét mã điểm danh tại sân thể thao"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 text-xs text-white font-medium">
                Check-in thành công qua camera điện thoại
              </p>
            </div>
          </div>

          {/* Feature 3: Schedule & Shift Management (Span 4) */}
          <div className="bento-card lg:col-span-4 p-8 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#101828] dark:text-white">
              Lịch hoạt động & Phân ca
            </h3>
            <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
              Tạo ca sân, lịch học định kỳ trong tuần. Tự động phát hiện trùng ca hoặc vượt sĩ số lớp học để chủ cơ sở kịp thời sắp xếp.
            </p>
          </div>

          {/* Feature 4: Digital Contracts & Documents (Span 4) */}
          <div className="bento-card lg:col-span-4 p-8 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#101828] dark:text-white">
              Hợp đồng & Tài liệu điện tử
            </h3>
            <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
              Ký hợp đồng thuê phòng, cam kết khóa học trực tiếp trên điện thoại. Xuất file PDF/Word có chữ ký xác nhận pháp lý rõ ràng.
            </p>
          </div>

          {/* Feature 5: Group Chat & Notifications (Span 4) */}
          <div className="bento-card lg:col-span-4 p-8 rounded-2xl bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#101828] dark:text-white">
              Thông báo đa kênh & Trò chuyện
            </h3>
            <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
              Tự động gửi biến động học phí và lịch sinh hoạt qua Telegram bot hoặc email. Trò chuyện nội bộ giữa giáo viên và học viên trong không gian.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
