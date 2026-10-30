'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  Users,
  Megaphone,
  CreditCard,
  QrCode,
  ArrowRight,
  FileText,
  Download,
  AlertCircle,
  ExternalLink,
  Lock,
  Vote,
  Sparkles
} from 'lucide-react';
import { formatVND } from '@/lib/utils';

export interface ChatCardProps {
  cardType: string;
  payloadStr?: string | null;
  pollData?: any;
  currentUserId: string;
  onVotePoll?: (pollId: string, optionId: string) => void;
  onClosePoll?: (pollId: string) => void;
  isOwnerOrAdmin?: boolean;
}

export function ChatCard({
  cardType,
  payloadStr,
  pollData,
  currentUserId,
  onVotePoll,
  onClosePoll,
  isOwnerOrAdmin,
}: ChatCardProps) {
  let payload: any = {};
  try {
    if (payloadStr) {
      payload = JSON.parse(payloadStr);
    }
  } catch {
    payload = {};
  }

  // 1. SCHEDULE CARD
  // 1. SCHEDULE CARD
  if (cardType === 'CARD_SCHEDULE') {
    return (
      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-900/60 max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
              Lịch hoạt động
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {payload.title || 'Buổi sinh hoạt / Lớp học'}
            </h4>
          </div>
        </div>

        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 py-1">
          {payload.date && (
            <p className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{payload.date} {payload.time ? `• ${payload.time}` : ''}</span>
            </p>
          )}
          {payload.location && (
            <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{payload.location}</span>
            </p>
          )}
          {payload.note && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5">
              &quot;{payload.note}&quot;
            </p>
          )}
        </div>

        {payload.link && (
          <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex justify-end">
            <Link
              href={payload.link}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Xem chi tiết lịch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // 2. ATTENDANCE CARD
  if (cardType === 'CARD_ATTENDANCE') {
    return (
      <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-900/60 max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
              Điểm danh nhóm
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {payload.sessionName || 'Phiên điểm danh'}
            </h4>
          </div>
        </div>

        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 py-1">
          <p className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Ngày: {payload.date || 'Hôm nay'}</span>
          </p>
          {typeof payload.presentCount === 'number' && (
            <p className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Đã có mặt: {payload.presentCount} {payload.totalCount ? `/ ${payload.totalCount} người` : 'thành viên'}</span>
            </p>
          )}
          <p className="text-[11px] text-slate-500">
            {payload.isOpen ? '🟢 Đang mở ghi nhận điểm danh' : '⚪ Phiên điểm danh đã kết thúc'}
          </p>
        </div>

        {payload.link && (
          <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 flex justify-end">
            <Link
              href={payload.link}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Xem bảng điểm danh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // 3. ANNOUNCEMENT CARD
  if (cardType === 'CARD_ANNOUNCEMENT') {
    return (
      <div className="my-2 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/90 dark:border-amber-900/60 max-w-sm shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">
              Thông báo chính thức
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {payload.title || 'Thông báo từ Ban quản lý'}
            </h4>
          </div>
        </div>

        <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed py-1">
          {payload.content}
        </div>

        {payload.expiresAt && (
          <p className="text-[10px] text-slate-400 mt-2">
            Hiệu lực đến: {new Date(payload.expiresAt).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>
    );
  }

  // 4. PAYMENT NOTICE CARD
  if (cardType === 'CARD_PAYMENT') {
    return (
      <div className="my-2 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/80 max-w-sm shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#2538D9] text-white flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#2538D9] dark:text-blue-400 block">
                Khoản thu & học phí
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {payload.title || 'Thông báo đóng phí định kỳ'}
              </h4>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#2538D9] dark:text-blue-300 text-[10px] font-bold whitespace-nowrap">
            VietQR
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 py-1">
          {payload.amount && (
            <p className="text-sm font-black text-slate-900 dark:text-white">
              Định mức: <span className="text-[#2538D9] dark:text-blue-400 font-mono">{formatVND(payload.amount)}</span>
            </p>
          )}
          {payload.dueDate && (
            <p className="text-[11px] text-slate-500">
              Hạn nộp: <span className="font-semibold text-slate-700 dark:text-slate-300">{payload.dueDate}</span>
            </p>
          )}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Quét mã VietQR trên Cổng Tra Cứu để thanh toán chuẩn xác, đối soát tự động tức thì.
          </p>
        </div>

        {payload.slug && (
          <div className="mt-3 pt-2.5 border-t border-blue-200/60 dark:border-blue-900/40">
            <Link
              href={`/p/${payload.slug}`}
              target="_blank"
              className="w-full py-2 px-3 rounded-xl bg-[#2538D9] hover:bg-[#1E2DB8] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap"
            >
              <span>Xem Cổng Tra Cứu & VietQR</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // 5. POLL CARD
  if (cardType === 'CARD_POLL' && pollData) {
    const totalVotes = (pollData.options || []).reduce(
      (sum: number, opt: any) => sum + (opt.votes?.length || 0),
      0
    );

    const isCreator = pollData.creatorId === currentUserId;
    const canManagePoll = isCreator || isOwnerOrAdmin;

    return (
      <div className="my-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
              <Vote className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 block">
                Bình chọn nhóm {pollData.isMultiple ? '(Nhiều lựa chọn)' : '(1 lựa chọn)'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {pollData.question}
              </h4>
            </div>
          </div>

          {pollData.isClosed && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold whitespace-nowrap">
              Đã đóng
            </span>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2 mt-3">
          {(pollData.options || []).map((opt: any) => {
            const votesCount = opt.votes?.length || 0;
            const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
            const hasVoted = (opt.votes || []).some((v: any) => v.userId === currentUserId);

            return (
              <button
                key={opt.id}
                type="button"
                disabled={pollData.isClosed}
                onClick={() => onVotePoll && onVotePoll(pollData.id, opt.id)}
                className={`w-full text-left p-2.5 rounded-xl border relative overflow-hidden transition-all text-xs font-semibold ${
                  hasVoted
                    ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 text-violet-950 dark:text-violet-100'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-violet-200/50 dark:bg-violet-800/30 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <span className="truncate">{opt.text}</span>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    {votesCount} ({percentage}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{totalVotes} lượt bình chọn • bởi {pollData.creatorName}</span>

          {!pollData.isClosed && canManagePoll && onClosePoll && (
            <button
              type="button"
              onClick={() => onClosePoll(pollData.id)}
              className="text-rose-600 hover:text-rose-700 font-bold hover:underline"
            >
              Đóng bình chọn
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
