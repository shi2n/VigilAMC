import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: auth.profile.id,
        fullName: auth.profile.fullName || 'Field Technician',
        email: auth.profile.email,
        phone: auth.profile.phone,
        employeeId: auth.profile.employeeId,
        preferredLanguage: auth.profile.preferredLanguage || 'en',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { preferredLanguage } = body;

    if (!preferredLanguage) {
      return NextResponse.json({ error: 'preferredLanguage is required' }, { status: 400 });
    }

    const updated = await (db as any).userProfile.update({
      where: { id: auth.profile.id },
      data: {
        preferredLanguage: String(preferredLanguage).trim(),
      },
      select: {
        id: true,
        fullName: true,
        preferredLanguage: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error: any) {
    console.error('Error updating technician preferredLanguage:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
