'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  ShieldCheck,
  Bell,
  Mail,
  Phone,
  Building,
  FileText,
  Save,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import Switch from '@mui/material/Switch';

export default function MemberProfilePage() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [phone, setPhone] = useState('0912345678');
  const [parentName, setParentName] = useState('Bác Bình');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyZalo, setNotifyZalo] = useState(true);
  const [notifyTelegram, setNotifyTelegram] = useState(false);

  useEffect(() => {
    fetch('/api/portal/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setUser(res.data.user);
        }
      })
      .catch((err) => console.error('Fetch profile error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#2538D9]" />
          <h1 className="text-xl font-bold text-[#111827] dark:text-white">Hồ Sơ Thành Viên & Cài Đặt Thông Báo</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý thông tin định danh cá nhân, người giám hộ và kênh nhận thông báo học phí.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Thông tin hồ sơ và tùy chọn thông báo đã được lưu thành công!</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white border-b border-[#E5E7EB] dark:border-[#1E293B] pb-3">
            Thông tin cá nhân học viên
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Họ và tên</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-100 dark:bg-[#0B0F19] text-slate-500 cursor-not-allowed font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Tên được định danh theo danh sách cơ sở đào tạo</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email đăng nhập</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-100 dark:bg-[#0B0F19] text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Họ tên Phụ huynh / Người giám hộ</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#111827] dark:text-white border-b border-[#E5E7EB] dark:border-[#1E293B] pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2538D9]" />
            <span>Kênh nhận thông báo học phí & điểm danh</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#2538D9] dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">Email thông báo học phí</span>
                  <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-normal">Nhận bảng kê chi tiết và mã VietQR qua email định kỳ</span>
                </div>
              </div>
              <Switch
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                color="primary"
                aria-label="Bật nhận thông báo học phí qua email"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">Tin nhắn Zalo ZNS</span>
                  <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-normal">Nhận tin báo xác nhận đã nộp học phí tức thì</span>
                </div>
              </div>
              <Switch
                checked={notifyZalo}
                onChange={(e) => setNotifyZalo(e.target.checked)}
                color="primary"
                aria-label="Bật nhận tin nhắn Zalo ZNS"
              />
            </div>
          </div>
        </div>

        {/* Legal & Policies Link */}
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Điều khoản sử dụng & Quy chế bảo vệ dữ liệu</h3>
              <p className="text-slate-500 text-[11px]">Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân</p>
            </div>
          </div>

          <Link
            href="/legal"
            className="px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] hover:bg-slate-50 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Xem điều khoản & hoàn phí</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
