import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ certificates: [] });
    }

    const reports = await (db as any).complianceReport.findMany({
      where: {
        organizationId: auth.organization.id,
      },
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
      licensedAgencyNumber: auth.organization.licenseNumber || 'DL/FIRE/LIC/PENDING',
      overallResult: r.status,
      building: r.building,
    }));

    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
