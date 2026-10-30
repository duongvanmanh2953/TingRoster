'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Sparkles } from 'lucide-react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';

interface PricingSectionProps {
  onInstantDemo: () => Promise<void>;
}

export function PricingSection({ onInstantDemo }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="bang-gia" className="scroll-reveal py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#2538D9] dark:text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Biểu phí rõ ràng, không phụ phí</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-normal leading-tight">
          Biểu phí minh bạch, không phí ẩn
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-[60ch] mx-auto">
          Không thu phần trăm hoa hồng trên giao dịch. Tiền vào thẳng 100% tài khoản ngân hàng chính chủ của bạn.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-2 inline-flex items-center p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-[#101828] dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Thanh toán theo tháng
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-[#2538D9] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Thanh toán cả năm</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* 1. Gói Khởi đầu */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.16)"
          className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-white">
                Gói Khởi đầu
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Dành cho lớp dạy kèm tại nhà hoặc câu lạc bộ mới thành lập
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-[#101828] dark:text-white">
                0 ₫
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">trọn đời</span>
            </div>

            <div className="space-y-3.5 pt-4 text-sm text-[#101828] dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>1 Workspace độc lập quản lý lớp/nhóm</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Tối đa 25 thành viên hoạt động</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Điểm danh 1 chạm & xuất báo cáo Excel</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Tạo mã VietQR động theo học viên</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/onboarding"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#101828] dark:text-white font-bold text-center block transition-colors"
            >
              Bắt đầu miễn phí
            </Link>
          </div>
        </SpotlightCard>

        {/* 2. Gói Chuyên nghiệp (Featured) */}
        <SpotlightCard
          spotlightColor="rgba(37, 56, 217, 0.28)"
          className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 ring-2 ring-[#2538D9] flex flex-col justify-between relative"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-black text-[#2538D9] dark:text-blue-400">
                Gói Chuyên nghiệp
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#2538D9] text-white text-xs font-bold">
                Khuyên dùng
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-3">
              Tự động hóa hoàn toàn luồng tiền và đối soát giao dịch Napas 24/7
            </p>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-[#2538D9] dark:text-blue-400">
                {billingCycle === 'annual' ? '159.000 ₫' : '199.000 ₫'}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                /tháng {billingCycle === 'annual' && '(thanh toán năm)'}
              </span>
            </div>

            <div className="space-y-3.5 pt-4 text-sm text-[#101828] dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#2538D9] dark:text-blue-400 shrink-0" />
                <span className="font-semibold">Tự động đối soát Webhook ngân hàng Napas 24/7</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#2538D9] dark:text-blue-400 shrink-0" />
                <span>Không giới hạn số lớp học, cụm sân hoặc phòng</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#2538D9] dark:text-blue-400 shrink-0" />
                <span>Tối đa 500 thành viên hoạt động</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#2538D9] dark:text-blue-400 shrink-0" />
                <span>Màn hình Kiosk quét QR tự phục vụ tại quầy</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#2538D9] dark:text-blue-400 shrink-0" />
                <span>Báo cáo doanh thu & quản lý nợ đọng tự động</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={onInstantDemo}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white font-bold text-center block transition-colors cursor-pointer"
            >
              Dùng thử Pro 30 ngày miễn phí
            </button>
          </div>
        </SpotlightCard>

        {/* 3. Gói Chuỗi & Cơ sở lớn */}
        <SpotlightCard
          spotlightColor="rgba(15, 23, 42, 0.18)"
          className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#101828] dark:text-white">
                Gói Chuỗi & Cơ sở lớn
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Cho trung tâm nhiều chi nhánh, tổ hợp thể thao và chuỗi trọ
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-[#101828] dark:text-white">
                {billingCycle === 'annual' ? '399.000 ₫' : '499.000 ₫'}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                /tháng {billingCycle === 'annual' && '(thanh toán năm)'}
              </span>
            </div>

            <div className="space-y-3.5 pt-4 text-sm text-[#101828] dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>Không giới hạn học sinh & hội viên</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>Phân quyền chi tiết giáo viên, HLV và kế toán</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>Gửi thông báo & nhắc nợ qua Zalo ZNS</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>Hỗ trợ kỹ thuật ưu tiên & cài đặt tận nơi 24/7</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link
              href="/onboarding"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#101828] dark:text-white font-bold text-center block transition-colors"
            >
              Đăng ký gói Chuỗi
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
