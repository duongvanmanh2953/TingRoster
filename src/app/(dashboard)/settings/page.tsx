'use client';

import React, { useEffect, useState } from 'react';
import { POPULAR_VIETNAMESE_BANKS } from '@/lib/providers/vietqr';
import {
  CreditCard,
  Webhook,
  Send,
  Check,
  Copy,
  AlertCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bankId, setBankId] = useState('MB');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setName(data.data.name || '');
          setEmail(data.data.email || '');
          setBankId(data.data.bankId || 'MB');
          setBankAccountNo(data.data.bankAccountNo || '');
          setBankAccountName(data.data.bankAccountName || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bankId,
          bankAccountNo,
          bankAccountName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Đã lưu cấu hình tài khoản thành công!');
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch {
      alert('Lỗi cập nhật cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const sepayWebhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/sepay`
      : 'https://domain.com/api/webhooks/sepay';

  const cassoWebhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/casso`
      : 'https://domain.com/api/webhooks/casso';

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Cài đặt tài khoản & Webhook
        </h1>
        <p className="text-sm text-slate-500">
          Cấu hình tài khoản ngân hàng nhận tiền VietQR và kết nối đối soát tự động
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Bank Account Settings */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tài khoản nhận tiền VietQR</h2>
            <p className="text-xs text-slate-500">
              Thông tin ngân hàng sẽ được tự động gắn vào mã VietQR trên phiếu thu
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBank} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngân hàng thụ hưởng *
              </label>
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {POPULAR_VIETNAMESE_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số tài khoản ngân hàng *
              </label>
              <input
                type="text"
                required
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
                placeholder="0987654321"
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên chủ tài khoản (viết hoa không dấu) *
              </label>
              <input
                type="text"
                required
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN A"
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên hiển thị chủ tài khoản
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu thông tin ngân hàng'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* 2. Webhook Setup Instructions */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Webhook Đối Soát Tự Động</h2>
            <p className="text-xs text-slate-500">
              Điền URL bên dưới vào trang quản trị SePay hoặc Casso để nhận thông báo biến động số dư
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* SePay Webhook URL */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">SePay Webhook URL</span>
              <button
                type="button"
                onClick={() => handleCopy(sepayWebhookUrl, 'sepay')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                {copiedUrl === 'sepay' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép URL
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Sao chép URL
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 select-all">
              {sepayWebhookUrl}
            </p>
            <p className="text-[11px] text-slate-500">
              Cấu hình trong SePay &gt; Tích hợp Webhook &gt; Điền URL và API Key khớp với biến môi trường <code className="text-indigo-600 font-mono">SEPAY_WEBHOOK_API_KEY</code>.
            </p>
          </div>

          {/* Casso Webhook URL */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Casso Webhook URL</span>
              <button
                type="button"
                onClick={() => handleCopy(cassoWebhookUrl, 'casso')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                {copiedUrl === 'casso' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã chép URL
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Sao chép URL
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 select-all">
              {cassoWebhookUrl}
            </p>
            <p className="text-[11px] text-slate-500">
              Cấu hình trong Casso &gt; Webhook &gt; Điền secure-token khớp với <code className="text-indigo-600 font-mono">CASSO_WEBHOOK_SECURE_TOKEN</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Telegram Notifications */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Thông báo Telegram</h2>
            <p className="text-xs text-slate-500">
              Nhận thông báo tức thì về điện thoại mỗi khi có phụ huynh / thành viên chuyển khoản thành công
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
          <p className="font-bold">⚡ Cấu hình biến môi trường server:</p>
          <p>
            Cấu hình <code className="font-mono font-bold">TELEGRAM_BOT_TOKEN</code> và{' '}
            <code className="font-mono font-bold">TELEGRAM_CHAT_ID</code> trong file{' '}
            <code className="font-mono font-bold">.env</code> hoặc trong Docker Compose.
          </p>
        </div>
      </section>
    </div>
  );
}
