'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Trophy,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  CreditCard,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { TiltedCard } from '@/components/reactbits/TiltedCard';
import { formatVND } from '@/lib/utils';

export function IndustryModelsSection() {
  const [selectedIndustry, setSelectedIndustry] = useState<'EDU' | 'SPORTS' | 'RENTAL' | 'WORKFORCE'>('EDU');

  const industries = [
    {
      id: 'EDU',
      title: 'Giáo dục & Lớp dạy thêm',
      desc: 'Giáo viên, trung tâm tiếng Anh, năng khiếu, dạy kèm tại nhà',
      icon: GraduationCap,
      color: '#2538D9',
      features: [
        'Điểm danh học sinh từng buổi hoặc trừ gói buổi linh hoạt',
        'Tự động gửi thông báo lịch học và học phí tới phụ huynh',
        'Tạo mã VietQR chuyển khoản cá nhân gắn mã học viên',
        'Xuất bảng kê doanh thu và báo cáo sĩ số cho từng lớp',
      ],
      sampleData: {
        label: 'Lớp Toán 10 Nâng cao',
        statA: '24 Học sinh',
        statB: formatVND(14400000) + ' /tháng',
        statC: 'Điểm danh 1 chạm',
      },
    },
    {
      id: 'SPORTS',
      title: 'CLB Thể thao & Đặt sân',
      desc: 'Pickleball, Cầu lông, Bóng đá mini, Phòng tập Gym & Yoga',
      icon: Trophy,
      color: '#10B981',
      features: [
        'Kiosk quét mã QR tự phục vụ check-in ngay tại quầy lễ tân',
        'Quản lý gói hội viên theo tháng, quý hoặc số lượt chơi',
        'Theo dõi lịch đặt sân, tránh trùng giờ và tính tiền dịch vụ đi kèm',
        'Tự động đối soát giao dịch đặt cọc và tiền nước qua Napas 24/7',
      ],
      sampleData: {
        label: 'Cụm 4 Sân Pickleball Thủ Đức',
        statA: '142 Hội viên',
        statB: formatVND(48500000) + ' /tháng',
        statC: 'Check-in QR Kiosk',
      },
    },
    {
      id: 'RENTAL',
      title: 'Nhà trọ & Căn hộ dịch vụ',
      desc: 'Chủ dãy nhà trọ, ký túc xá tư nhân, căn hộ mini cho thuê',
      icon: Building2,
      color: '#F59E0B',
      features: [
        'Chốt chỉ số điện nước từng phòng và tự động cộng dồn vào hóa đơn',
        'Tạo mã VietQR Napas riêng cho từng phòng kèm cú pháp P101-T11',
        'Tự động gạch nợ ngay khi khách thuê chuyển khoản thành công',
        'Báo cáo tuổi nợ và theo dõi hợp đồng thuê phòng minh bạch',
      ],
      sampleData: {
        label: 'Dãy 18 Phòng Trọ Bình Thạnh',
        statA: '18 Phòng đang thuê',
        statB: formatVND(68400000) + ' /tháng',
        statC: 'Chốt điện nước tự động',
      },
    },
    {
      id: 'WORKFORCE',
      title: 'Doanh nghiệp & Đội ngũ',
      desc: 'Cửa hàng, quán cafe, chuỗi bán lẻ, quản lý nhân viên ca kíp',
      icon: Users,
      color: '#0B0F19',
      features: [
        'Chấm công ca kíp theo mã QR động, hạn chế gian lận giờ giấc',
        'Phân quyền chi tiết cho quản lý ca, kế toán và chủ cửa hàng',
        'Tổng hợp ngày công và tính phụ cấp tự động cuối tháng',
        'Nhật ký hoạt động rõ ràng giúp kiểm soát nội bộ chuẩn xác',
      ],
      sampleData: {
        label: 'Chuỗi 3 Cửa hàng F&B',
        statA: '32 Nhân sự',
        statB: '98.5% Đúng giờ',
        statC: 'Chấm công QR ca kíp',
      },
    },
  ];

  const current = industries.find((i) => i.id === selectedIndustry) || industries[0];
  const Icon = current.icon;

  return (
    <section className="scroll-reveal py-24 sm:py-32 relative bg-slate-50/60 dark:bg-[#070A11] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#2538D9] dark:text-blue-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Khả năng thích ứng vượt trội</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#101828] dark:text-white tracking-normal leading-tight">
            Một nền tảng, Đa dạng mô hình vận hành
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Dù bạn đang điều hành lớp học, câu lạc bộ thể thao, chuỗi phòng trọ hay cửa hàng bán lẻ, TingRoster đều cung cấp quy trình chuyên biệt.
          </p>
        </div>

        {/* Industry Selector Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {industries.map((item) => {
            const ItemIcon = item.icon;
            const isSelected = selectedIndustry === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndustry(item.id as typeof selectedIndustry)}
                className={`p-4 sm:p-5 rounded-2xl text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#2538D9] text-white ring-2 ring-[#2538D9]'
                    : 'bg-white dark:bg-slate-800 text-[#101828] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#2538D9]/10 text-[#2538D9] dark:bg-blue-950/80 dark:text-blue-300'
                  }`}
                >
                  <ItemIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{item.title}</h3>
                  <p
                    className={`text-xs mt-1 line-clamp-2 ${
                      isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Industry Workspace Preview */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" data-ui>
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2538D9]/10 text-[#2538D9] dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#101828] dark:text-white">{current.title}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Giải pháp vận hành chuyên biệt</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {current.desc}
            </p>

            <div className="space-y-3 pt-2 text-sm text-[#101828] dark:text-slate-200">
              {current.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <TiltedCard maxTilt={8} perspective={1200}>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 space-y-5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    MẪU WORKSPACE THỰC TẾ
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Đang hoạt động
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-lg font-black text-[#101828] dark:text-white block">
                    {current.sampleData.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Được cấu hình sẵn quy tắc và biểu phí tự động
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Quy mô</span>
                    <span className="text-xs sm:text-sm font-bold text-[#101828] dark:text-white">
                      {current.sampleData.statA}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Dòng tiền</span>
                    <span className="text-xs sm:text-sm font-bold text-[#2538D9] dark:text-blue-400">
                      {current.sampleData.statB}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Cơ chế</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {current.sampleData.statC}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-xs text-[#2538D9] dark:text-blue-300 font-semibold flex items-center justify-between">
                  <span>Khởi tạo workspace trong 60 giây</span>
                  <span className="font-bold">Miễn phí trải nghiệm →</span>
                </div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </div>
    </section>
  );
}
