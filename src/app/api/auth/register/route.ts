import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { extractSupabaseTokenFromCookies } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

async function resolveVerifiedAuthUser(request: Request) {
  const supabase = createServerSupabaseClient();

  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        return data.user;
      }
    }
  }

  const cookieToken = extractSupabaseTokenFromCookies(request);
  if (cookieToken) {
    const { data, error } = await supabase.auth.getUser(cookieToken);
    if (!error && data?.user) {
      return data.user;
    }
  }

  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) {
    return data.user;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const authUser = await resolveVerifiedAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isEmailVerified = Boolean(
      authUser.email_confirmed_at ||
        authUser.confirmed_at ||
        authUser.app_metadata?.provider === 'google'
    );
    if (!isEmailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address with the OTP code before creating an account.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { fullName, agencyName, companyName, phone, city, state, licenseNumber } = body;

    const normalizedEmail = (authUser.email || body.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const resolvedUserId = authUser.id;
    const rawName = (fullName || authUser.user_metadata?.full_name || '').trim();
    const cleanFullName =
      rawName && rawName.toLowerCase() !== 'jordan michael'
        ? rawName
        : normalizedEmail === 'vigilamc@gmail.com'
          ? 'Shaizan'
          : normalizedEmail.split('@')[0];

    const cleanPhone = (phone || authUser.user_metadata?.phone || '').trim();
    const cleanOrgName = (
      agencyName ||
      companyName ||
      authUser.user_metadata?.agency_name ||
      authUser.user_metadata?.company_name ||
      ''
    ).trim();

    // Check if user profile already exists
    let profile = await (db as any).userProfile.findUnique({
      where: { id: resolvedUserId },
      include: { organization: true },
    });

    if (!profile && normalizedEmail) {
      profile = await (db as any).userProfile.findUnique({
        where: { email: normalizedEmail },
        include: { organization: true },
      });
    }

    if (profile) {
      if (profile.status === 'INACTIVE') {
        return NextResponse.json(
          { error: 'Your account has been deactivated. Please contact your agency administrator.' },
          { status: 403 }
        );
      }

      const updateData: Record<string, any> = {};
      if (profile.fullName?.trim().toLowerCase() === 'jordan michael') {
        updateData.fullName = cleanFullName;
      } else if (!profile.fullName && cleanFullName) {
        updateData.fullName = cleanFullName;
      }
      if (!profile.phone && cleanPhone) {
        updateData.phone = cleanPhone;
      }

      let organization = profile.organization;
      if (!profile.organizationId && cleanOrgName) {
        organization = await (db as any).organization.create({
          data: {
            name: cleanOrgName,
            phone: cleanPhone,
            email: normalizedEmail,
            city: (city || '').trim(),
            state: (state || '').trim(),
            licenseNumber: (licenseNumber || '').trim(),
          },
        });
        updateData.organizationId = organization.id;
      }

      if (Object.keys(updateData).length > 0) {
        profile = await (db as any).userProfile.update({
          where: { id: profile.id },
          data: updateData,
          include: { organization: true },
        });
        organization = profile.organization;
      }

      return NextResponse.json({
        success: true,
        alreadyExists: true,
        profile,
        organization,
        userId: profile.id,
      });
    }

    // 1. Create a dedicated Organization for this verified user / agency
    const orgName = cleanOrgName || `${cleanFullName || 'My'}'s Fire Safety AMC`;
    const org = await (db as any).organization.create({
      data: {
        name: orgName,
        phone: cleanPhone,
        email: normalizedEmail,
        city: (city || '').trim(),
        state: (state || '').trim(),
        licenseNumber: (licenseNumber || '').trim(),
      },
    });

    // 2. Create the UserProfile linked to the Organization
    profile = await (db as any).userProfile.create({
      data: {
        id: resolvedUserId,
        email: normalizedEmail,
        fullName: cleanFullName,
        phone: cleanPhone,
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
        details: `Organization "${org.name}" registered by verified email ${profile.email}`,
      },
    });

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      profile,
      organization: org,
      userId: resolvedUserId,
    });
  } catch (error: any) {
    console.error('Error in user registration synchronization:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
