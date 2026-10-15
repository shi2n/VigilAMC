import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, isPlatformOwner } from '@/lib/auth';
import { evaluateEquipmentStatus } from '@/lib/compliance';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { buildingId: string } }
) {
  try {
    const auth = await getCurrentUser();

    const building = await (db as any).building.findUnique({
      where: { id: params.buildingId },
      include: {
        client: true,
        equipments: {
          include: {
            inspections: {
              orderBy: { date: 'desc' },
              take: 1,
            },
            serviceLogs: {
              orderBy: { servicedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: [{ location: 'asc' }, { qrCode: 'asc' }],
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Verify tenant authorization if user is authenticated
    if (auth && auth.organization && building.organizationId) {
      if (auth.organization.id !== building.organizationId && !isPlatformOwner(auth)) {
        return NextResponse.json({ error: 'Forbidden: Access denied to other agency data' }, { status: 403 });
      }
    }

    // Fetch the agency company specific to this building's organization
    let company = null;
    if (building.organizationId) {
      company = await (db as any).company.findFirst({
        where: {
          organizationId: building.organizationId,
        },
      });
      if (!company) {
        // Fallback to linked organization record
        const org = await (db as any).organization.findUnique({
          where: { id: building.organizationId },
        });
        if (org) {
          company = {
            name: org.name,
            phone: org.phone || '+91 83838 90483',
            email: org.email || '',
            address: org.address || '',
            licenseNumber: org.licenseNumber || '',
          };
        }
      }
    }

    if (!company) {
      company = await (db as any).company.findFirst();
    }

    const now = new Date();

    let verifiedCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;
    let notInspectedCount = 0;

    const evaluatedEquipments = building.equipments.map((eq: any) => {
      const evaluation = evaluateEquipmentStatus(eq, now);
      if (evaluation.status === 'VERIFIED') {
        verifiedCount++;
      } else if (evaluation.status === 'DUE_SOON') {
        dueSoonCount++;
      } else if (evaluation.status === 'OVERDUE') {
        overdueCount++;
      } else {
        notInspectedCount++;
      }

      return {
        ...eq,
        currentStatus: evaluation.status,
        statusLabel: evaluation.label,
        diffDays: evaluation.diffDays,
        hasGPS: evaluation.hasGPS,
        hasPhoto: evaluation.hasPhoto,
        isImported: evaluation.isImported,
      };
    });

    const isFullyVerified = overdueCount === 0 && dueSoonCount === 0 && notInspectedCount === 0 && verifiedCount > 0;
    const overallReportStatus = isFullyVerified ? 'VERIFIED' : 'ACTION_NEEDED';

    // Create or update ComplianceReport record
    const reportNumber = `FORM-B/${new Date().getFullYear()}/${building.id.slice(-4).toUpperCase()}`;
    const report = await (db as any).complianceReport.upsert({
      where: { reportNumber },
      create: {
        buildingId: building.id,
        organizationId: building.organizationId || null,
        reportNumber,
        cyclePeriod: `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} - ${new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' })} ${new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).getFullYear()}`,
        totalEquipment: building.equipments.length,
        compliantCount: verifiedCount,
        dueCount: dueSoonCount,
        overdueCount: overdueCount,
        status: overallReportStatus,
      },
      update: {
        totalEquipment: building.equipments.length,
        compliantCount: verifiedCount,
        dueCount: dueSoonCount,
        overdueCount: overdueCount,
        status: overallReportStatus,
      },
    }).catch(() => null);

    return NextResponse.json({
      company,
      building: {
        ...building,
        equipments: evaluatedEquipments,
      },
      report,
      summary: {
        total: building.equipments.length,
        verified: verifiedCount,
        compliant: verifiedCount,
        dueSoon: dueSoonCount,
        overdue: overdueCount,
        notInspected: notInspectedCount,
        overallStatus: overallReportStatus,
      },
    });
  } catch (error: any) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
