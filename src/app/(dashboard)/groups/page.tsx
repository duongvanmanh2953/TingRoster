'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatVND } from '@/lib/utils';
import {
  Plus,
  Users,
  ExternalLink,
  Tv,
  Copy,
  Check,
  Archive,
  GraduationCap,
  Sparkles,
  Building2,
  CalendarCheck
} from 'lucide-react';

interface GroupItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  defaultFee: number;
  billingCycle: string;
  groupType: string;
  publicPortalEnabled: boolean;
  _count: {
    members: number;
    invoices: number;
  };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [defaultFee, setDefaultFee] = useState<number>(500000);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [groupType, setGroupType] = useState('CLASS');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGroups = () => {
    setLoading(true);
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGroups(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          defaultFee: Number(defaultFee),
          billingCycle,
          groupType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setName('');
        setSlug('');
        setDescription('');
        loadGroups();
      } else {
        setFormError(data.error || 'Lỗi tạo nhóm');
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPortalLink = (groupSlug: string) => {
    const url = `${window.location.origin}/p/${groupSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(groupSlug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleArchiveGroup = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ lớp học này không?')) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Lớp học & Câu lạc bộ
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              Quản trị
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tạo lớp dạy thêm, câu lạc bộ thể thao (Pickleball, Cầu lông) hoặc nhóm phòng trọ
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tạo lớp / CLB mới</span>
        </button>
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 animate-pulse text-xs">Đang tải danh sách lớp...</div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="ting-card p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {group.groupType === 'CLASS'
                        ? 'Lớp học'
                        : group.groupType === 'SPORTS_CLUB'
                        ? 'CLB Thể thao'
                        : 'Cho thuê'}
                    </span>
                    <h2 className="text-base font-bold text-white mt-1.5">{group.name}</h2>
                  </div>
                  <button
                    onClick={() => handleArchiveGroup(group.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition"
                    title="Lưu trữ lớp này"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>

                {group.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{group.description}</p>
                )}

                <div className="pt-2 border-t border-[#1E283D] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sĩ số:</span>
                    <span className="font-semibold text-white">
                      {group._count.members} thành viên
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Định mức phí:</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {formatVND(group.defaultFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3.5 border-t border-[#1E283D] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPortalLink(group.slug)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#1E283D] text-slate-300 hover:text-white hover:bg-[#182136] transition"
                  title="Sao chép link cổng tra cứu phụ huynh"
                >
                  {copiedSlug === group.slug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Link Cổng Phụ Huynh</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/kiosk/${group.id}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-emerald-400 border border-[#1E283D] rounded-lg hover:bg-[#182136] transition"
                    title="Mở màn hình Kiosk iPad"
                  >
                    <Tv className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/p/${group.slug}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-emerald-400 border border-[#1E283D] rounded-lg hover:bg-[#182136] transition"
                    title="Xem cổng thu phí công khai"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ting-card p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Chưa có lớp hoặc câu lạc bộ nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bấm nút &quot;Tạo lớp / CLB mới&quot; để bắt đầu quản lý học viên, điểm danh và tạo mã VietQR tự động.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl transition"
          >
            Tạo lớp đầu tiên
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E283D] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
              <h3 className="text-base font-bold text-white">Tạo Lớp / CLB mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên lớp / câu lạc bộ *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Lớp Toán Thầy Tuấn 12A, CLB Pickleball Hà Nội..."
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đường dẫn công khai (slug) *
                </label>
                <div className="flex items-center text-xs text-slate-400 bg-[#111726] border border-[#1E283D] rounded-xl px-3 py-2">
                  <span>tingroster.vn/p/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent font-semibold text-emerald-400 focus:outline-none flex-1 ml-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Loại hình
                  </label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CLASS">Lớp học dạy thêm</option>
                    <option value="SPORTS_CLUB">Câu lạc bộ thể thao / Sân</option>
                    <option value="RENTAL">Phòng trọ / Cho thuê</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kỳ tính phí
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MONTHLY">Theo tháng</option>
                    <option value="PER_SESSION">Theo buổi học / lượt chơi</option>
                    <option value="DAILY">Hàng ngày</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Học phí mặc định (VND)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(Number(e.target.value))}
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mô tả ngắn (tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú về lịch học, địa chỉ sân tập..."
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E283D]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
