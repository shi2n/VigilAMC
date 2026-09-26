import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { buildingId: string } }
) {
  try {
    const building = await db.building.findUnique({
      where: { id: params.buildingId },
      include: {
        client: true,
        equipments: {
          orderBy: [{ location: 'asc' }, { qrCode: 'asc' }],
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const company = await db.company.findFirst();
    const now = new Date();

    let compliantCount = 0;
    let dueCount = 0;
    let overdueCount = 0;

    const evaluatedEquipments = building.equipments.map((eq: any) => {
      const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let currentStatus: 'COMPLIANT' | 'DUE_SOON' | 'OVERDUE' = 'COMPLIANT';
      if (diffDays < 0) {
        overdueCount++;
        currentStatus = 'OVERDUE';
      } else if (diffDays <= 30) {
        dueCount++;
        currentStatus = 'DUE_SOON';
      } else {
        compliantCount++;
      }

      return {
        ...eq,
        currentStatus,
        diffDays,
      };
    });

    const isFullyCompliant = overdueCount === 0 && dueCount === 0;
    const overallReportStatus = isFullyCompliant ? 'COMPLIANT' : 'ACTION_NEEDED';

    // Create or update ComplianceReport record
    const reportNumber = `FORM-B/${new Date().getFullYear()}/${building.id.slice(-4).toUpperCase()}`;
    const report = await db.complianceReport.upsert({
      where: { reportNumber },
      create: {
        buildingId: building.id,
        reportNumber,
        cyclePeriod: `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} - ${new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' })} ${new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).getFullYear()}`,
        totalEquipment: building.equipments.length,
        compliantCount,
        dueCount,
        overdueCount,
        status: overallReportStatus,
      },
      update: {
        totalEquipment: building.equipments.length,
        compliantCount,
        dueCount,
        overdueCount,
        status: overallReportStatus,
      },
    });

    return NextResponse.json({
      company,
      building: {
        ...building,
        equipments: evaluatedEquipments,
      },
      report,
      summary: {
        total: building.equipments.length,
        compliant: compliantCount,
        dueSoon: dueCount,
        overdue: overdueCount,
        overallStatus: overallReportStatus,
      },
    });
  } catch (error: any) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
