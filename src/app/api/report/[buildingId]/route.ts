import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluateEquipmentStatus } from '@/lib/compliance';

export const dynamic = 'force-dynamic';

function extractPhotoUrl(eq: any, latestInspection: any): string | null {
  if (eq?.photoUrl && typeof eq.photoUrl === 'string' && eq.photoUrl.trim()) {
    return eq.photoUrl.trim();
  }
  if (!latestInspection?.photos) return null;
  if (Array.isArray(latestInspection.photos) && latestInspection.photos.length > 0) {
    return latestInspection.photos[0];
  }
  if (typeof latestInspection.photos === 'string') {
    try {
      const parsed = JSON.parse(latestInspection.photos);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch {
      if (latestInspection.photos.startsWith('http') || latestInspection.photos.startsWith('data:image/')) {
        return latestInspection.photos;
      }
    }
  }
  return null;
}

function determineApplicableStandards(equipments: any[]): string[] {
  const standards: string[] = [];
  const types = equipments.map((e) => `${e.type || ''} ${e.capacity || ''}`.toLowerCase());

  const hasExtinguisher =
    equipments.length === 0 ||
    types.some(
      (t) =>
        t.includes('extinguisher') ||
        t.includes('abc') ||
        t.includes('co2') ||
        t.includes('foam') ||
        t.includes('powder') ||
        t.includes('water')
    );
  const hasHydrantOrHose = types.some(
    (t) => t.includes('hydrant') || t.includes('hose') || t.includes('landing') || t.includes('riser')
  );
  const hasYardHydrant = types.some(
    (t) => t.includes('yard') || t.includes('external hydrant') || t.includes('ring main')
  );
  const hasSprinkler = types.some((t) => t.includes('sprinkler') || t.includes('drencher'));
  const hasAlarm = types.some(
    (t) =>
      t.includes('alarm') ||
      t.includes('detector') ||
      t.includes('panel') ||
      t.includes('mcp') ||
      t.includes('hooter')
  );

  if (hasExtinguisher) {
    standards.push('IS 2190:2010 — Selection, Installation and Maintenance of First-Aid Fire Extinguishers');
  }
  if (hasHydrantOrHose) {
    standards.push('IS 3844:1989 — Code of Practice for Installation & Maintenance of Internal Fire Hydrants and Hose Reels');
  }
  if (hasYardHydrant) {
    standards.push('IS 13039:1991 — Provision and Maintenance of External Fire Hydrant Systems');
  }
  if (hasSprinkler) {
    standards.push('IS 15105:2021 — Design and Installation of Fixed Automatic Sprinkler Fire Extinguishing Systems');
  }
  if (hasAlarm) {
    standards.push('IS 2189:2008 — Selection, Installation and Maintenance of Automatic Fire Detection and Alarm System');
  }
  // NBC 2016 Part 4 is the universal statutory benchmark for built premises in India
  standards.push('NBC 2016 Part 4 — National Building Code of India (Fire and Life Safety)');

  return standards;
}

export async function GET(
  request: Request,
  { params }: { params: { buildingId: string } }
) {
  try {
    const building = await (db as any).building.findUnique({
      where: { id: params.buildingId },
      include: {
        client: true,
        equipments: {
          orderBy: { createdAt: 'asc' },
          include: {
            inspections: {
              where: { approvalStatus: 'APPROVED' },
              orderBy: { date: 'desc' },
              take: 1,
            },
            serviceLogs: {
              orderBy: { servicedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Fetch agency details from Organization and primary ORG_ADMIN UserProfile
    let company: any = null;
    let signatoryName = 'Authorized Signatory';

    if (building.organizationId) {
      const [org, adminProfile] = await Promise.all([
        (db as any).organization
          .findUnique({
            where: { id: building.organizationId },
          })
          .catch(() => null),
        (db as any).userProfile
          .findFirst({
            where: {
              organizationId: building.organizationId,
              role: 'ORG_ADMIN',
            },
            orderBy: { createdAt: 'asc' },
          })
          .catch(() => null),
      ]);

      const rawAdminName = adminProfile?.fullName?.trim();
      const cleanAdminName =
        rawAdminName && rawAdminName.toLowerCase() !== 'jordan michael'
          ? rawAdminName
          : null;

      if (org) {
        signatoryName =
          (org.signatoryName && org.signatoryName.trim()) ||
          cleanAdminName ||
          org.contactPerson ||
          'Shaizan';
        company = {
          name: org.name || 'Vigil Fire & Safety Solutions',
          phone: org.phone || '+91 83838 90483',
          email: org.email || 'vigilamc@gmail.com',
          address:
            [org.address, org.city, org.state].filter(Boolean).join(', ') ||
            'New Delhi, India',
          licenseNumber: org.licenseNumber || 'DL/FIRE/LIC/2026/042',
          gstin: org.gstin || '',
          contactPerson: signatoryName,
          signatoryName,
          brandLogoUrl: org.brandLogoUrl || null,
          signatoryDesignation: org.signatoryDesignation || null,
          signatorySignatureUrl: org.signatorySignatureUrl || null,
          reportFooterText: org.reportFooterText || null,
        };
      } else if (cleanAdminName) {
        signatoryName = cleanAdminName;
      }
    }

    if (!company) {
      const fallbackCompany = await (db as any).company.findFirst().catch(() => null);
      company = fallbackCompany || {
        name: 'Vigil Fire & Safety Solutions',
        licenseNumber: 'DL/FIRE/LIC/2026/042',
        phone: '+91 83838 90483',
        email: 'vigilamc@gmail.com',
        address: 'New Delhi, India',
        contactPerson: signatoryName,
        signatoryName,
      };
    }

    const now = new Date();

    let verifiedCount = 0;
    let compliantCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;
    let notInspectedCount = 0;

    const rawEquipments = Array.isArray(building.equipments) ? building.equipments : [];

    const evaluatedEquipments = rawEquipments.map((eq: any) => {
      const evaluation = evaluateEquipmentStatus(eq, now);
      const latestInspection = eq.inspections?.[0] || null;
      const latestLog = eq.serviceLogs?.[0] || null;
      const resolvedPhotoUrl = extractPhotoUrl(eq, latestInspection);
      const inspectionNotes =
        latestInspection?.remarks ||
        latestLog?.notes ||
        latestLog?.actionType ||
        'Routine IS 2190 physical & pressure verification';

      const isOverdue = evaluation.status === 'OVERDUE' || eq.status === 'OVERDUE' || eq.status === 'DEFECTIVE';
      const isDueSoon = !isOverdue && (evaluation.status === 'DUE_SOON' || eq.status === 'DUE_SOON');
      const isOperational = !isOverdue && !isDueSoon;

      if (evaluation.status === 'VERIFIED') {
        verifiedCount++;
      } else if (evaluation.status === 'NOT_INSPECTED') {
        notInspectedCount++;
      }

      if (isOverdue) {
        overdueCount++;
      } else if (isDueSoon) {
        dueSoonCount++;
      } else {
        compliantCount++;
      }

      const displayStatus = isOverdue ? 'OVERDUE' : isDueSoon ? 'DUE_SOON' : 'COMPLIANT';

      return {
        ...eq,
        photoUrl: resolvedPhotoUrl,
        inspectionNotes,
        currentStatus: displayStatus,
        evaluationStatus: evaluation.status,
        statusLabel: evaluation.label,
        diffDays: evaluation.diffDays,
        hasGPS: evaluation.hasGPS,
        hasPhoto: Boolean(resolvedPhotoUrl) || evaluation.hasPhoto,
        isImported: evaluation.isImported,
        latestLatitude: latestInspection?.latitude ?? null,
        latestLongitude: latestInspection?.longitude ?? null,
        latestInspectionDate: latestInspection?.date || eq.lastServiceDate || null,
        latestTechnicianName: latestInspection?.technicianName || latestLog?.technicianName || null,
      };
    });

    // Find latest GPS-verified inspection across the building's equipment or building inspections
    let latestGpsInspection: any = null;
    for (const eq of evaluatedEquipments) {
      if (eq.latestLatitude != null && eq.latestLongitude != null) {
        if (
          !latestGpsInspection ||
          new Date(eq.latestInspectionDate || 0).getTime() >
            new Date(latestGpsInspection.date || 0).getTime()
        ) {
          latestGpsInspection = {
            latitude: eq.latestLatitude,
            longitude: eq.latestLongitude,
            date: eq.latestInspectionDate,
            technicianName: eq.latestTechnicianName,
            assetCode: eq.qrCode,
          };
        }
      }
    }

    if (!latestGpsInspection) {
      const bldgInsp = await (db as any).inspection
        .findFirst({
          where: {
            buildingId: building.id,
            approvalStatus: 'APPROVED',
            latitude: { not: null },
            longitude: { not: null },
          },
          orderBy: { date: 'desc' },
        })
        .catch(() => null);
      if (bldgInsp) {
        latestGpsInspection = {
          latitude: bldgInsp.latitude,
          longitude: bldgInsp.longitude,
          date: bldgInsp.date,
          technicianName: bldgInsp.technicianName,
          assetCode: null,
        };
      }
    }

    const pendingApprovalsCount = await (db as any).inspection
      .count({
        where: {
          buildingId: building.id,
          approvalStatus: 'PENDING',
        },
      })
      .catch(() => 0);

    const isFullyCompliant = overdueCount === 0 && rawEquipments.length > 0;
    const overallReportStatus = isFullyCompliant ? 'COMPLIANT' : 'ACTION_NEEDED';

    // Create or update ComplianceReport record
    const reportNumber = `FORM-B/${now.getFullYear()}/${building.id.slice(-4).toUpperCase()}`;
    const cyclePeriod = `${now.toLocaleString('en-IN', { month: 'short' })} ${now.getFullYear()} - ${new Date(
      now.getTime() + 180 * 24 * 60 * 60 * 1000
    ).toLocaleString('en-IN', { month: 'short' })} ${new Date(
      now.getTime() + 180 * 24 * 60 * 60 * 1000
    ).getFullYear()}`;

    const report =
      (await (db as any).complianceReport
        .upsert({
          where: { reportNumber },
          create: {
            buildingId: building.id,
            organizationId: building.organizationId || null,
            reportNumber,
            cyclePeriod,
            totalEquipment: rawEquipments.length,
            compliantCount,
            dueCount: dueSoonCount,
            overdueCount,
            status: overallReportStatus,
          },
          update: {
            totalEquipment: rawEquipments.length,
            compliantCount,
            dueCount: dueSoonCount,
            overdueCount,
            status: overallReportStatus,
          },
        })
        .catch(() => null)) || {
        reportNumber,
        cyclePeriod,
        totalEquipment: rawEquipments.length,
        compliantCount,
        dueCount: dueSoonCount,
        overdueCount,
        status: overallReportStatus,
      };

    const [correctiveActions, buildingInspections] = await Promise.all([
      (db as any).correctiveAction
        .findMany({
          where: { buildingId: building.id },
          orderBy: [{ status: 'asc' }, { openedAt: 'desc' }],
          include: {
            equipment: {
              select: {
                id: true,
                qrCode: true,
                type: true,
                location: true,
              },
            },
          },
        })
        .catch(() => []),
      (db as any).inspection
        .findMany({
          where: { buildingId: building.id },
          orderBy: { date: 'desc' },
          take: 25,
          include: {
            inspectionPhotos: {
              orderBy: { createdAt: 'desc' },
              take: 4,
            },
            issues: true,
            equipment: {
              select: {
                id: true,
                qrCode: true,
                type: true,
                location: true,
              },
            },
          },
        })
        .catch(() => []),
    ]);

    const openFindingsCount = (correctiveActions || []).filter(
      (ca: any) => ca.status === 'OPEN' || ca.status === 'DISPATCHED' || ca.status === 'REPAIRED'
    ).length;

    const applicableStandards = determineApplicableStandards(evaluatedEquipments);

    return NextResponse.json({
      company,
      signatoryName,
      building: {
        ...building,
        equipments: evaluatedEquipments,
        inspections: buildingInspections,
        correctiveActions,
      },
      report,
      latestGpsInspection,
      pendingApprovalsCount,
      applicableStandards,
      summary: {
        total: rawEquipments.length,
        verified: verifiedCount,
        compliant: compliantCount,
        dueSoon: dueSoonCount,
        overdue: overdueCount,
        notInspected: notInspectedCount,
        openFindings: openFindingsCount,
        compliantPercent:
          rawEquipments.length > 0 ? Math.round((compliantCount / rawEquipments.length) * 100) : 0,
        overallStatus: overallReportStatus,
      },
    });
  } catch (error: any) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}
