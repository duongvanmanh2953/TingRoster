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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tingroster.vn';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'TingRoster - Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.',
    template: '%s | TingRoster',
  },
  description: 'Nền tảng quản lý điểm danh và tự động đối soát giao dịch ngân hàng VietQR Napas 24/7 hàng đầu tại Việt Nam theo cơ chế Zero-Custody an toàn tuyệt đối.',
  keywords: [
    'TingRoster',
    'điểm danh',
    'đối soát VietQR',
    'thu học phí tự động',
    'quản lý lớp học',
    'kiosk điểm danh',
    'quản lý sân bóng',
    'quản lý pickleball',
    'quản lý phòng trọ',
    'zero-custody'
  ],
  authors: [{ name: 'TingRoster Team', url: APP_URL }],
  creator: 'TingRoster',
  publisher: 'TingRoster',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: APP_URL,
    siteName: 'TingRoster',
    title: 'TingRoster - Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.',
    description: 'Nền tảng quản lý điểm danh và tự động đối soát giao dịch ngân hàng VietQR Napas 24/7 hàng đầu tại Việt Nam.',
    images: [
      {
        url: `${APP_URL}/og-preview.png`,
        width: 1200,
        height: 630,
        alt: 'TingRoster - Nền tảng điểm danh và đối soát VietQR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TingRoster - Điểm danh một chạm. Thu phí tự động. Đối soát khỏi lo.',
    description: 'Nền tảng quản lý điểm danh và tự động đối soát giao dịch ngân hàng VietQR Napas 24/7 hàng đầu tại Việt Nam.',
    images: [`${APP_URL}/og-preview.png`],
    creator: '@tingroster',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      'name': 'TingRoster',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Web, iOS, Android',
      'offers': {
        '@type': 'Offer',
        'price': '500',
        'priceCurrency': 'VND',
        'description': '500đ / giao dịch VietQR tự động khớp'
      },
      'description': 'Nền tảng quản lý điểm danh, thu học phí và tự động đối soát giao dịch ngân hàng VietQR Napas 24/7 theo mô hình Zero-Custody.',
      'url': APP_URL,
    },
    {
      '@type': 'Organization',
      'name': 'TingRoster',
      'url': APP_URL,
      'logo': `${APP_URL}/favicon.png`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer support',
        'email': 'hotline@tingroster.vn'
      }
    }
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
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
