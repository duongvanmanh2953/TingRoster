'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { SpaceNavHeader } from '@/components/spaces/SpaceNavHeader';
import { formatVND } from '@/lib/utils';

interface ServiceItem {
  id: string;
  name: string;
  code: string;
  category: string;
  billingType: string;
  unit: string;
  unitPrice: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SpaceServicesPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'GENERAL',
    billingType: 'MONTHLY',
    unit: 'tháng',
    unitPrice: 0,
    description: '',
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/groups/${spaceId}/services`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data || []);
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
      fetchServices();
    }
  }, [spaceId]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      code: `SVC-${Math.floor(1000 + Math.random() * 9000)}`,
      category: space?.groupType === 'RENTAL' ? 'RENTAL' : space?.groupType === 'SPORTS_CLUB' ? 'SPORTS' : 'EDUCATION',
      billingType: 'MONTHLY',
      unit: 'tháng',
      unitPrice: 0,
      description: '',
      isActive: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      code: svc.code,
      category: svc.category,
      billingType: svc.billingType,
      unit: svc.unit,
      unitPrice: svc.unitPrice,
      description: svc.description || '',
      isActive: svc.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingService) {
        // PATCH
        const res = await fetch(`/api/groups/${spaceId}/services`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingService.id,
            name: formData.name,
            unitPrice: Number(formData.unitPrice),
            unit: formData.unit,
            description: formData.description,
            isActive: formData.isActive,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        // POST
        const res = await fetch(`/api/groups/${spaceId}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }

      setModalOpen(false);
      await fetchServices();
    } catch (err: any) {
      setFormError(err.message || 'Có lỗi xảy ra khi lưu dịch vụ');
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || s.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getBillingTypeLabel = (type: string) => {
    switch (type) {
      case 'FIXED_ONE_TIME':
        return 'Cố định 1 lần';
      case 'PER_SESSION':
        return 'Theo buổi';
      case 'PER_HOUR':
        return 'Theo giờ';
      case 'METERED':
        return 'Theo chỉ số (Điện/Nước)';
      case 'DAILY':
        return 'Theo ngày';
      case 'PACKAGE':
        return 'Theo gói';
      case 'SURCHARGE':
        return 'Phụ phí phát sinh';
      default:
        return 'Hàng tháng';
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
            groupType: space.groupType,
          }}
          activeSection="services"
        />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Danh mục Dịch vụ & Bảng giá</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cấu hình bảng giá linh hoạt, chu kỳ tính phí, phụ phí và chỉ số sử dụng độc lập cho không gian này.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm dịch vụ mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên hoặc mã dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Lọc theo nhóm dịch vụ"
          className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="ALL">Tất cả nhóm dịch vụ</option>
          <option value="GENERAL">Chung</option>
          <option value="RENTAL">Nhà cho thuê / Tiền phòng</option>
          <option value="UTILITY">Điện, Nước & Tiện ích</option>
          <option value="SPORTS">Sân bãi & Thể thao</option>
          <option value="EDUCATION">Học phí & Giáo dục</option>
        </select>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Đang tải danh mục bảng giá...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Chưa có dịch vụ nào trong danh mục. Nhấn &quot;Thêm dịch vụ mới&quot; để tạo bảng giá.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Mã & Tên dịch vụ</th>
                  <th className="py-3 px-4">Nhóm</th>
                  <th className="py-3 px-4">Cách tính phí</th>
                  <th className="py-3 px-4">Đơn vị</th>
                  <th className="py-3 px-4 text-right">Đơn giá</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredServices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{svc.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{svc.code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {svc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {getBillingTypeLabel(svc.billingType)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {svc.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatVND(svc.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {svc.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đang áp dụng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tạm ngừng</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(svc)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Service */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ & Bảng giá mới'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên dịch vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tiền phòng trọ, Tiền điện sinh hoạt, Học phí tháng..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã dịch vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingService}
                    placeholder="SVC-DIEN, SVC-SAN-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nhóm dịch vụ
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GENERAL">Chung</option>
                    <option value="RENTAL">Nhà cho thuê / Tiền phòng</option>
                    <option value="UTILITY">Điện, Nước & Tiện ích</option>
                    <option value="SPORTS">Sân bãi & Thể thao</option>
                    <option value="EDUCATION">Học phí & Giáo dục</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cách tính phí
                  </label>
                  <select
                    value={formData.billingType}
                    onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MONTHLY">Hàng tháng</option>
                    <option value="PER_SESSION">Theo buổi</option>
                    <option value="PER_HOUR">Theo giờ</option>
                    <option value="METERED">Theo chỉ số</option>
                    <option value="FIXED_ONE_TIME">Cố định 1 lần</option>
                    <option value="DAILY">Theo ngày</option>
                    <option value="PACKAGE">Gói dịch vụ</option>
                    <option value="SURCHARGE">Phụ phí</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    placeholder="kWh, m3, giờ, tháng, người..."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn giá (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả / Ghi chú quy tắc
                </label>
                <textarea
                  rows={2}
                  placeholder="Điều kiện áp dụng, chính sách tính bù..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Kích hoạt áp dụng dịch vụ này ngay
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Đang lưu...' : 'Lưu dịch vụ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
