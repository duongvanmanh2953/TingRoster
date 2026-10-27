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
  X
} from 'lucide-react';

interface AutomationRuleItem {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isEnabled: boolean;
  lastRunAt?: string | null;
  lastRunStatus?: string | null;
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    // Optimistic update
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
      // Rollback
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101828]">
              Tự Động Hóa & Thông Báo
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2538D9]/10 text-[#2538D9] border border-[#2538D9]/20 uppercase">
              Bot Zalo / Telegram
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            Thiết lập các kịch bản tự động gửi thông báo, cảnh báo dòng tiền và nhắc nợ học phí
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-semibold rounded-xl shadow-sm shadow-[#2538D9]/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm kịch bản mới</span>
        </button>
      </div>

      {/* 2. Rules List */}
      {loading ? (
        <div className="text-center py-20 text-[#475467] text-xs animate-pulse font-medium">
          Đang tải kịch bản tự động hóa...
        </div>
      ) : rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rule.isEnabled ? 'ting-card' : 'bg-white/60 border-[#E4E7EC] opacity-70'
              }`}
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#101828] text-sm">{rule.name}</span>
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
                    → Hành động: <strong className="text-[#2538D9]">{renderActionLabel(rule.action)}</strong>
                  </span>
                </div>

                {rule.lastRunAt && (
                  <p className="text-[11px] text-[#475467]">
                    Lần chạy gần nhất: {formatDateTimeVN(rule.lastRunAt)} ({rule.lastRunStatus || 'SUCCESS'})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  type="button"
                  disabled={testingId === rule.id}
                  onClick={() => handleTestRun(rule.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#101828] border border-[#E4E7EC] text-xs font-semibold rounded-xl transition-colors shadow-xs"
                  title="Chạy thử nghiệm ngay lập tức"
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
          ))}
        </div>
      ) : (
        <div className="text-center py-16 ting-card text-xs text-[#475467]">
          Chưa có quy tắc tự động hóa nào. Bấm &quot;Thêm kịch bản mới&quot; để tạo.
        </div>
      )}

      {/* 3. Create Automation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4E7EC] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2538D9]/10 text-[#2538D9] flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-[#101828]">Thêm kịch bản tự động hóa</h3>
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
                  className="px-4 py-2.5 text-xs font-semibold text-[#475467] hover:text-[#101828] rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
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
