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
  ShieldCheck
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
    // Optimistic
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
        body: JSON.stringify({ name, trigger, action }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setName('');
        loadRules();
      }
    } catch {
      alert('Lỗi tạo quy tắc');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTriggerLabel = (t: string) => {
    switch (t) {
      case 'ON_UNMATCHED_TRANSACTION':
        return 'Giao dịch chuyển khoản chưa khớp mã';
      case 'ON_PAYMENT_DUE':
        return 'Phiếu thu sắp đến hạn nộp';
      case 'ON_DAILY_SUMMARY':
        return 'Định kỳ tổng kết cuối ngày (21:00)';
      case 'ON_INVOICE_PAID':
        return 'Phụ huynh đóng học phí thành công';
      default:
        return t;
    }
  };

  const renderActionLabel = (a: string) => {
    switch (a) {
      case 'TELEGRAM_ALERT':
        return 'Bắn thông báo tức thì qua Telegram';
      case 'AUTO_REMINDER':
        return 'Soạn sẵn tin nhắn nhắc Zalo AI';
      case 'EMAIL_SUMMARY':
        return 'Gửi email tổng kết tài chính';
      default:
        return a;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tự Động Hóa & Thông Báo
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              Bot Zalo / Telegram
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Thiết lập các kịch bản tự động gửi thông báo, cảnh báo dòng tiền và nhắc nợ học phí
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm kịch bản mới</span>
        </button>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs animate-pulse">Đang tải kịch bản tự động hóa...</div>
      ) : rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rule.isEnabled ? 'ting-card' : 'bg-[#0B0F19]/60 border-[#1A2338] opacity-60'
              }`}
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{rule.name}</span>
                  {rule.isEnabled ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      Đang bật
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#162033] text-slate-400 border border-[#1E283D]">
                      Đã tắt
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>
                    ⚡ Khi: <strong className="text-white">{renderTriggerLabel(rule.trigger)}</strong>
                  </span>
                  <span>
                    → Hành động: <strong className="text-emerald-400">{renderActionLabel(rule.action)}</strong>
                  </span>
                </div>

                {rule.lastRunAt && (
                  <p className="text-[11px] text-slate-400">
                    Lần chạy gần nhất: {formatDateTimeVN(rule.lastRunAt)} ({rule.lastRunStatus || 'SUCCESS'})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  type="button"
                  disabled={testingId === rule.id}
                  onClick={() => handleTestRun(rule.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111726] hover:bg-[#182136] text-slate-300 hover:text-white border border-[#1E283D] text-xs font-semibold rounded-xl transition"
                  title="Chạy thử nghiệm ngay lập tức"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{testingId === rule.id ? 'Đang chạy...' : 'Chạy thử'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(rule.id, rule.isEnabled)}
                  className="p-1 transition text-emerald-400"
                  title={rule.isEnabled ? 'Tắt quy tắc này' : 'Bật quy tắc này'}
                >
                  {rule.isEnabled ? (
                    <ToggleRight className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 ting-card text-xs text-slate-400">
          Chưa có quy tắc tự động hóa nào.
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E283D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
              <h3 className="text-base font-bold text-white">Thêm quy tắc tự động hóa</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tên quy tắc *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Báo Telegram khi học sinh đóng tiền..."
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Điều kiện kích hoạt (Trigger)</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full text-xs font-medium border border-[#1E283D] rounded-xl px-3 py-2 bg-[#111726] text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ON_INVOICE_PAID">Khi có học viên đóng đủ tiền</option>
                  <option value="ON_UNMATCHED_TRANSACTION">Khi có giao dịch chuyển khoản chưa khớp</option>
                  <option value="ON_PAYMENT_DUE">Khi hóa đơn đến hạn nộp</option>
                  <option value="ON_DAILY_SUMMARY">Định kỳ tổng kết cuối ngày (21h00)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Hành động thực hiện (Action)</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full text-xs font-medium border border-[#1E283D] rounded-xl px-3 py-2 bg-[#111726] text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="TELEGRAM_ALERT">Gửi tin nhắn Telegram</option>
                  <option value="AUTO_REMINDER">Soạn sẵn tin nhắn Zalo AI</option>
                  <option value="EMAIL_SUMMARY">Gửi email tổng hợp</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E283D]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 font-semibold text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] font-bold rounded-xl transition"
                >
                  Tạo quy tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
