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
      await fetch('/api/automations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isEnabled: !currentState }),
      });
    } catch {
      loadRules();
    }
  };

  const handleTestRun = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch('/api/automations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, testRun: true }),
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
        return 'Đến giờ tổng kết cuối ngày (21:00)';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Trung Tâm Tự Động Hóa (Automation Center)
          </h1>
          <p className="text-sm text-slate-500">
            Thiết lập các kịch bản tự động gửi thông báo, cảnh báo dòng tiền và nhắc nợ học phí
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm kịch bản mới</span>
        </button>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Đang tải kịch bản tự động hóa...</div>
      ) : rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                rule.isEnabled ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rule.name}</span>
                  {rule.isEnabled ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đang bật
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      Đã tắt
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    ⚡ Khi: <strong className="text-slate-800">{renderTriggerLabel(rule.trigger)}</strong>
                  </span>
                  <span>
                    → Hành động: <strong className="text-indigo-600">{renderActionLabel(rule.action)}</strong>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  title="Chạy thử nghiệm ngay lập tức"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{testingId === rule.id ? 'Đang chạy...' : 'Chạy thử'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(rule.id, rule.isEnabled)}
                  className="p-1 text-slate-400 hover:text-slate-700 transition"
                  title={rule.isEnabled ? 'Tắt quy tắc này' : 'Bật quy tắc này'}
                >
                  {rule.isEnabled ? (
                    <ToggleRight className="w-8 h-8 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          Chưa có quy tắc tự động hóa nào.
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Thêm quy tắc tự động hóa</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên quy tắc *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Báo Telegram khi học sinh đóng tiền..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Điều kiện kích hoạt (Trigger)</label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="ON_INVOICE_PAID">Khi có học viên đóng đủ tiền</option>
                  <option value="ON_UNMATCHED_TRANSACTION">Khi có giao dịch chuyển khoản chưa khớp</option>
                  <option value="ON_PAYMENT_DUE">Khi hóa đơn đến hạn nộp</option>
                  <option value="ON_DAILY_SUMMARY">Định kỳ tổng kết cuối ngày (21h00)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hành động thực hiện (Action)</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="TELEGRAM_ALERT">Gửi tin nhắn Telegram</option>
                  <option value="AUTO_REMINDER">Soạn sẵn tin nhắn Zalo AI</option>
                  <option value="EMAIL_SUMMARY">Gửi email tổng hợp</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl"
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
