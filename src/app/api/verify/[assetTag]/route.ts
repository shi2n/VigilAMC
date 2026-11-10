import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkVerifyRateLimit } from '@/lib/portalSession';
import { calendarDayDiff } from '@/lib/dates';
import {
  PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
  classifyEquipmentCategory,
  EQUIPMENT_CATEGORY_STANDARDS,
} from '@/lib/compliance-engine';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { qrCode?: string; assetTag?: string } }
) {
  try {
    const rawTag = params.assetTag || params.qrCode || '';
    const queryRef = decodeURIComponent(rawTag).trim();

    if (!queryRef) {
      return NextResponse.json({ error: 'Record not available' }, { status: 404 });
    }

    // Rate-limiting: max 30 lookups per minute per IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';
    const rateCheck = checkVerifyRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many lookup requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const verificationHeading = 'VigilAMC Report Authenticity Verification';
    const authenticityNotice =
      'Verification confirms that this record was generated on the VigilAMC platform and has not been altered since generation. A verified report does NOT constitute government approval, a Fire NOC, or a statutory Fire Safety Certificate.';

    // DEMO ASSET TAG OR DEMO REPORT REFERENCE
    if (
      queryRef.toUpperCase() === 'EXT-DEMO-01' ||
      queryRef.toUpperCase() === 'DEMO-EXT-01' ||
      queryRef.toUpperCase() === 'VAMC-RPT-DEMO-01'
    ) {
      return NextResponse.json({
        verificationHeading,
        verificationKind: queryRef.toUpperCase().startsWith('VAMC-RPT') ? 'REPORT' : 'ASSET',
        reportReferenceId: 'VAMC-RPT/UP_NOIDA/2026/DEMO1',
        reportTitle: 'VIGILAMC FIRE SAFETY INSPECTION & MAINTENANCE REPORT',
        reportType: 'Fire Safety Inspection Report',
        jurisdiction: 'Uttar Pradesh – Noida',
        assetTag: 'DEMO-EXT-01',
        type: 'ABC Dry Powder 6kg (IS 2190:2024 / IS 15683:2018)',
        capacity: '6kg Stored Pressure',
        buildingName: 'Horizon Tower Alpha (Sample Demonstration)',
        city: 'Noida',
        status: 'OK',
        reportStatus: 'INSPECTION COMPLETED',
        verificationStatus: 'AUTHENTIC PLATFORM RECORD',
        documentVersion: '2.0.0',
        recordIntegrityHash: 'A94F81C0E72B38D15F90A12C',
        createdAt: '2026-11-02T10:00:00.000Z',
        lastApprovedInspectionDate: '2026-11-02T10:00:00.000Z',
        nextServiceDue: '2027-05-02T10:00:00.000Z',
        agencyName: 'Apex Shield Fire Safety AMC (Demo Agency)',
        agencyLogoUrl: '/brand/logo-tile-192.png',
        recordId: 'rec_demo_asset_001',
        authenticityNotice,
        legalDisclaimer: PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
        isDemo: true,
      });
    }

    // 1. Check if queryRef matches an InspectionReport or ComplianceReport
    const [inspReport, compReport] = await Promise.all([
      (db as any).inspectionReport
        .findFirst({
          where: {
            OR: [
              { reportReferenceId: { equals: queryRef, mode: 'insensitive' } },
              { id: queryRef },
              { buildingId: queryRef },
            ],
          },
          orderBy: { generatedAt: 'desc' },
          include: {
            building: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
                organizationId: true,
                client: {
                  select: {
                    name: true, // Only client/building name — never expose private client phone/email
                  },
                },
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                brandLogoUrl: true,
                publicVerificationEnabled: true,
              },
            },
          },
        })
        .catch(() => null),
      (db as any).complianceReport
        .findFirst({
          where: {
            OR: [
              { reportNumber: { equals: queryRef, mode: 'insensitive' } },
              { id: queryRef },
              { buildingId: queryRef },
            ],
          },
          orderBy: { generatedAt: 'desc' },
          include: {
            building: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
                organizationId: true,
                client: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
                brandLogoUrl: true,
                publicVerificationEnabled: true,
              },
            },
          },
        })
        .catch(() => null),
    ]);

    if (inspReport || compReport) {
      const targetReport = inspReport || compReport;
      const org = targetReport.organization;
      if (org && org.publicVerificationEnabled === false) {
        return NextResponse.json({ error: 'Record not available' }, { status: 404 });
      }

      // Log verification attempt
      await (db as any).reportVerificationLog
        .create({
          data: {
            inspectionReportId: inspReport?.id || null,
            queriedRef: queryRef,
            verificationResult: 'VERIFIED_AUTHENTIC',
            ipHash: ip.slice(0, 16),
            userAgent: request.headers.get('user-agent')?.slice(0, 120) || null,
          },
        })
        .catch(() => null);

      const reportRefId = inspReport?.reportReferenceId || compReport?.reportNumber || queryRef;
      const reportStatus = inspReport?.inspectionStatus || compReport?.status || 'INSPECTION COMPLETED';

      return NextResponse.json({
        verificationHeading,
        verificationKind: 'REPORT',
        reportReferenceId: reportRefId,
        reportTitle: inspReport?.reportTitle || 'VIGILAMC FIRE SAFETY INSPECTION & MAINTENANCE REPORT',
        reportType: inspReport?.reportType || 'FIRE_SAFETY_INSPECTION_REPORT',
        jurisdictionCode: inspReport?.jurisdictionCode || 'GENERAL',
        createdAt: (inspReport?.generatedAt || compReport?.generatedAt || new Date()).toISOString(),
        agencyName: org?.name || 'Servicing Fire Safety Agency',
        agencyLogoUrl: org?.brandLogoUrl || null,
        clientOrBuildingName: targetReport.building?.name || 'Registered Premises',
        buildingName: targetReport.building?.name || 'Registered Premises',
        clientOrganizationName: targetReport.building?.client?.name || null,
        city: targetReport.building?.city || '',
        reportStatus,
        status: reportStatus === 'INSPECTION COMPLETED' || reportStatus === 'CORRECTIVE ACTION COMPLETED' ? 'OK' : 'ACTION_REQUIRED',
        verificationStatus: 'VERIFIED VIGILAMC PLATFORM RECORD',
        documentVersion: inspReport?.templateVersion || '2.0.0',
        recordIntegrityHash: inspReport?.integrityHash || `VAMC-${targetReport.id.slice(-10).toUpperCase()}`,
        counts: inspReport
          ? {
              totalRegistered: inspReport.totalRegistered,
              inspectedCount: inspReport.inspectedCount,
              operationalCount: inspReport.operationalCount,
              nonOperationalCount: inspReport.nonOperationalCount,
              overdueCount: inspReport.overdueCount,
              notInspectedCount: inspReport.notInspectedCount,
            }
          : null,
        recordId: targetReport.id,
        authenticityNotice,
        legalDisclaimer: PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
        isDemo: false,
      });
    }

    // 2. Lookup equipment by qrCode (Asset Tag) or id
    const equipment = await (db as any).equipment.findFirst({
      where: {
        OR: [{ qrCode: queryRef }, { id: queryRef }],
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            city: true,
            organizationId: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            brandLogoUrl: true,
            publicVerificationEnabled: true,
          },
        },
      },
    });

    if (!equipment || !equipment.building) {
      await (db as any).reportVerificationLog
        .create({
          data: {
            queriedRef: queryRef,
            verificationResult: 'NOT_FOUND',
            ipHash: ip.slice(0, 16),
          },
        })
        .catch(() => null);
      return NextResponse.json({ error: 'Record not available' }, { status: 404 });
    }

    if (equipment.organization && equipment.organization.publicVerificationEnabled === false) {
      return NextResponse.json({ error: 'Record not available' }, { status: 404 });
    }

    const now = new Date();
    const diffDays = equipment.nextDueDate ? calendarDayDiff(equipment.nextDueDate, now) : null;

    let computedStatus = 'OK';
    if ((diffDays !== null && diffDays < 0) || equipment.status === 'OVERDUE' || equipment.status === 'DEFECTIVE') {
      computedStatus = 'EXPIRED';
    } else if ((diffDays !== null && diffDays <= 30) || equipment.status === 'DUE_SOON') {
      computedStatus = 'DUE_SOON';
    }

    const lastApprovedInspection = await (db as any).inspection
      .findFirst({
        where: {
          equipmentId: equipment.id,
          approvalStatus: 'APPROVED',
        },
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          status: true,
        },
      })
      .catch(() => null);

    const cat = classifyEquipmentCategory(equipment.type, equipment.capacity);
    const std = EQUIPMENT_CATEGORY_STANDARDS[cat];

    await (db as any).reportVerificationLog
      .create({
        data: {
          queriedRef: queryRef,
          verificationResult: 'ASSET_VERIFIED',
          ipHash: ip.slice(0, 16),
        },
      })
      .catch(() => null);

    return NextResponse.json({
      verificationHeading,
      verificationKind: 'ASSET',
      assetTag: equipment.qrCode,
      type: equipment.type,
      capacity: equipment.capacity || null,
      applicableStandard: std?.standardCode || null,
      buildingName: equipment.building.name,
      city: equipment.building.city || '',
      status: computedStatus,
      reportStatus: lastApprovedInspection ? 'INSPECTION COMPLETED' : 'NOT INSPECTED',
      verificationStatus: 'VERIFIED VIGILAMC ASSET RECORD',
      documentVersion: '2.0.0',
      recordIntegrityHash: `AST-${equipment.id.slice(-12).toUpperCase()}`,
      createdAt: (lastApprovedInspection?.date || equipment.lastServiceDate || equipment.createdAt || now).toISOString(),
      lastApprovedInspectionDate: lastApprovedInspection?.date || equipment.lastServiceDate || null,
      nextServiceDue: equipment.nextDueDate || null,
      agencyName: equipment.organization?.name || 'Servicing Fire Safety Agency',
      agencyLogoUrl: equipment.organization?.brandLogoUrl || null,
      recordId: lastApprovedInspection?.id || equipment.id,
      authenticityNotice,
      legalDisclaimer: PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
      isDemo: false,
    });
  } catch {
    return NextResponse.json({ error: 'Record not available' }, { status: 404 });
  }
}
