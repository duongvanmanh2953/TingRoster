'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Trophy, 
  Building, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  Calendar,
  CreditCard,
  QrCode,
  Users,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface ModelData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  mockStats: { label: string; value: string }[];
  previewTitle: string;
  previewRows: { col1: string; col2: string; col3: string; badge: string }[];
}

const MODELS: ModelData[] = [
  {
    id: 'education',
    name: 'Giáo dục & Dạy thêm',
    tagline: 'Lớp học thêm, Trung tâm ngoại ngữ, Luyện thi THPT',
    description: 'Quản lý danh sách học sinh theo từng lớp, điểm danh theo buổi học, tính tiền học phí linh hoạt theo tháng hoặc theo buổi thực học.',
    icon: GraduationCap,
    features: [
      'Điểm danh tự động qua mã QR lớp học hoặc Kiosk tại cửa',
      'Học phí trừ tự động theo số buổi có mặt / vắng có phép',
      'Cổng phụ huynh tra cứu bảng điểm danh và đóng học phí VietQR',
      'Tự động gửi thông báo sĩ số vào nhóm Zalo/Telegram của lớp'
    ],
    mockStats: [
      { label: 'Học sinh đang học', value: '185 em' },
      { label: 'Tỷ lệ thu phí đúng hạn', value: '98.5%' },
      { label: 'Thời gian đối soát/tháng', value: '5 phút' }
    ],
    previewTitle: 'Lớp Toán 12A • Luyện thi THPT Quốc Gia',
    previewRows: [
      { col1: 'Nguyễn Văn An', col2: '8/8 buổi (Đầy đủ)', col3: '600.000 đ', badge: 'Đã đóng đủ' },
      { col1: 'Trần Thị Mai', col2: '7/8 buổi (1 vắng phép)', col3: '525.000 đ', badge: 'Đã đóng đủ' },
      { col1: 'Lê Hoàng Nam', col2: '8/8 buổi', col3: '600.000 đ', badge: 'Chưa đóng' },
    ]
  },
  {
    id: 'sports',
    name: 'CLB Thể thao & Sân bãi',
    tagline: 'Pickleball, Cầu lông, Bóng đá mini, Gym, Yoga',
    description: 'Phân ca tập linh hoạt, kiểm soát vé vào sân theo buổi hoặc gói tháng, thanh toán quét mã QR tại chỗ không cần nhân viên thu tiền mặt.',
    icon: Trophy,
    features: [
      'Mã QR đặt tại cửa sân: Hội viên quét là vào sân, tự động tích ca',
      'Hỗ trợ cả hội viên cố định theo tháng và khách vãng lai theo ca',
      'Hạn chế gian lận số người vào sân nhờ camera Kiosk đối chiếu',
      'Đối soát doanh thu theo từng sân đấu trong ngày theo thời gian thực'
    ],
    mockStats: [
      { label: 'Ca sân đã đặt hôm nay', value: '28 ca' },
      { label: 'Vé vãng lai thu qua QR', value: '1.400.000 đ' },
      { label: 'Hội viên hoạt động', value: '64 người' }
    ],
    previewTitle: 'CLB Pickleball & Cầu lông Quận 10 • Sân 1 - 4',
    previewRows: [
      { col1: 'Ca 17:30 - 19:30 (Sân 3)', col2: 'Team Trần Tuấn (4 người)', col3: '200.000 đ', badge: 'Đã thanh toán' },
      { col1: 'Vé vãng lai buổi sáng', col2: 'Khách lẻ quét QR quầy', col3: '50.000 đ', badge: 'Đã thanh toán' },
      { col1: 'Ca 20:00 - 22:00 (Sân 1)', col2: 'Gói tháng CLB Đêm', col3: 'Vé tháng', badge: 'Hội viên VIP' },
    ]
  },
  {
    id: 'rental',
    name: 'Cho thuê & Căn hộ mini',
    tagline: 'Nhà trọ, Căn hộ dịch vụ, Co-working space, Studio',
    description: 'Chốt chỉ số điện nước định kỳ, tự động cộng phụ phí phát sinh, sinh hóa đơn tiền phòng chi tiết có mã VietQR thanh toán 1 chạm.',
    icon: Building,
    features: [
      'Ghi chỉ số điện nước theo công tơ từng phòng có lưu ảnh bằng chứng',
      'Hợp đồng thuê điện tử và điều khoản phụ phí thỏa thuận minh bạch',
      'Gửi thông báo hóa đơn kèm link VietQR chính xác số tiền đến từng khách',
      'Hệ thống tự động gạch nợ tiền nhà ngay khi tài khoản ngân hàng báo có'
    ],
    mockStats: [
      { label: 'Tỷ lệ lấp đầy phòng', value: '16/16 phòng' },
      { label: 'Tiền phòng đã thu tháng', value: '72.000.000 đ' },
      { label: 'Công nợ điện nước', value: '0 đ (Đã thu đủ)' }
    ],
    previewTitle: 'Tòa nhà Dịch vụ TingHouse • 16 Phòng Studio',
    previewRows: [
      { col1: 'Phòng 201 • Chị Hương', col2: 'Tiền phòng + 142 số điện', col3: '4.850.000 đ', badge: 'Đã thanh toán' },
      { col1: 'Phòng 302 • Anh Đức', col2: 'Tiền phòng + 98 số điện', col3: '4.420.000 đ', badge: 'Đã thanh toán' },
      { col1: 'Phòng 104 • Bạn Lan', col2: 'Tiền phòng tháng 11', col3: '4.200.000 đ', badge: 'Hạn: 05/11' },
    ]
  },
  {
    id: 'enterprise',
    name: 'Doanh nghiệp & Đa chi nhánh',
    tagline: 'Chuỗi cơ sở, Công ty dịch vụ, Không gian đào tạo',
    description: 'Phân quyền chặt chẽ giữa Chủ cơ sở (Owner), Quản lý cơ sở (Manager) và Nhân viên lễ tân (Staff). Báo cáo tài chính hợp nhất không rò rỉ dữ liệu.',
    icon: Briefcase,
    features: [
      'Quản lý không giới hạn cơ sở và chi nhánh trên một tài khoản mẹ',
      'Mỗi chi nhánh có thể liên kết tài khoản ngân hàng nhận tiền riêng biệt',
      'Phân quyền xem báo cáo: Nhân viên chỉ điểm danh, chủ nắm tài chính',
      'Xuất báo cáo thuế và đối soát sao kê ngân hàng ra file Excel tiêu chuẩn'
    ],
    mockStats: [
      { label: 'Chi nhánh vận hành', value: '4 cơ sở' },
      { label: 'Tổng số nhân viên', value: '18 nhân sự' },
      { label: 'GMV hệ thống tháng', value: '240.000.000 đ' }
    ],
    previewTitle: 'Tập đoàn Giáo dục & Thể thao • Báo cáo hợp nhất',
    previewRows: [
      { col1: 'Cơ sở Quận 1 (Toán & Anh)', col2: '12 lớp • 140 học viên', col3: '84.000.000 đ', badge: 'Hoạt động tốt' },
      { col1: 'Cơ sở Bình Thạnh (Pickleball)', col2: '6 sân • 380 ca/tháng', col3: '76.000.000 đ', badge: 'Hoạt động tốt' },
      { col1: 'Cơ sở Cầu Giấy (Gym & Yoga)', col2: '95 hội viên thường trực', col3: '80.000.000 đ', badge: 'Hoạt động tốt' },
    ]
  }
];

