import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  QrCode,
  Users2,
  Tv,
  ShieldCheck,
  Building2,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Header */}
      <header className="border-b border-[#1B2333] bg-[#0B0F19]/90 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg">
              ⚡
            </div>
            <div>
              <span className="font-black text-lg text-white tracking-tight">TingRoster</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                VietQR SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#080C14] text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
            >
              <span>Vào ứng dụng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8 flex-1 flex flex-col justify-center relative">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-400 mx-auto shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ting-badge-pulse" />
          <span>Giải pháp đối soát học phí & hội phí tự động 100% tại Việt Nam</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Điểm danh một chạm. <br />
          <span className="text-emerald-400">
            Thu phí tự động.
          </span> <br />
          Đối soát khỏi lo.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Tạm biệt những buổi tối mỏi mắt dò từng dòng sao kê ngân hàng. TingRoster tự động sinh mã VietQR theo học viên và gạch nợ ngay khi tiền về tài khoản.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#080C14] font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Khám phá bảng điều hành</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111726] hover:bg-[#182136] border border-[#1E283D] text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Dùng thử tài khoản mẫu</span>
          </Link>
        </div>

        {/* Feature Grid Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12 text-left">
          <div className="ting-card p-4">
            <CalendarCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Điểm danh thông minh</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ Có mặt, Vắng có phép, Vắng trừ phí, Học bù linh hoạt</p>
          </div>

          <div className="ting-card p-4">
            <QrCode className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-xs font-bold text-white">VietQR Động Chuẩn Napas</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sinh mã QR có sẵn số tiền & mã thanh toán TR... chống gõ nhầm</p>
          </div>

          <div className="ting-card p-4">
            <Zap className="w-5 h-5 text-purple-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Tự động Ting! & Gạch nợ</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Kết nối trực tiếp SePay, Casso, MB Bank với độ trễ dưới 1 giây</p>
          </div>

          <div className="ting-card p-4">
            <Tv className="w-5 h-5 text-cyan-400 mb-2" />
            <h3 className="text-xs font-bold text-white">Kiosk Tự Check-in</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Màn hình cảm ứng đặt tại cửa lớp hoặc sân thể thao không cần nhân viên</p>
          </div>
        </div>

      </section>

      {/* Target Audiences */}
      <section className="py-16 border-t border-[#1B2333] bg-[#0A0E1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-bold text-white">Được thiết kế chuyên biệt cho 3 nhóm khách hàng</h2>
            <p className="text-xs text-slate-400">Tối ưu quy trình vận hành thu chi thực tế tại Việt Nam</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ting-card p-6 space-y-3">
              <span className="text-2xl">👩‍🏫</span>
              <h3 className="text-base font-bold text-white">Giáo viên & Trung tâm dạy thêm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tự động tính học phí theo số buổi học thực tế của học sinh. Phụ huynh nhận link cổng tra cứu xem lịch sử điểm danh và quét VietQR thanh toán 1 chạm.
              </p>
            </div>

            <div className="ting-card p-6 space-y-3">
              <span className="text-2xl">🏸</span>
              <h3 className="text-base font-bold text-white">Chủ CLB Thể thao (Pickleball, Cầu lông)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quản lý thành viên tham gia theo ca, theo tháng. Thành viên check-in tại sân và thanh toán tiền quỹ, tiền nước qua VietQR tự động.
              </p>
            </div>

            <div className="ting-card p-6 space-y-3">
              <span className="text-2xl">🏢</span>
              <h3 className="text-base font-bold text-white">Chủ Phòng trọ & Căn hộ dịch vụ</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quản lý tiền phòng, điện, nước hàng tháng. Khách thuê chuyển khoản theo mã phòng, hệ thống tự động gạch nợ không sợ nhầm phòng này sang phòng khác.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#1B2333] text-center text-xs text-slate-400">
        <p>© 2026 TingRoster — Nền tảng quản lý điểm danh, học phí & đối soát VietQR tự động.</p>
      </footer>

    </div>
  );
}
