import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, fullName, companyName, phone, city, state, licenseNumber } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    // Check if user profile already exists
    let profile = await (db as any).userProfile.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (profile) {
      return NextResponse.json({ success: true, profile, organization: profile.organization });
    }

    // 1. Create a dedicated Organization for this user / agency
    const orgName = (companyName || `${fullName || 'My'}'s Fire Safety AMC`).trim();
    const org = await (db as any).organization.create({
      data: {
        name: orgName,
        phone: phone || '',
        email: email || '',
        city: city || 'New Delhi',
        state: state || 'Delhi',
        licenseNumber: licenseNumber || '',
      },
    });

    // 2. Create the UserProfile linked to the Organization
    profile = await (db as any).userProfile.create({
      data: {
        id: userId,
        email: email.trim().toLowerCase(),
        fullName: fullName || email.split('@')[0],
        phone: phone || '',
        role: 'ORG_ADMIN',
        organizationId: org.id,
      },
      include: {
        organization: true,
      },
    });

    // 3. Log activity
    await (db as any).activityLog.create({
      data: {
        organizationId: org.id,
        userId: profile.id,
        userEmail: profile.email,
        action: 'ORGANIZATION_CREATED',
        entityType: 'Organization',
        entityId: org.id,
        details: `Organization "${org.name}" registered by ${profile.email}`,
      },
    });

    return NextResponse.json({ success: true, profile, organization: org });
  } catch (error: any) {
    console.error('Error in user registration synchronization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
