'use client';

import React, { useEffect, useState } from 'react';
import { formatDateVN, formatDateTimeVN } from '@/lib/utils';
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
  History
} from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

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
  color: string;
}

const PRESET_PIPELINES: Array<{
  id: string;
  name: string;
  desc: string;
  steps: WorkflowStep[];
}> = [
  {
    id: 'vietqr-auto-settle',
    name: 'Gạch nợ siêu tốc VietQR & Gửi Zalo ZNS',
    desc: 'Tự động gạch nợ ngay lập tức khi tiền về tài khoản ngân hàng và gửi biên lai cho phụ huynh.',
    steps: [
      {
        type: 'TRIGGER',
        title: 'Khi nhận tiền từ Webhook VietQR (Napas 24/7)',
        desc: 'Bắt gói tin JSON từ SePay / Casso ngay lập tức',
        badge: 'Trigger',
        color: 'border-indigo-300 bg-indigo-50/50 text-[#2538D9]',
      },
      {
        type: 'CONDITION',
        title: 'Khớp mã thanh toán TR và số tiền >= Còn nợ',
        desc: 'Kiểm tra tính hợp lệ và loại trừ giao dịch trùng lặp',
        badge: 'Điều kiện',
        color: 'border-amber-300 bg-amber-50/50 text-amber-800',
      },
      {
        type: 'ACTION',
        title: 'Gạch nợ hóa đơn & Chuyển trạng thái PAID',
        desc: 'Ghi nhật ký phân bổ thanh toán nguyên tử (Atomic)',
        badge: 'Hành động 1',
        color: 'border-emerald-300 bg-emerald-50/50 text-emerald-800',
      },
      {
        type: 'ACTION',
        title: 'Gửi tin nhắn Zalo ZNS kèm link phiếu thu cá nhân',
        desc: 'Khấu trừ 200 ₫ từ số dư dịch vụ TingRoster',
        badge: 'Hành động 2',
        color: 'border-blue-300 bg-blue-50/50 text-blue-800',
      },
      {
        type: 'ACTION',
        title: 'Phát âm thanh "Ting" chime trên Dashboard',
        desc: 'Thông báo nổi tức thời cho thu ngân và giáo viên',
        badge: 'Hành động 3',
        color: 'border-purple-300 bg-purple-50/50 text-purple-800',
      },
    ],
  },
  {
    id: 'absent-warning',
    name: 'Cảnh báo vắng 2 buổi liên tiếp qua Zalo',
    desc: 'Phát hiện sớm nguy cơ bỏ học và gửi tin nhắn quan tâm đến gia đình học viên.',
    steps: [
      {
        type: 'TRIGGER',
        title: 'Khi điểm danh kết thúc buổi học',
        desc: 'Kích hoạt ngay khi giáo viên bấm "Lưu điểm danh"',
        badge: 'Trigger',
        color: 'border-indigo-300 bg-indigo-50/50 text-[#2538D9]',
      },
      {
        type: 'CONDITION',
        title: 'Học viên có 2 buổi vắng liên tiếp trong 7 ngày',
        desc: 'Phân tích lịch sử từ bảng Attendance',
        badge: 'Điều kiện',
        color: 'border-amber-300 bg-amber-50/50 text-amber-800',
      },
      {
        type: 'ACTION',
        title: 'Gửi thông báo hỏi thăm vào Zalo phụ huynh',
        desc: 'Đính kèm tóm tắt bài học & bài tập về nhà cần làm bù',
        badge: 'Hành động',
        color: 'border-blue-300 bg-blue-50/50 text-blue-800',
      },
    ],
  },
  {
    id: 'overdue-reminder',
    name: 'Nhắc nợ tự động lúc 09:00 khi quá hạn 3 ngày',
    desc: 'Tự động gửi tin nhắn nhắc nợ lịch sự và mã VietQR cá nhân hóa mà không làm phiền phụ huynh.',
    steps: [
      {
        type: 'TRIGGER',
        title: 'Cron job định kỳ hàng ngày lúc 09:00 sáng',
        desc: 'Lên lịch hệ thống tự động quét toàn bộ hóa đơn',
        badge: 'Cron Trigger',
        color: 'border-indigo-300 bg-indigo-50/50 text-[#2538D9]',
      },
      {
        type: 'CONDITION',
        title: 'Hóa đơn chưa thanh toán & quá hạn từ 1 đến 7 ngày',
        desc: 'Loại trừ các học sinh đã xin bảo lưu hoặc đang chờ giải quyết',
        badge: 'Điều kiện',
        color: 'border-amber-300 bg-amber-50/50 text-amber-800',
      },
      {
        type: 'ACTION',
        title: 'Sinh mã VietQR động & Gửi nhắc nhở tinh tế qua Zalo',
        desc: 'Giúp phụ huynh 1 chạm chuyển khoản ngay mà không cần nhập STK',
        badge: 'Hành động',
        color: 'border-emerald-300 bg-emerald-50/50 text-emerald-800',
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
    }, 900);
  };

  const activePipeline = PRESET_PIPELINES.find((p) => p.id === selectedPipelineId) || PRESET_PIPELINES[0];

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#2538D9]/10 text-[#2538D9]">
              <Workflow className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[#101828] tracking-tight">Quy Trình Tự Động Hóa & Workflow Builder</h1>
          </div>
          <p className="text-xs text-[#475467] mt-1">
            Thiết kế trực quan các luồng sự kiện: Webhook VietQR ➔ Điều kiện kiểm tra ➔ Tự động gạch nợ ➔ Gửi tin Zalo.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm kịch bản mới</span>
        </button>
      </div>

      {/* 2. Visual Workflow Canvas */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-[#2538D9] tracking-wider">Visual Workflow Canvas</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Node Engine
              </span>
            </div>
            <h2 className="text-base font-bold text-[#101828] mt-1">{activePipeline.name}</h2>
            <p className="text-xs text-[#475467] mt-0.5">{activePipeline.desc}</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E4E7EC] text-xs font-bold text-[#101828] bg-[#F8FAFC] focus:outline-none focus:border-[#2538D9]"
            >
              {PRESET_PIPELINES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleSimulateWorkflow}
              disabled={simulatingStep >= 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2538D9] hover:bg-[#1E2DB8] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{simulatingStep >= 0 ? 'Đang chạy mô phỏng...' : 'Chạy thử mô phỏng'}</span>
            </button>
          </div>
        </div>

        {simulationComplete && (
          <Alert severity="success" className="text-xs font-bold">
            Mô phỏng toàn bộ luồng thành công! Dữ liệu mẫu đã được kích hoạt, gạch nợ và gửi thông báo kiểm thử.
          </Alert>
        )}

        {/* Node Pipeline View */}
        <div className="relative py-4 overflow-x-auto">
          <div className="flex items-stretch gap-4 min-w-[780px]">
            {activePipeline.steps.map((step, idx) => {
              const isCurrentSim = simulatingStep === idx;
              const isPastSim = simulatingStep > idx;

              return (
                <React.Fragment key={idx}>
                  <div
                    className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      step.color
                    } ${
                      isCurrentSim
                        ? 'ring-4 ring-[#2538D9]/30 scale-105 border-[#2538D9] shadow-lg'
                        : isPastSim
                        ? 'opacity-90 border-emerald-400'
                        : 'shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-current">
                          {step.badge}
                        </span>
                        {isCurrentSim && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#2538D9] animate-ping" />
                        )}
                        {isPastSim && (
                          <Check className="w-4 h-4 text-emerald-600 font-bold" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold leading-tight">{step.title}</h4>
                      <p className="text-[11px] opacity-80 mt-1 leading-snug">{step.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-current/20 flex items-center justify-between text-[10px] font-mono">
                      <span>Node #{idx + 1}</span>
                      <span>{step.type}</span>
                    </div>
                  </div>

                  {idx < activePipeline.steps.length - 1 && (
                    <div className="flex items-center justify-center flex-shrink-0 text-slate-400">
                      <ArrowRight className={`w-5 h-5 ${isCurrentSim ? 'text-[#2538D9] animate-pulse' : ''}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Managed Rules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase text-[#101828] tracking-wider">
            Danh sách kịch bản đang vận hành ({rules.length})
          </h3>
          <button
            onClick={loadRules}
            className="text-xs text-[#475467] hover:text-[#101828] flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E4E7EC] text-xs text-[#475467]">
            <CircularProgress size={16} className="text-[#2538D9] mb-2" />
            <p>Đang tải danh sách kịch bản tự động hóa...</p>
          </div>
        ) : rules.length > 0 ? (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rule.isEnabled ? 'bg-white border-[#E4E7EC] shadow-xs' : 'bg-slate-50 border-[#E2E8F0] opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#101828] text-xs">{rule.name}</span>
                  {rule.isEnabled ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đang bật
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#475467] border border-slate-200">
                      Đã tắt
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#475467]">
                  <span>
                    ⚡ Khi: <strong className="text-[#101828]">{renderTriggerLabel(rule.trigger)}</strong>
                  </span>
                  <span>
                    ➔ Thực thi: <strong className="text-[#2538D9]">{renderActionLabel(rule.action)}</strong>
                  </span>
                </div>

                {rule.lastRunAt && (
                  <p className="text-[11px] text-[#64748B]">
                    Lần chạy gần nhất: {formatDateTimeVN(rule.lastRunAt)} ({rule.lastRunStatus || 'SUCCESS'})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  type="button"
                  disabled={testingId === rule.id}
                  onClick={() => handleTestRun(rule.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#101828] border border-[#E4E7EC] text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 text-[#2538D9]" />
                  <span>{testingId === rule.id ? 'Đang chạy...' : 'Chạy thử'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(rule.id, rule.isEnabled)}
                  className="p-1 transition"
                  title={rule.isEnabled ? 'Tắt quy tắc này' : 'Bật quy tắc này'}
                >
                  {rule.isEnabled ? (
                    <ToggleRight className="w-8 h-8 text-[#2538D9]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E4E7EC] text-xs text-[#475467]">
            Chưa có kịch bản tự động hóa nào. Bấm &quot;Thêm kịch bản mới&quot; để thiết lập.
          </div>
        )}
      </div>

      {/* 4. Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#101828]">Thêm kịch bản tự động hóa</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-[#101828] rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Tên kịch bản tự động *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Báo động giao dịch sai mã TR..."
                  className="w-full border border-[#E4E7EC] rounded-xl px-3.5 py-2.5 bg-white text-[#101828] font-medium placeholder-slate-400 focus:outline-none focus:border-[#2538D9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Sự kiện kích hoạt (Trigger) *
                </label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full border border-[#E4E7EC] rounded-xl px-3.5 py-2.5 bg-white text-[#101828] font-medium focus:outline-none focus:border-[#2538D9]"
                >
                  <option value="ON_UNMATCHED_TRANSACTION">Giao dịch ngân hàng không khớp mã TR</option>
                  <option value="ON_PAYMENT_SUCCESS">Nhận được học phí qua VietQR thành công</option>
                  <option value="ON_ABSENCE_CONSECUTIVE">Học viên vắng 2 buổi liên tiếp</option>
                  <option value="ON_INVOICE_OVERDUE">Học phí quá hạn nộp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Hành động thực thi (Action) *
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full border border-[#E4E7EC] rounded-xl px-3.5 py-2.5 bg-white text-[#101828] font-medium focus:outline-none focus:border-[#2538D9]"
                >
                  <option value="TELEGRAM_ALERT">Báo động tức thì vào Telegram Quản trị</option>
                  <option value="ZALO_PARENT_REMINDER">Gửi tin nhắn Zalo ZNS nhắc phụ huynh</option>
                  <option value="AUTO_CHARGE_DEBT">Tự động tính phí buổi vắng vào kỳ sau</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#475467] hover:text-[#101828] rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
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
