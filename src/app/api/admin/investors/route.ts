import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isFounderOwner } from '@/lib/founderAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
    }

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
    return NextResponse.json({ error: error.message || 'Forbidden' }, { status: 403 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }
    if (!id) {
      return NextResponse.json({ error: 'Investor ID is required' }, { status: 400 });
    }

    await (db as any).investorInterest.delete({ where: { id } });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting investor lead:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete investor lead' }, { status: 500 });
  }
}
