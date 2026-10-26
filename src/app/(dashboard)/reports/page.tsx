'use client';

import React, { useEffect, useState } from 'react';
import { formatVND, formatDateVN } from '@/lib/utils';
import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Download,
  AlertCircle,
  Users,
  Calendar,
  Send,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Query states
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<any>(null);
  const [askingAi, setAskingAi] = useState(false);

  const loadReports = () => {
    setLoading(true);
    fetch('/api/reports')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAskingAi(true);
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiQuestion }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setAiAnswer(resJson.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAskingAi(false);
    }
  };

  const handleExportCSV = () => {
    if (!data?.groupSummaries) return;
    const headers = 'Tên lớp,Sĩ số,Tổng cần thu,Đã thu,Còn nợ,Tỷ lệ thu\n';
    const rows = data.groupSummaries
      .map(
        (g: any) =>
          `"${g.name}",${g.memberCount},${g.totalDue},${g.totalPaid},${g.debt},${g.rate}%`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tingroster_baocao_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Báo Cáo & Phân Tích Thu Phí
          </h1>
          <p className="text-sm text-slate-500">
            Theo dõi xu hướng dòng tiền, tỷ lệ hoàn thành thu phí và công nợ chi tiết từng lớp
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Xuất file Excel / CSV</span>
        </button>
      </div>

      {/* AI Natural Language Query Box */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-2xl border border-indigo-100 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Trợ Lý Phân Tích & Báo Cáo Thông Minh</span>
        </div>
        <p className="text-xs text-indigo-700">
          Hỏi đáp trực tiếp bằng tiếng Việt tự nhiên. AI sẽ truy vấn dữ liệu thực tế từ hệ thống:
        </p>

        <form onSubmit={handleAskAi} className="flex gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ví dụ: 'Tháng này lớp nào nợ nhiều nhất?', 'Có khoản thu nào quá hạn không?'..."
            className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={askingAi || !aiQuestion.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {askingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Hỏi AI</span>
          </button>
        </form>

        {/* AI Answer Box */}
        {aiAnswer && (
          <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm text-xs text-slate-800 space-y-2 animate-in fade-in duration-200">
            <p className="whitespace-pre-line leading-relaxed">{aiAnswer.answer}</p>
            {aiAnswer.targetUrl && (
              <Link
                href={aiAnswer.targetUrl}
                className="text-xs font-bold text-indigo-600 hover:underline inline-block pt-1"
              >
                Mở trang chi tiết liên quan →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Monthly Revenue Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Doanh thu thu phí 6 tháng gần nhất</h2>
            <p className="text-xs text-slate-400">Dòng tiền đối soát qua VietQR thực tế</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Tăng trưởng đều đặn
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-4">
          {data?.monthlyData?.map((m: any, i: number) => {
            const heightPercent = Math.min(100, Math.round((m.revenue / 10000000) * 100));
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-900">{formatVND(m.revenue)}</span>
                <div className="w-full bg-slate-100 rounded-xl h-36 flex items-end p-1.5">
                  <div
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                    title={`Mục tiêu: ${formatVND(m.target)}`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Debt Breakdown Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Bảng theo dõi thu phí & công nợ theo lớp</h2>
          <p className="text-xs text-slate-400">Chi tiết số tiền cần thu, đã thu và tỷ lệ hoàn thành</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Tên lớp</th>
                <th className="py-3 px-4 text-center">Sĩ số</th>
                <th className="py-3 px-4 text-right">Tổng cần thu</th>
                <th className="py-3 px-4 text-right">Đã thu thực tế</th>
                <th className="py-3 px-4 text-right">Còn phải thu</th>
                <th className="py-3 px-4 text-center">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.groupSummaries?.map((g: any) => (
                <tr key={g.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <Link href={`/groups/${g.id}`} className="hover:text-indigo-600 hover:underline">
                      {g.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-600">{g.memberCount}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatVND(g.totalDue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">
                    {formatVND(g.totalPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                    {formatVND(g.debt)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {g.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
