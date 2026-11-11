import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getAuthenticatedActor } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = (await getCurrentUser(request)) || (await getAuthenticatedActor(request));
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    const equipment = await (db as any).equipment.findFirst({
      where: { id, organizationId: auth.organization.id },
      select: { id: true },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    const history = await (db as any).equipmentHistory.findMany({
      where: { equipmentId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('Error fetching equipment history:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch history' }, { status: 500 });
  }
}
