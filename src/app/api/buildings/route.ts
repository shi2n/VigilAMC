import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const buildings = await db.building.findMany({
      include: {
        client: true,
        equipments: true,
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { nextFilingDueDate: 'asc' },
    });

    const now = new Date();
    const mapped = buildings.map((b: any) => {
      let compliantCount = 0;
      let dueCount = 0;
      let overdueCount = 0;

      b.equipments.forEach((eq: any) => {
        const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) overdueCount++;
        else if (diffDays <= 30) dueCount++;
        else compliantCount++;
      });

      return {
        ...b,
        city: 'New Delhi',
        occupancyType: 'Commercial Complex',
        fireNocNumber: 'NOC-2026-DEL-892',
        nocExpiryDate: b.nextFilingDueDate,
        totalAssets: b.equipments.length,
        assets: b.equipments,
        compliantCount,
        dueCount,
        overdueCount,
        status: overdueCount > 0 ? 'OVERDUE' : (dueCount > 0 ? 'DUE_SOON' : 'COMPLIANT'),
      };
    });

    return NextResponse.json({ buildings: mapped });
  } catch (error: any) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
