import Link from 'next/link';
import {
  GraduationCap,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Users,
  Smartphone,
  Tv,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              TingRoster
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Dùng thử miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mx-auto shadow-sm">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tự động đối soát thu phí qua VietQR • SePay & Casso Webhook</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
          Điểm danh một chạm. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">
            Thu phí tự động.
          </span>{' '}
          Đối soát khỏi lo.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Không còn phải dò từng dòng sao kê ngân hàng hay yêu cầu phụ huynh chụp màn hình chuyển khoản.
          TingRoster tự động nhận diện giao dịch và gạch nợ tức thời trong 5 giây.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition"
          >
            <span>Vào Bảng Điều Khiển</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/p/lop-toan-12a"
            target="_blank"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-2xl transition"
          >
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>Xem Cổng Phụ Huynh Mẫu</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Mã VietQR Riêng Biệt</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mỗi học viên có mã định danh TR84920 ngẫu nhiên an toàn. Quét mã bằng bất kỳ app ngân hàng nào là có sẵn số tiền và nội dung.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Gạch Nợ Tự Động Trong 5 Giây</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Webhook nhận biến động số dư tức thời từ SePay & Casso. Tự động kiểm tra số tiền, cập nhật trạng thái Đã đóng và ghi sổ kiểm toán.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Tv className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Chế Độ Kiosk iPad Tại Sân</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dành riêng cho câu lạc bộ thể thao, sân cầu lông, bóng đá: Chạm tên, hiện QR lớn, phát tiếng chuông &quot;Ting&quot; khi nhận tiền.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        TingRoster © 2026 • Nền tảng điểm danh và tự động đối soát thu phí bằng VietQR
      </footer>
    </div>
  );
}
