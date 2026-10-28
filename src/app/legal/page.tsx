'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Scale,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface PolicyDoc {
  id: string;
  policyType: string;
  title: string;
  version: string;
  summary: string;
  content: string;
  publishedAt: string;
}

export default function LegalCenterPage() {
  const [policies, setPolicies] = useState<PolicyDoc[]>([]);
  const [activeType, setActiveType] = useState<string>('TERMS');
  const [loading, setLoading] = useState(true);
  const [acceptedPolicies, setAcceptedPolicies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/policies')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setPolicies(res.data || []);
        }
      })
      .catch((err) => console.error('Fetch policies error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (policy: PolicyDoc) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId: policy.id, version: policy.version }),
      });
      const data = await res.json();
      if (data.success) {
        setAcceptedPolicies((prev) => ({ ...prev, [policy.id]: true }));
      }
    } catch {
      // ignore
    }
  };

  const activeDoc = policies.find((p) => p.policyType === activeType) || policies[0];

  return (
    <div className="min-h-screen bg-[#F5F6F8] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] flex flex-col font-sans selection:bg-[#2538D9] selection:text-white">
      {/* Top Bar */}
      <header className="bg-white dark:bg-[#111726] border-b border-[#E5E7EB] dark:border-[#1E293B]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" showTagline={false} />
            <span className="text-slate-400">/</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Trung Tâm Pháp Lý & Chính Sách</span>
          </div>

          <Link
            href="/portal"
            className="text-xs font-semibold text-[#2538D9] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Cổng học viên</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Intro Card */}
        <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#2538D9]" />
            <h1 className="text-xl font-bold text-[#111827] dark:text-white">Quy Chế Pháp Lý & Bảo Vệ Quyền Lợi</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            TingRoster công khai minh bạch tất cả các điều khoản dịch vụ, cam kết bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP) và chính sách phân định rõ ràng giữa cước phần mềm và học phí cơ sở.
          </p>

          {/* Policy Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#1E293B]">
            {policies.map((p) => {
              const isActive = activeType === p.policyType;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveType(p.policyType)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#2538D9] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{p.title}</span>
                  <span className="text-[10px] opacity-75 font-mono">v{p.version}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Policy Document Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Đang tải văn bản chính sách...</div>
        ) : activeDoc ? (
          <div className="bg-white dark:bg-[#111726] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header info */}
            <div className="border-b border-[#E5E7EB] dark:border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#111827] dark:text-white">{activeDoc.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Phiên bản: <strong>{activeDoc.version}</strong></span>
                  <span>•</span>
                  <span>Hiệu lực từ: {new Date(activeDoc.publishedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <button
                onClick={() => handleAccept(activeDoc)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  acceptedPolicies[activeDoc.id]
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-[#2538D9] text-white hover:bg-[#1E2DB8]'
                }`}
              >
                {acceptedPolicies[activeDoc.id] ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Đã ghi nhận đồng ý</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận đồng ý điều khoản</span>
                  </>
                )}
              </button>
            </div>

            {/* Document Body */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {activeDoc.content}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
