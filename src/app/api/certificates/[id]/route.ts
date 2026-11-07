import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeAgencyCredentials } from '@/lib/compliance-engine';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await (db as any).complianceReport.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
        building: {
          include: {
            client: true,
            equipments: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const agencyCred = report.organizationId
      ? await (db as any).agencyCredential
          .findFirst({
            where: { organizationId: report.organizationId },
            orderBy: { updatedAt: 'desc' },
          })
          .catch(() => null)
      : null;

    const sanitizedAgency = sanitizeAgencyCredentials(report.organization, agencyCred);

    const certificate = {
      id: report.id,
      certificateNumber: report.reportNumber,
      formType: 'INSPECTION_REPORT',
      reportTitle: 'VIGILAMC FIRE SAFETY INSPECTION & MAINTENANCE REPORT',
      period: report.cyclePeriod,
      issueDate: report.generatedAt,
      validUntil: new Date(new Date(report.generatedAt).getTime() + 180 * 24 * 60 * 60 * 1000),
      licensedAgencyNumber: sanitizedAgency.licenseNumber || 'Not Provided',
      licenseVerificationStatus: sanitizedAgency.verificationStatus,
      signatoryName: sanitizedAgency.signatoryName || sanitizedAgency.legalName,
      overallResult: report.status,
      totalAssetsInspected: report.totalEquipment,
      functionalCount: report.compliantCount,
      refilledCount: report.compliantCount,
      defectiveCount: report.overdueCount,
      building: report.building,
    };

    return NextResponse.json({ certificate });
  } catch (error: any) {
    console.error('Error fetching report details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
