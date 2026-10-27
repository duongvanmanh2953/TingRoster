import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import MuiThemeRegistry from '@/components/theme/MuiThemeRegistry';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TingRoster — Điểm danh một chạm • Thu phí tự động • Đối soát khỏi lo',
  description: 'Nền tảng quản lý điểm danh và tự động đối soát giao dịch ngân hàng VietQR hàng đầu tại Việt Nam.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${beVietnamPro.className} font-sans antialiased min-h-screen text-[#101828] bg-[#F5F7FB] dark:bg-[#0B0F19] dark:text-[#F8FAFC] selection:bg-[#2538D9] selection:text-white`}>
        <MuiThemeRegistry>
          {children}
        </MuiThemeRegistry>
      </body>
    </html>
  );
}