export function IndustryModelsSection() {
  const [selectedId, setSelectedId] = useState('education');
  const activeModel = MODELS.find(m => m.id === selectedId) || MODELS[0];

  return (
    <section id="mo-hinh" className="industry-models-section py-20 sm:py-28 bg-white dark:bg-[#0B0F19] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="industry-header text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-300 text-xs font-medium">
            <span>Một nền tảng, nhiều mô hình chuyên biệt</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#101828] dark:text-white leading-tight">
            Được tùy biến cho đúng lĩnh vực của bạn
          </h2>
          <p className="text-base text-[#475467] dark:text-slate-400 font-normal leading-relaxed">
            Mỗi loại hình hoạt động có đặc thù tính phí và điểm danh khác nhau. TingRoster cung cấp các module tương ứng mà không làm phức tạp hóa giao diện.
          </p>
        </div>

        {/* Industry Model Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {MODELS.map((model) => {
            const Icon = model.icon;
            const isSelected = model.id === selectedId;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedId(model.id)}
                className={`industry-tab-btn p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-[#2538D9] dark:border-[#4F62FF] shadow-sm'
                    : 'bg-white dark:bg-[#111726] border-[#E4E7EC] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected 
                    ? 'bg-[#2538D9] text-white dark:bg-[#4F62FF]' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-semibold mb-1 ${
                  isSelected ? 'text-[#2538D9] dark:text-[#4F62FF]' : 'text-[#101828] dark:text-white'
                }`}>
                  {model.name}
                </h3>
                <p className="text-xs text-[#475467] dark:text-slate-400 font-normal line-clamp-1">
                  {model.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Model Content & Visual Preview */}
        <div className="industry-card p-6 sm:p-10 rounded-2xl bg-[#F5F7FB] dark:bg-[#111726] border border-[#E4E7EC] dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Description */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div>
                <span className="text-xs font-semibold text-[#2538D9] dark:text-[#4F62FF] tracking-wide uppercase">
                  {activeModel.tagline}
                </span>
                <h3 className="text-2xl font-semibold text-[#101828] dark:text-white mt-1">
                  {activeModel.name}
                </h3>
                <p className="text-sm text-[#475467] dark:text-slate-300 font-normal mt-2 leading-relaxed">
                  {activeModel.description}
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3">
                {activeModel.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#344054] dark:text-slate-300 font-normal">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Real Stats Grid for this Model */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[#EAECF0] dark:border-slate-800">
                {activeModel.mockStats.map((st, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">{st.label}</p>
                    <p className="text-sm sm:text-base font-semibold text-[#101828] dark:text-white tabular-nums mt-0.5">{st.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2538D9] dark:text-[#4F62FF] hover:underline cursor-pointer"
                >
                  <span>Bắt đầu áp dụng cho {activeModel.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Distinctive Screen Preview for this Model */}
            <div className="lg:col-span-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E4E7EC] dark:border-slate-800 shadow-md p-5 text-left">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-[#101828] dark:text-white">{activeModel.previewTitle}</p>
                    <p className="text-[11px] text-slate-400">Dữ liệu đối soát tự động thời gian thực</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#2538D9] dark:text-[#4F62FF] font-medium">
                    VietQR Active
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  {activeModel.previewRows.map((row, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-[#101828] dark:text-slate-200">{row.col1}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{row.col2}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#101828] dark:text-slate-200 tabular-nums">{row.col3}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                          {row.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hệ thống tự động đồng bộ khi thành viên chuyển khoản</span>
                  <span className="text-emerald-600 font-medium">Đã kiểm chứng Zero-Custody</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
