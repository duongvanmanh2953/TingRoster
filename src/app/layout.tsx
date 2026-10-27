import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import MuiThemeRegistry from '@/components/theme/MuiThemeRegistry';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

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
    <html lang="vi" className={beVietnamPro.variable}>
      <body className={`${beVietnamPro.className} antialiased min-h-screen text-[#101828] bg-[#F5F7FB] selection:bg-[#2538D9] selection:text-white`}>
        <MuiThemeRegistry>
          {children}
        </MuiThemeRegistry>
      </body>
    </html>
  );
}
