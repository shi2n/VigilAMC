import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingSeenAt = auth.profile.welcomeSeenAt;
    if (existingSeenAt) {
      return NextResponse.json({
        success: true,
        welcomeSeenAt: existingSeenAt,
      });
    }

    const now = new Date();
    const updated = await (db as any).userProfile.update({
      where: { id: auth.profile.id },
      data: { welcomeSeenAt: now },
      select: { id: true, welcomeSeenAt: true },
    });

    return NextResponse.json({
      success: true,
      welcomeSeenAt: updated.welcomeSeenAt,
    });
  } catch (error: any) {
    console.error('Error in POST /api/dashboard/welcome-seen:', error);
    return NextResponse.json({ error: error.message || 'Failed to record welcome seen' }, { status: 500 });
  }
}
