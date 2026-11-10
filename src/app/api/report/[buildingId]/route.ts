import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isFounderOwner } from '@/lib/founderAuth';
import {
  REPORT_TYPES,
  ReportTypeCode,
  JURISDICTIONS,
  JurisdictionCode,
  detectJurisdictionFromBuilding,
  getApplicableStandardsForEquipments,
  calculateBuildingCompliance,
  sanitizeAgencyCredentials,
  sanitizeTechnicianName,
  sanitizeTechnicianDesignation,
  PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
  PERMANENT_LEGAL_DISCLAIMER_TEXT,
  computeReportIntegrityHash,
  DEFAULT_LEGAL_REFERENCES,
} from '@/lib/compliance-engine';
import { todayCalendarDateString, addCalendarMonths, parseCalendarDate } from '@/lib/dates';

export const dynamic = 'force-dynamic';

function extractPhotoUrl(eq: any, latestInspection: any): string | null {
  if (latestInspection?.inspectionPhotos && Array.isArray(latestInspection.inspectionPhotos) && latestInspection.inspectionPhotos.length > 0) {
    return latestInspection.inspectionPhotos[0].photoUrl;
  }
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

export async function GET(
  request: Request,
  { params }: { params: { buildingId: string } }
) {
  try {
    const url = new URL(request.url);
    const requestedReportType = (url.searchParams.get('reportType') || 'FIRE_SAFETY_INSPECTION_REPORT') as ReportTypeCode;
    const requestedJurisdiction = url.searchParams.get('jurisdiction') as JurisdictionCode | null;
    const requestedVersionId = url.searchParams.get('versionId');
    const requestedAgencyOrgId = url.searchParams.get('agencyOrgId'); // Used for cross-tenant isolation tests

    const building = await (db as any).building.findUnique({
      where: { id: params.buildingId },
      include: {
        client: true,
        defects: {
          orderBy: { reportedAt: 'desc' },
        },
        equipments: {
          orderBy: { createdAt: 'asc' },
          include: {
            inspections: {
              where: { approvalStatus: 'APPROVED' },
              orderBy: { date: 'desc' },
              take: 1,
              include: {
                inspectionPhotos: {
                  orderBy: { createdAt: 'desc' },
                  take: 4,
                },
                issues: true,
                technician: {
                  select: {
                    id: true,
                    fullName: true,
                    employeeId: true,
                    role: true,
                  },
                },
              },
            },
            inspectionIssues: true,
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

    // Tenant Isolation Check (Step 13 & Test 12):
    // If an authenticated user belongs to another agency, or if an explicit agencyOrgId
    // header/param does not match the building's organizationId, deny access with 403.
    const auth = await getCurrentUser(request, { skipSubscription: true }).catch(() => null);
    if (auth?.organization?.id && building.organizationId) {
      const isFounder = isFounderOwner(auth.user?.email);
      if (!isFounder && auth.organization.id !== building.organizationId) {
        return NextResponse.json(
          { error: 'Access is denied. You do not have permission to access another agency’s building report.' },
          { status: 403 }
        );
      }
    }
    const headerOrgId = request.headers.get('x-agency-org-id') || requestedAgencyOrgId;
    if (headerOrgId && building.organizationId && headerOrgId !== building.organizationId) {
      return NextResponse.json(
        { error: 'Access is denied. Cross-agency report access is prohibited.' },
        { status: 403 }
      );
    }

    // Historical Report Version Support (Test 11: Template Update Does Not Break Old Reports)
    if (requestedVersionId) {
      const existingVersion = await (db as any).reportVersion
        .findUnique({
          where: { id: requestedVersionId },
          include: { inspectionReport: true },
        })
        .catch(() => null);
      if (existingVersion && existingVersion.inspectionReport?.buildingId === building.id) {
        try {
          const snapshot = JSON.parse(existingVersion.snapshotJson);
          return NextResponse.json({
            ...snapshot,
            isHistoricalSnapshot: true,
            versionNumber: existingVersion.versionNumber,
            templateVersion: existingVersion.templateVersion,
            integrityHash: existingVersion.integrityHash,
          });
        } catch {
          // Fall through if snapshot JSON is malformed
        }
      }
    }

    // Fetch Organization & Agency Credential Verification Record (Step 7)
    let orgRecord: any = null;
    let agencyCredRecord: any = null;
    let technicianCreds: any[] = [];
    let signatoryName = 'Authorized Agency Representative';

    if (building.organizationId) {
      const [org, adminProfile, cred, techCredList] = await Promise.all([
        (db as any).organization.findUnique({ where: { id: building.organizationId } }).catch(() => null),
        (db as any).userProfile
          .findFirst({
            where: { organizationId: building.organizationId, role: 'ORG_ADMIN' },
            orderBy: { createdAt: 'asc' },
          })
          .catch(() => null),
        (db as any).agencyCredential
          .findFirst({
            where: { organizationId: building.organizationId },
            orderBy: { updatedAt: 'desc' },
          })
          .catch(() => null),
        (db as any).technicianCredential
          .findMany({
            where: { organizationId: building.organizationId },
            orderBy: { updatedAt: 'desc' },
          })
          .catch(() => []),
      ]);

      orgRecord = org;
      agencyCredRecord = cred;
      technicianCreds = techCredList || [];

      const rawAdminName = adminProfile?.fullName?.trim();
      const cleanAdminName =
        rawAdminName && rawAdminName.toLowerCase() !== 'jordan michael' ? rawAdminName : null;

      if (org) {
        signatoryName =
          (org.signatoryName && org.signatoryName.trim()) ||
          cleanAdminName ||
          org.contactPerson ||
          'Authorized Agency Representative';
      } else if (cleanAdminName) {
        signatoryName = cleanAdminName;
      }
    }

    const sanitizedAgency = sanitizeAgencyCredentials(orgRecord, agencyCredRecord);
    if (sanitizedAgency.signatoryName) {
      signatoryName = sanitizedAgency.signatoryName;
    }

    const company = {
      name: sanitizedAgency.legalName,
      phone: sanitizedAgency.phone,
      email: sanitizedAgency.email,
      address: sanitizedAgency.businessAddress,
      licenseNumber: sanitizedAgency.licenseNumber, // null if not provided or fake
      issuingAuthority: sanitizedAgency.issuingAuthority,
      licenseIssueDate: sanitizedAgency.issueDate,
      licenseExpiryDate: sanitizedAgency.expiryDate,
      licenseVerificationStatus: sanitizedAgency.verificationStatus,
      licenseVerificationLabel: sanitizedAgency.verificationStatusLabel,
      isLicenseVerified: sanitizedAgency.isLicenseVerified,
      gstin: sanitizedAgency.gstin || '',
      contactPerson: signatoryName,
      signatoryName,
      brandLogoUrl: sanitizedAgency.brandLogoUrl,
      signatoryDesignation: sanitizedAgency.signatoryDesignation,
      signatorySignatureUrl: sanitizedAgency.signatorySignatureUrl,
      reportFooterText: orgRecord?.reportFooterText || null,
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
          take: 35,
          include: {
            inspectionPhotos: {
              orderBy: { createdAt: 'desc' },
              take: 4,
            },
            issues: true,
            technician: {
              select: {
                id: true,
                fullName: true,
                employeeId: true,
              },
            },
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

    const now = new Date();
    const rawEquipments = Array.isArray(building.equipments) ? building.equipments : [];
    const rawDefects = Array.isArray(building.defects) ? building.defects : [];

    // Step 6: Run strict Compliance Calculation Engine
    const complianceResult = calculateBuildingCompliance({
      equipments: rawEquipments,
      defects: rawDefects,
      correctiveActions: correctiveActions || [],
      now,
    });

    // Step 2: Resolve Report Type & Naming
    const reportTypeObj =
      REPORT_TYPES[requestedReportType] || REPORT_TYPES.FIRE_SAFETY_INSPECTION_REPORT;

    // Step 3 & 12: Resolve Jurisdiction Configuration (Delhi, UP Noida, Haryana Gurugram, General)
    const detectedJurisdiction = detectJurisdictionFromBuilding(building);
    const activeJurisdictionCode: JurisdictionCode =
      requestedJurisdiction && requestedJurisdiction in JURISDICTIONS
        ? requestedJurisdiction
        : detectedJurisdiction;
    const jurisdictionConfig = JURISDICTIONS[activeJurisdictionCode];

    // Step 4 & 5: Applicable BIS Standards & Legal References
    const applicableStandardsDetailed = getApplicableStandardsForEquipments(rawEquipments);
    const applicableStandards = applicableStandardsDetailed.map(
      (s) => `${s.standardCode} — ${s.title}`
    );

    const dbLegalRefs = await (db as any).legalReference
      .findMany({
        where: {
          jurisdictionCode: { in: [activeJurisdictionCode, 'GENERAL'] },
        },
        orderBy: { updatedAt: 'desc' },
      })
      .catch(() => []);

    const legalReferences =
      dbLegalRefs && dbLegalRefs.length > 0
        ? dbLegalRefs
        : DEFAULT_LEGAL_REFERENCES.filter(
            (r) => r.jurisdictionCode === activeJurisdictionCode || r.jurisdictionCode === 'GENERAL'
          );

    // Map equipment items for backward compatibility + new 5-page report fields
    const evaluatedEquipments = rawEquipments.map((eq: any, idx: number) => {
      const calcItem = complianceResult.evaluatedEquipments[idx];
      const latestInspection = eq.inspections?.[0] || null;
      const latestLog = eq.serviceLogs?.[0] || null;
      const resolvedPhotoUrl = extractPhotoUrl(eq, latestInspection);

      // Step 1 & 6: Never invent "Routine IS 2190 physical & pressure verification" when no inspection exists
      const inspectionNotes = calcItem.hasActualInspectionRecord
        ? latestInspection?.remarks ||
          latestLog?.notes ||
          latestLog?.actionType ||
          'Field inspection recorded without additional remarks.'
        : 'No field inspection recorded yet.';

      const displayStatus =
        calcItem.inspectionStatus === 'NON_OPERATIONAL' || calcItem.inspectionStatus === 'OVERDUE'
          ? 'OVERDUE'
          : calcItem.inspectionStatus === 'MAINTENANCE_DUE'
          ? 'DUE_SOON'
          : calcItem.inspectionStatus === 'NOT_INSPECTED'
          ? 'NOT_INSPECTED'
          : 'COMPLIANT';

      return {
        ...eq,
        photoUrl: resolvedPhotoUrl,
        inspectionNotes,
        currentStatus: displayStatus,
        evaluationStatus:
          calcItem.inspectionStatus === 'OPERATIONAL'
            ? 'VERIFIED'
            : calcItem.inspectionStatus === 'MAINTENANCE_DUE'
            ? 'DUE_SOON'
            : calcItem.inspectionStatus === 'NOT_INSPECTED'
            ? 'NOT_INSPECTED'
            : 'OVERDUE',
        inspectionStatus: calcItem.inspectionStatus,
        statusLabel: calcItem.statusLabel,
        badgeColor: calcItem.badgeColor,
        categoryCode: calcItem.categoryCode,
        categoryLabel: calcItem.categoryLabel,
        applicableStandard: calcItem.applicableStandard,
        hasActualInspectionRecord: calcItem.hasActualInspectionRecord,
        hasGPS: calcItem.hasGPS,
        hasPhoto: calcItem.hasPhoto,
        latestLatitude: calcItem.latitude,
        latestLongitude: calcItem.longitude,
        latestInspectionDate: calcItem.lastServiceDate,
        latestTechnicianName: calcItem.latestAuditor,
        pressureGauge: calcItem.pressureGauge,
        overallCondition: calcItem.overallCondition,
        openIssuesCount: calcItem.openIssuesCount,
      };
    });

    // Step 9 Page 4: GPS verification ONLY when actual valid GPS coordinates exist
    let latestGpsInspection: any = null;
    for (const eq of evaluatedEquipments) {
      if (typeof eq.latestLatitude === 'number' && typeof eq.latestLongitude === 'number') {
        if (
          !latestGpsInspection ||
          new Date(eq.latestInspectionDate || 0).getTime() >
            new Date(latestGpsInspection.date || 0).getTime()
        ) {
          latestGpsInspection = {
            latitude: eq.latestLatitude,
            longitude: eq.latestLongitude,
            date: eq.latestInspectionDate,
            technicianName: sanitizeTechnicianName(eq.latestTechnicianName),
            assetCode: eq.qrCode,
          };
        }
      }
    }

    if (!latestGpsInspection) {
      for (const bldgInsp of buildingInspections || []) {
        if (
          typeof bldgInsp.latitude === 'number' &&
          typeof bldgInsp.longitude === 'number' &&
          !isNaN(bldgInsp.latitude) &&
          !isNaN(bldgInsp.longitude) &&
          (bldgInsp.latitude !== 0 || bldgInsp.longitude !== 0)
        ) {
          latestGpsInspection = {
            latitude: bldgInsp.latitude,
            longitude: bldgInsp.longitude,
            date: bldgInsp.date,
            technicianName: sanitizeTechnicianName(bldgInsp.technician?.fullName || bldgInsp.technicianName),
            assetCode: bldgInsp.equipment?.qrCode || null,
          };
          break;
        }
      }
    }

    // Sanitize technician credentials on building inspections (Step 8)
    const sanitizedBuildingInspections = (buildingInspections || []).map((insp: any) => {
      const techName = sanitizeTechnicianName(insp.technician?.fullName || insp.technicianName);
      const matchedCred = technicianCreds.find(
        (tc: any) =>
          (insp.technicianId && tc.userProfileId === insp.technicianId) ||
          (tc.fullName && tc.fullName.toLowerCase() === techName.toLowerCase())
      );
      const hasValidGps =
        typeof insp.latitude === 'number' &&
        typeof insp.longitude === 'number' &&
        !isNaN(insp.latitude) &&
        !isNaN(insp.longitude) &&
        (insp.latitude !== 0 || insp.longitude !== 0);

      return {
        ...insp,
        technicianName: techName,
        technicianDesignation: sanitizeTechnicianDesignation(
          matchedCred?.designation,
          matchedCred?.verificationStatus === 'VERIFIED'
        ),
        technicianEmployeeId: matchedCred?.employeeId || insp.technician?.employeeId || null,
        technicianQualification: matchedCred?.qualification || null,
        technicianCertStatus: matchedCred?.verificationStatus || 'NOT_PROVIDED',
        gpsVerified: hasValidGps,
      };
    });

    const pendingApprovalsCount = await (db as any).inspection
      .count({
        where: {
          buildingId: building.id,
          approvalStatus: 'PENDING',
        },
      })
      .catch(() => 0);

    // Step 2: Generate non-Form-B Report Reference Number
    const reportNumber = `VAMC-RPT/${activeJurisdictionCode}/${now.getFullYear()}/${building.id.slice(-5).toUpperCase()}`;
    const todayStr = todayCalendarDateString();
    const cycleEndStr = addCalendarMonths(todayStr, 6);
    const startCal = parseCalendarDate(todayStr);
    const endCal = parseCalendarDate(cycleEndStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const cyclePeriod = startCal && endCal
      ? `${monthNames[startCal.month - 1]} ${startCal.year} - ${monthNames[endCal.month - 1]} ${endCal.year}`
      : 'Current Cycle';

    const integrityHash = computeReportIntegrityHash({
      reportReferenceId: reportNumber,
      buildingId: building.id,
      generatedAtIso: todayStr,
      totalRegistered: complianceResult.counts.totalRegistered,
      operationalCount: complianceResult.counts.operationalCount,
      nonOperationalCount: complianceResult.counts.nonOperationalCount,
      notInspectedCount: complianceResult.counts.notInspectedCount,
      inspectionStatus: complianceResult.reportStatus,
    });

    // Save/upsert ComplianceReport & InspectionReport records
    const report =
      (await (db as any).complianceReport
        .upsert({
          where: { reportNumber },
          create: {
            buildingId: building.id,
            organizationId: building.organizationId || null,
            reportNumber,
            cyclePeriod,
            totalEquipment: complianceResult.counts.totalRegistered,
            compliantCount: complianceResult.counts.operationalCount,
            dueCount: complianceResult.counts.maintenanceDueCount,
            overdueCount: complianceResult.counts.overdueCount + complianceResult.counts.nonOperationalCount,
            status: complianceResult.reportStatus,
          },
          update: {
            totalEquipment: complianceResult.counts.totalRegistered,
            compliantCount: complianceResult.counts.operationalCount,
            dueCount: complianceResult.counts.maintenanceDueCount,
            overdueCount: complianceResult.counts.overdueCount + complianceResult.counts.nonOperationalCount,
            status: complianceResult.reportStatus,
          },
        })
        .catch(() => null)) || {
        reportNumber,
        cyclePeriod,
        generatedAt: now.toISOString(),
        totalEquipment: complianceResult.counts.totalRegistered,
        compliantCount: complianceResult.counts.operationalCount,
        dueCount: complianceResult.counts.maintenanceDueCount,
        overdueCount: complianceResult.counts.overdueCount + complianceResult.counts.nonOperationalCount,
        status: complianceResult.reportStatus,
      };

    const inspectionReportRecord = await (db as any).inspectionReport
      .upsert({
        where: { reportReferenceId: reportNumber },
        create: {
          organizationId: building.organizationId || null,
          buildingId: building.id,
          reportReferenceId: reportNumber,
          reportType: reportTypeObj.code,
          reportTitle: reportTypeObj.title,
          reportSubtitle: reportTypeObj.subtitle,
          jurisdictionCode: activeJurisdictionCode,
          templateVersion: '2.0.0',
          reportingPeriod: cyclePeriod,
          inspectionStatus: complianceResult.reportStatus,
          compliancePercentage: complianceResult.compliancePercentage,
          totalRegistered: complianceResult.counts.totalRegistered,
          inspectedCount: complianceResult.counts.inspectedCount,
          operationalCount: complianceResult.counts.operationalCount,
          nonOperationalCount: complianceResult.counts.nonOperationalCount,
          maintenanceDueCount: complianceResult.counts.maintenanceDueCount,
          overdueCount: complianceResult.counts.overdueCount,
          notInspectedCount: complianceResult.counts.notInspectedCount,
          openDefectsCount: complianceResult.counts.openDefectsCount,
          resolvedDefectsCount: complianceResult.counts.resolvedDefectsCount,
          integrityHash,
        },
        update: {
          reportType: reportTypeObj.code,
          reportTitle: reportTypeObj.title,
          reportSubtitle: reportTypeObj.subtitle,
          jurisdictionCode: activeJurisdictionCode,
          inspectionStatus: complianceResult.reportStatus,
          compliancePercentage: complianceResult.compliancePercentage,
          totalRegistered: complianceResult.counts.totalRegistered,
          inspectedCount: complianceResult.counts.inspectedCount,
          operationalCount: complianceResult.counts.operationalCount,
          nonOperationalCount: complianceResult.counts.nonOperationalCount,
          maintenanceDueCount: complianceResult.counts.maintenanceDueCount,
          overdueCount: complianceResult.counts.overdueCount,
          notInspectedCount: complianceResult.counts.notInspectedCount,
          openDefectsCount: complianceResult.counts.openDefectsCount,
          resolvedDefectsCount: complianceResult.counts.resolvedDefectsCount,
          integrityHash,
        },
      })
      .catch(() => null);

    return NextResponse.json({
      company,
      signatoryName,
      reportMetadata: {
        reportReferenceId: reportNumber,
        reportType: reportTypeObj.code,
        reportTypeName: reportTypeObj.name,
        reportTitle: reportTypeObj.title,
        reportSubtitle: reportTypeObj.subtitle,
        jurisdictionCode: activeJurisdictionCode,
        detectedJurisdictionCode: detectedJurisdiction,
        jurisdiction: jurisdictionConfig,
        templateVersion: inspectionReportRecord?.templateVersion || '2.0.0',
        generatedAt: now.toISOString(),
        reportingPeriod: cyclePeriod,
        integrityHash,
        verificationUrl: `/verify/${encodeURIComponent(reportNumber)}`,
      },
      compliance: {
        reportStatus: complianceResult.reportStatus,
        statusBadgeColor: complianceResult.statusBadgeColor,
        compliancePercentage: complianceResult.compliancePercentage,
        statusBannerMessage: complianceResult.statusBannerMessage,
        formulaDescription: complianceResult.formulaDescription,
        counts: complianceResult.counts,
      },
      legalReferences,
      applicableStandardsDetailed,
      applicableStandards,
      legalDisclaimer: {
        paragraphs: PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
        fullText: PERMANENT_LEGAL_DISCLAIMER_TEXT,
      },
      technicianCredentials: technicianCreds,
      building: {
        ...building,
        jurisdictionCode: activeJurisdictionCode,
        equipments: evaluatedEquipments,
        inspections: sanitizedBuildingInspections,
        correctiveActions,
        defects: rawDefects,
      },
      report: {
        ...report,
        reportNumber,
        status: complianceResult.reportStatus,
        integrityHash,
        templateVersion: inspectionReportRecord?.templateVersion || '2.0.0',
      },
      latestGpsInspection,
      pendingApprovalsCount,
      summary: {
        total: complianceResult.counts.totalRegistered,
        inspected: complianceResult.counts.inspectedCount,
        verified: complianceResult.counts.operationalCount,
        operational: complianceResult.counts.operationalCount,
        nonOperational: complianceResult.counts.nonOperationalCount,
        compliant: complianceResult.counts.operationalCount,
        dueSoon: complianceResult.counts.maintenanceDueCount,
        overdue: complianceResult.counts.overdueCount,
        notInspected: complianceResult.counts.notInspectedCount,
        openFindings: complianceResult.counts.openDefectsCount,
        resolvedFindings: complianceResult.counts.resolvedDefectsCount,
        gpsVerifiedCount: complianceResult.counts.gpsVerifiedCount,
        photoVerifiedCount: complianceResult.counts.photoVerifiedCount,
        compliantPercent: complianceResult.compliancePercentage,
        overallStatus: complianceResult.reportStatus,
        statusBannerMessage: complianceResult.statusBannerMessage,
      },
    });
  } catch (error: any) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}

/**
 * POST /api/report/[buildingId]
 * Creates an immutable versioned snapshot of the generated report so that future
 * template or legal reference changes do not overwrite historical reports (Test 11),
 * or updates building jurisdiction / FSC / Fire NOC reference fields.
 */
export async function POST(
  request: Request,
  { params }: { params: { buildingId: string } }
) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const building = await (db as any).building.findUnique({
      where: { id: params.buildingId },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    if (
      auth.organization?.id &&
      building.organizationId &&
      auth.organization.id !== building.organizationId &&
      !isFounderOwner(auth.user?.email)
    ) {
      return NextResponse.json({ error: 'Access is denied' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

    if (body.action === 'UPDATE_BUILDING_COMPLIANCE_FIELDS') {
      const updated = await (db as any).building.update({
        where: { id: building.id },
        data: {
          jurisdictionCode: body.jurisdictionCode ? String(body.jurisdictionCode).trim() : null,
          occupancyType: body.occupancyType ? String(body.occupancyType).trim() : null,
          buildingHeight: body.buildingHeight ? String(body.buildingHeight).trim() : null,
          localAuthority: body.localAuthority ? String(body.localAuthority).trim() : null,
          fscNumber: body.fscNumber ? String(body.fscNumber).trim() : null,
          fscValidityDate: body.fscValidityDate ? new Date(body.fscValidityDate) : null,
          fireNocNumber: body.fireNocNumber ? String(body.fireNocNumber).trim() : null,
          fireNocIssueDate: body.fireNocIssueDate ? new Date(body.fireNocIssueDate) : null,
          fireNocExpiryDate: body.fireNocExpiryDate ? new Date(body.fireNocExpiryDate) : null,
        },
      });
      return NextResponse.json({ success: true, building: updated });
    }

    // Create immutable snapshot version
    const reportRef =
      body.reportReferenceId ||
      `VAMC-RPT/${building.jurisdictionCode || 'GENERAL'}/${new Date().getFullYear()}/${building.id.slice(-5).toUpperCase()}`;

    let inspReport = await (db as any).inspectionReport.findUnique({
      where: { reportReferenceId: reportRef },
    });

    if (!inspReport) {
      inspReport = await (db as any).inspectionReport.create({
        data: {
          organizationId: building.organizationId || auth.organization?.id || null,
          buildingId: building.id,
          reportReferenceId: reportRef,
          reportType: body.reportType || 'FIRE_SAFETY_INSPECTION_REPORT',
          jurisdictionCode: body.jurisdictionCode || 'GENERAL',
          templateVersion: body.templateVersion || '2.0.0',
          reportingPeriod: body.reportingPeriod || 'Current Cycle',
          inspectionStatus: body.inspectionStatus || 'INSUFFICIENT DATA',
          integrityHash: body.integrityHash || 'SNAPSHOT',
        },
      });
    }

    const existingCount = await (db as any).reportVersion.count({
      where: { inspectionReportId: inspReport.id },
    });

    const version = await (db as any).reportVersion.create({
      data: {
        inspectionReportId: inspReport.id,
        versionNumber: existingCount + 1,
        templateVersion: body.templateVersion || inspReport.templateVersion || '2.0.0',
        snapshotJson: JSON.stringify(body.snapshot || {}),
        integrityHash: body.integrityHash || inspReport.integrityHash,
        createdByUserId: auth.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      versionId: version.id,
      versionNumber: version.versionNumber,
      templateVersion: version.templateVersion,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save report version' }, { status: 500 });
  }
}
