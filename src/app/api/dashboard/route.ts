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

    // Real database counts
    const [totalClients, totalBuildings, totalEquipments, activeTechnicians, openWorkOrders] = await Promise.all([
      (db as any).client.count({ where: { organizationId } }).catch(() => 0),
      (db as any).building.count({ where: { organizationId } }).catch(() => 0),
      (db as any).equipment.count({ where: { organizationId } }).catch(() => 0),
      (db as any).userProfile.count({
        where: {
          organizationId,
          role: 'TECHNICIAN',
          status: 'ACTIVE',
        },
      }).catch(() => 0),
      (db as any).workOrder.count({
        where: {
          organizationId,
          status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
        },
      }).catch(() => 0),
    ]);

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

    const complianceRate = equipments.length > 0 ? Math.round((compliantCount / equipments.length) * 100) : 100;

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      organization: auth.organization,
      kpis: {
        totalClients,
        totalBuildings,
        totalEquipments,
        activeTechnicians,
        openWorkOrders,
        dueInspections: dueCount,
        overdueInspections: overdueCount,
        complianceRate,
      },
      buildings,
      equipments,
    });
  } catch (error: any) {
    console.error('Error in dashboard aggregation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
