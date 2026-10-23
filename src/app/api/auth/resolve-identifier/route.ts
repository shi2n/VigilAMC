import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: 'Please enter your Mobile Number, Staff ID, or Email.' },
        { status: 400 }
      );
    }

    // 1. If identifier already contains '@', treat it as an email and check if deactivated
    if (rawIdentifier.includes('@')) {
      const normalizedEmail = rawIdentifier.toLowerCase();
      const profile = await (db as any).userProfile
        .findUnique({
          where: { email: normalizedEmail },
          select: { email: true, status: true },
        })
        .catch(() => null);

      if (profile && (profile.status === 'INACTIVE' || profile.status === 'SUSPENDED')) {
        return NextResponse.json(
          { error: 'This staff account has been deactivated by your agency admin.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ email: profile?.email || normalizedEmail });
    }

    // 2. Check if identifier matches an Employee ID / Staff ID (case-insensitive)
    const upperId = rawIdentifier.toUpperCase();
    const byEmployeeId = await (db as any).userProfile
      .findFirst({
        where: {
          employeeId: {
            equals: upperId,
            mode: 'insensitive',
          },
        },
        select: { email: true, status: true },
      })
      .catch(() => null);

    if (byEmployeeId) {
      if (byEmployeeId.status === 'INACTIVE' || byEmployeeId.status === 'SUSPENDED') {
        return NextResponse.json(
          { error: 'This staff account has been deactivated by your agency admin.' },
          { status: 403 }
        );
      }
      return NextResponse.json({ email: byEmployeeId.email });
    }

    // 3. Check if identifier is a 10+ digit Indian Mobile Number
    const digits = cleanDigits(rawIdentifier);
    if (digits.length >= 10) {
      const last10 = digits.slice(-10);

      // Search user profiles whose phone ends with the 10-digit number or whose internal email starts with it
      const candidates = await (db as any).userProfile
        .findMany({
          where: {
            OR: [
              { phone: { contains: last10 } },
              { email: `${last10}@tech.vigilamc.app` },
              { email: `${digits}@tech.vigilamc.app` },
            ],
          },
          select: { email: true, phone: true, status: true, role: true },
          orderBy: { createdAt: 'desc' },
        })
        .catch(() => []);

      const matched =
        candidates.find((c: any) => cleanDigits(c.phone || '').slice(-10) === last10) ||
        candidates[0];

      if (matched) {
        if (matched.status === 'INACTIVE' || matched.status === 'SUSPENDED') {
          return NextResponse.json(
            { error: 'This staff account has been deactivated by your agency admin.' },
            { status: 403 }
          );
        }
        return NextResponse.json({ email: matched.email });
      }
    }

    return NextResponse.json(
      {
        error:
          'No active staff or agency account found for this Mobile Number / Staff ID. Please check with your agency admin.',
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/auth/resolve-identifier:', error);
    return NextResponse.json(
      { error: 'Unable to verify login identifier right now. Please try again.' },
      { status: 500 }
    );
  }
}
