'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users2,
  Plus,
  Search,
  Sparkles,
  RefreshCw,
  Trash2,
  Phone,
  UserCheck
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { SmartBackButton } from '@/components/common/SmartBackButton';
import { CommunityMemberSearchModal } from '@/components/groups/CommunityMemberSearchModal';

interface GroupDetail {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  themeColor?: string | null;
  enabledModules?: string | null;
  groupType: string;
  members: Array<{
    id: string;
    name: string;
    phone?: string | null;
    parentName?: string | null;
  }>;
}

export default function SpaceMembersPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCommunitySearch, setShowCommunitySearch] = useState(false);
  const [showImportAi, setShowImportAi] = useState(false);

  // Add member simple state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // AI Import Roster state
  const [importText, setImportText] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState<any>(null);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      if (data.success && data.data) {
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

  const filteredMembers = useMemo(() => {
    if (!group?.members) return [];
    if (!search.trim()) return group.members;
    const q = search.toLowerCase();
    return group.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.parentName && m.parentName.toLowerCase().includes(q))
    );
  }, [group?.members, search]);

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
          parentName: newParentName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddMember(false);
        setNewMemberName('');
        setNewMemberPhone('');
        setNewParentName('');
        loadGroup();
      } else {
        alert(data.error || 'Lỗi thêm thành viên');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${memberName}" khỏi không gian này không? Dữ liệu lịch sử thanh toán vẫn được bảo toàn an toàn.`)) {
      return;
    }
    try {
      setRemovingMemberId(memberId);
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadGroup();
      } else {
        alert(data.error || 'Lỗi khi gỡ thành viên');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setRemovingMemberId(null);
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
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-xs">Đang tải danh sách thành viên...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-24 text-slate-500 space-y-3">
        <p className="text-sm font-bold">Không tìm thấy không gian.</p>
        <SmartBackButton fallbackUrl="/groups" label="Quay lại danh sách không gian" />
      </div>
    );
  }

  const themeColor = group.themeColor || '#2538D9';

  return (
    <div
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ '--space-accent': themeColor } as React.CSSProperties}
    >
      <SpaceNavHeader
        space={{
          ...group,
          memberCount: group.members.length,
        }}
        activeSection="members"
      />

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên thành viên, số điện thoại..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCommunitySearch(true)}
            className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm từ cộng đồng</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportAi(true)}
            className="px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/60 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span>AI Nhập Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm thành viên</span>
          </button>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Users2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold">
              {search ? 'Không tìm thấy thành viên nào phù hợp' : 'Chưa có thành viên nào trong không gian này.'}
            </p>
            <p className="text-[11px] text-slate-400">
              {search
                ? 'Thử thay đổi từ khóa tìm kiếm.'
                : 'Thêm thành viên mới hoặc dùng tính năng AI Nhập danh sách để quét từ Excel.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 font-bold">Họ và tên</th>
                  <th className="py-3 px-4 font-bold">Số điện thoại</th>
                  <th className="py-3 px-4 font-bold">Người liên hệ / Giám hộ</th>
                  <th className="py-3 px-4 text-right font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <Link href={`/members/${m.id}`} className="hover:text-blue-600 transition-colors">
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {m.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {m.parentName || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={removingMemberId === m.id}
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        {removingMemberId === m.id ? 'Đang gỡ...' : 'Gỡ khỏi không gian'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Simple Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Thêm thành viên mới</h3>
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="0987..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Người liên hệ / Giám hộ (không bắt buộc)
                </label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="Ví dụ: Mẹ Nguyễn Thị B"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  Thêm vào không gian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Import Modal */}
      {showImportAi && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">AI Nhập danh sách Roster</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportAi(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={5}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Dán danh sách từ Excel, Zalo hoặc tin nhắn, ví dụ:&#10;1. Nguyễn Hoàng Nam - 0988123456&#10;2. Trần Thị Mai - 0912345678"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />

            {aiPreviewData && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300">
                AI đã nhận diện thành công {aiPreviewData.members?.length || 0} thành viên!
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportAi(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer"
              >
                Hủy
              </button>
              {!aiPreviewData ? (
                <button
                  type="button"
                  disabled={aiAnalyzing || !importText.trim()}
                  onClick={handleAnalyzeImport}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer"
                >
                  {aiAnalyzing ? 'Đang phân tích...' : 'Phân tích văn bản'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Xác nhận thêm vào không gian
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Community Search Modal */}
      {showCommunitySearch && (
        <CommunityMemberSearchModal
          open={showCommunitySearch}
          onClose={() => setShowCommunitySearch(false)}
          groupId={group.id}
          groupName={group.name}
          onMembersAdded={() => loadGroup()}
        />
      )}
    </div>
  );
}
