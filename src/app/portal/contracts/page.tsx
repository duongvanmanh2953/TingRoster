'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { formatVND } from '@/lib/utils';
import {
  FileText,
  Search,
  Filter,
  Download,
  PenTool,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Shield,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { ElectronicSignatureModal } from '@/components/contracts/ElectronicSignatureModal';
import { SmartBackButton } from '@/components/common/SmartBackButton';

interface PortalContract {
  id: string;
  code: string;
  title: string;
  contractType: string;
  status: string;
  totalValue: number;
  partyAName: string;
  partyBName: string;
  contentHtml: string;
  effectiveDate: string;
  group: {
    id: string;
    name: string;
    slug: string;
  };
  signatures: Array<{
    id: string;
    partyRole: string;
    signerName: string;
    signedAt: string;
  }>;
}

function ContractsContent() {
  const [contracts, setContracts] = useState<PortalContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Signing modal
  const [signingContract, setSigningContract] = useState<PortalContract | null>(null);
  const [signingModalOpen, setSigningModalOpen] = useState(false);

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/contracts');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setContracts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const filteredContracts = contracts.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = contracts.filter((c) => !c.signatures.some((s) => s.partyRole === 'PARTY_B')).length;

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Đang tải hồ sơ & hợp đồng của bạn...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cổng Ký Kết & Hồ Sơ Điện Tử Thành Viên</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Hợp Đồng & Thỏa Thuận Của Tôi</h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Tra cứu, kiểm tra điều khoản và thực hiện ký điện tử trực tiếp trên điện thoại đối với các hợp đồng thuê nhà, khóa học đào tạo và thẻ hội viên.
          </p>
        </div>
      </div>

      {/* Notice of pending signatures */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Bạn có {pendingCount} văn bản đang chờ ký điện tử</p>
              <p className="text-amber-700">Hãy đọc kỹ các điều khoản trước khi xác nhận ký kết.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã, tên hợp đồng, không gian..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
        >
          <option value="ALL">Mọi trạng thái</option>
          <option value="PENDING_SIGNATURE">Chờ ký</option>
          <option value="ACTIVE">Có hiệu lực</option>
          <option value="EXPIRED">Hết hạn</option>
        </select>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Không tìm thấy hợp đồng nào
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Khi chủ không gian phát hành hợp đồng thuê nhà hoặc đào tạo cho bạn, văn bản sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContracts.map((c) => {
            const hasPartyBSigned = c.signatures.some((s) => s.partyRole === 'PARTY_B');
            const hasPartyASigned = c.signatures.some((s) => s.partyRole === 'PARTY_A');

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {c.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? 'Đã ký đủ hai bên' : 'Chờ ký xác nhận'}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                    {c.title}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Không gian:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.group.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bên A:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.partyAName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Giá trị:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatVND(c.totalValue)}
                      </span>
                    </div>
                  </div>

                  {/* Signatures status strip */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] flex justify-between">
                    <span>Chủ sở hữu: <strong>{hasPartyASigned ? '✓ Đã ký' : 'Chưa ký'}</strong></span>
                    <span>Bạn: <strong className={hasPartyBSigned ? 'text-emerald-600' : 'text-amber-600'}>{hasPartyBSigned ? '✓ Đã ký' : 'Chưa ký'}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={`/api/groups/${c.group.id}/contracts?downloadDocx=${c.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold inline-flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Word</span>
                  </a>

                  {!hasPartyBSigned ? (
                    <button
                      onClick={() => {
                        setSigningContract(c);
                        setSigningModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Ký điện tử</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSigningContract(c);
                        setSigningModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer ml-auto"
                    >
                      Xem văn bản
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SIGNING MODAL */}
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
            loadContracts();
          }}
        />
      )}
    </div>
  );
}

export default function StudentContractsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">Đang tải...</p>
        </div>
      }
    >
      <ContractsContent />
    </Suspense>
  );
}
