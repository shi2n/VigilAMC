import { NextResponse } from 'next/server';
import { TECH_SESSION_COOKIE } from '@/lib/techSession';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut().catch(() => {});

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set(TECH_SESSION_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error('Error logging out:', error);
    const response = NextResponse.json({ success: true });
    response.cookies.set(TECH_SESSION_COOKIE, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}
