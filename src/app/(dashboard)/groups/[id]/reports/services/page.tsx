'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  TrendingUp,
  Receipt,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Tag,
  ArrowLeft
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

export default function SpaceServicesReportPage() {
  const params = useParams();
  const spaceId = params.id as string;

  const [space, setSpace] = useState<any>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [spaceRes, servRes, invRes] = await Promise.all([
          fetch(`/api/groups/${spaceId}`),
          fetch(`/api/groups/${spaceId}/services`),
          fetch(`/api/invoices?groupId=${spaceId}`),
        ]);
        const [spaceJson, servJson, invJson] = await Promise.all([
          spaceRes.json(),
          servRes.json(),
          invRes.json(),
        ]);

        if (spaceJson.success) setSpace(spaceJson.data);
        if (servJson.success) setServices(servJson.data || []);
        if (invJson.success) setInvoices(invJson.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (spaceId) {
      loadData();
    }
  }, [spaceId]);

  // Aggregate invoice line items or matching titles to services
  const serviceStats = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};

    services.forEach((s) => {
      map[s.id] = { count: 0, revenue: 0 };
    });

    invoices.forEach((inv) => {
      // Check line items if any
      if (Array.isArray(inv.lineItems) && inv.lineItems.length > 0) {
        inv.lineItems.forEach((li: any) => {
          if (li.serviceId && map[li.serviceId]) {
            map[li.serviceId].count += 1;
            map[li.serviceId].revenue += li.amount || 0;
          }
        });
      } else {
        // Fallback match by service name/code in title
        services.forEach((s) => {
          if (inv.title && (inv.title.includes(s.name) || inv.title.includes(s.code))) {
            map[s.id].count += 1;
            map[s.id].revenue += inv.amountPaid || 0;
          }
        });
      }
    });

    return map;
  }, [services, invoices]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [services, search, categoryFilter]);

  const totalActive = services.filter((s) => s.isActive).length;
  const totalRevenue = Object.values(serviceStats).reduce((sum, item) => sum + item.revenue, 0);
  const totalInvoicedServices = Object.values(serviceStats).filter((item) => item.count > 0).length;

  const handleExportCSV = () => {
    const headers = ['Mã dịch vụ', 'Tên dịch vụ', 'Danh mục', 'Đơn vị tính', 'Đơn giá niêm yết (VND)', 'Số chứng từ sử dụng', 'Doanh thu ghi nhận (VND)', 'Trạng thái'];
    const rows = filteredServices.map((s) => [
      s.code,
      `"${s.name}"`,
      s.category,
      s.unit,
      s.unitPrice,
      serviceStats[s.id]?.count || 0,
      serviceStats[s.id]?.revenue || 0,
      s.isActive ? 'Đang hoạt động' : 'Tạm dừng',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_dich_vu_${space?.code || spaceId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          activeSection="reports"
        />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/groups/${spaceId}/reports`}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>Báo cáo Dịch vụ & Hiệu suất Doanh thu</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-6">
            Thống kê chi tiết danh mục dịch vụ, số lượng phát sinh hóa đơn và tổng doanh thu ghi nhận trong không gian.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Xuất báo cáo Excel / CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Dịch vụ hoạt động</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {totalActive} / {services.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Đang áp dụng trong bảng giá</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Dịch vụ đã phát sinh</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
            {totalInvoicedServices}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Có giao dịch trong kỳ</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Doanh thu dịch vụ</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono tabular-nums">
            {formatVND(totalRevenue)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Tổng tiền thực thu từ dịch vụ</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tỷ lệ sử dụng</span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2 font-mono tabular-nums">
            {services.length > 0 ? Math.round((totalInvoicedServices / services.length) * 100) : 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Hiệu quả danh mục dịch vụ</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên dịch vụ hoặc mã..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          >
            <option value="ALL">Tất cả danh mục</option>
            <option value="RENTAL">Cho thuê / Căn hộ</option>
            <option value="SPORTS">Sân bãi / Thể thao</option>
            <option value="EDUCATION">Giáo dục / Khóa học</option>
            <option value="UTILITY">Tiện ích / Điện nước</option>
            <option value="GENERAL">Chung</option>
          </select>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs">Đang tổng hợp báo cáo dịch vụ...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">Không tìm thấy dịch vụ nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Dịch vụ</th>
                  <th className="py-3 px-4">Mã dịch vụ</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4 text-right">Đơn giá niêm yết</th>
                  <th className="py-3 px-4 text-center">Đơn vị tính</th>
                  <th className="py-3 px-4 text-center">Chứng từ sử dụng</th>
                  <th className="py-3 px-4 text-right">Doanh thu thu được</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredServices.map((service) => {
                  const stat = serviceStats[service.id] || { count: 0, revenue: 0 };
                  return (
                    <tr key={service.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {service.name}
                        {service.description && (
                          <p className="text-[10px] text-slate-400 font-normal line-clamp-1">{service.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {service.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {service.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatVND(service.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">
                        {service.unit}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {stat.count}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatVND(stat.revenue)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            service.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {service.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {service.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
