import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.organization?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const receipts = await (db as any).reportAck.findMany({
      where: {
        building: {
          organizationId: auth.organization.id,
        },
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            city: true,
            complianceCycle: true,
          },
        },
        portalUser: {
          select: {
            id: true,
            name: true,
            email: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        acknowledgedAt: 'desc',
      },
    });

    return NextResponse.json({ receipts });
  } catch (error: any) {
    console.error('[Admin Portal Receipts GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch report receipts' }, { status: 500 });
  }
}
