import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  REPORT_TYPES,
  JURISDICTIONS,
  EQUIPMENT_CATEGORY_STANDARDS,
  DEFAULT_LEGAL_REFERENCES,
  sanitizeAgencyCredentials,
  sanitizeTechnicianDesignation,
} from '@/lib/compliance-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = auth.organization?.id || null;

    const [
      dbTemplates,
      dbLegalRefs,
      agencyCredentials,
      technicianCredentials,
      inspectionReports,
      verificationLogs,
      orgUsers,
    ] = await Promise.all([
      (db as any).jurisdictionTemplate
        .findMany({
          where: orgId ? { OR: [{ organizationId: orgId }, { organizationId: null }] } : {},
          orderBy: { updatedAt: 'desc' },
        })
        .catch(() => []),
      (db as any).legalReference
        .findMany({
          where: orgId ? { OR: [{ organizationId: orgId }, { organizationId: null }] } : {},
          orderBy: { updatedAt: 'desc' },
        })
        .catch(() => []),
      orgId
        ? (db as any).agencyCredential
            .findMany({
              where: { organizationId: orgId },
              orderBy: { updatedAt: 'desc' },
            })
            .catch(() => [])
        : Promise.resolve([]),
      orgId
        ? (db as any).technicianCredential
            .findMany({
              where: { organizationId: orgId },
              orderBy: { updatedAt: 'desc' },
            })
            .catch(() => [])
        : Promise.resolve([]),
      orgId
        ? (db as any).inspectionReport
            .findMany({
              where: { organizationId: orgId },
              orderBy: { generatedAt: 'desc' },
              take: 50,
              include: {
                building: {
                  select: { id: true, name: true, city: true, state: true },
                },
                versions: {
                  orderBy: { versionNumber: 'desc' },
                  select: {
                    id: true,
                    versionNumber: true,
                    templateVersion: true,
                    integrityHash: true,
                    createdAt: true,
                  },
                },
              },
            })
            .catch(() => [])
        : Promise.resolve([]),
      (db as any).reportVerificationLog
        .findMany({
          orderBy: { verifiedAt: 'desc' },
          take: 25,
        })
        .catch(() => []),
      orgId
        ? (db as any).userProfile
            .findMany({
              where: { organizationId: orgId, role: 'TECHNICIAN' },
              select: { id: true, fullName: true, email: true, employeeId: true },
            })
            .catch(() => [])
        : Promise.resolve([]),
    ]);

    // Seed default templates in response if DB has none yet
    const defaultTemplates = [
      {
        id: 'tpl-delhi-amc',
        code: 'DELHI',
        state: 'National Capital Territory of Delhi',
        city: 'Delhi',
        templateName: 'Delhi AMC Inspection Report',
        reportType: 'FIRE_SAFETY_INSPECTION_REPORT',
        isStatutoryForm: false,
        statutoryFormCode: null,
        statutoryPurpose: 'Private Agency Fire Equipment Inspection & Maintenance Report (Delhi Jurisdiction)',
        issuingAuthority: 'Servicing AMC Agency (Non-Statutory)',
        status: 'ACTIVE',
        version: '2.0.0',
        effectiveDate: '2026-01-01T00:00:00.000Z',
        verifiedBy: 'System Compliance Audit',
      },
      {
        id: 'tpl-delhi-form-b-statutory',
        code: 'DELHI',
        state: 'National Capital Territory of Delhi',
        city: 'Delhi',
        templateName: 'Delhi Form-B (Application for Stand-by Duty — Statutory Reference Only)',
        reportType: 'STATUTORY_REFERENCE',
        isStatutoryForm: true,
        statutoryFormCode: 'DELHI_FORM_B',
        statutoryPurpose: 'Application for Stand-by Duty under Delhi Fire Service Rules, 2010 (NOT an AMC Inspection Certificate)',
        issuingAuthority: 'Applicant to Director, Delhi Fire Service',
        status: 'DRAFT_PENDING_LEGAL_REVIEW',
        version: '1.0.0',
        effectiveDate: '2010-01-01T00:00:00.000Z',
        verifiedBy: null,
      },
      {
        id: 'tpl-delhi-form-h-statutory',
        code: 'DELHI',
        state: 'National Capital Territory of Delhi',
        city: 'Delhi',
        templateName: 'Delhi Form-H (Fire Safety Certificate — Issued Only by Delhi Fire Service)',
        reportType: 'STATUTORY_REFERENCE',
        isStatutoryForm: true,
        statutoryFormCode: 'DELHI_FORM_H',
        statutoryPurpose: 'Prescribed Fire Safety Certificate issued by Director, Delhi Fire Service',
        issuingAuthority: 'Director, Delhi Fire Service (Govt. of NCT of Delhi)',
        status: 'DRAFT_PENDING_LEGAL_REVIEW',
        version: '1.0.0',
        effectiveDate: '2010-01-01T00:00:00.000Z',
        verifiedBy: null,
      },
      {
        id: 'tpl-noida-amc',
        code: 'UP_NOIDA',
        state: 'Uttar Pradesh',
        city: 'Noida',
        templateName: 'Noida Inspection & Maintenance Report',
        reportType: 'FIRE_SAFETY_INSPECTION_REPORT',
        isStatutoryForm: false,
        statutoryFormCode: null,
        statutoryPurpose: 'Private Agency Fire Equipment Inspection & Maintenance Report (Noida / UP Jurisdiction)',
        issuingAuthority: 'Servicing AMC Agency (Non-Statutory)',
        status: 'ACTIVE',
        version: '2.0.0',
        effectiveDate: '2026-01-01T00:00:00.000Z',
        verifiedBy: 'System Compliance Audit',
      },
      {
        id: 'tpl-gurugram-amc',
        code: 'HR_GURUGRAM',
        state: 'Haryana',
        city: 'Gurugram',
        templateName: 'Gurugram Inspection & Maintenance Report',
        reportType: 'FIRE_SAFETY_INSPECTION_REPORT',
        isStatutoryForm: false,
        statutoryFormCode: null,
        statutoryPurpose: 'Private Agency Fire Equipment Inspection & Maintenance Report (Gurugram / Haryana Jurisdiction)',
        issuingAuthority: 'Servicing AMC Agency (Non-Statutory)',
        status: 'ACTIVE',
        version: '2.0.0',
        effectiveDate: '2026-01-01T00:00:00.000Z',
        verifiedBy: 'System Compliance Audit',
      },
    ];

    const sanitizedAgency = sanitizeAgencyCredentials(
      auth.organization,
      agencyCredentials?.[0] || null
    );

    return NextResponse.json({
      jurisdictions: Object.values(JURISDICTIONS),
      reportTypes: Object.values(REPORT_TYPES),
      templates: dbTemplates.length > 0 ? dbTemplates : defaultTemplates,
      legalReferences:
        dbLegalRefs.length > 0
          ? dbLegalRefs
          : DEFAULT_LEGAL_REFERENCES.map((r, i) => ({ id: `seed-ref-${i + 1}`, ...r })),
      applicableStandardsCatalog: Object.values(EQUIPMENT_CATEGORY_STANDARDS),
      agencyCredential: sanitizedAgency,
      agencyCredentialRecords: agencyCredentials,
      technicianCredentials,
      techniciansList: orgUsers,
      reportHistory: inspectionReports,
      verificationLogs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load compliance management data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request, { skipSubscription: true });
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = auth.organization?.id || null;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action;

    // 1. Create or Update Legal Reference (Step 4)
    if (action === 'UPSERT_LEGAL_REFERENCE') {
      const isReviewedByAdmin = Boolean(body.approveNow && auth.profile?.role === 'ORG_ADMIN');
      const data = {
        organizationId: orgId,
        jurisdictionCode: body.jurisdictionCode || 'GENERAL',
        state: String(body.state || '').trim() || 'India',
        city: String(body.city || '').trim() || 'General',
        department: String(body.department || '').trim() || 'Fire & Emergency Services',
        actName: String(body.actName || '').trim(),
        ruleNumber: body.ruleNumber ? String(body.ruleNumber).trim() : null,
        notificationNumber: body.notificationNumber ? String(body.notificationNumber).trim() : null,
        applicableStandard: body.applicableStandard ? String(body.applicableStandard).trim() : null,
        equipmentCategory: body.equipmentCategory ? String(body.equipmentCategory).trim() : 'GENERAL',
        officialSourceUrl: String(body.officialSourceUrl || '').trim(),
        publicationDate: body.publicationDate ? new Date(body.publicationDate) : null,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        lastVerifiedDate: isReviewedByAdmin ? new Date() : null,
        version: String(body.version || '2024').trim(),
        // Step 4: If a rule cannot be verified, mark it "LEGAL REFERENCE PENDING VERIFICATION".
        // A legal reference must not become active until an authorized administrator has reviewed it.
        currentStatus: isReviewedByAdmin
          ? 'VERIFIED_ACTIVE'
          : 'LEGAL REFERENCE PENDING VERIFICATION',
        verificationNotes: body.verificationNotes ? String(body.verificationNotes).trim() : null,
        verifiedBy: isReviewedByAdmin ? auth.profile?.fullName || auth.user.email : null,
        approvalStatus: isReviewedByAdmin ? 'APPROVED' : 'PENDING_REVIEW',
      };

      if (!data.actName || !data.officialSourceUrl) {
        return NextResponse.json(
          { error: 'Act Name and Official Government/BIS Source URL are required.' },
          { status: 400 }
        );
      }

      const record = body.id && !String(body.id).startsWith('seed-')
        ? await (db as any).legalReference.update({
            where: { id: body.id },
            data,
          })
        : await (db as any).legalReference.create({ data });

      return NextResponse.json({ success: true, legalReference: record });
    }

    // 2. Submit or Verify Agency Credential (Step 7)
    if (action === 'UPSERT_AGENCY_CREDENTIAL') {
      const cleanLicense = body.licenseNumber ? String(body.licenseNumber).trim() : null;
      const requestedStatus = body.verificationStatus;
      let status = cleanLicense ? 'PENDING_VERIFICATION' : 'NOT_PROVIDED';

      if (
        requestedStatus &&
        ['NOT_PROVIDED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'EXPIRED'].includes(
          requestedStatus
        ) &&
        auth.profile?.role === 'ORG_ADMIN'
      ) {
        status = requestedStatus;
      }

      const existing = await (db as any).agencyCredential.findFirst({
        where: { organizationId: orgId },
        orderBy: { updatedAt: 'desc' },
      });

      const payload = {
        organizationId: orgId,
        legalName: String(body.legalName || auth.organization?.name || 'Service Agency').trim(),
        businessAddress: body.businessAddress ? String(body.businessAddress).trim() : null,
        contactInfo: body.contactInfo ? String(body.contactInfo).trim() : null,
        gstin: body.gstin ? String(body.gstin).trim() : null,
        licenseNumber: cleanLicense,
        issuingAuthority: body.issuingAuthority ? String(body.issuingAuthority).trim() : null,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        supportingDocUrl: body.supportingDocUrl ? String(body.supportingDocUrl).trim() : null,
        verificationStatus: status,
        verifiedBy: status === 'VERIFIED' ? auth.profile?.fullName || auth.user.email : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        reviewNotes: body.reviewNotes ? String(body.reviewNotes).trim() : null,
      };

      const record = existing
        ? await (db as any).agencyCredential.update({
            where: { id: existing.id },
            data: payload,
          })
        : await (db as any).agencyCredential.create({ data: payload });

      // Sync clean license number to Organization (never saving fake default)
      await (db as any).organization
        .update({
          where: { id: orgId },
          data: {
            name: payload.legalName,
            gstin: payload.gstin,
            licenseNumber: cleanLicense,
          },
        })
        .catch(() => null);

      return NextResponse.json({
        success: true,
        agencyCredential: sanitizeAgencyCredentials(auth.organization, record),
        rawRecord: record,
      });
    }

    // 3. Submit or Verify Technician Credential (Step 8)
    if (action === 'UPSERT_TECHNICIAN_CREDENTIAL') {
      const fullName = String(body.fullName || '').trim();
      if (!fullName) {
        return NextResponse.json({ error: 'Technician full name is required.' }, { status: 400 });
      }

      const isVerified = body.verificationStatus === 'VERIFIED' && auth.profile?.role === 'ORG_ADMIN';
      const cleanDesignation = sanitizeTechnicianDesignation(body.designation, isVerified);

      const payload = {
        organizationId: orgId,
        userProfileId: body.userProfileId ? String(body.userProfileId).trim() : null,
        fullName,
        employeeId: body.employeeId ? String(body.employeeId).trim() : null,
        designation: cleanDesignation,
        qualification: body.qualification ? String(body.qualification).trim() : null,
        trainingDetails: body.trainingDetails ? String(body.trainingDetails).trim() : null,
        certificationDetails: body.certificationDetails ? String(body.certificationDetails).trim() : null,
        issuingOrganization: body.issuingOrganization ? String(body.issuingOrganization).trim() : null,
        certificateNumber: body.certificateNumber ? String(body.certificateNumber).trim() : null,
        validityDate: body.validityDate ? new Date(body.validityDate) : null,
        supportingDocUrl: body.supportingDocUrl ? String(body.supportingDocUrl).trim() : null,
        verificationStatus: body.verificationStatus || 'PENDING_VERIFICATION',
        verifiedBy: isVerified ? auth.profile?.fullName || auth.user.email : null,
        verifiedAt: isVerified ? new Date() : null,
      };

      const record = body.id
        ? await (db as any).technicianCredential.update({
            where: { id: body.id },
            data: payload,
          })
        : await (db as any).technicianCredential.create({ data: payload });

      return NextResponse.json({ success: true, technicianCredential: record });
    }

    // 4. Create or Update Jurisdiction Template (Step 3 & 14)
    if (action === 'UPSERT_JURISDICTION_TEMPLATE') {
      const isStatutory = Boolean(body.isStatutoryForm);
      // Statutory templates stay in DRAFT_PENDING_LEGAL_REVIEW unless explicitly verified by admin with legal notes
      let status = body.status || 'ACTIVE';
      if (isStatutory && status === 'ACTIVE' && !body.verifiedLegalBasisConfirmed) {
        status = 'DRAFT_PENDING_LEGAL_REVIEW';
      }

      const payload = {
        organizationId: orgId,
        code: body.code || 'GENERAL',
        state: String(body.state || 'India').trim(),
        city: String(body.city || 'General').trim(),
        templateName: String(body.templateName || 'Inspection & Maintenance Report').trim(),
        reportType: body.reportType || 'FIRE_SAFETY_INSPECTION_REPORT',
        isStatutoryForm: isStatutory,
        statutoryFormCode: body.statutoryFormCode ? String(body.statutoryFormCode).trim() : null,
        statutoryPurpose: body.statutoryPurpose ? String(body.statutoryPurpose).trim() : null,
        issuingAuthority: body.issuingAuthority ? String(body.issuingAuthority).trim() : null,
        status,
        version: String(body.version || '2.0.0').trim(),
        verifiedBy: status === 'ACTIVE' ? auth.profile?.fullName || auth.user.email : null,
        verifiedAt: status === 'ACTIVE' ? new Date() : null,
      };

      const record = body.id && !String(body.id).startsWith('tpl-')
        ? await (db as any).jurisdictionTemplate.update({
            where: { id: body.id },
            data: payload,
          })
        : await (db as any).jurisdictionTemplate.create({ data: payload });

      return NextResponse.json({ success: true, template: record });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save compliance configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return POST(request);
}
