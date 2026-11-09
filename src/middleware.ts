import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase();

  // Allow localhost / 127.0.0.1 for local development
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // Redirect vigilamc.vercel.app and apex vigilamc.com to canonical https://www.vigilamc.com
  if (host.includes('vigilamc.vercel.app') || host === 'vigilamc.com') {
    const { pathname, search } = request.nextUrl;
    const destination = new URL(`https://www.vigilamc.com${pathname}${search}`);
    return NextResponse.redirect(destination, 308);
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
