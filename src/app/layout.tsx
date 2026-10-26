import type { Metadata } from 'next';
import './globals.css';
import MuiThemeRegistry from '@/components/theme/MuiThemeRegistry';

export const metadata: Metadata = {
  title: 'TingRoster — Quản lý điểm danh, học phí & Đối soát VietQR tự động',
  description: 'Nền tảng điểm danh một chạm và tự động đối soát ngân hàng VietQR cho giáo viên dạy thêm, CLB thể thao và căn hộ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="antialiased min-h-screen text-slate-100 bg-[#080C14] selection:bg-emerald-500 selection:text-white">
        <MuiThemeRegistry>
          {children}
        </MuiThemeRegistry>
      </body>
    </html>
  );
}
