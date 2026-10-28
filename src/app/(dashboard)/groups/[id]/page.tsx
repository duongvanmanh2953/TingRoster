'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  Users,
  CalendarCheck,
  Receipt,
  ArrowRightLeft,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Search,
  Upload,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar } from '@/components/common/Avatar';

interface GroupDetail {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  defaultFee: number;
  billingCycle: string;
  groupType: string;
  publicPortalEnabled: boolean;
  members: Array<{
    id: string;
    name: string;
    phone?: string | null;
    parentName?: string | null;
  }>;
  _count: {
    members: number;
    invoices: number;
  };
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MEMBERS' | 'INVOICES' | 'SETTINGS'>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showImportAi, setShowImportAi] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [importText, setImportText] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState<any>(null);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (data.success) {
        setGroup(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) loadGroup();
  }, [groupId, loadGroup]);

  const handleCopyLink = () => {
    if (!group) return;
    const url = `${window.location.origin}/p/${group.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          name: newMemberName.trim(),
          phone: newMemberPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddMember(false);
        setNewMemberName('');
        setNewMemberPhone('');
        loadGroup();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyzeImport = async () => {
    if (!importText.trim()) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/import-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, rawText: importText }),
      });
      const data = await res.json();
      if (data.success) {
        setAiPreviewData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!aiPreviewData?.members) return;
    try {
      for (const m of aiPreviewData.members) {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            name: m.name,
            phone: m.phone || undefined,
            parentName: m.parentName || undefined,
          }),
        });
      }
      setShowImportAi(false);
      setAiPreviewData(null);
      setImportText('');
      loadGroup();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Đang tải thông tin chi tiết lớp học...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-24 text-slate-500">
        <p>Không tìm thấy lớp học.</p>
        <Link href="/groups" className="text-indigo-600 text-xs font-bold hover:underline mt-2 inline-block">
          ← Quay lại danh sách lớp
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Tất cả các lớp
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{group.name}</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {group.groupType === 'CLASS' ? 'Lớp học' : group.groupType === 'SPORTS_CLUB' ? 'CLB Thể thao' : 'Cho thuê'}
            </span>
          </div>
          {group.description && <p className="text-xs text-slate-500">{group.description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã chép link Zalo</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Chép link gửi Zalo</span>
              </>
            )}
          </button>

          <Link
            href={`/p/${group.slug}`}
            target="_blank"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 rounded-xl transition"
            title="Mở cổng phụ huynh"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'OVERVIEW' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tổng quan
        </button>

        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'MEMBERS' ? 'bg-[#2538D9] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Học viên</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {group.members.length}
          </span>
        </button>

        <Link
          href={`/attendance?groupId=${group.id}`}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1.5"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Sổ điểm danh</span>
        </Link>

        <Link
          href={`/invoices?groupId=${group.id}`}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap flex items-center gap-1.5"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Phiếu thu</span>
        </Link>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="ting-card p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Sĩ số lớp</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">{group.members.length} học viên</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Đang hoạt động trong danh sách</p>
          </div>

          <div className="ting-card p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Học phí định mức</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">{formatVND(group.defaultFee)}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Kỳ tính: {group.billingCycle === 'MONTHLY' ? 'Theo tháng' : 'Theo buổi'}</p>
          </div>

          <div className="ting-card p-5 space-y-1">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Phiếu thu đã tạo</span>
            <span className="text-2xl font-black text-[#2538D9] dark:text-indigo-400 font-mono">{group._count.invoices} đợt thu</span>
            <Link href={`/invoices?groupId=${group.id}`} className="text-xs text-[#2538D9] dark:text-indigo-400 font-semibold hover:underline block">
              Xem danh sách phiếu thu →
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Danh sách học viên ({group.members.length})</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowImportAi(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800/60 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>AI Nhập Excel/CSV</span>
              </button>

              <button
                onClick={() => setShowAddMember(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm học viên</span>
              </button>
            </div>
          </div>

          <div className="ting-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-[#E4E7EC] dark:border-[#1E293B] text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Học viên</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Tên phụ huynh</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                {group.members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} size="sm" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">{m.phone || '-'}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{m.parentName || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/members?search=${encodeURIComponent(m.name)}`}
                        className="text-xs font-semibold text-[#2538D9] dark:text-indigo-400 hover:underline"
                      >
                        Hồ sơ →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowAddMember(false)}
        >
          <div
            className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Thêm học viên vào lớp</h3>
              <button onClick={() => setShowAddMember(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Lưu học viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Import Assistant Modal */}
      {showImportAi && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowImportAi(false)}
        >
          <div
            className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">AI Trợ Lý Nhập Danh Sách Học Viên</h3>
              </div>
              <button onClick={() => setShowImportAi(false)} className="text-slate-400 text-lg">✕</button>
            </div>

            {!aiPreviewData ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Dán dữ liệu copy từ Excel hoặc file CSV vào đây. AI sẽ tự động phân loại cột Họ tên, Số điện thoại và lọc các trường hợp trùng lặp:
                </p>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Nguyễn Văn An, 0912345678, Bác Bình\nTrần Thị Mai, 0987654321, Cô Lan\nLê Hoàng Nam, 0933221100, Chú Hùng`}
                  className="w-full text-xs font-mono border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  disabled={aiAnalyzing || !importText.trim()}
                  onClick={handleAnalyzeImport}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiAnalyzing ? 'AI đang phân tích...' : 'Phân tích danh sách bằng AI'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex justify-between">
                  <span>Tổng nhận diện: <strong>{aiPreviewData.totalParsed} học viên</strong></span>
                  <span>Hợp lệ: <strong className="text-emerald-700">{aiPreviewData.validCount}</strong></span>
                  <span>Cảnh báo: <strong className="text-amber-700">{aiPreviewData.warningCount}</strong></span>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 text-xs">
                  {aiPreviewData.members.map((m: any, i: number) => (
                    <div key={i} className="p-2 border border-slate-100 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">{m.name}</span>
                        <span className="text-slate-400 font-mono ml-2">({m.phone || 'Không có SĐT'})</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'VALID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {m.message}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setAiPreviewData(null)}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    Sửa lại
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Xác nhận nạp vào lớp ({aiPreviewData.totalParsed})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
