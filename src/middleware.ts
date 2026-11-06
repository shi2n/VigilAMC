import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // CRITICAL: NEVER redirect the Android field technician app or API endpoints to another host.
  // The Android app (com.vigilamc on Google Play) loads https://vigilamc.vercel.app/technician inside its WebView.
  if (
    pathname.startsWith('/technician') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/images') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg' ||
    pathname === '/logo.jpg'
  ) {
    return NextResponse.next();
  }

  // Redirect public visits from vigilamc.vercel.app to vigilamc.com
  if (host.includes('vigilamc.vercel.app')) {
    const targetUrl = new URL(
      `${pathname}${request.nextUrl.search}`,
      'https://vigilamc.com'
    );
    return NextResponse.redirect(targetUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
