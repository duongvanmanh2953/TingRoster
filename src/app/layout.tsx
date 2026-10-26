import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TingRoster — Nền tảng điểm danh & tự động đối soát thu phí bằng VietQR',
  description: 'Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo. Giải pháp dành cho giáo viên, câu lạc bộ thể thao và chủ phòng trọ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
