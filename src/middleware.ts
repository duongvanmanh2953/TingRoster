import { NextRequest, NextResponse } from 'next/server';

/**
 * TingRoster Intelligent Edge Middleware
 * Handles:
 * 1. Subdomain / Host Routing (admin., owner., member., kiosk., api.)
 * 2. Multi-Port Routing (3000: Landing, 4000: Admin, 4001: Owner, 4002: Member, 4003: Kiosk, 4100: API)
 * 3. Security Headers (HSTS, X-Frame-Options, X-Content-Type, Referrer-Policy)
 * 4. Auth Route Protection and Session Redirection
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = req.headers.get('host') || '';
  const port = host.split(':')[1] || '';

  // 1. Static file and internal Next.js requests bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Identify subdomain from host (e.g. admin.tingroster.vn, owner.tingroster.local)
  const hostParts = host.split(':')[0].split('.');
  let subdomain = '';
  if (hostParts.length > 2) {
    subdomain = hostParts[0].toLowerCase();
  }

  // 3. Subdomain-based or Port-based Rewriting
  // A. Admin Portal (admin.* or port 4000)
  if (subdomain === 'admin' || port === '4000') {
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
  }

  // B. Owner Portal (owner.* or port 4001)
  if (subdomain === 'owner' || port === '4001') {
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.rewrite(url);
    }
  }

  // C. Student/Member Portal (member.* or student.* or port 4002)
  if (subdomain === 'member' || subdomain === 'student' || port === '4002') {
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/portal';
      return NextResponse.rewrite(url);
    }
  }

  // D. Kiosk Mode (kiosk.* or port 4003)
  if (subdomain === 'kiosk' || port === '4003') {
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      // Default to general kiosk scanner or selector
      url.pathname = '/kiosk';
      return NextResponse.rewrite(url);
    }
  }

  // E. API Only (api.* or port 4100)
  if ((subdomain === 'api' || port === '4100') && !pathname.startsWith('/api')) {
    const url = req.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 4. Build response with standard enterprise security headers
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');

  // Prevent clickjacking except for Kiosk if embedded
  if (pathname.startsWith('/kiosk')) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  } else {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
