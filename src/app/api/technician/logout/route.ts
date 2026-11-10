import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor, TECH_SESSION_COOKIE } from '@/lib/techSession';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const actor = await getAuthenticatedActor(request).catch(() => null);
    if (actor?.user?.id) {
      // Invalidate device tokens on technician logout
      await (db as any).deviceToken.deleteMany({
        where: { technicianId: actor.user.id },
      }).catch(() => null);
    }

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
