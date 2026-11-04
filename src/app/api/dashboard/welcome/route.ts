import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = auth.profile;
    const organization = auth.organization;
    const isTechnician = profile.role === 'TECHNICIAN';
    const showWelcome = !isTechnician && (profile.welcomeSeenAt === null || profile.welcomeSeenAt === undefined);

    return NextResponse.json({
      authenticated: true,
      showWelcome,
      welcomeSeenAt: profile.welcomeSeenAt ?? null,
      fullName: profile.fullName ?? null,
      agencyName: organization?.name ?? null,
      preferredLanguage: profile.preferredLanguage || 'en',
    });
  } catch (error: any) {
    console.error('Error in GET /api/dashboard/welcome:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
