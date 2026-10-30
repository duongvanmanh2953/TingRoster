'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatVND } from '@/lib/utils';
import {
  FileText,
  CalendarCheck,
  Receipt,
  MessageSquare,
  QrCode,
  Shield,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  PenTool,
  ChevronRight,
  ExternalLink,
  Phone,
  User,
  Check
} from 'lucide-react';
import { ElectronicSignatureModal } from '@/components/contracts/ElectronicSignatureModal';
import { SmartBackButton } from '@/components/common/SmartBackButton';

type StudentSpaceTab = 'overview' | 'schedule' | 'fees' | 'contracts' | 'clauses';

interface SpaceDetail {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  groupType: string;
  defaultFee: number;
  billingCycle: string;
  owner: {
    name: string;
    phone?: string | null;
  };
}

interface StudentInvoice {
  id: string;
  code: string;
  title: string;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  qrContent?: string;
}

interface StudentContract {
  id: string;
  code: string;
  title: string;
  contractType: string;
  status: string;
  totalValue: number;
  partyAName: string;
  partyBName: string;
  contentHtml: string;
  partyBRequiredFields?: string[];
  partyBSubmittedData?: Record<string, string>;
  signatures: Array<{
    id: string;
    partyRole: string;
    signerName: string;
    signedAt: string;
  }>;
}

interface SpaceClauseItem {
  id: string;
  title: string;
  content: string;
  version: number;
  isRequired: boolean;
  isAccepted: boolean;
  acceptedAt?: string;
}

