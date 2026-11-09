import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateFormBReportPdf, FormBReportData } from '@/lib/pdf/generateFormBReport';
import { sendFormBReportEmail, EmailSenderInfo } from '@/lib/email';
import { calculateBuildingCompliance, computeReportIntegrityHash } from '@/lib/compliance-engine';
import { toCalendarDateInput, formatCalendarDate } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { buildingId, to, cc, subject, message } = body;

    if (!buildingId || typeof buildingId !== 'string') {
      return NextResponse.json({ error: 'buildingId is required' }, { status: 400 });
    }

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ error: 'A valid recipient email (to) is required' }, { status: 400 });
    }

    const orgId = auth.organization?.id || null;

    const building = await (db as any).building.findUnique({
      where: { id: buildingId },
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
                technician: {
                  select: {
                    id: true,
                    fullName: true,
                    employeeId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    if (orgId && building.organizationId && building.organizationId !== orgId) {
      return NextResponse.json({ error: 'Access is denied' }, { status: 403 });
    }

    const org = auth.organization || {};
    const profile = auth.profile || {};

    const companyData = {
      name: org.name || 'Vigil Fire & Safety Solutions',
      licenseNumber: org.licenseNumber || null,
      gstin: org.gstin || null,
      phone: org.phone || profile.phone || '+91 98201 54321',
      email: org.email || auth.user.email || 'compliance@vigilfire.in',
      address: org.address ? `${org.address}${org.city ? `, ${org.city}` : ''}` : 'New Delhi, India',
      signatoryName: org.signatoryName || profile.fullName || 'Authorized Signatory',
      signatoryDesignation: org.signatoryDesignation || (profile.role === 'ORG_ADMIN' ? 'Authorized Agency Signatory' : 'Managing Director'),
      isLicenseVerified: Boolean(org.licenseNumber),
      licenseVerificationLabel: org.licenseNumber ? 'Verified Private Agency' : 'Unverified',
    };

    const complianceResult = calculateBuildingCompliance({
      equipments: building.equipments || [],
      defects: building.defects || [],
    });

    const refNum = `VAMC-${building.id.slice(0, 8).toUpperCase()}`;
    const integrityHash = computeReportIntegrityHash({
      reportReferenceId: refNum,
      buildingId: building.id,
      generatedAtIso: new Date().toISOString(),
      totalRegistered: complianceResult.counts.totalRegistered,
      operationalCount: complianceResult.counts.operationalCount,
      nonOperationalCount: complianceResult.counts.nonOperationalCount,
      notInspectedCount: complianceResult.counts.notInspectedCount,
      inspectionStatus: complianceResult.reportStatus,
    });

    // Find latest inspection with GPS if available
    let latestGps: any = null;
    for (const eq of building.equipments || []) {
      const ins = eq.inspections?.[0];
      if (ins) {
        latestGps = {
          technicianName: ins.technician?.fullName || null,
          inspectedAt: ins.date,
        };
        break;
      }
    }
    if (building.latitude && building.longitude) {
      latestGps = {
        ...(latestGps || {}),
        latitude: building.latitude,
        longitude: building.longitude,
      };
    }

    const reportData: FormBReportData = {
      building: {
        id: building.id,
        name: building.name,
        address: building.address,
        city: building.city,
        state: building.state,
        occupancyType: building.occupancyType,
        buildingHeight: building.buildingHeight,
        localAuthority: building.localAuthority,
        fscNumber: building.fscNumber,
        fscValidityDate: building.fscValidityDate,
        fireNocNumber: building.fireNocNumber,
        fireNocIssueDate: building.fireNocIssueDate,
        fireNocExpiryDate: building.fireNocExpiryDate,
        reportingCycle: building.reportingCycle || 'Half-Yearly',
        client: building.client
          ? {
              id: building.client.id,
              name: building.client.name,
              contactPerson: building.client.contactPerson,
              phone: building.client.phone,
              email: building.client.email,
            }
          : null,
      },
      company: companyData,
      reportMetadata: {
        reportReferenceId: refNum,
        reportTypeName: 'Fire Safety Inspection & Maintenance Report',
        reportingPeriod: `${building.reportingCycle || 'Half-Yearly'} Statutory Cycle`,
        templateVersion: '2.0.0',
        integrityHash,
        verificationUrl: `https://vigilamc.com/verify/${encodeURIComponent(refNum)}`,
      },
      compliance: {
        reportStatus: complianceResult.reportStatus,
        statusBadgeColor: complianceResult.statusBadgeColor,
        compliancePercentage: complianceResult.compliancePercentage,
        statusBannerMessage: complianceResult.statusBannerMessage,
        counts: complianceResult.counts,
      },
      equipments: building.equipments,
      defects: building.defects,
      latestGpsInspection: latestGps,
    };

    const pdfBuffer = await generateFormBReportPdf(reportData);

    const safeDateStr = toCalendarDateInput(new Date());
    const safeBuildingSlug = building.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfFilename = `Form-B-Report-${safeBuildingSlug}-${safeDateStr}.pdf`;

    const sender: EmailSenderInfo = {
      name: profile.fullName || auth.user.email.split('@')[0],
      role: profile.role === 'ORG_ADMIN' ? 'Authorized Agency Signatory' : (profile.role || 'Service Manager'),
      agencyName: companyData.name,
      phone: profile.phone || companyData.phone,
      email: auth.user.email,
    };

    const defaultSubject = `VigilAMC — Form B Report: ${building.name} · ${safeDateStr}`.slice(0, 60);
    const finalSubject = (subject && typeof subject === 'string' && subject.trim()) ? subject.trim().slice(0, 60) : defaultSubject;

    const emailResult = await sendFormBReportEmail({
      to: to.trim(),
      cc: (cc && typeof cc === 'string' && cc.trim()) ? cc.trim() : 'support@vigilamc.com',
      subject: finalSubject,
      message: (message && typeof message === 'string') ? message.trim() : null,
      buildingId: building.id,
      buildingName: building.name,
      reportRef: refNum,
      pdfBuffer,
      pdfFilename,
      sender,
      organizationId: orgId,
      createdById: profile.id || null,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: emailResult.message || 'Failed to dispatch email via Resend',
          errorCode: emailResult.errorCode,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      isDevSimulation: Boolean(emailResult.isDevSimulation),
      sentAt: new Date().toISOString(),
      filename: pdfFilename,
      size: pdfBuffer.length,
      refNum,
    });
  } catch (error: any) {
    console.error('[API /api/reports/email Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while processing Form B email' },
      { status: 500 }
    );
  }
}
