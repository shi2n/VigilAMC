import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runAutoSchedulerForOrg } from '@/lib/autoScheduler';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgs = await (db as any).organization.findMany({
      where: { autoSchedulingEnabled: true },
      select: { id: true, name: true },
    });

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const org of orgs) {
      const res = await runAutoSchedulerForOrg({
        organizationId: org.id,
      });
      totalCreated += res.createdCount;
      totalSkipped += res.skippedCount;
    }

    return NextResponse.json({
      success: true,
      organizationsProcessed: orgs.length,
      totalCreated,
      totalSkipped,
    });
  } catch (error: any) {
    console.error('Error in compliance-cycles cron:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
