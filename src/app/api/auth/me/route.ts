import { NextResponse } from 'next/server';
import { getCurrentUser, isPlatformOwner } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null, profile: null, organization: null, isPlatformOwner: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      organization: auth.organization,
      isPlatformOwner: isPlatformOwner(auth),
    });
  } catch (error: any) {
    console.error('Error fetching current user profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.user || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { preferredLanguage } = body;

    const updateData: any = {};
    if (preferredLanguage && typeof preferredLanguage === 'string') {
      updateData.preferredLanguage = preferredLanguage.trim().toLowerCase();
    }

    if (Object.keys(updateData).length > 0) {
      const updatedProfile = await (db as any).userProfile.update({
        where: { id: auth.profile.id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        profile: updatedProfile,
      });
    }

    return NextResponse.json({ success: true, profile: auth.profile });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
