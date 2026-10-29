import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tingroster.vn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/legal',
          '/terms',
          '/privacy',
          '/refund',
          '/p/*',
        ],
        disallow: [
          '/api/*',
          '/dashboard/*',
          '/invoices/*',
          '/attendance/*',
          '/transactions/*',
          '/members/*',
          '/groups/*',
          '/settings/*',
          '/reports/*',
          '/kiosk/*',
          '/portal/*',
          '/auth/*',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
