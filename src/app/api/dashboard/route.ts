import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const buildings = await db.building.findMany({
      include: {
        client: true,
        equipments: true,
        reports: true,
      },
    });

    const equipments = await db.equipment.findMany({
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

    return NextResponse.json({
      kpis: {
        totalBuildings: buildings.length,
        totalEquipments: equipments.length,
        compliantCount,
        dueCount,
        overdueCount,
        complianceRate: equipments.length > 0 ? Math.round((compliantCount / equipments.length) * 100) : 100,
      },
      buildings,
      equipments,
    });
  } catch (error: any) {
    console.error('Error in dashboard aggregation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
