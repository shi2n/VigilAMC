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

    const candidateUsers: any[] = [];

    // 1. Try exact email match
    if (rawIdentifier.includes('@')) {
      const emailLower = rawIdentifier.toLowerCase();
      const byEmail = await (db as any).userProfile.findUnique({
        where: { email: emailLower },
        include: { organization: true },
      });
      if (byEmail) candidateUsers.push(byEmail);
    }

    // 2. Try Employee ID / Staff ID match (e.g. TECH-101, SHAIZAN1234)
    const upperId = rawIdentifier.toUpperCase();
    const byStaffId = await (db as any).userProfile.findMany({
      where: {
        employeeId: {
          equals: upperId,
          mode: 'insensitive',
        },
      },
      include: { organization: true },
    });
    for (const u of byStaffId) {
      if (!candidateUsers.some((c) => c.id === u.id)) candidateUsers.push(u);
    }

    // 3. Try Mobile Number match (10+ digits)
    const digits = cleanDigits(rawIdentifier);
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);
      const first5 = last10.slice(0, 5);
      const second5 = last10.slice(5);

      const byPhone = await (db as any).userProfile.findMany({
        where: {
          OR: [
            { phone: { contains: last10 } },
            { phone: { contains: `${first5} ${second5}` } },
            { phone: { contains: first5 } },
            { email: `${last10}@tech.vigilamc.app` },
            { email: `${digits}@tech.vigilamc.app` },
          ],
        },
        include: { organization: true },
        orderBy: { createdAt: 'desc' },
      });

      for (const u of byPhone) {
        const uDigits = cleanDigits(u.phone || '');
        if (
          uDigits.slice(-10) === last10 ||
          (u.email && (u.email.includes(last10) || u.email.includes(digits)))
        ) {
          if (!candidateUsers.some((c) => c.id === u.id)) candidateUsers.push(u);
        }
      }
    }

    let matchedUser: any = null;

    // 4. Test candidates against PIN / Password
    for (const candidate of candidateUsers) {
      if (candidate.status === 'INACTIVE' || candidate.status === 'SUSPENDED') {
        continue;
      }

      let isVerified = false;

      // Verify PIN hash
      if (candidate.passwordHash) {
        isVerified = verifyPin(rawPassword, candidate.passwordHash);
      }

      // Default PIN 123456 fallback if no passwordHash set yet
      if (!isVerified && (!candidate.passwordHash || candidate.passwordHash.trim() === '')) {
        if (rawPassword === '123456') {
          isVerified = true;
          await (db as any).userProfile
            .update({
              where: { id: candidate.id },
              data: { passwordHash: hashPin('123456') },
            })
            .catch(() => {});
        }
      }

      // If still not verified, and candidate has email, try Supabase auth
      if (!isVerified && candidate.email) {
        try {
          const supabase = createServerSupabaseClient();
          const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
            email: candidate.email,
            password: rawPassword,
          });
          if (!supaErr && supaData.user) {
            isVerified = true;
            await (db as any).userProfile
              .update({
                where: { id: candidate.id },
                data: { passwordHash: hashPin(rawPassword) },
              })
              .catch(() => {});
          }
        } catch {
          // ignore error and try next
        }
      }

      if (isVerified) {
        matchedUser = candidate;
        break;
      }
    }

    // 5. If still no matchedUser, but rawIdentifier looks like an email, try Supabase directly
    if (!matchedUser && rawIdentifier.includes('@')) {
      const supabase = createServerSupabaseClient();
      const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
        email: rawIdentifier.toLowerCase(),
        password: rawPassword,
      });

      if (!supaErr && supaData.user) {
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
          await (db as any).userProfile
            .update({
              where: { id: profile.id },
              data: { passwordHash: hashPin(rawPassword) },
            })
            .catch(() => {});
        }

        matchedUser = profile;
      }
    }

    if (!matchedUser) {
      if (candidateUsers.length === 0) {
        return NextResponse.json(
          { error: 'No account found matching this Mobile Number, Staff ID, or Email.' },
          { status: 404 }
        );
      }
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
