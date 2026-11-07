import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeAgencyCredentials } from '@/lib/compliance-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ certificates: [] });
    }

    const [reports, agencyCred] = await Promise.all([
      (db as any).complianceReport.findMany({
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
      }),
      (db as any).agencyCredential
        .findFirst({
          where: { organizationId: auth.organization.id },
          orderBy: { updatedAt: 'desc' },
        })
        .catch(() => null),
    ]);

    const sanitizedAgency = sanitizeAgencyCredentials(auth.organization, agencyCred);

    const certificates = reports.map((r: any) => ({
      id: r.id,
      certificateNumber: r.reportNumber,
      formType: 'INSPECTION_REPORT',
      reportTitle: 'VIGILAMC FIRE SAFETY INSPECTION & MAINTENANCE REPORT',
      period: r.cyclePeriod,
      issueDate: r.generatedAt,
      validUntil: new Date(new Date(r.generatedAt).getTime() + 180 * 24 * 60 * 60 * 1000),
      licensedAgencyNumber: sanitizedAgency.licenseNumber || 'Not Provided',
      licenseVerificationStatus: sanitizedAgency.verificationStatus,
      overallResult: r.status,
      building: r.building,
    }));

    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error('Error fetching inspection reports:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
