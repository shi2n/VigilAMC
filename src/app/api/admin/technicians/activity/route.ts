import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit')) || 50));

    const where: any = {
      organizationId,
    };

    if (technicianId && technicianId !== 'ALL') {
      where.userId = technicianId;
    }

    const [activities, technicians] = await Promise.all([
      (db as any).activityLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).userProfile.findMany({
        where: {
          organizationId,
          role: 'TECHNICIAN',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          lastLoginAt: true,
        },
        orderBy: { fullName: 'asc' },
      }),
    ]);

    // Map user profiles to activities
    const techMap = new Map();
    technicians.forEach((t: any) => {
      techMap.set(t.id, t);
    });

    const enrichedActivities = activities.map((act: any) => {
      const tech = act.userId ? techMap.get(act.userId) : null;
      return {
        id: act.id,
        action: act.action,
        entityType: act.entityType,
        entityId: act.entityId,
        details: act.details,
        createdAt: act.createdAt,
        userEmail: act.userEmail,
        technician: tech
          ? {
              id: tech.id,
              name: tech.fullName || tech.email,
              email: tech.email,
              status: tech.status,
              lastLoginAt: tech.lastLoginAt,
            }
          : {
              name: act.userEmail?.split('@')[0] || 'System',
              email: act.userEmail || '',
              status: 'UNKNOWN',
              lastLoginAt: null,
            },
      };
    });

    return NextResponse.json({
      success: true,
      activities: enrichedActivities,
      technicians,
    });
  } catch (error: any) {
    console.error('Error fetching technician activity:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
