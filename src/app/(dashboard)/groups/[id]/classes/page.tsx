'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Loader2,
  DollarSign
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

interface ClassItem {
  id: string;
  className: string;
  subject: string;
  courseType: string;
  teacherName?: string | null;
  room?: string | null;
  schedule?: string | null;
  maxCapacity: number;
  feePerPeriod: number;
  status: string;
}

export default function SpaceClassesPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal create
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    subject: 'Toán học',
    courseType: 'MONTHLY',
    teacherName: '',
    room: 'Phòng 201',
    schedule: 'T3, T5: 18:00 - 19:30',
    maxCapacity: 30,
    feePerPeriod: 1200000,
  });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${spaceId}/classes`);
      const data = await res.json();
      if (data.success) {
        setClasses(data.data || []);
        setTotalStudents(data.totalStudents || 0);
        setSpace(data.group || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchClasses();
    }
  }, [spaceId]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${spaceId}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxCapacity: Number(formData.maxCapacity),
          feePerPeriod: Number(formData.feePerPeriod),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setModalOpen(false);
      await fetchClasses();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo lớp học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {space && (
        <SpaceNavHeader
          space={{
            id: space.id,
            name: space.name,
            slug: space.slug || space.id,
            code: space.code,
            groupType: 'CLASS',
          }}
          activeSection="classes"
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Quản lý Khóa học & Lớp học</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập chương trình đào tạo, phân công giáo viên, phòng học, lịch học cố định và học phí kỳ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số lớp đang mở</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {classes.length} lớp
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Tổng học viên trong không gian</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {totalStudents} học sinh
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Học phí trung bình</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {classes.length > 0
              ? formatVND(Math.round(classes.reduce((sum, c) => sum + c.feePerPeriod, 0) / classes.length))
              : '0 ₫'}
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải danh sách lớp học...</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Chưa có lớp học nào được tạo. Nhấn &quot;Tạo lớp học mới&quot; để thiết lập chương trình.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cls.className}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{cls.subject}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Đang học
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{cls.schedule || 'Chưa xếp lịch'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{cls.room || 'Chưa gán phòng'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Giáo viên: {cls.teacherName || 'Chưa chỉ định'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Học phí:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {formatVND(cls.feePerPeriod)} / {cls.courseType === 'MONTHLY' ? 'tháng' : 'khóa'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Class */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Thêm lớp học / khóa học mới
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp Toán Nâng Cao 9A"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Môn học
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toán, Tiếng Anh, Guitar..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giáo viên phụ trách
                  </label>
                  <input
                    type="text"
                    placeholder="Thầy Nam..."
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lịch học
                  </label>
                  <input
                    type="text"
                    placeholder="T3 - T5: 18h - 19h30"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phòng học
                  </label>
                  <input
                    type="text"
                    placeholder="Phòng 201"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Học phí (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    required
                    value={formData.feePerPeriod}
                    onChange={(e) => setFormData({ ...formData, feePerPeriod: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sĩ số tối đa
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Đang lưu...' : 'Lưu lớp học'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
