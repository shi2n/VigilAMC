import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await (db as any).complianceReport.findUnique({
      where: { id: params.id },
      include: {
        building: {
          include: {
            client: true,
            equipments: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const certificate = {
      id: report.id,
      certificateNumber: report.reportNumber,
      formType: 'FORM_B',
      period: report.cyclePeriod,
      issueDate: report.generatedAt,
      validUntil: new Date(new Date(report.generatedAt).getTime() + 180 * 24 * 60 * 60 * 1000),
      licensedAgencyNumber: 'MH/FIRE/LIC/2024/098',
      signatoryName: 'National Fire Safety & AMC Services',
      overallResult: report.status,
      totalAssetsInspected: report.totalEquipment,
      functionalCount: report.compliantCount,
      refilledCount: report.compliantCount,
      defectiveCount: report.overdueCount,
      building: report.building,
    };

    return NextResponse.json({ certificate });
  } catch (error: any) {
    console.error('Error fetching certificate details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
