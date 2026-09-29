import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.user || auth.profile?.role === 'TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ history: [] });
    }

    const logs = await (db as any).activityLog.findMany({
      where: {
        organizationId,
        action: 'IMPORT_BATCH',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const history = logs.map((log: any) => {
      let parsedDetails: any = {};
      try {
        parsedDetails = JSON.parse(log.details || '{}');
      } catch (e) {
        parsedDetails = { raw: log.details };
      }

      return {
        id: log.id,
        userEmail: log.userEmail,
        createdAt: log.createdAt,
        entityType: log.entityType,
        ...parsedDetails,
      };
    });

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error('Error fetching import history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
