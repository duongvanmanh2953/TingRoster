'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="bang-gia" className="py-20 sm:py-28 bg-white dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-medium">
            <span>Chi phí minh bạch</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Biểu phí rõ ràng, không phụ phí ẩn
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Không cắt phế phần trăm trên dòng tiền giao dịch. Tiền vào thẳng 100% tài khoản ngân hàng của bạn.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-3 inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                !isAnnual
                  ? 'bg-white dark:bg-slate-700 text-[#101828] dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Thanh toán tháng
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-[#2538D9] dark:bg-[#4F62FF] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>Thanh toán năm</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch text-left">
          
          {/* Plan 1: Miễn phí (Khởi đầu) */}
          <div className="p-8 rounded-2xl bg-[#F5F7FB] dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#101828] dark:text-white">Gói Khởi Đầu</h3>
                <p className="text-xs text-[#475467] dark:text-slate-400 mt-1">Dành cho lớp học nhỏ hoặc CLB mới mở</p>
              </div>
              <div className="pt-2">
                <span className="text-3xl font-semibold text-[#101828] dark:text-white tabular-nums">0 đ</span>
                <span className="text-xs text-slate-400"> / vĩnh viễn</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#344054] dark:text-slate-300 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                {[
                  'Quản lý tối đa 20 thành viên / học viên',
                  '1 Không gian quản lý (Lớp học hoặc CLB)',
                  'Điểm danh qua mã QR tĩnh',
                  'Theo dõi công nợ học phí cơ bản',
                  'Hỗ trợ qua tài liệu hướng dẫn trực tuyến'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-[#344054] dark:text-slate-200 transition-colors"
              >
                <span>Bắt đầu miễn phí</span>
              </Link>
            </div>
          </div>

          {/* Plan 2: Chuyên Nghiệp (PRO) - Most Popular */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#111726] border-2 border-[#2538D9] dark:border-[#4F62FF] shadow-lg flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#2538D9] dark:bg-[#4F62FF] text-white text-[11px] font-semibold tracking-wide">
              Được khuyên dùng nhiều nhất
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#101828] dark:text-white">Gói Chuyên Nghiệp (PRO)</h3>
                <p className="text-xs text-[#475467] dark:text-slate-400 mt-1">Dành cho trung tâm giáo dục, CLB thể thao lớn</p>
              </div>
              <div className="pt-2">
                <span className="text-3xl font-semibold text-[#101828] dark:text-white tabular-nums">
                  {isAnnual ? '199.000 đ' : '249.000 đ'}
                </span>
                <span className="text-xs text-slate-400"> / tháng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#344054] dark:text-slate-300 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                {[
                  'Quản lý không giới hạn số lượng thành viên',
                  'Quản lý tới 5 không gian / chi nhánh',
                  'Tự động đối soát VietQR Napas 24/7 gạch nợ tức thì',
                  'Màn hình Kiosk điểm danh tự động toàn màn hình',
                  'Cổng phụ huynh & học viên tra cứu riêng biệt',
                  'Thông báo biến động tự động qua Telegram/Email',
                  'Xuất báo cáo doanh thu tài chính Excel chuẩn'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-[#101828] dark:text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] dark:bg-[#4F62FF] dark:hover:bg-[#3E51E8] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Dùng thử 30 ngày đầy đủ tính năng</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Plan 3: Doanh Nghiệp (Enterprise) */}
          <div className="p-8 rounded-2xl bg-[#F5F7FB] dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#101828] dark:text-white">Gói Doanh Nghiệp</h3>
                <p className="text-xs text-[#475467] dark:text-slate-400 mt-1">Dành cho chuỗi cơ sở & tổ chức đa chi nhánh</p>
              </div>
              <div className="pt-2">
                <span className="text-3xl font-semibold text-[#101828] dark:text-white tabular-nums">
                  Liên hệ
                </span>
                <span className="text-xs text-slate-400"> / tùy biến</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#344054] dark:text-slate-300 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                {[
                  'Không giới hạn cơ sở, lớp học và hội viên',
                  'Tùy biến tên miền riêng & logo thương hiệu',
                  'Tích hợp API ngân hàng doanh nghiệp (Virtual Account)',
                  'Phân quyền nhân sự đa tầng (Owner, Manager, Staff)',
                  'Hỗ trợ kỹ thuật 24/7 có cam kết SLA chuyên trách'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-[#344054] dark:text-slate-200 transition-colors"
              >
                <span>Tư vấn giải pháp chuỗi</span>
              </Link>
            </div>
          </div>

        </div>

        <div className="mt-12 text-center text-xs text-[#475467] dark:text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cam kết Zero-Custody: TingRoster không thu phần trăm doanh thu trên bất kỳ giao dịch nào.</span>
        </div>

      </div>
    </section>
  );
}