export default function StudentDedicatedSpacePage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const [activeTab, setActiveTab] = useState<StudentSpaceTab>('overview');
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<SpaceDetail | null>(null);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [contracts, setContracts] = useState<StudentContract[]>([]);
  const [clauses, setClauses] = useState<SpaceClauseItem[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);

  // Signing modal
  const [signingContract, setSigningContract] = useState<StudentContract | null>(null);
  const [signingModalOpen, setSigningModalOpen] = useState(false);

  // Party B data fill modal
  const [fillingContract, setFillingContract] = useState<StudentContract | null>(null);
  const [citizenId, setCitizenId] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [savingPartyBData, setSavingPartyBData] = useState(false);

  // Clause acceptance
  const [acceptingClauseId, setAcceptingClauseId] = useState<string | null>(null);

  const loadSpaceData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch space details
      const gRes = await fetch(`/api/groups/${groupId}`);
      const gData = await gRes.json();
      if (gData.success && gData.data) {
        setSpace(gData.data);
      }

      // Fetch student invoices for this space
      const invRes = await fetch(`/api/portal/fees`);
      const invData = await invRes.json();
      if (invData.success && Array.isArray(invData.data)) {
        // Filter invoices for this space
        setInvoices(invData.data.filter((i: any) => i.group?.id === groupId || i.groupId === groupId));
      }

      // Fetch contracts
      const cRes = await fetch(`/api/groups/${groupId}/contracts`);
      const cData = await cRes.json();
      if (cData.success && Array.isArray(cData.data)) {
        setContracts(cData.data);
      }

      // Fetch clauses
      const clRes = await fetch(`/api/groups/${groupId}/clauses`);
      const clData = await clRes.json();
      if (clData.success && Array.isArray(clData.data)) {
        setClauses(
          clData.data.map((c: any) => ({
            ...c,
            isAccepted: c.acceptances && c.acceptances.length > 0,
            acceptedAt: c.acceptances?.[0]?.acceptedAt
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadSpaceData();
    }
  }, [groupId, loadSpaceData]);

  const handleSavePartyBData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fillingContract) return;

    try {
      setSavingPartyBData(true);
      const res = await fetch(`/api/groups/${groupId}/contracts/${fillingContract.id}/party-b`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedData: {
            citizenId,
            permanentAddress
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setFillingContract(null);
        loadSpaceData();
      } else {
        alert(data.error || 'Lỗi cập nhật thông tin');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể lưu thông tin Bên B');
    } finally {
      setSavingPartyBData(false);
    }
  };

  const handleAcceptClause = async (clauseId: string) => {
    try {
      setAcceptingClauseId(clauseId);
      const res = await fetch(`/api/groups/${groupId}/clauses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          clauseId
        })
      });
      const data = await res.json();
      if (data.success) {
        setClauses((prev) =>
          prev.map((c) => (c.id === clauseId ? { ...c, isAccepted: true, acceptedAt: new Date().toISOString() } : c))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptingClauseId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Đang tải khu vực học viên của không gian...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="text-center py-24 text-slate-500 space-y-3">
        <p className="text-sm font-bold">Không tìm thấy không gian hoặc bạn không thuộc không gian này.</p>
        <SmartBackButton fallbackUrl="/portal/groups" label="Quay lại Không gian của tôi" />
      </div>
    );
  }

  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');
  const pendingContracts = contracts.filter((c) => !c.signatures.some((s) => s.partyRole === 'PARTY_B'));

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/portal/groups" className="hover:text-blue-600 font-medium">
          Không gian của tôi
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
          {space.name}
        </span>
      </nav>

      {/* Space Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Khu Vực Thành Viên
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {space.code || `TR-${space.slug.toUpperCase().slice(0, 4)}`}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">{space.name}</h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              {space.description || 'Không gian học tập và sinh hoạt chuyên nghiệp trên TingRoster.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/portal/chat?groupId=${space.id}`}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-xs"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Chat nhóm</span>
            </Link>
            <Link
              href="/portal/scan"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Quét QR tại lớp</span>
            </Link>
          </div>
        </div>

        {/* Space Contact Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Phụ trách: <strong>{space.owner?.name || 'Quản lý không gian'}</strong></span>
          </div>
          {space.owner?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Liên hệ: <strong>{space.owner.phone}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>Mức phí: <strong>{formatVND(space.defaultFee)}</strong> ({space.billingCycle === 'MONTHLY' ? 'Tháng' : 'Buổi'})</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Tổng quan
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'fees'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Khoản phí</span>
          {unpaidInvoices.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {unpaidInvoices.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'contracts'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Hợp đồng & Ký điện tử</span>
          {pendingContracts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingContracts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('clauses')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'clauses'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Điều khoản & Quy định ({clauses.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Khoản phí cần đóng
              </span>
              <span className="text-2xl font-black text-rose-600 tabular-nums block">
                {formatVND(unpaidInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0))}
              </span>
              <span className="text-xs text-slate-400 block">
                {unpaidInvoices.length > 0 ? `${unpaidInvoices.length} đợt thu đang chờ` : 'Đã hoàn tất thanh toán'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Hợp đồng & Thỏa thuận
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums block">
                {contracts.length}
              </span>
              <span className="text-xs text-slate-400 block">
                {pendingContracts.length > 0 ? `${pendingContracts.length} bản ghi cần ký xác nhận` : 'Tất cả đã hoàn tất'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Điều khoản không gian
              </span>
              <span className="text-2xl font-black text-emerald-600 tabular-nums block">
                {clauses.filter((c) => c.isAccepted).length} / {clauses.length}
              </span>
              <span className="text-xs text-slate-400 block">Đã chấp thuận quy chế nội bộ</span>
            </div>
          </div>

          {/* Pending Alerts */}
          {pendingContracts.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-amber-900">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold">Bạn có {pendingContracts.length} thỏa thuận đang chờ ký điện tử</p>
                  <p className="text-amber-700">Vui lòng đọc kỹ nội dung và hoàn tất thao tác ký để kích hoạt quyền lợi.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('contracts')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                Ký ngay
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Lối tắt thao tác nhanh</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/portal/scan"
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Quét QR</span>
                    <span className="text-[10px] text-slate-400">Điểm danh & Thanh toán</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </Link>

              <button
                onClick={() => setActiveTab('fees')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition flex items-center justify-between group text-left shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Khoản phí</span>
                    <span className="text-[10px] text-slate-400">Chuyển khoản VietQR</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </button>

              <button
                onClick={() => setActiveTab('contracts')}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition flex items-center justify-between group text-left shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Hợp đồng</span>
                    <span className="text-[10px] text-slate-400">Ký & Xem hồ sơ</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </button>

              <Link
                href={`/portal/chat?groupId=${space.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Chat nhóm</span>
                    <span className="text-[10px] text-slate-400">Trao đổi nội bộ</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEES */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Học Phí & Khoản Thu Của Bạn Tại Không Gian Này
            </h2>
            <Link
              href="/portal/fees"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Xem tất cả hóa đơn →
            </Link>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Bạn không có khoản phí nào còn nợ tại không gian này.
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inv.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {inv.status === 'PAID' ? 'Đã đóng đủ' : 'Chưa đóng'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{inv.title}</h3>
                    <p className="text-xs text-slate-400">Hạn thanh toán: {new Date(inv.dueDate).toLocaleDateString('vi-VN')}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block">Số tiền:</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
                        {formatVND(inv.amount)}
                      </span>
                    </div>

                    <Link
                      href="/portal/fees"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Thanh toán VietQR</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Hợp Đồng & Thỏa Thuận Điện Tử Của Bạn
            </h2>
            <Link
              href="/portal/contracts"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Xem tất cả hợp đồng →
            </Link>
          </div>

          {contracts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              Không gian này chưa phát hành văn bản hợp đồng nào liên quan đến bạn.
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => {
                const hasPartyBSigned = c.signatures.some((s) => s.partyRole === 'PARTY_B');
                const hasPartyASigned = c.signatures.some((s) => s.partyRole === 'PARTY_A');

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {c.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {c.status === 'ACTIVE' ? 'Đã ký đủ hai bên' : 'Đang chờ ký'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{c.title}</h3>
                        <p className="text-xs text-slate-400">
                          Bên Cho Thuê / Đào Tạo (Bên A): {c.partyAName} • Giá trị: {formatVND(c.totalValue)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <a
                          href={`/api/groups/${groupId}/contracts?downloadDocx=${c.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tải Word (.docx)</span>
                        </a>

                        {!hasPartyBSigned && (
                          <button
                            onClick={() => {
                              setSigningContract(c);
                              setSigningModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Ký điện tử Bên B</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Signature Status */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Chữ ký Bên A:</span>
                        <span className={`font-bold ${hasPartyASigned ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {hasPartyASigned ? '✓ Đã hoàn tất' : 'Chờ Bên A ký'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Chữ ký Bên B (Bạn):</span>
                        <span className={`font-bold ${hasPartyBSigned ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {hasPartyBSigned ? '✓ Đã hoàn tất' : 'Chưa ký'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CLAUSES */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Điều Khoản, Chính Sách & Nội Quy Không Gian
            </h2>
            <p className="text-xs text-slate-400">
              Quy chế sinh hoạt, nghĩa vụ bảo quản tài sản và cam kết thanh toán đúng hạn.
            </p>
          </div>

          <div className="space-y-3">
            {clauses.map((clause) => (
              <div
                key={clause.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{clause.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      v{clause.version}.0
                    </span>
                  </div>

                  {clause.isAccepted ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chấp thuận</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcceptClause(clause.id)}
                      disabled={acceptingClauseId === clause.id}
                      className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      {acceptingClauseId === clause.id ? 'Đang lưu...' : 'Tôi đồng ý'}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {clause.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIGNING MODAL FOR STUDENT (PARTY B) */}
      {signingContract && signingModalOpen && (
        <ElectronicSignatureModal
          contractId={signingContract.id}
          contractTitle={signingContract.title}
          contractContent={signingContract.contentHtml}
          partyRole="PARTY_B"
          partyName={signingContract.partyBName}
          isOpen={signingModalOpen}
          onClose={() => {
            setSigningModalOpen(false);
            setSigningContract(null);
          }}
          onSuccess={() => {
            setSigningModalOpen(false);
            setSigningContract(null);
            loadSpaceData();
          }}
        />
      )}
    </div>
  );
}
