'use client';

import React, { useEffect, useState } from 'react';
import { formatDateTimeVN } from '@/lib/utils';
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Bell,
  Clock,
  Send,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  X,
  Workflow,
  ArrowRight,
  Filter,
  Check,
  Smartphone,
  CreditCard,
  Volume2,
  Layers,
  History,
  Terminal,
  Activity,
  Code2,
  Copy,
  ChevronRight,
  Building2,
  GraduationCap
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import { TingSelect } from '@/components/common/Select';

interface AutomationRuleItem {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isEnabled: boolean;
  lastRunAt?: string | null;
  lastRunStatus?: string | null;
}

interface WorkflowStep {
  type: 'TRIGGER' | 'CONDITION' | 'ACTION';
  title: string;
  desc: string;
  badge: string;
  iconName: 'webhook' | 'filter' | 'settle' | 'zalo' | 'sound' | 'calendar' | 'kiosk';
}

const PRESET_PIPELINES: Array<{
  id: string;
  category: 'ALL' | 'EDUCATION' | 'SPORTS' | 'RENTAL';
  name: string;
  desc: string;
  samplePayload: Record<string, unknown>;
  steps: WorkflowStep[];
}> = [
  {
    id: 'vietqr-auto-settle',
    category: 'EDUCATION',
    name: 'Gạch nợ VietQR 24/7 & Gửi Zalo ZNS',
    desc: 'Bắt webhook chuyển khoản ngân hàng qua Napas, tự động gạch nợ học phí nguyên tử và gửi biên lai xác nhận.',
    samplePayload: {
      gateway: 'SePay Webhook Engine',
      transactionId: 'TX_84920491',
      transferType: 'in',
      transferAmount: 600000,
      content: 'NGUYEN VAN A CK HOC PHI TR84920',
      matchedInvoiceCode: 'TR84920',
      allocationStatus: 'ATOMIC_SETTLED_PAID',
      notificationChannels: ['Zalo ZNS (Sent)', 'Dashboard Web Chime (Played)'],
      latencyMs: 38
    },
    steps: [
      {
        type: 'TRIGGER',
        title: 'Webhook VietQR Napas 24/7',
        desc: 'Bắt gói tin JSON từ SePay/Casso ngay khi tiền vào tài khoản',
        badge: 'Trigger 01',
        iconName: 'webhook',
      },
      {
        type: 'CONDITION',
        title: 'Fuzzy Matching & Lũy đẳng',
        desc: 'Kiểm tra mã TR84920, số tiền >= Còn nợ, chặn cộng trùng',
        badge: 'Rule Engine',
        iconName: 'filter',
      },
      {
        type: 'ACTION',
        title: 'Gạch nợ nguyên tử (Atomic)',
        desc: 'Cập nhật Invoice PAID, lưu PaymentAllocation trong $transaction',
        badge: 'Action 01',
        iconName: 'settle',
      },
      {
        type: 'ACTION',
        title: 'Gửi Zalo ZNS kèm link phiếu thu',
        desc: 'Tin nhắn thương hiệu ZNS gửi tức thì đến số điện thoại phụ huynh',
        badge: 'Action 02',
        iconName: 'zalo',
      },
      {
        type: 'ACTION',
        title: 'Phát âm thanh "Ting!" Chime',
        desc: 'Rung chuông âm thanh trực tiếp trên Dashboard và Kiosk',
        badge: 'Action 03',
        iconName: 'sound',
      },
    ],
  },
  {
    id: 'sports-kiosk-checkin',
    category: 'SPORTS',
    name: 'Quét QR Check-in sân CLB Pickleball / Cầu lông',
    desc: 'Hội viên quét mã VietQR tại sân ➔ Tự động trừ tiền vé lượt ➔ Mở quyền vào sân và phát thông báo loa.',
    samplePayload: {
      venue: 'Sân Pickleball Sân 2 - Cụm Thể Thao',
      member: 'Trần Văn Hoàng (Hội viên Vàng)',
      ticketFee: 50000,
      kioskId: 'KIOSK_GATE_02',
      gateStatus: 'UNLOCKED_5_SECONDS',
      audioBroadcast: 'Xin chào Trần Văn Hoàng, chúc bạn thi đấu vui vẻ!'
    },
    steps: [
      {
        type: 'TRIGGER',
        title: 'Hội viên quét VietQR tại Kiosk',
        desc: 'Mã QR động chứa số tiền vé lượt và ID sân thi đấu',
        badge: 'Trigger 01',
        iconName: 'kiosk',
      },
      {
        type: 'CONDITION',
        title: 'Xác thực tài khoản & Giờ thuê',
        desc: 'Kiểm tra khung giờ ca chơi 17:30 - 19:30 có trùng lịch',
        badge: 'Rule Engine',
        iconName: 'filter',
      },
      {
        type: 'ACTION',
        title: 'Ghi nhận điểm danh & Trừ số dư',
        desc: 'Tự động tạo phiếu thu lượt và cập nhật trạng thái có mặt',
        badge: 'Action 01',
        iconName: 'settle',
      },
      {
        type: 'ACTION',
        title: 'Phát loa thông báo chào mừng',
        desc: 'Text-to-speech phát tên hội viên qua hệ thống âm thanh sân',
        badge: 'Action 02',
        iconName: 'sound',
      },
    ],
  },
  {
    id: 'rental-monthly-billing',
    category: 'RENTAL',
    name: 'Chốt số điện nước & Lên hóa đơn phòng ngày 25',
    desc: 'Tự động tính chỉ số điện nước, gửi thông báo tiền phòng kèm mã VietQR 1-chạm đến Zalo người thuê.',
    samplePayload: {
      room: 'Phòng 302 - Căn hộ dịch vụ Mini',
      billingPeriod: 'Tháng 4/2026',
      totalRent: 4200000,
      electricity: '124 kWh x 3.800 đ',
      water: '12 m³ x 25.000 đ',
      status: 'INVOICE_SENT_ZALO',
      paymentToken: 'https://tingroster.vn/p/p302-t4'
    },
    steps: [
      {
        type: 'TRIGGER',
        title: 'Cron Job định kỳ ngày 25 hàng tháng',
        desc: 'Hệ thống tự động kích hoạt tiến trình chốt chu kỳ thuê phòng',
        badge: 'Cron Trigger',
        iconName: 'calendar',
      },
      {
        type: 'CONDITION',
        title: 'Kiểm tra trạng thái phòng đang thuê',
        desc: 'Loại trừ phòng trống hoặc hợp đồng đang thanh lý cọc',
        badge: 'Rule Engine',
        iconName: 'filter',
      },
      {
        type: 'ACTION',
        title: 'Tạo hóa đơn tổng hợp điện + nước + phòng',
        desc: 'Tính toán biểu giá lũy tiến và tạo mã thanh toán duy nhất',
        badge: 'Action 01',
        iconName: 'settle',
      },
      {
        type: 'ACTION',
        title: 'Gửi link thanh toán VietQR qua Zalo',
        desc: 'Người thuê chỉ cần quét là chuyển khoản chính xác từng đồng',
        badge: 'Action 02',
        iconName: 'zalo',
      },
    ],
  },
  {
    id: 'absent-warning',
    category: 'EDUCATION',
    name: 'Cảnh báo vắng 2 buổi liên tiếp qua Zalo',
    desc: 'Phát hiện sớm nguy cơ nghỉ học bất thường để giáo viên kịp thời quan tâm học sinh.',
    samplePayload: {
      student: 'Nguyễn Văn Minh (Lớp Toán 6A)',
      absentDates: ['2026-04-18', '2026-04-20'],
      alertLevel: 'HIGH_INTERVENTION_NEEDED',
      autoRemind: 'Gửi tóm tắt bài giảng & bài tập về nhà vào Zalo mẹ'
    },
    steps: [
      {
        type: 'TRIGGER',
        title: 'Điểm danh xong ca học hôm nay',
        desc: 'Kích hoạt ngay khi giáo viên bấm "Lưu sổ điểm danh"',
        badge: 'Trigger 01',
        iconName: 'calendar',
      },
      {
        type: 'CONDITION',
        title: 'Phát hiện 2 buổi vắng liên tiếp trong 7 ngày',
        desc: 'Quét bảng Attendance tìm chuỗi trạng thái ABSENT',
        badge: 'Rule Engine',
        iconName: 'filter',
      },
      {
        type: 'ACTION',
        title: 'Gửi tin nhắn hỏi thăm vào Zalo phụ huynh',
        desc: 'Đính kèm tóm tắt bài giảng và bài tập về nhà cần hoàn thành',
        badge: 'Action 01',
        iconName: 'zalo',
      },
    ],
  },
];

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('vietqr-auto-settle');
  const [simulatingStep, setSimulatingStep] = useState<number>(-1);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'visual' | 'payload' | 'logs'>('visual');

  // Form states
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('ON_UNMATCHED_TRANSACTION');
  const [action, setAction] = useState('TELEGRAM_ALERT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRules = () => {
    setLoading(true);
    fetch('/api/automations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRules(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (id: string, currentState: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !currentState } : r))
    );

    try {
      await fetch(`/api/automations/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !currentState }),
      });
    } catch {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isEnabled: currentState } : r))
      );
    }
  };

  const handleTestRun = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/automations/${id}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('Kích hoạt chạy thử nghiệm thành công! Hệ thống đã ghi nhận nhật ký.');
        loadRules();
      }
    } catch {
      alert('Lỗi kích hoạt chạy thử');
    } finally {
      setTestingId(null);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          trigger,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setName('');
        loadRules();
      } else {
        alert(data.error || 'Lỗi khi tạo quy tắc');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateWorkflow = () => {
    const pipeline = PRESET_PIPELINES.find((p) => p.id === selectedPipelineId);
    if (!pipeline) return;

    setSimulationComplete(false);
    setSimulatingStep(0);

    const totalSteps = pipeline.steps.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      if (current < totalSteps) {
        setSimulatingStep(current);
      } else {
        clearInterval(interval);
        setSimulatingStep(-1);
        setSimulationComplete(true);
        setTimeout(() => setSimulationComplete(false), 5000);
      }
    }, 750);
  };

  const activePipeline = PRESET_PIPELINES.find((p) => p.id === selectedPipelineId) || PRESET_PIPELINES[0];

  const renderStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'webhook':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'filter':
        return <Filter className="w-4 h-4 text-indigo-500" />;
      case 'settle':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'zalo':
        return <Smartphone className="w-4 h-4 text-blue-500" />;
      case 'sound':
        return <Volume2 className="w-4 h-4 text-purple-500" />;
      case 'calendar':
        return <Clock className="w-4 h-4 text-rose-500" />;
      case 'kiosk':
        return <CreditCard className="w-4 h-4 text-cyan-500" />;
      default:
        return <Activity className="w-4 h-4 text-[#2538D9]" />;
    }
  };

  const renderTriggerLabel = (t: string) => {
    switch (t) {
      case 'ON_PAYMENT_SUCCESS':
        return 'Nhận được học phí qua VietQR';
      case 'ON_ABSENCE_CONSECUTIVE':
        return 'Học viên vắng 2 buổi liên tiếp';
      case 'ON_UNMATCHED_TRANSACTION':
        return 'Giao dịch ngân hàng không khớp mã TR';
      case 'ON_INVOICE_OVERDUE':
        return 'Học phí quá hạn nộp';
      default:
        return t;
    }
  };

  const renderActionLabel = (a: string) => {
    switch (a) {
      case 'TELEGRAM_ALERT':
        return 'Báo động tức thì vào Telegram Quản trị';
      case 'ZALO_PARENT_REMINDER':
        return 'Gửi tin nhắn Zalo ZNS nhắc phụ huynh';
      case 'AUTO_CHARGE_DEBT':
        return 'Tự động tính phí buổi vắng vào kỳ sau';
      default:
        return a;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E4E7EC] dark:border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400">
              <Workflow className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-[#F8FAFC] tracking-tight">
              Quy Trình Tự Động Hóa & Workflow Builder
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 uppercase">
              Idempotent Engine
            </span>
          </div>
          <p className="text-xs text-[#475467] dark:text-slate-400 mt-1">
            Thiết kế trực quan các luồng sự kiện: Webhook VietQR ➔ Kiểm tra điều kiện ➔ Tự động gạch nợ ➔ Gửi tin nhắn Zalo.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo kịch bản mới</span>
        </button>
      </div>

      {/* 2. Visual Workflow Canvas */}
      <div className="ting-card p-5 sm:p-6 space-y-6 overflow-hidden">
        
        {/* Canvas Toolbar: Unified TingSelect + Simulation Trigger */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC] dark:border-[#1E293B]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#101828] dark:text-[#F8FAFC]">
                {activePipeline.name}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {activePipeline.steps.length} bước
              </span>
            </div>
            <p className="text-xs text-[#475467] dark:text-slate-400 max-w-2xl leading-relaxed">
              {activePipeline.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Unified TingSelect for switching pipelines */}
            <TingSelect
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              options={PRESET_PIPELINES.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
              icon={<Workflow className="w-3.5 h-3.5 text-[#2538D9] dark:text-indigo-400" />}
              className="w-full sm:w-72 font-semibold text-xs"
            />

            <button
              onClick={handleSimulateWorkflow}
              disabled={simulatingStep >= 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all h-9 flex-shrink-0"
            >
              <Play className={`w-3.5 h-3.5 ${simulatingStep >= 0 ? 'animate-spin' : ''}`} />
              <span>{simulatingStep >= 0 ? 'Đang chạy mô phỏng...' : 'Chạy thử mô phỏng'}</span>
            </button>
          </div>
        </div>

        {simulationComplete && (
          <Alert severity="success" className="text-xs font-bold rounded-lg">
            Mô phỏng toàn bộ luồng thành công! Dữ liệu mẫu đã được chuyển trạng thái PAID và lưu nhật ký phân bổ (PaymentAllocation).
          </Alert>
        )}

        {/* Node Pipeline View with Connected Wires */}
        <div className="relative py-4 overflow-x-auto">
          <div className="flex items-stretch gap-3 min-w-[840px] pb-2">
            {activePipeline.steps.map((step, idx) => {
              const isCurrentSim = simulatingStep === idx;
              const isPastSim = simulatingStep > idx;

              return (
                <React.Fragment key={idx}>
                  <div
                    className={`
                      flex-1 p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between relative
                      ${isCurrentSim
                        ? 'border-[#2538D9] dark:border-indigo-400 ring-4 ring-[#2538D9]/20 scale-[1.02] bg-blue-50/40 dark:bg-blue-950/30 shadow-md'
                        : isPastSim
                        ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-[#E4E7EC] dark:border-[#1E293B] bg-white dark:bg-[#111726] shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                      }
                    `}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="inline-flex items-center whitespace-nowrap select-none text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {step.badge}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {renderStepIcon(step.iconName)}
                          {isCurrentSim && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2538D9] dark:bg-black-400 animate-ping" />
                          )}
                          {isPastSim && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC] leading-snug">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-[#475467] dark:text-slate-400 mt-1 leading-normal">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#E4E7EC] dark:border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      <span>Node #{idx + 1}</span>
                      <span className="font-semibold">{step.type}</span>
                    </div>
                  </div>

                  {idx < activePipeline.steps.length - 1 && (
                    <div className="flex items-center justify-center flex-shrink-0 px-1 text-slate-400 dark:text-slate-600">
                      <div className="relative flex items-center justify-center">
                        <ArrowRight className={`w-4 h-4 ${isCurrentSim ? 'text-[#2538D9] dark:text-indigo-400 scale-125 transition-transform' : ''}`} />
                        {isCurrentSim && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2538D9] dark:bg-black-400 absolute -top-1 animate-pulse" />
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Live Payload & Execution Log Inspector */}
        <div className="rounded-lg border border-[#E4E7EC] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B0F19] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E7EC] dark:border-[#1E293B] bg-slate-100/60 dark:bg-slate-900/60 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#2538D9] dark:text-indigo-400" />
              <span className="font-bold text-[#101828] dark:text-[#F8FAFC]">Gói tin & Nhật ký luồng thời gian thực</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveConsoleTab('visual')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  activeConsoleTab === 'visual'
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#101828] dark:hover:text-white'
                }`}
              >
                Tóm tắt luồng
              </button>
              <button
                type="button"
                onClick={() => setActiveConsoleTab('payload')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  activeConsoleTab === 'payload'
                    ? 'bg-white dark:bg-[#111726] text-[#2538D9] dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-[#101828] dark:hover:text-white'
                }`}
              >
                Gói tin JSON
              </button>
            </div>
          </div>

          <div className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto max-h-48">
            {activeConsoleTab === 'payload' ? (
              <pre className="text-[11px] leading-relaxed text-indigo-900 dark:text-indigo-300">
                {JSON.stringify(activePipeline.samplePayload, null, 2)}
              </pre>
            ) : (
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#475467] dark:text-slate-400">Trạng thái định tuyến:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">200 OK • Sẵn sàng nhận gói tin</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#475467] dark:text-slate-400">Webhook Endpoint:</span>
                  <span className="font-mono text-[#2538D9] dark:text-indigo-400 font-semibold truncate max-w-xs">
                    https://tingroster.vn/api/webhooks/sepay
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#475467] dark:text-slate-400">Nguyên tắc giao dịch:</span>
                  <span className="text-[#101828] dark:text-[#F8FAFC]">Lũy đẳng (Idempotent) • Khóa chống double-spending</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Managed Rules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#101828] dark:text-[#F8FAFC]">
            Danh sách kịch bản đang vận hành ({rules.length})
          </h3>
          <button
            onClick={loadRules}
            className="text-xs text-[#475467] dark:text-slate-400 hover:text-[#101828] dark:hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2538D9]' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 ting-card text-xs text-[#475467] dark:text-slate-400">
            <CircularProgress size={20} sx={{ color: '#2538D9', mb: 1 }} />
            <p className="mt-2">Đang tải danh sách kịch bản tự động hóa...</p>
          </div>
        ) : rules.length > 0 ? (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`ting-card p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rule.isEnabled ? '' : 'opacity-60 bg-slate-50 dark:bg-slate-900/40'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#101828] dark:text-[#F8FAFC] text-xs sm:text-sm">
                    {rule.name}
                  </span>
                  {rule.isEnabled ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      Đang bật
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#475467] dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Đã tắt
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475467] dark:text-slate-400">
                  <span>
                    ⚡ Khi: <strong className="text-[#101828] dark:text-[#F8FAFC]">{renderTriggerLabel(rule.trigger)}</strong>
                  </span>
                  <span>
                    ➔ Thực thi: <strong className="text-[#2538D9] dark:text-indigo-400">{renderActionLabel(rule.action)}</strong>
                  </span>
                </div>

                {rule.lastRunAt && (
                  <p className="text-[11px] text-[#64748B] dark:text-slate-500">
                    Lần chạy gần nhất: {formatDateTimeVN(rule.lastRunAt)} ({rule.lastRunStatus || 'SUCCESS'})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  type="button"
                  disabled={testingId === rule.id}
                  onClick={() => handleTestRun(rule.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800 text-[#101828] dark:text-[#F8FAFC] border border-[#E4E7EC] dark:border-[#1E293B] text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 text-[#2538D9] dark:text-indigo-400" />
                  <span>{testingId === rule.id ? 'Đang chạy...' : 'Chạy thử'}</span>
                </button>

                <Switch
                  checked={rule.isEnabled}
                  onChange={() => handleToggle(rule.id, rule.isEnabled)}
                  color="primary"
                  aria-label={rule.isEnabled ? `Tắt kịch bản ${rule.name}` : `Bật kịch bản ${rule.name}`}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="ting-card p-12 text-center text-xs text-[#475467] dark:text-slate-400">
            Chưa có quy tắc tự động hóa nào. Nhấn &quot;Tạo kịch bản mới&quot; để thiết lập.
          </div>
        )}
      </div>

      {/* 4. Create Automation Modal with Unified TingSelect */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="ting-card max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between border-b border-[#E4E7EC] dark:border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2538D9]/10 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#101828] dark:text-[#F8FAFC]">
                  Thêm kịch bản tự động hóa
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-[#101828] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#101828] dark:text-[#F8FAFC] mb-1.5">
                  Tên kịch bản tự động *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Báo động giao dịch sai mã TR vào Telegram..."
                  className="w-full border border-[#E4E7EC] dark:border-[#1E293B] rounded-lg px-3.5 py-2.5 bg-white dark:bg-[#111726] text-[#101828] dark:text-[#F8FAFC] font-medium placeholder-slate-400 focus:outline-none focus:border-[#2538D9] h-10"
                />
              </div>

              <div>
                <TingSelect
                  label="Sự kiện kích hoạt (Trigger)"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  options={[
                    { value: 'ON_UNMATCHED_TRANSACTION', label: 'Giao dịch ngân hàng không khớp mã TR' },
                    { value: 'ON_PAYMENT_SUCCESS', label: 'Nhận được học phí qua VietQR thành công' },
                    { value: 'ON_ABSENCE_CONSECUTIVE', label: 'Học viên vắng 2 buổi liên tiếp' },
                    { value: 'ON_INVOICE_OVERDUE', label: 'Học phí quá hạn nộp' },
                  ]}
                  icon={<Zap className="w-4 h-4 text-amber-500" />}
                  sizeVariant="md"
                  containerClassName="w-full"
                />
              </div>

              <div>
                <TingSelect
                  label="Hành động thực thi (Action)"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  options={[
                    { value: 'TELEGRAM_ALERT', label: 'Báo động tức thì vào Telegram Quản trị' },
                    { value: 'ZALO_PARENT_REMINDER', label: 'Gửi tin nhắn Zalo ZNS nhắc phụ huynh' },
                    { value: 'AUTO_CHARGE_DEBT', label: 'Tự động tính phí buổi vắng vào kỳ sau' },
                  ]}
                  icon={<Send className="w-4 h-4 text-emerald-500" />}
                  sizeVariant="md"
                  containerClassName="w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E7EC] dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#475467] dark:text-slate-400 hover:text-[#101828] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-lg shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Lưu kịch bản'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
