'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { PublicPaymentCard, PublicInvoiceData } from '@/components/payments/PublicPaymentCard';
import { GraduationCap, Search, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface GroupData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members: Array<{ id: string; name: string }>;
}

export default function PublicPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const initialToken = searchParams.get('token');

  const [group, setGroup] = useState<GroupData | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [invoice, setInvoice] = useState<PublicInvoiceData | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load group details
  useEffect(() => {
    async function loadGroup() {
      try {
        setLoadingGroup(true);
        const res = await fetch(`/api/public/groups/${slug}`);
        const data = await res.json();
        if (data.success) {
          setGroup(data.data);
        } else {
          setError(data.error || 'Không tìm thấy lớp học');
        }
      } catch {
        setError('Không thể kết nối đến máy chủ');
      } finally {
        setLoadingGroup(false);
      }
    }
    if (slug) {
      loadGroup();
    }
  }, [slug]);

  // Load invoice by publicToken
  const loadInvoiceByToken = useCallback(async (token: string) => {
    try {
      setLoadingInvoice(true);
      const res = await fetch(`/api/public/invoices/${token}`);
      const data = await res.json();
      if (data.success) {
        setInvoice(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Lỗi tải phiếu thu');
    } finally {
      setLoadingInvoice(false);
    }
  }, []);

  // Initial load if token provided in URL
  useEffect(() => {
    if (initialToken) {
      loadInvoiceByToken(initialToken);
    }
  }, [initialToken, loadInvoiceByToken]);

  // When parent selects a member
  const handleSelectMember = async (memberId: string) => {
    setSelectedMemberId(memberId);
    setError(null);
    try {
      setLoadingInvoice(true);
      const res = await fetch(`/api/public/groups/${slug}/invoices?memberId=${memberId}`);
      const data = await res.json();
      if (data.success && data.data?.publicToken) {
        await loadInvoiceByToken(data.data.publicToken);
      } else {
        setInvoice(null);
        setError(data.error || 'Chưa có phiếu thu nào cho học viên này');
      }
    } catch {
      setError('Không thể tải phiếu thu của học viên');
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Auto-polling for real-time status update every 5 seconds if invoice is UNPAID or PARTIAL
  useEffect(() => {
    if (!invoice || invoice.status === 'PAID' || invoice.status === 'VOID') return;

    const interval = setInterval(() => {
      fetch(`/api/public/invoices/${invoice.publicToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setInvoice(data.data);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [invoice]);

  const filteredMembers =
    group?.members.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    ) || [];

  return (
    <div className="min-h-screen bg-[#F5F7FB] py-8 px-4 sm:px-6 lg:px-8 selection:bg-[#2538D9] selection:text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Brand / Class Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <Logo href="/" size="sm" showTagline={false} />
          </div>
          {group && (
            <div>
              <h1 className="text-2xl font-extrabold text-[#101828] tracking-tight">{group.name}</h1>
              {group.description && (
                <p className="text-xs text-[#475467] mt-1">{group.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Loading state for group */}
        {loadingGroup && (
          <div className="text-center py-12 text-[#475467] text-xs font-medium">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2538D9]" />
            Đang tải thông tin lớp học...
          </div>
        )}

        {/* Error notification */}
        {error && !loadingGroup && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Member Selector (if invoice not loaded or want to switch) */}
        {!initialToken && group && (
          <div className="ting-card p-5 space-y-4">
            <label className="block text-xs font-bold text-[#101828]">
              Chọn tên học viên / thành viên:
            </label>

            {/* Quick search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh theo tên học viên..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-[#E4E7EC] rounded-xl text-[#101828] placeholder-slate-400 focus:outline-none focus:border-[#2538D9] focus:ring-1 focus:ring-[#2538D9]"
              />
            </div>

            {/* Member list chips */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-all ${
                      selectedMemberId === member.id
                        ? 'bg-[#2538D9] text-white font-bold shadow-xs'
                        : 'bg-[#F8FAFC] hover:bg-slate-100 text-[#101828] font-medium border border-[#E4E7EC]'
                    }`}
                  >
                    <span>{member.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-75" />
                  </button>
                ))
              ) : (
                <p className="text-xs text-[#475467] text-center py-4">
                  Không tìm thấy học viên nào phù hợp
                </p>
              )}
            </div>
          </div>
        )}

        {/* Invoice Loading Skeleton */}
        {loadingInvoice && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
            <p className="text-sm font-medium text-slate-600">Đang tạo mã VietQR cho học viên...</p>
          </div>
        )}

        {/* Active Payment Card */}
        {invoice && !loadingInvoice && (
          <div className="space-y-4">
            <PublicPaymentCard invoice={invoice} />
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setInvoice(null);
                  setSelectedMemberId('');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition"
              >
                ← Chọn học viên khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
