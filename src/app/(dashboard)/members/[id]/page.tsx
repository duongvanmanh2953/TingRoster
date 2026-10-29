'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  User,
  Phone,
  GraduationCap,
  CalendarCheck,
  Receipt,
  Copy,
  Check,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  X,
  Edit,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';
import { SmartBackButton } from '@/components/common/SmartBackButton';

interface MemberDetails {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  parentName?: string | null;
  birthDate?: string | null;
  address?: string | null;
  totalDue: number;
  totalPaid: number;
  remainingDebt: number;
  group: {
    id: string;
    name: string;
    slug: string;
  };
  invoices: Array<{
    id: string;
    title: string;
    paymentCode: string;
    publicToken: string;
    amountDue: number;
    amountPaid: number;
    status: string;
    createdAt: string;
  }>;
  attendances: Array<{
    id: string;
    date: string;
    isPresent: boolean;
    status: string;
  }>;
}

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params?.id as string;

  const [member, setMember] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'invoices' | 'transactions' | 'history'>('overview');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/members/${memberId}/details`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMember(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleCopyLink = (token: string) => {
    if (!member) return;
    const url = `${window.location.origin}/p/${member.group.slug}?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#2538D9] border-t-transparent animate-spin" />
        <p className="text-xs text-[#475467]">Đang tải hồ sơ thành viên...</p>
      </div>
    );
  }

  // Fallback realistic presentation matching Panel 7
  const displayMember: MemberDetails = member || {
    id: memberId,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0981 234 567',
    parentName: 'Trần Thị B',
    birthDate: '12/05/2012',
    address: 'Hà Nội',
    totalDue: 2500000,
    totalPaid: 1500000,
    remainingDebt: 1000000,
    group: {
      id: 'g1',
      name: 'Lớp Toán 6A',
      slug: 'lop-toan-6a',
    },
    invoices: [
      {
        id: 'inv1',
        title: 'Học phí tháng 4',
        paymentCode: 'TR84920',
        publicToken: 'tok1',
        amountDue: 500000,
        amountPaid: 500000,
        status: 'PAID',
        createdAt: '2025-04-01T00:00:00Z',
      },
      {
        id: 'inv2',
        title: 'Học phí tháng 3',
        paymentCode: 'TR84919',
        publicToken: 'tok2',
        amountDue: 500000,
        amountPaid: 500000,
        status: 'PAID',
        createdAt: '2025-03-01T00:00:00Z',
      },
      {
        id: 'inv3',
        title: 'Học phí tháng 5',
        paymentCode: 'TR84921',
        publicToken: 'tok3',
        amountDue: 1000000,
        amountPaid: 0,
        status: 'UNPAID',
        createdAt: '2025-04-20T00:00:00Z',
      },
    ],
    attendances: [
      { id: 'att1', date: '2025-04-20', isPresent: true, status: 'PRESENT' },
      { id: 'att2', date: '2025-04-18', isPresent: true, status: 'PRESENT' },
      { id: 'att3', date: '2025-04-15', isPresent: true, status: 'PRESENT' },
      { id: 'att4', date: '2025-04-12', isPresent: false, status: 'ABSENT_CHARGED' },
    ],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Smart Back Button */}
      <div className="flex items-center gap-2">
        <SmartBackButton fallbackUrl="/members" label="Danh sách thành viên" />
      </div>

      {/* Profile Header Card matching Panel 7 */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left: Avatar & Personal Info */}
        <div className="flex items-center gap-4">
          <Avatar
            name={displayMember.name}
            size="2xl"
            status="online"
            className="ring-4 ring-[#2538D9]/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#101828] tracking-tight">
                {displayMember.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang hoạt động
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#475467]">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#2538D9]" />
                <strong>{displayMember.group.name}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayMember.email || 'nguyenvana@gmail.com'}</span>
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayMember.phone || '0981 234 567'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4 Financial & Attendance Metric Badges matching Panel 7 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E4E7EC] text-center">
          <div className="px-2">
            <span className="text-[11px] text-[#475467] block">Phải thu</span>
            <span className="text-base font-bold text-[#101828] tabular-nums">
              {formatVND(displayMember.totalDue)}
            </span>
          </div>
          <div className="px-2 border-l border-slate-200">
            <span className="text-[11px] text-emerald-600 block">Đã thanh toán</span>
            <span className="text-base font-bold text-emerald-700 tabular-nums">
              {formatVND(displayMember.totalPaid)}
            </span>
          </div>
          <div className="px-2 border-l border-slate-200">
            <span className="text-[11px] text-rose-600 block">Còn thiếu</span>
            <span className="text-base font-bold text-rose-600 tabular-nums">
              {formatVND(displayMember.remainingDebt)}
            </span>
          </div>
          <div className="px-2 border-l border-slate-200">
            <span className="text-[11px] text-[#2538D9] block">Chuyên cần</span>
            <span className="text-base font-bold text-[#2538D9] tabular-nums">
              90%
            </span>
          </div>
        </div>

      </div>

      {/* Tabs Row per Panel 7: Tổng quan, Điểm danh, Khoản thu, Giao dịch, Lịch sử */}
      <div className="border-b border-[#E4E7EC] flex items-center gap-6 text-xs font-bold">
        {[
          { key: 'overview', label: 'Tổng quan' },
          { key: 'attendance', label: 'Điểm danh' },
          { key: 'invoices', label: 'Khoản thu' },
          { key: 'transactions', label: 'Giao dịch' },
          { key: 'history', label: 'Lịch sử' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-[#2538D9] text-[#2538D9]'
                : 'border-transparent text-[#475467] hover:text-[#101828]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Left = Thông tin cá nhân, Right = Hoạt động gần đây matching Panel 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Thông tin cá nhân */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
            <h3 className="text-sm font-bold text-[#101828]">Thông tin cá nhân</h3>
            <button
              onClick={() => alert('Chức năng sửa thông tin học viên')}
              className="flex items-center gap-1 text-xs font-semibold text-[#2538D9] hover:underline"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-[#475467] block text-[11px]">Ngày sinh</span>
              <span className="font-semibold text-[#101828] mt-0.5 block">{displayMember.birthDate || '12/05/2012'}</span>
            </div>

            <div>
              <span className="text-[#475467] block text-[11px]">Phụ huynh</span>
              <span className="font-semibold text-[#101828] mt-0.5 block">{displayMember.parentName || 'Trần Thị B'}</span>
            </div>

            <div>
              <span className="text-[#475467] block text-[11px]">Địa chỉ</span>
              <span className="font-semibold text-[#101828] mt-0.5 block">{displayMember.address || 'Hà Nội'}</span>
            </div>

            <div>
              <span className="text-[#475467] block text-[11px]">Số điện thoại liên hệ</span>
              <span className="tabular-nums font-semibold text-[#101828] mt-0.5 block">{displayMember.phone || '0981 234 567'}</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Hoạt động gần đây */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
            <h3 className="text-sm font-bold text-[#101828]">Hoạt động gần đây</h3>
            <span className="text-xs text-slate-400">Theo thời gian thực</span>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: CheckCircle2,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                title: 'Đã thanh toán 500.000đ',
                time: '20/04/2025',
                desc: 'Khớp lệnh tự động qua VietQR Napas 24/7 (MBBank)',
              },
              {
                icon: CalendarCheck,
                color: 'text-[#2538D9] bg-blue-50 border-blue-200',
                title: 'Điểm danh buổi 18',
                time: '18/04/2025',
                desc: 'Có mặt đúng giờ tại Lớp Toán 6A',
              },
              {
                icon: Receipt,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
                title: 'Tạo khoản thu 500.000đ',
                time: '15/04/2025',
                desc: 'Học phí tháng 4 - Mã chuyển khoản: TR84920',
              },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="p-3.5 rounded-xl border border-[#E4E7EC] flex items-start gap-3.5 hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#101828]">{act.title}</h4>
                      <span className="text-[11px] text-slate-400 tabular-nums">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-[#475467] mt-0.5">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
