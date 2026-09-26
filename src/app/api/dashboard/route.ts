import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({
        authenticated: false,
        kpis: {
          totalBuildings: 0,
          totalEquipments: 0,
          compliantCount: 0,
          dueCount: 0,
          overdueCount: 0,
          complianceRate: 100,
          openDefects: 0,
          inspectionsCompleted: 0,
        },
        buildings: [],
        equipments: [],
      });
    }

    const organizationId = auth.organization.id;

    const buildings = await (db as any).building.findMany({
      where: { organizationId },
      include: {
        client: true,
        equipments: true,
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const equipments = await (db as any).equipment.findMany({
      where: { organizationId },
      include: {
        building: {
          select: { name: true, address: true },
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    const inspectionsCount = await (db as any).inspection.count({
      where: { organizationId },
    }).catch(() => 0);

    const openDefectsCount = await (db as any).defect.count({
      where: {
        organizationId,
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    }).catch(() => 0);

    const now = new Date();
    let compliantCount = 0;
    let dueCount = 0;
    let overdueCount = 0;

    equipments.forEach((eq: any) => {
      const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        overdueCount++;
      } else if (diffDays <= 30) {
        dueCount++;
      } else {
        compliantCount++;
      }
    });

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      organization: auth.organization,
      kpis: {
        totalBuildings: buildings.length,
        totalEquipments: equipments.length,
        compliantCount,
        dueCount,
        overdueCount,
        complianceRate: equipments.length > 0 ? Math.round((compliantCount / equipments.length) * 100) : 100,
        openDefects: openDefectsCount,
        inspectionsCompleted: inspectionsCount,
      },
      buildings,
      equipments,
    });
  } catch (error: any) {
    console.error('Error in dashboard aggregation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
