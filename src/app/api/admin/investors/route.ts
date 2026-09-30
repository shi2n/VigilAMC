import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Ensure caller is an authenticated Administrator
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [investors, total] = await Promise.all([
      (db as any).investorInterest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      (db as any).investorInterest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      investors,
      total,
    });
  } catch (error: any) {
    console.error('Error fetching investor leads:', error);
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch investor records' }, { status });
  }
}
