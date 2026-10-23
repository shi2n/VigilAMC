import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CRITICAL: Never redirect unauthenticated visits to /technician over to /!
  // /technician renders its own clean full-screen In-App Technician Login Screen.
  return NextResponse.next();
}

export const config = {
  matcher: ['/technician/:path*', '/dashboard/:path*', '/founder/:path*', '/report/:path*'],
};
