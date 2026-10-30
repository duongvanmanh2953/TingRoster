'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Sparkles,
  Webhook,
  QrCode,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function HelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState<'QUICK_START' | 'INTEGRATION' | 'FAQ' | 'GLOSSARY'>('QUICK_START');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Trung Tâm Hỗ Trợ & Hướng Dẫn (Help Center)
        </h1>
        <p className="text-sm text-slate-500">
          Tài liệu hướng dẫn vận hành, xử lý giao dịch và giải đáp thắc mắc thường gặp
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('QUICK_START')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeCategory === 'QUICK_START' ? 'bg-black-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Checklist bắt đầu nhanh
        </button>

        <button
          onClick={() => setActiveCategory('INTEGRATION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeCategory === 'INTEGRATION' ? 'bg-black-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tích hợp SePay & Casso
        </button>

        <button
          onClick={() => setActiveCategory('FAQ')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeCategory === 'FAQ' ? 'bg-black-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Câu hỏi thường gặp (FAQ)
        </button>

        <button
          onClick={() => setActiveCategory('GLOSSARY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeCategory === 'GLOSSARY' ? 'bg-black-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Giải thích thuật ngữ
        </button>
      </div>

      {/* TAB 1: QUICK START */}
      {activeCategory === 'QUICK_START' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>4 Bước Bắt Đầu Vận Hành Thu Phí TingRoster</span>
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Bước 1: Cài đặt tài khoản nhận tiền</span>
                <p>Vào mục <strong>Cài đặt tài khoản</strong>, chọn ngân hàng và nhập đúng số tài khoản, tên chủ tài khoản để tự động sinh mã VietQR.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Bước 2: Tạo lớp và nhập danh sách học sinh</span>
                <p>Vào <strong>Lớp & CLB</strong>, tạo lớp mới và dùng công cụ <strong>AI Nhập Excel</strong> để nạp toàn bộ học sinh trong vài giây.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Bước 3: Điểm danh và phát hành đợt thu</span>
                <p>Hàng ngày vào <strong>Điểm danh hôm nay</strong> chạm có mặt. Cuối tháng bấm <strong>Tạo đợt thu mới</strong>, hệ thống tự động tính học phí theo số buổi.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Bước 4: Gửi link Zalo & Tận hưởng gạch nợ tự động</span>
                <p>Sao chép link phiếu thu gửi phụ huynh. Khi phụ huynh quét mã chuyển khoản, hệ thống tự động gạch nợ sau 5 giây.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTEGRATION */}
      {activeCategory === 'INTEGRATION' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Webhook className="w-5 h-5 text-indigo-600" />
            <span>Hướng Dẫn Kết Nối Webhook SePay & Casso</span>
          </h2>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">1. Kết nối với SePay:</h3>
              <p>• Đăng nhập trang quản trị SePay &gt; Tích hợp Webhook &gt; Thêm mới Webhook.</p>
              <p>• <strong>URL Webhook:</strong> Điền đường dẫn <code>https://your-domain.com/api/webhooks/sepay</code>.</p>
              <p>• <strong>API Key:</strong> Khóa bí mật cấu hình khớp với biến môi trường <code>SEPAY_WEBHOOK_API_KEY</code>.</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">2. Kết nối với Casso:</h3>
              <p>• Vào Casso &gt; Thiết lập &gt; Webhook.</p>
              <p>• <strong>URL Webhook:</strong> <code>https://your-domain.com/api/webhooks/casso</code>.</p>
              <p>• <strong>Secure Token:</strong> Khớp với biến <code>CASSO_WEBHOOK_SECURE_TOKEN</code>.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeCategory === 'FAQ' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Câu Hỏi Thường Gặp</h2>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">Q: Nếu phụ huynh quên ghi mã chuyển khoản thì sao?</span>
              <p>A: Giao dịch vẫn được bảo toàn nguyên vẹn trong mục <strong>Giao dịch chưa khớp</strong>. AI sẽ phân tích số tiền, họ tên và đề xuất học sinh khớp nhất để bạn gán thủ công chỉ với 1 click.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">Q: Phụ huynh chuyển tiền thiếu hoặc thừa có bị mất tiền không?</span>
              <p>A: Tuyệt đối không! Chuyển thiếu phiếu thu sẽ đổi trạng thái thành <strong>Đóng thiếu</strong> (PARTIAL). Chuyển thừa hệ thống ghi nhận <strong>Đóng thừa</strong> (OVERPAID) và lưu chính xác số dư để hoàn lại hoặc cấn trừ kỳ sau.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">Q: Tiền học phí chuyển về đâu?</span>
              <p>A: Tiền chuyển trực tiếp vào tài khoản ngân hàng chính chủ của bạn (VietQR liên kết trực tiếp STK của bạn). TingRoster không giữ tiền trung gian.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GLOSSARY */}
      {activeCategory === 'GLOSSARY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
          <h2 className="text-base font-bold text-slate-900">Từ Điển Thuật Ngữ</h2>
          <div className="space-y-2">
            <p>• <strong>VietQR:</strong> Chuẩn mã QR thanh toán liên ngân hàng Napas 24/7 của Việt Nam, mở app ngân hàng nào cũng quét được.</p>
            <p>• <strong>Mã thanh toán (Payment Code):</strong> Mã nhận diện riêng biệt dạng <code>TR84920</code> cấp cho từng học sinh.</p>
            <p>• <strong>Idempotency (Tính lũy đẳng):</strong> Cơ chế kỹ thuật đảm bảo khi ngân hàng gửi trùng 2 lần một giao dịch, hệ thống chỉ cộng tiền duy nhất 1 lần.</p>
            <p>• <strong>Outbox Pattern:</strong> Đảm bảo thông báo Telegram và realtime không bao giờ bị mất nếu mạng chập chờn.</p>
          </div>
        </div>
      )}
    </div>
  );
}
