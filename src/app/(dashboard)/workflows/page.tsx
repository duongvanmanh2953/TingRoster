'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  CheckCircle2,
  Settings2,
  GraduationCap,
  Trophy,
  Building,
  ArrowRight,
  Clock,
  Bell,
  CreditCard,
  ShieldAlert,
  Save,
  Check,
  Layers,
  Sliders
} from 'lucide-react';
import Switch from '@mui/material/Switch';

interface WorkflowTemplate {
  id: string;
  name: string;
  category: 'CLASS' | 'SPORTS_CLUB' | 'RENTAL';
  description: string;
  icon: any;
  steps: string[];
  rules: {
    cycle: string;
    attendanceRule: string;
    feeRule: string;
    reminderDays: number;
    partialPayment: boolean;
  };
}

export default function WorkflowsPage() {
  const templates: WorkflowTemplate[] = [
    {
      id: 'template_class',
      name: 'Quy trình Lớp học & Gia sư (Thu theo tháng / buổi)',
      category: 'CLASS',
      description: 'Phù hợp giáo viên dạy thêm, trung tâm ôn thi. Điểm danh theo buổi và tự động chốt học phí vào ngày 28 hàng tháng.',
      icon: GraduationCap,
      steps: [
        'Nhập danh sách học sinh & phụ huynh',
        'Điểm danh 1 chạm hàng ngày (Có mặt / Vắng)',
        'Cuối tháng tự động nhân đơn giá / buổi',
        'Phát hành bảng kê học phí kèm mã VietQR',
        'Ngân hàng khớp giao dịch sau 5 giây',
        'Gửi tin nhắn biên nhận qua Zalo / Telegram'
      ],
      rules: {
        cycle: 'MONTHLY',
        attendanceRule: 'Chỉ tính phí buổi có mặt hoặc vắng không phép',
        feeRule: 'Đơn giá cố định 75.000đ/buổi × Số buổi thực tế',
        reminderDays: 3,
        partialPayment: true,
      },
    },
    {
      id: 'template_sports',
      name: 'Quy trình CLB Thể Thao (Pickleball, Cầu lông, Bóng đá)',
      category: 'SPORTS_CLUB',
      description: 'Phù hợp nhóm thể thao thu theo gói 10 buổi hoặc theo tháng. Hội viên nạp tiền và trừ dần lượt chơi.',
      icon: Trophy,
      steps: [
        'Hội viên đăng ký gói sinh hoạt (10 buổi / 20 buổi)',
        'Tạo mã thanh toán nạp lượt chơi VietQR',
        'Quét QR hoặc chạm điểm danh khi đến sân',
        'Trừ 1 lượt chơi và cập nhật số dư realtime',
        'Cảnh báo khi gói còn dưới 2 buổi'
      ],
      rules: {
        cycle: 'PER_SESSION',
        attendanceRule: 'Trừ 1 lượt ngay khi điểm danh vào sân',
        feeRule: 'Gói 10 buổi: 500.000đ (50.000đ/lượt)',
        reminderDays: 2,
        partialPayment: false,
      },
    },
    {
      id: 'template_rental',
      name: 'Quy trình Nhà Trọ & Căn Hộ Mini (Tiền phòng + Điện nước)',
      category: 'RENTAL',
      description: 'Phù hợp chủ nhà trọ cho thuê. Chốt chỉ số điện nước ngày 25, gửi thông báo tiền phòng ngày 28.',
      icon: Building,
      steps: [
        'Nhập chỉ số điện (kWh) và nước (m³) cuối tháng',
        'Hệ thống tự động cộng tiền phòng + phụ phí dịch vụ',
        'Tạo bảng kê tiền phòng chi tiết từng dòng',
        'Gửi link VietQR đến người thuê qua Zalo',
        'Tự động gạch nợ và đổi trạng thái hợp đồng sang ĐÃ ĐÓNG'
      ],
      rules: {
        cycle: 'MONTHLY',
        attendanceRule: 'Không áp dụng điểm danh',
        feeRule: 'Tiền phòng 3.500.000đ + Điện 4.000đ/kWh + Nước 25.000đ/m³',
        reminderDays: 5,
        partialPayment: true,
      },
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<string>('template_class');
  const [reminderDays, setReminderDays] = useState<number>(3);
  const [partialPayment, setPartialPayment] = useState<boolean>(true);
  const [autoReminder, setAutoReminder] = useState<boolean>(true);
  const [telegramAlert, setTelegramAlert] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const active = templates.find((t) => t.id === selectedTemplate) || templates[0];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-[#2538D9]" />
            <h1 className="text-xl font-bold text-[#111827] dark:text-white">Thiết Lập Quy Trình Quản Lý (Workflow Builder)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            TingRoster trao quyền cho Chủ cơ sở tự do định nghĩa quy trình thu tiền, tính học phí và phương thức nhắc nợ phù hợp nhất với mô hình của mình.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Đã lưu cấu hình!' : 'Lưu quy trình'}</span>
        </button>
      </div>

      {/* Template Selector Cards */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chọn mẫu quy trình khởi đầu (Template)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-[#111726] border-[#2538D9] shadow-md ring-2 ring-[#2538D9]/15'
                    : 'bg-white dark:bg-[#111726] border-[#E5E7EB] dark:border-[#1E293B] hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]">
                      <Icon className="w-5 h-5 text-[#2538D9]" />
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2538D9] text-white">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] dark:text-white mt-3">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B] text-[11px] text-slate-400">
                  <span>{tpl.steps.length} bước tự động hóa</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Workflow Steps Stepper */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 sm:p-7 space-y-4">
        <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2538D9]" />
          <span>Luồng hoạt động chuẩn hóa: {active.name}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {active.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#0B0F19]/60 flex items-start gap-3 text-xs"
            >
              <span className="w-6 h-6 rounded-full bg-[#2538D9] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                {idx + 1}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Configurable Business Rules */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 sm:p-7 space-y-5">
        <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#2538D9]" />
          <span>Tùy chỉnh quy tắc nghiệp vụ theo cơ sở</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Rule 1: Reminder days */}
          <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] space-y-2">
            <span className="font-bold text-slate-800 dark:text-white block">Tự động nhắc hạn thanh toán</span>
            <p className="text-slate-500 text-[11px]">Hệ thống sẽ tự động gửi thông báo qua Zalo/Email trước khi đến hạn.</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-slate-600">Nhắc trước:</span>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-slate-50 dark:bg-[#0B0F19] font-bold text-[#2538D9]"
              >
                <option value={1}>1 ngày trước hạn</option>
                <option value={2}>2 ngày trước hạn</option>
                <option value={3}>3 ngày trước hạn</option>
                <option value={5}>5 ngày trước hạn</option>
              </select>
            </div>
          </div>

          {/* Rule 2: Partial payment */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">Chính sách thanh toán từng phần</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">Cho phép học viên/khách nộp trước một phần tiền cọc hoặc học phí đợt 1.</p>
              </div>
              <Switch
                checked={partialPayment}
                onChange={(e) => setPartialPayment(e.target.checked)}
                color="primary"
                aria-label="Kích hoạt thanh toán linh hoạt nhiều đợt"
              />
            </div>
          </div>

          {/* Rule 3: Auto reminder channel */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">Gửi biên nhận tự động khi đối soát thành công</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">Ngay khi tài khoản ngân hàng nhận tiền khớp mã TR, gửi xác nhận tức thì qua Email & Bảng tin.</p>
              </div>
              <Switch
                checked={autoReminder}
                onChange={(e) => setAutoReminder(e.target.checked)}
                color="primary"
                aria-label="Tự động gửi biên nhận qua Email & Bảng tin"
              />
            </div>
          </div>

          {/* Rule 4: Telegram alert */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">Cảnh báo giao dịch pending hoặc sai cú pháp</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">Báo ngay vào Telegram của Giáo viên/Chủ cơ sở nếu phụ huynh chuyển sai nội dung.</p>
              </div>
              <Switch
                checked={telegramAlert}
                onChange={(e) => setTelegramAlert(e.target.checked)}
                color="primary"
                aria-label="Nhận cảnh báo sai lệch qua Bot Telegram"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
