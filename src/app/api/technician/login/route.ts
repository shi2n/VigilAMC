import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPin, hashPin, signTechSessionToken, TECH_SESSION_COOKIE } from '@/lib/techSession';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function cleanDigits(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawIdentifier = String(body?.identifier || '').trim();
    const rawPassword = String(body?.password || '').trim();

    if (!rawIdentifier || !rawPassword) {
      return NextResponse.json(
        { error: 'Please enter both your login identifier and PIN/password.' },
        { status: 400 }
      );
    }

    let matchedUser: any = null;

    // 1. Try exact email match
    if (rawIdentifier.includes('@')) {
      const emailLower = rawIdentifier.toLowerCase();
      matchedUser = await (db as any).userProfile.findUnique({
        where: { email: emailLower },
        include: { organization: true },
      });
    }

    // 2. Try Employee ID / Staff ID match (e.g. TECH-101)
    if (!matchedUser) {
      const upperId = rawIdentifier.toUpperCase();
      matchedUser = await (db as any).userProfile.findFirst({
        where: {
          employeeId: {
            equals: upperId,
            mode: 'insensitive',
          },
        },
        include: { organization: true },
      });
    }

    // 3. Try Mobile Number match (10+ digits)
    if (!matchedUser) {
      const digits = cleanDigits(rawIdentifier);
      if (digits.length >= 10) {
        const last10 = digits.slice(-10);
        const candidates = await (db as any).userProfile.findMany({
          where: {
            OR: [
              { phone: { contains: last10 } },
              { email: `${last10}@tech.vigilamc.app` },
              { email: `${digits}@tech.vigilamc.app` },
            ],
          },
          include: { organization: true },
          orderBy: { createdAt: 'desc' },
        });

        // Prefer active TECHNICIAN or ORG_ADMIN
        matchedUser =
          candidates.find(
            (c: any) =>
              c.status === 'ACTIVE' &&
              (c.role === 'TECHNICIAN' || c.role === 'ORG_ADMIN') &&
              cleanDigits(c.phone || '').slice(-10) === last10
          ) ||
          candidates.find((c: any) => cleanDigits(c.phone || '').slice(-10) === last10) ||
          candidates[0] ||
          null;
      }
    }

    // If still no user in Prisma, but it's an email, check if Supabase has it
    if (!matchedUser && rawIdentifier.includes('@')) {
      const supabase = createServerSupabaseClient();
      const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
        email: rawIdentifier.toLowerCase(),
        password: rawPassword,
      });

      if (supaErr || !supaData.user) {
        return NextResponse.json(
          { error: supaErr?.message || 'Invalid email or password.' },
          { status: 401 }
        );
      }

      // Supabase user authenticated, let's load/create userProfile in Prisma
      let profile = await (db as any).userProfile.findUnique({
        where: { id: supaData.user.id },
        include: { organization: true },
      });

      if (!profile) {
        const org = await (db as any).organization.create({
          data: {
            name: `${supaData.user.email?.split('@')[0] || 'Agency'} Fire Safety`,
            email: supaData.user.email,
          },
        });

        profile = await (db as any).userProfile.create({
          data: {
            id: supaData.user.id,
            email: supaData.user.email,
            fullName: (supaData.user.user_metadata?.full_name as string) || 'Agency Admin',
            role: 'ORG_ADMIN',
            status: 'ACTIVE',
            organizationId: org.id,
            passwordHash: hashPin(rawPassword),
          },
          include: { organization: true },
        });
      } else {
        // Cache passwordHash for instant future logins
        await (db as any).userProfile
          .update({
            where: { id: profile.id },
            data: { passwordHash: hashPin(rawPassword) },
          })
          .catch(() => {});
      }

      matchedUser = profile;
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'No account found matching this Mobile Number, Staff ID, or Email.' },
        { status: 404 }
      );
    }

    // 4. Check if deactivated or inactive
    if (matchedUser.status === 'INACTIVE' || matchedUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'This staff account has been deactivated by your agency admin.' },
        { status: 403 }
      );
    }

    // 5. Verify Password / PIN
    let verified = false;

    if (matchedUser.passwordHash) {
      verified = verifyPin(rawPassword, matchedUser.passwordHash);
    }

    // If passwordHash didn't match or wasn't set, try Supabase auth if user has email
    if (!verified && matchedUser.email) {
      const supabase = createServerSupabaseClient();
      const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
        email: matchedUser.email,
        password: rawPassword,
      });

      if (!supaErr && supaData.user) {
        verified = true;
        // Backfill passwordHash in Prisma so subsequent logins are instant
        await (db as any).userProfile
          .update({
            where: { id: matchedUser.id },
            data: { passwordHash: hashPin(rawPassword) },
          })
          .catch(() => {});
      }
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid PIN or Password. Please check your credentials.' },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    await (db as any).userProfile
      .update({
        where: { id: matchedUser.id },
        data: { lastLoginAt: new Date() },
      })
      .catch(() => {});

    // 6. Sign Session Token & Set Cookie
    const sessionToken = signTechSessionToken({
      userId: matchedUser.id,
      orgId: matchedUser.organizationId || '',
      role: matchedUser.role || 'TECHNICIAN',
      email: matchedUser.email,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      profile: {
        id: matchedUser.id,
        email: matchedUser.email,
        fullName: matchedUser.fullName || 'Technician',
        phone: matchedUser.phone || '',
        employeeId: matchedUser.employeeId || '',
        role: matchedUser.role || 'TECHNICIAN',
        status: matchedUser.status,
        organizationId: matchedUser.organizationId,
        organizationName: matchedUser.organization?.name || 'VigilAMC Fire Agency',
      },
      token: sessionToken,
    });

    response.cookies.set(TECH_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Error in POST /api/technician/login:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
