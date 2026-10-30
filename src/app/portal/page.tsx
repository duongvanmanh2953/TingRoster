'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  QrCode,
  Users,
  Megaphone,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

interface PortalData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  financial: {
    totalDue: number;
    totalPaid: number;
    overdueCount: number;
    activeInvoiceCount: number;
  };
  joinedGroups: Array<{
    memberId: string;
    groupId: string;
    name: string;
    slug: string;
    groupType: string;
    defaultFee: number;
    billingCycle: string;
    description?: string;
    owner: {
      name: string;
      bankId: string;
      bankAccountNo: string;
      bankAccountName: string;
    };
  }>;
  recentInvoices: Array<{
    id: string;
    title: string;
    paymentCode: string;
    amountDue: number;
    amountPaid: number;
    status: string;
    dueDate?: string;
    group: { name: string };
    user: { bankId: string; bankAccountNo: string; bankAccountName: string };
  }>;
  recentAttendances: Array<{
    id: string;
    date: string;
    status: string;
    isPresent: boolean;
    group: { name: string };
  }>;
  announcements: Array<{
    id: string;
    content: string;
    createdAt: string;
    conversation: { title: string };
  }>;
}

export default function MemberPortalDashboard() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portal/dashboard')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Fetch portal dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2538D9] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải dữ liệu cổng học viên...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111726] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B]">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Không tìm thấy dữ liệu học viên</h3>
        <p className="text-xs text-slate-500 mt-1">Tài khoản của bạn chưa được liên kết với bất kỳ nhóm hoặc lớp học nào.</p>
        <Link
          href="/login"
          className="mt-4 inline-block px-4 py-2 bg-[#2538D9] text-white text-xs font-bold rounded-xl"
        >
          Đăng nhập lại
        </Link>
      </div>
    );
  }

  const firstUnpaid = data.recentInvoices.find((inv) => inv.status !== 'PAID');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Học viên / Thành viên
            </span>
            <span className="text-xs text-slate-400">Tham gia {data.joinedGroups.length} nhóm cơ sở</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-white mt-1">
            Xin chào, {data.user.name}!
          </h1>
          <p className="text-xs text-[#4B5563] dark:text-slate-400 mt-0.5">
            Theo dõi chuyên cần, lịch sinh hoạt và thanh toán học phí qua mã định danh VietQR tự động.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portal/fees"
            className="px-4 py-2 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Xem & Đóng học phí</span>
          </Link>
          <Link
            href="/portal/attendance"
            className="px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Lịch điểm danh
          </Link>
        </div>
      </div>

      {/* 3 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Due */}
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4B5563] dark:text-slate-400">Còn phải thanh toán</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono tracking-tight">
            {formatVND(data.financial.totalDue)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            {data.financial.totalDue === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bạn đã hoàn thành tất cả khoản phí
              </span>
            ) : (
              <span>Gồm {data.financial.activeInvoiceCount} khoản phí chưa hoàn tất</span>
            )}
          </div>
        </div>

        {/* Overdue / Due Soon */}
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4B5563] dark:text-slate-400">Khoản quá hạn</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#111827] dark:text-white mt-2 font-mono">
            {data.financial.overdueCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {data.financial.overdueCount > 0
              ? 'Vui lòng thanh toán sớm để đảm bảo quyền lợi tham gia'
              : 'Không có khoản thu nào bị quá hạn'}
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4B5563] dark:text-slate-400">Đã thanh toán (Năm 2026)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {formatVND(data.financial.totalPaid)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tất cả giao dịch được ngân hàng đối soát tự động</p>
        </div>
      </div>

      {/* Quick Pay Card (if unpaid invoice exists) */}
      {firstUnpaid && (
        <div className="bg-white dark:bg-[#111726] border-2 border-indigo-200 dark:border-indigo-900/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Khoản thu cần đóng ngay</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white">
                {firstUnpaid.title} ({firstUnpaid.group.name})
              </h3>
              <p className="text-xs text-slate-500">
                Hạn thanh toán: {firstUnpaid.dueDate ? new Date(firstUnpaid.dueDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
              </p>

              {/* Bank Details Snippet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Số tiền cần đóng</span>
                  <span className="text-sm font-extrabold text-[#2538D9] dark:text-indigo-400 font-mono">
                    {formatVND(firstUnpaid.amountDue - firstUnpaid.amountPaid)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Số tài khoản nhận</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {firstUnpaid.user.bankAccountNo} ({firstUnpaid.user.bankId})
                    </span>
                    <button
                      onClick={() => handleCopy(firstUnpaid.user.bankAccountNo)}
                      className="text-slate-400 hover:text-[#2538D9]"
                      title="Sao chép STK"
                    >
                      {copiedCode === firstUnpaid.user.bankAccountNo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-[#E5E7EB] dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mã chuyển khoản (Bắt buộc)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#2538D9] font-mono tracking-wider">
                      {firstUnpaid.paymentCode}
                    </span>
                    <button
                      onClick={() => handleCopy(firstUnpaid.paymentCode)}
                      className="text-slate-400 hover:text-[#2538D9]"
                      title="Sao chép mã"
                    >
                      {copiedCode === firstUnpaid.paymentCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <Link
                href="/portal/fees"
                className="px-5 py-3 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Mở mã VietQR thanh toán</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2 Columns: Joined Groups & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Groups & Attendance */}
        <div className="lg:col-span-8 space-y-6">
          {/* Groups List */}
          <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2538D9]" />
                <h2 className="text-sm font-bold text-[#111827] dark:text-white">Nhóm & Lớp học đang tham gia</h2>
              </div>
              <Link href="/portal/groups" className="text-xs font-semibold text-[#2538D9] hover:underline flex items-center gap-1">
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.joinedGroups.map((g) => (
                <div
                  key={g.groupId}
                  className="p-4 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#0B0F19]/50 hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{g.groupType === 'CLASS' ? 'Lớp học' : g.groupType === 'SPORTS_CLUB' ? 'CLB Thể thao' : 'Nhà trọ'}</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{g.owner.name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white mt-1">{g.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{g.description || 'Chưa có mô tả'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {formatVND(g.defaultFee)} / {g.billingCycle === 'MONTHLY' ? 'tháng' : 'buổi'}
                    </span>
                    <Link
                      href="/portal/groups"
                      className="text-[#2538D9] hover:underline font-bold text-[11px] flex items-center gap-0.5"
                    >
                      Chi tiết & Thảo luận →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#2538D9]" />
                <h2 className="text-sm font-bold text-[#111827] dark:text-white">Lịch sử điểm danh gần đây</h2>
              </div>
              <Link href="/portal/attendance" className="text-xs font-semibold text-[#2538D9] hover:underline flex items-center gap-1">
                <span>Xem toàn bộ lịch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.recentAttendances.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Chưa có bản ghi điểm danh nào.</p>
            ) : (
              <div className="space-y-2">
                {data.recentAttendances.map((att) => {
                  const isPresent = att.status === 'PRESENT';
                  return (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{att.group.name}</span>
                        <span className="text-slate-400 block text-[11px]">
                          Ngày: {new Date(att.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                        }`}
                      >
                        {isPresent ? 'Có mặt' : att.status === 'ABSENT_CHARGED' ? 'Vắng (Tính phí)' : 'Nghỉ có phép'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Announcements & Support */}
        <div className="lg:col-span-4 space-y-6">
          {/* Announcements Card */}
          <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-[#2538D9]" />
              <h2 className="text-sm font-bold text-[#111827] dark:text-white">Thông báo từ Thầy cô / Quản lý</h2>
            </div>

            {data.announcements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Hiện chưa có thông báo mới.</p>
            ) : (
              <div className="space-y-3">
                {data.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl bg-black-50/50 dark:bg-black-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-[#2538D9] dark:text-indigo-400">{ann.conversation.title}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-[#344054] dark:text-slate-200 leading-relaxed font-medium">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/portal/chat"
              className="mt-4 block text-center py-2 text-xs font-bold text-[#2538D9] dark:text-indigo-400 hover:underline"
            >
              Mở kênh trò chuyện nhóm →
            </Link>
          </div>

          {/* Quick Support Card */}
          <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 text-xs space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">Cần hỗ trợ đối soát học phí?</h3>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Nếu đã chuyển khoản nhưng chưa thấy hệ thống cập nhật trạng thái sau 30 giây, bạn có thể tạo phiếu yêu cầu đối soát ngay.
            </p>
            <Link
              href="/portal/help"
              className="w-full py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Gửi yêu cầu trợ giúp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
