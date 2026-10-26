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
  MoreVertical,
  GraduationCap,
  Sparkles,
  Archive,
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
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      const autoSlug = val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(autoSlug);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý Lớp & Câu lạc bộ
          </h1>
          <p className="text-sm text-slate-500">
            Tạo lớp dạy thêm, câu lạc bộ thể thao hoặc nhóm thuê phòng
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lớp / CLB mới</span>
        </button>
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Đang tải danh sách lớp...</div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {group.groupType === 'CLASS'
                        ? 'Lớp học'
                        : group.groupType === 'SPORTS_CLUB'
                        ? 'CLB Thể thao'
                        : 'Cho thuê'}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{group.name}</h2>
                  </div>
                  <button
                    onClick={() => handleArchiveGroup(group.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Lưu trữ lớp này"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>

                {group.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{group.description}</p>
                )}

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Thành viên:</span>
                    <span className="font-semibold text-slate-800">
                      {group._count.members} người
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Định mức phí:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatVND(group.defaultFee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPortalLink(group.slug)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                  title="Sao chép link gửi phụ huynh qua Zalo"
                >
                  {copiedSlug === group.slug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã chép link Zalo</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Link Zalo</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/kiosk/${group.id}`}
                    target="_blank"
                    className="p-1.5 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                    title="Mở màn hình Kiosk cho iPad tại sân"
                  >
                    <Tv className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/p/${group.slug}`}
                    target="_blank"
                    className="p-1.5 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Chưa có lớp hoặc câu lạc bộ nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bấm nút &quot;Tạo lớp / CLB mới&quot; để bắt đầu quản lý học viên, điểm danh và tạo mã VietQR tự động.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            Tạo lớp đầu tiên
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Tạo Lớp / CLB mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên lớp / câu lạc bộ *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Lớp Toán Thầy Tuấn 12A, CLB Cầu Lông Ting..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn công khai (slug) *
                </label>
                <div className="flex items-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <span>tingroster.vn/p/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent font-semibold text-slate-900 focus:outline-none flex-1 ml-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại hình
                  </label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CLASS">Lớp học dạy thêm</option>
                    <option value="SPORTS_CLUB">Câu lạc bộ thể thao / Sân</option>
                    <option value="RENTAL">Phòng trọ / Cho thuê</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kỳ tính phí
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MONTHLY">Theo tháng</option>
                    <option value="PER_SESSION">Theo buổi học / lượt chơi</option>
                    <option value="DAILY">Hàng ngày</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Học phí mặc định (VND)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={defaultFee}
                  onChange={(e) => setDefaultFee(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả ngắn (tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú về lịch học, địa chỉ sân tập..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
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
