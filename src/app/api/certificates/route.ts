import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reports = await (db as any).complianceReport.findMany({
      include: {
        building: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    const certificates = reports.map((r: any) => ({
      id: r.id,
      certificateNumber: r.reportNumber,
      formType: 'FORM_B',
      period: r.cyclePeriod,
      issueDate: r.generatedAt,
      validUntil: new Date(new Date(r.generatedAt).getTime() + 180 * 24 * 60 * 60 * 1000),
      licensedAgencyNumber: 'MH/FIRE/LIC/2024/098',
      overallResult: r.status,
      building: r.building,
    }));

    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
