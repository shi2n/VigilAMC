import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !secretKey) {
    throw new Error('Supabase admin credentials not configured in environment variables');
  }
  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId: explicitUserId, email, password, fullName, agencyName, companyName, phone, city, state, licenseNumber } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    let resolvedUserId = explicitUserId;

    // If password provided and no userId yet, create/confirm user via Supabase Admin API
    if (password && !resolvedUserId) {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || '',
          agency_name: agencyName || companyName || '',
          phone: phone || '',
        },
      });

      if (createError) {
        // If user already exists in auth, find their ID
        if (createError.message?.toLowerCase().includes('already')) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingAuth = listData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
          if (existingAuth) {
            resolvedUserId = existingAuth.id;
          } else {
            return NextResponse.json({ error: createError.message }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: createError.message }, { status: 400 });
        }
      } else if (createData?.user) {
        resolvedUserId = createData.user.id;
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'User ID could not be resolved.' }, { status: 400 });
    }

    // Check if user profile already exists
    let profile = await (db as any).userProfile.findUnique({
      where: { id: resolvedUserId },
      include: { organization: true },
    });

    if (profile) {
      if (profile.status === 'INACTIVE') {
        return NextResponse.json(
          { error: 'Your account has been deactivated. Please contact your agency administrator.' },
          { status: 403 }
        );
      }
      return NextResponse.json({ success: true, profile, organization: profile.organization });
    }

    // 1. Create a dedicated Organization for this user / agency
    const orgName = (agencyName || companyName || `${fullName || 'My'}'s Fire Safety AMC`).trim();
    const org = await (db as any).organization.create({
      data: {
        name: orgName,
        phone: phone || '',
        email: normalizedEmail,
        city: city || '',
        state: state || '',
        licenseNumber: licenseNumber || '',
      },
    });

    // 2. Create the UserProfile linked to the Organization
    profile = await (db as any).userProfile.create({
      data: {
        id: resolvedUserId,
        email: normalizedEmail,
        fullName: fullName || normalizedEmail.split('@')[0],
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

    return NextResponse.json({ success: true, profile, organization: org, userId: resolvedUserId });
  } catch (error: any) {
    console.error('Error in user registration synchronization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
