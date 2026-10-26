'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Search,
  Phone,
  RefreshCw,
  ExternalLink,
  Users2,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  phone?: string | null;
  parentName?: string | null;
  status: string;
  group: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    attendances: number;
    invoices: number;
  };
}

interface GroupOption {
  id: string;
  name: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setGroups(data.data);
          setTargetGroupId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const loadMembers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedGroupId) params.append('groupId', selectedGroupId);
    if (search) params.append('search', search);

    fetch(`/api/members?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMembers(data.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, [selectedGroupId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !targetGroupId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: targetGroupId,
          name: newName.trim(),
          phone: newPhone.trim() || undefined,
          parentName: newParentName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewName('');
        setNewPhone('');
        setNewParentName('');
        loadMembers();
      } else {
        alert(data.error || 'Lỗi thêm học viên');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Học viên & Hội viên
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              Danh bạ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản lý thông tin liên hệ, lịch sử chuyên cần và tiến độ nộp học phí từng cá nhân
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm học viên mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="ting-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, số điện thoại..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#111726] border border-[#1E283D] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="text-xs font-semibold border border-[#1E283D] rounded-xl px-3 py-2 bg-[#111726] text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Tất cả các lớp</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            onClick={loadMembers}
            className="p-2 border border-[#1E283D] rounded-xl hover:bg-[#182136] text-slate-400 hover:text-white transition"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Member Table */}
      <div className="ting-card overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse text-xs">Đang tải danh sách học viên...</div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111726] border-b border-[#1E283D] text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp / Nhóm</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Phụ huynh</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2338]">
                {members.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-[#131C2E] transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <Link href={`/members/${m.id}`} className="hover:text-emerald-400 transition-colors">
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {m.group.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {m.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {m.parentName || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        Hoạt động
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/members/${m.id}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        <span>Hồ sơ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <p className="text-xs">Chưa có học viên nào phù hợp với bộ lọc</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl transition"
            >
              Thêm học viên đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1626] border border-[#1E283D] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#1E283D] pb-3">
              <h3 className="text-base font-bold text-white">Thêm học viên mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn Lớp / CLB *
                </label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên học viên *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An, Trần Thu Hà..."
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số điện thoại học sinh / thành viên (tùy chọn)
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên phụ huynh / Người bảo hộ (tùy chọn)
                </label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="Ví dụ: Bác Tuấn (Bố), Chị Lan (Mẹ)..."
                  className="w-full bg-[#111726] border border-[#1E283D] text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E283D]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang thêm...' : 'Thêm học viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
