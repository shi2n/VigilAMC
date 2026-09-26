import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null, profile: null, organization: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      organization: auth.organization,
    });
  } catch (error: any) {
    console.error('Error fetching current user profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
