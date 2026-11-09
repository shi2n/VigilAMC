import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Hard-exempted paths on the vercel.app host:
 * The live Android app origin (package com.vigilamc) hosts sessions, offline outbox,
 * and service worker caches on https://vigilamc.vercel.app.
 * These paths must NEVER redirect on vercel.app.
 */
function isExemptPath(pathname: string): boolean {
  // 1. Android field app & technician flow
  if (pathname === '/technician' || pathname.startsWith('/technician/')) {
    return true;
  }

  // 2. All API routes (app backend, auth, technician endpoints)
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return true;
  }

  // 3. Next.js internal paths & core PWA / service worker assets
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/icon.svg' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return true;
  }

  // 4. Static assets (images, fonts, stylesheets, scripts, icons, manifests)
  if (/\.(png|jpg|jpeg|webp|svg|ico|css|js|woff|woff2|txt|xml|json)$/i.test(pathname)) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase();
  const hostname = host.split(':')[0];
  const { pathname, search } = request.nextUrl;

  // 1. Localhost / local IP pass-through for development and testing
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
    return NextResponse.next();
  }

  // 2. On vercel.app host: protect Android app origin + PWA + APIs.
  //    Redirect ONLY non-exempt marketing pages to apex: https://vigilamc.com<same-path>
  if (hostname.endsWith('vercel.app')) {
    if (isExemptPath(pathname)) {
      return NextResponse.next();
    }

    const destination = new URL(`https://vigilamc.com${pathname}${search}`);
    const response = NextResponse.redirect(destination, 308);
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return response;
  }

  // 3. www.vigilamc.com -> canonical apex vigilamc.com (single 308 hop)
  if (hostname === 'www.vigilamc.com') {
    const destination = new URL(`https://vigilamc.com${pathname}${search}`);
    const response = NextResponse.redirect(destination, 308);
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return response;
  }

  // 4. Apex vigilamc.com serves directly (200) without any redirect
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except _next/static, _next/image, and favicon.ico.
     * Hard-exempted files like /sw.js, /manifest.json, /api/*, /technician/*
     * are matched and explicitly preserved by isExemptPath.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
