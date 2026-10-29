'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  ShieldCheck,
  Scale,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Check,
  Printer,
  Search,
  HelpCircle,
  ExternalLink,
  Lock,
  Receipt,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface PolicyDoc {
  id: string;
  policyType: string;
  title: string;
  version: string;
  summary: string;
  publishedAt: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

const DEFAULT_POLICIES: PolicyDoc[] = [
  {
    id: 'doc-terms',
    policyType: 'TERMS',
    title: 'Điều Khoản Dịch Vụ SaaS Nền Tảng TingRoster',
    version: '2.4',
    publishedAt: '2026-01-01',
    summary: 'Quy định quyền hạn, nghĩa vụ của Người khởi tạo Workspace và Thành viên tham gia nhóm.',
    sections: [
      {
        title: 'Điều 1. Định nghĩa và Phạm vi Áp dụng',
        content: `1.1. "TingRoster" là nền tảng phần mềm dịch vụ (SaaS) cung cấp các công cụ: quản lý không gian/nhóm/lớp học, điểm danh tại chỗ & kiosk, lập hóa đơn, tạo mã VietQR động và tự động đối soát thông báo biến động số dư ngân hàng qua kết nối Napas 24/7.
1.2. "Chủ Workspace" (Quản trị viên) là cá nhân hoặc tổ chức đăng ký tài khoản TingRoster để quản lý một hoặc nhiều nhóm (lớp học dạy thêm, câu lạc bộ thể thao, nhà trọ, câu lạc bộ gym/pickleball).
1.3. "Thành viên" (Người trả phí/Học viên) là người tham gia không gian, nhận hóa đơn thông báo và quét mã VietQR để hoàn tất nghĩa vụ thanh toán trực tiếp tới tài khoản của Chủ Workspace.`
      },
      {
        title: 'Điều 2. Nguyên tắc Công nghệ và Cơ chế Zero-Custody',
        content: `2.1. TingRoster vận hành theo mô hình "Zero-Custody" (Không trung gian giữ tiền). Nền tảng hoàn toàn KHÔNG thu hộ, giữ hộ, phong tỏa hoặc luân chuyển tiền học phí / tiền phòng của người dùng.
2.2. Khi Thành viên quét mã VietQR, dòng tiền được định tuyến trực tiếp từ ứng dụng ngân hàng của người chuyển đến tài khoản ngân hàng thụ hưởng chính chủ của Chủ Workspace.
2.3. TingRoster chỉ đóng vai trò phân tích mã đối soát định danh (Payment Code) trong nội dung chuyển khoản để tự động cập nhật trạng thái "Đã đóng đủ" trên phần mềm.`
      },
      {
        title: 'Điều 3. Trách nhiệm và Nghĩa vụ của Chủ Workspace',
        content: `3.1. Chủ Workspace chịu trách nhiệm bảo mật thông tin đăng nhập, API key kết nối ngân hàng và số điện thoại quản trị.
3.2. Cung cấp thông tin số tài khoản ngân hàng chính xác. TingRoster không chịu trách nhiệm trong trường hợp Chủ Workspace nhập sai số tài khoản thụ hưởng.
3.3. Đảm bảo tính hợp pháp của các hoạt động thu phí được tổ chức trong không gian quản lý.`
      },
      {
        title: 'Điều 4. Tính Ổn định và Giới hạn Trách nhiệm',
        content: `4.1. TingRoster cam kết nỗ lực tối đa đảm bảo hệ thống vận hành liên tục 99.8% thời gian trong tháng (SLA).
4.2. TingRoster được miễn trừ trách nhiệm trong các trường hợp sự cố ngoài tầm kiểm soát: lỗi bảo trì hệ thống chuyển tiền nhanh Napas 24/7, sự cố hạ tầng của nhà mạng viễn thông hoặc sự cố máy chủ ngân hàng thương mại.`
      }
    ]
  },
  {
    id: 'doc-privacy',
    policyType: 'PRIVACY',
    title: 'Chính Sách Bảo Vệ Dữ Liệu Cá Nhân (Nghị định 13/2023/NĐ-CP)',
    version: '2.1',
    publishedAt: '2026-01-01',
    summary: 'Cam kết minh bạch về thu thập, xử lý, bảo mật và quyền xóa dữ liệu cá nhân của người dùng.',
    sections: [
      {
        title: 'Điều 1. Các Loại Dữ Liệu Được Thu Thập',
        content: `1.1. Dữ liệu cơ bản: Họ tên, số điện thoại, địa chỉ email, ảnh đại diện (nếu tự tải lên).
1.2. Dữ liệu vận hành: Lịch sử điểm danh (ngày, giờ, trạng thái có mặt/vắng mặt), mã định danh thành viên.
1.3. Dữ liệu giao dịch ngân hàng: Số tiền, thời gian chuyển khoản, mã tham chiếu ngân hàng, mã thanh toán đối soát. TingRoster KHÔNG thu thập và KHÔNG lưu trữ mật khẩu ngân hàng, mã PIN hoặc mã OTP của người dùng.`
      },
      {
        title: 'Điều 2. Mục Đích Xử Lý và Sử Dụng Dữ Liệu',
        content: `2.1. Xác thực danh tính người dùng và cấp quyền truy cập không gian làm việc.
2.2. Tạo mã thanh toán VietQR động cá nhân hóa và tự động đối soát giao dịch chuyển khoản.
2.3. Gửi thông báo tự động (nhắc lịch học, xác nhận điểm danh, hóa đơn học phí) qua Zalo ZNS hoặc thông báo hệ thống theo ủy quyền của Chủ Workspace.`
      },
      {
        title: 'Điều 3. Biện Pháp Che Chắn và Bảo Mật Thông Tin',
        content: `3.1. Cổng thông tin công khai (Public Portal) chỉ có thể truy cập qua URL chứa mã thông báo ngẫu nhiên bảo mật (publicToken) có độ dài an toàn.
3.2. Trên cổng tra cứu công khai, số điện thoại và thông tin tài chính cá nhân được che giấu tự động (masking dạng 0987***321), tuyệt đối không để lộ dữ liệu cho người ngoài hoặc học viên khác.
3.3. Dữ liệu giao dịch được mã hóa tại rest (AES-256) và trong quá trình truyền tải (TLS 1.3).`
      },
      {
        title: 'Điều 4. Quyền của Chủ thể Dữ liệu',
        content: `4.1. Người dùng có quyền tra cứu, yêu cầu chỉnh sửa thông tin cá nhân hoặc xuất lịch sử điểm danh của mình.
4.2. Quyền yêu cầu xóa bỏ dữ liệu: Thành viên có thể gửi yêu cầu xóa dữ liệu cá nhân qua Chủ Workspace hoặc qua email phaply@tingroster.vn. TingRoster sẽ tiến hành xóa hoặc ẩn danh hóa trong vòng 72 giờ làm việc.`
      }
    ]
  },
  {
    id: 'doc-payment',
    policyType: 'PAYMENT',
    title: 'Quy Chế Thanh Toán VietQR & Đối Soát Giao Dịch',
    version: '2.0',
    publishedAt: '2026-01-01',
    summary: 'Quy trình tạo mã VietQR động, cơ chế Napas 24/7 và xử lý sai sót số tiền hoặc nội dung.',
    sections: [
      {
        title: 'Điều 1. Cấu Trúc Mã VietQR và Nội Dung Chuyển Khoản',
        content: `1.1. Mã VietQR do TingRoster khởi tạo tuân thủ theo Quy chuẩn Kỹ thuật VietQR của Napas và Ngân hàng Nhà nước Việt Nam.
1.2. Mỗi mã thanh toán chứa mã đối soát duy nhất (Payment Code, ví dụ TR2849). Người nộp tiền không cần nhập tay số tiền hoặc số tài khoản, chỉ cần quét mã bằng ứng dụng ngân hàng.`
      },
      {
        title: 'Điều 2. Quy Trình Đối Soát Tự Động',
        content: `2.1. Khi tiền vào tài khoản ngân hàng của Chủ Workspace, hệ thống webhook của ngân hàng gửi tín hiệu đối soát an toàn đến máy chủ TingRoster.
2.2. Cơ chế Idempotency: Hệ thống áp dụng khóa giao dịch nguyên tử độc nhất dựa trên provider và providerTransactionId, đảm bảo KHÔNG bao giờ ghi nhận cộng trùng tiền dù webhook gửi lặp nhiều lần.`
      },
      {
        title: 'Điều 3. Xử Lý Các Trường Hợp Bất Thường',
        content: `3.1. Chuyển thiếu tiền: Hệ thống tự động chuyển trạng thái hóa đơn sang "Đóng thiếu" (badge-partial) và cập nhật số dư còn nợ.
3.2. Chuyển thừa tiền: Hệ thống chuyển trạng thái sang "Đóng thừa" (badge-overpaid) và ghi nhận số tiền dôi dư vào quỹ dự phòng của thành viên.
3.3. Chuyển sai cú pháp hoặc quên ghi mã: Giao dịch được đưa vào danh mục "Chờ khớp thủ công" (Unmatched Transactions) trên bảng điều khiển để Quản trị viên duyệt bằng 1 cú nhấp chuột.`
      }
    ]
  },
  {
    id: 'doc-refund',
    policyType: 'REFUND',
    title: 'Chính Sách Hủy Gói, Gia Hạn & Hoàn Phí',
    version: '1.9',
    publishedAt: '2026-01-01',
    summary: 'Phân định rõ ràng giữa cước phần mềm TingRoster và học phí cơ sở thu trực tiếp từ học viên.',
    sections: [
      {
        title: 'Điều 1. Phân Định Bản Chất Giao Dịch Tài Chính',
        content: `1.1. Cần phân biệt rõ rệt hai loại dòng tiền riêng biệt:
a) Cước phí bản quyền dịch vụ phần mềm TingRoster: Khoản tiền do Chủ Workspace thanh toán cho TingRoster (gồm phí duy trì phần mềm hoặc nạp ví đối soát giao dịch 500đ/lần).
b) Khoản thu nghiệp vụ của Cơ sở: Học phí, tiền sân bóng, tiền thuê phòng trọ do Thành viên thanh toán trực tiếp vào tài khoản ngân hàng của Chủ Workspace.`
      },
      {
        title: 'Điều 2. Chính Sách Hoàn Phí Dịch Vụ SaaS TingRoster',
        content: `2.1. TingRoster áp dụng chính sách hoàn trả 100% cước phí phần mềm trong vòng 07 ngày đầu tiên kể từ khi nâng cấp gói PRO nếu khách hàng không hài lòng với tính năng.
2.2. Số dư trong Ví đối soát tự động: Khách hàng có quyền yêu cầu hoàn trả số dư ví chưa sử dụng bất cứ lúc nào qua kênh Chăm sóc khách hàng. Thời gian xử lý giải ngân từ 01 đến 03 ngày làm việc.`
      },
      {
        title: 'Điều 3. Chính Sách Hoàn Trả Học Phí / Tiền Thu Của Cơ Sở',
        content: `3.1. Vì TingRoster áp dụng cơ chế Zero-Custody (tiền không qua TingRoster), việc hoàn trả học phí, tiền cọc hoặc tiền thuê sân hoàn toàn thuộc thẩm quyền và quy chế nội bộ của Chủ Workspace.
3.2. TingRoster không đóng vai trò tài phán giải quyết tranh chấp hoàn trả học phí giữa Chủ Workspace và Thành viên.
3.3. Tuy nhiên, TingRoster cam kết lưu trữ nhật ký đối soát chi tiết (Audit Trail) để cung cấp bằng chứng giao dịch khách quan khi hai bên có nhu cầu đối chiếu.`
      }
    ]
  },
  {
    id: 'doc-comm',
    policyType: 'COMMUNICATION',
    title: 'Quy Chế Kênh Trao Đổi, Điểm Danh Kiosk & Thông Báo Tự Động',
    version: '1.5',
    publishedAt: '2026-01-01',
    summary: 'Tiêu chuẩn văn minh cho kênh thảo luận, điểm danh thiết bị kiosk và tần suất gửi thông báo.',
    sections: [
      {
        title: 'Điều 1. Chuẩn Mực Ứng Xử Kênh Trao Đổi Nội Bộ',
        content: `1.1. Kênh trao đổi trong từng nhóm chỉ phục vụ mục đích thông báo lịch học, lịch tập, thảo luận chuyên môn hoặc thông báo hành chính.
1.2. Nghiêm cấm phát tán nội dung quảng cáo rác, tin tức sai sự thật, xúc phạm danh dự hoặc nội dung vi phạm thuần phong mỹ tục Việt Nam.`
      },
      {
        title: 'Điều 2. Quy Chuẩn Vận Hành Thiết Bị Kiosk Check-in',
        content: `2.1. Màn hình Kiosk đặt tại địa điểm chỉ phục vụ thao tác quét mã QR hoặc nhập mã cá nhân để xác thực có mặt.
2.2. Kiosk không hiển thị thông tin tài chính công nợ, số dư cá nhân hoặc lịch sử điểm danh của học viên khác.
2.3. Màn hình Kiosk được bảo vệ bằng mã PIN quản trị (Staff PIN) nhằm ngăn ngừa tình trạng học viên vô tình thoát ứng dụng hoặc điều hướng sang các tính năng nhạy cảm.`
      },
      {
        title: 'Điều 3. Tần Suất Gửi Thông Báo Nhắc Phí Tự Động',
        content: `3.1. Các thông báo nhắc nợ tự động chỉ được gửi trong khung giờ quy định từ 08:00 đến 21:00 hàng ngày, tuyệt đối không quấy rầy phụ huynh/học viên vào ban đêm.
3.2. Thành viên có quyền tùy chọn tắt nhận tin nhắn nhắc phí qua liên kết cấu hình trên Cổng tra cứu cá nhân.`
      }
    ]
  }
];

function LegalContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'TERMS';

  const [activeType, setActiveType] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [acceptedPolicies, setAcceptedPolicies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && DEFAULT_POLICIES.some((p) => p.policyType === tab)) {
      setActiveType(tab);
    }
  }, [searchParams]);

  const activeDoc = useMemo(() => {
    return DEFAULT_POLICIES.find((p) => p.policyType === activeType) || DEFAULT_POLICIES[0];
  }, [activeType]);

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return activeDoc.sections;
    const term = searchTerm.toLowerCase();
    return activeDoc.sections.filter(
      (sec) => sec.title.toLowerCase().includes(term) || sec.content.toLowerCase().includes(term)
    );
  }, [activeDoc, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const handleAccept = (policy: PolicyDoc) => {
    setAcceptedPolicies((prev) => ({ ...prev, [policy.id]: true }));
  };

  return (
    <div className="min-h-screen ambient-loang-bg text-[#101828] dark:text-[#F8FAFC] flex flex-col font-sans selection:bg-[#2538D9] selection:text-white">
      {/* Top Header */}
      <header className="bg-white/95 dark:bg-[#0B0F19]/95 border-b border-[#E4E7EC] dark:border-[#1E293B] sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" size="sm" showTagline={false} />
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Trung Tâm Pháp Lý & Chính Sách
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In văn bản</span>
            </button>

            <Link
              href="/"
              className="text-xs font-medium text-[#2538D9] dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner card */}
        <div className="bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2538D9] dark:text-blue-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#101828] dark:text-white">
                  Quy Chế Pháp Lý, Bảo Mật & Bảo Vệ Quyền Lợi
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#475467] dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
                TingRoster công khai minh bạch tất cả các điều khoản dịch vụ, cam kết bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP) và chính sách phân định rạch ròi giữa cước phần mềm SaaS và học phí thu trực tiếp qua VietQR.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm điều khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2538D9]"
              />
            </div>
          </div>

          {/* Policy navigation tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {DEFAULT_POLICIES.map((p) => {
              const isActive = activeType === p.policyType;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveType(p.policyType);
                    setSearchTerm('');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#2538D9] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{p.title.split('(')[0].trim()}</span>
                  <span className="text-[10px] opacity-75 font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                    v{p.version}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Layout: 2 Columns (Table of Contents on left, Full Document on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Navigation: Table of Contents & Zero-Custody Badge */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] rounded-2xl p-4 shadow-xs sticky top-24">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2538D9]" />
                <span>Mục Lục Văn Bản</span>
              </h2>
              <nav className="space-y-1 text-xs">
                {activeDoc.sections.map((sec, idx) => (
                  <a
                    key={idx}
                    href={`#section-${idx}`}
                    className="block px-2.5 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors line-clamp-1 font-medium"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[#2538D9] dark:text-blue-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cơ Chế Zero-Custody</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    TingRoster không trung gian giữ tiền. 100% học phí chuyển thẳng vào tài khoản ngân hàng chính chủ của cơ sở.
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 px-1">
                  <p>Hỗ trợ pháp lý & khiếu nại:</p>
                  <p className="font-mono text-slate-700 dark:text-slate-300 font-medium">hotline@tingroster.vn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Document Body */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#111726] border border-[#E4E7EC] dark:border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs printable-document">
              {/* Document Header */}
              <div className="border-b border-[#E4E7EC] dark:border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#101828] dark:text-white">
                    {activeDoc.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                    <span>Phiên bản: <strong className="text-slate-700 dark:text-slate-300">{activeDoc.version}</strong></span>
                    <span>•</span>
                    <span>Hiệu lực từ: {new Date(activeDoc.publishedAt).toLocaleDateString('vi-VN')}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Đang áp dụng</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAccept(activeDoc)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    acceptedPolicies[activeDoc.id]
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-[#2538D9] text-white hover:bg-[#1E2DB8]'
                  }`}
                >
                  {acceptedPolicies[activeDoc.id] ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Đã ghi nhận chấp thuận</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận đã đọc & hiểu</span>
                    </>
                  )}
                </button>
              </div>

              {/* Summary callout */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Tóm tắt nội dung chính:</span>
                  <span>{activeDoc.summary}</span>
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-6">
                {filteredSections.map((sec, idx) => (
                  <div key={idx} id={`section-${idx}`} className="space-y-2 pt-2 scroll-mt-24">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                      {sec.title}
                    </h3>
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line space-y-2">
                      {sec.content}
                    </div>
                  </div>
                ))}

                {filteredSections.length === 0 && (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Không tìm thấy điều khoản nào khớp với từ khóa &ldquo;{searchTerm}&rdquo;.
                  </div>
                )}
              </div>

              {/* Bottom footer note */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
                <p>© {new Date().getFullYear()} TingRoster Platform. Mọi quyền được bảo lưu.</p>
                <p>Địa chỉ liên hệ giải quyết khiếu nại và bảo vệ dữ liệu cá nhân: <strong>hotline@tingroster.vn</strong></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LegalCenterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Đang tải Trung tâm Pháp lý...</div>}>
      <LegalContent />
    </Suspense>
  );
}
