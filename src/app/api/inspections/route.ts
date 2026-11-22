import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAuditActivity } from '@/lib/auth';
import { getAuthenticatedActor } from '@/lib/techSession';
import { addCalendarMonths, addCalendarDays, todayCalendarDateString, toDbDate } from '@/lib/dates';
import {
  EVIDENCE_NO_STORE_HEADERS,
  sanitizeIdSegment,
  signInspectionRecords,
  validateStoredPhotoUrl,
} from '@/lib/evidencePhotos';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: EVIDENCE_NO_STORE_HEADERS });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (buildingId && buildingId !== 'ALL') {
      where.buildingId = buildingId;
    }

    const inspectionsRaw = await (db as any).inspection.findMany({
      where,
      include: {
        building: { select: { id: true, name: true, address: true } },
        equipment: {
          select: { id: true, qrCode: true, type: true, capacity: true, location: true, status: true },
        },
        issues: true,
        partsUsed: true,
        inspectionPhotos: {
          orderBy: { createdAt: 'desc' },
        },
        job: { select: { id: true, jobNumber: true, title: true } },
        defects: true,
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    const inspections = await signInspectionRecords(inspectionsRaw, auth.organization.id);

    return NextResponse.json({ inspections }, { headers: EVIDENCE_NO_STORE_HEADERS });
  } catch (error: any) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: EVIDENCE_NO_STORE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      buildingId,
      equipmentId,
      status,
      checklist,
      pressureGauge,
      overallCondition,
      remarks,
      technicianId,
      technicianName,
      customerName,
      customerDesignation,
      customerSignature,
      photoUrl,
      photos,
      latitude,
      longitude,
      gpsAccuracy,
      issueChips,
    } = body;

    if (!buildingId) {
      return NextResponse.json({ error: 'Building ID is required' }, { status: 400 });
    }

    // Strictly validate every photo URL: reject blob:/data:/non-https/cross-org URLs!
    const rawCandidateUrls: string[] = [];
    if (Array.isArray(photos)) {
      for (const p of photos) {
        if (typeof p === 'string' && p.trim()) rawCandidateUrls.push(p.trim());
      }
    } else if (typeof photos === 'string' && photos.trim()) {
      try {
        const parsed = JSON.parse(photos);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            if (typeof p === 'string' && p.trim()) rawCandidateUrls.push(p.trim());
          }
        } else {
          rawCandidateUrls.push(photos.trim());
        }
      } catch {
        rawCandidateUrls.push(photos.trim());
      }
    }
    if (typeof photoUrl === 'string' && photoUrl.trim() && !rawCandidateUrls.includes(photoUrl.trim())) {
      rawCandidateUrls.push(photoUrl.trim());
    }

    const resolvedPhotoArray: string[] = [];
    for (const candidate of rawCandidateUrls) {
      const check = validateStoredPhotoUrl(candidate, auth.organization.id);
      if (!check.valid) {
        return NextResponse.json(
          { error: check.error },
          { status: check.status, headers: EVIDENCE_NO_STORE_HEADERS }
        );
      }
      if (!resolvedPhotoArray.includes(check.url)) {
        resolvedPhotoArray.push(check.url);
      }
    }

    const normalizedPhotos =
      resolvedPhotoArray.length > 0 ? JSON.stringify(resolvedPhotoArray) : null;
    const primaryPhotoUrl = resolvedPhotoArray[0] || null;

    let resolvedTechId: string = auth.user.id;
    let resolvedTechName: string =
      technicianName || auth.profile?.fullName || auth.user?.email || 'Field Technician';

    if (typeof technicianId === 'string' && technicianId.trim()) {
      const selectedTech = await (db as any).userProfile
        .findFirst({
          where: {
            id: technicianId.trim(),
            organizationId: auth.organization.id,
          },
          select: { id: true, fullName: true, email: true },
        })
        .catch(() => null);
      if (selectedTech) {
        resolvedTechId = selectedTech.id;
        resolvedTechName =
          technicianName || selectedTech.fullName || selectedTech.email || resolvedTechName;
      }
    }

    const inspection = await (db as any).inspection.create({
      data: {
        organizationId: auth.organization.id,
        buildingId,
        equipmentId: equipmentId || null,
        technicianId: resolvedTechId,
        technicianName: resolvedTechName,
        status: status || 'PASSED',
        checklist: typeof checklist === 'string' ? checklist : JSON.stringify(checklist || {}),
        pressureGauge: pressureGauge || (status === 'FAILED' ? 'LOW' : 'NORMAL'),
        overallCondition: overallCondition || (status === 'FAILED' ? 'NEEDS_ATTENTION' : 'GOOD'),
        remarks: remarks || '',
        customerName: customerName || null,
        customerDesignation: customerDesignation || null,
        customerSignature: customerSignature || null,
        photos: normalizedPhotos,
        latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
        gpsAccuracy: gpsAccuracy !== undefined && gpsAccuracy !== null ? Number(gpsAccuracy) : null,
      },
    });

    // Persist InspectionPhoto records with full geo/time metadata & idempotency (ZERO swallowed failures)
    if (resolvedPhotoArray.length > 0) {
      const captureTime = body.capturedAt ? new Date(body.capturedAt) : inspection.date;
      const dayStr =
        body.dayOfWeek ||
        ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][captureTime.getDay()];
      for (let i = 0; i < resolvedPhotoArray.length; i++) {
        const pUrl = resolvedPhotoArray[i];
        const cpid = body.clientPhotoId
          ? sanitizeIdSegment(`${body.clientPhotoId}-${i}`, `insp-${inspection.id}-${i}`)
          : sanitizeIdSegment(`insp-${inspection.id}-${i}`, `insp-${inspection.id}-${i}`);
        await (db as any).inspectionPhoto.upsert({
          where: { clientPhotoId: cpid },
          update: {
            inspectionId: inspection.id,
            equipmentId: equipmentId || null,
            photoUrl: pUrl,
            caption: body.caption || remarks || null,
          },
          create: {
            inspectionId: inspection.id,
            equipmentId: equipmentId || null,
            clientPhotoId: cpid,
            category: body.photoCategory || 'GAUGE',
            photoUrl: pUrl,
            caption: body.caption || remarks || null,
            capturedAt: captureTime,
            dayOfWeek: dayStr,
            latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
            longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
            gpsAccuracy: gpsAccuracy !== undefined && gpsAccuracy !== null ? Number(gpsAccuracy) : null,
            gpsSource: body.gpsSource || (body.isBasementCached ? 'BASEMENT_CACHED' : 'LIVE'),
          },
        });
      }
    }

    if (equipmentId) {
      const eq = await (db as any).equipment.findUnique({
        where: { id: equipmentId },
        select: { id: true, qrCode: true, serviceIntervalMonths: true, photoUrl: true },
      });

      const todayStr = todayCalendarDateString();
      const months = Number(eq?.serviceIntervalMonths) || 12;
      const nextDueStr = addCalendarMonths(todayStr, months);
      const isDefect = status === 'FAILED' || status === 'SERVICE_REQUIRED' || status === 'REPLACEMENT_REQUIRED';

      await (db as any).equipment.update({
        where: { id: equipmentId },
        data: {
          lastServiceDate: toDbDate(todayStr),
          nextDueDate: toDbDate(isDefect ? todayStr : nextDueStr),
          status: isDefect ? 'DEFECTIVE' : 'COMPLIANT',
          ...(primaryPhotoUrl ? { photoUrl: primaryPhotoUrl } : {}),
        },
      });

      // Also create a ServiceLog so history is complete everywhere
      await (db as any).serviceLog.create({
        data: {
          equipmentId,
          technicianName: resolvedTechName,
          servicedAt: toDbDate(todayStr),
          nextDueDate: toDbDate(isDefect ? todayStr : nextDueStr),
          actionType: isDefect
            ? `Defect Flagged: ${Array.isArray(issueChips) && issueChips.length > 0 ? issueChips.join(', ') : 'Refill / Repair Needed'}`
            : 'GPS Field Inspection Verified (PASS)',
          notes: remarks || (isDefect ? 'Flagged for repair/refill during field check' : 'Passed field inspection check'),
        },
      });

      // If defect flagged, create Defect + WorkOrder automatically so admin sees it in Repairs & Work Orders!
      if (isDefect) {
        const defectDesc =
          (Array.isArray(issueChips) && issueChips.length > 0 ? issueChips.join(' • ') : '') +
          (remarks ? ` — ${remarks}` : '') ||
          'Field defect reported via Mobile App';

        const defect = await (db as any).defect
          .create({
            data: {
              organizationId: auth.organization.id,
              buildingId,
              equipmentId,
              inspectionId: inspection.id,
              description: defectDesc,
              severity: 'HIGH',
              status: 'OPEN',
              photoUrl: primaryPhotoUrl,
            },
          })
          .catch(() => null);

        await (db as any).workOrder
          .create({
            data: {
              organizationId: auth.organization.id,
              buildingId,
              equipmentId,
              defectId: defect?.id || null,
              assignedToId: resolvedTechId,
              title: `${eq?.qrCode || 'Asset'} — ${
                Array.isArray(issueChips) && issueChips.length > 0 ? issueChips[0] : 'Refill / Repair'
              }`,
              description: defectDesc,
              priority: 'HIGH',
              status: 'OPEN',
              dueDate: toDbDate(addCalendarDays(todayStr, 3)),
            },
          })
          .catch(() => null);
      }

      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: isDefect ? 'DEFECT_REPORTED' : 'INSPECTION_COMPLETED',
        entityType: 'Equipment',
        entityId: equipmentId,
        details: `${eq?.qrCode || 'Asset'} marked ${isDefect ? 'DEFECT' : 'PASS'} by ${resolvedTechName}${
          latitude != null && longitude != null
            ? ` at GPS (${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)})`
            : ''
        }`,
      });
    } else if (customerSignature) {
      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'SITE_SIGNOFF_COMPLETED',
        entityType: 'Building',
        entityId: buildingId,
        details: `Building inspection signed off by ${customerName || 'Site Supervisor'} (${
          customerDesignation || 'Guard / Facility Manager'
        })`,
      });
    }

    return NextResponse.json({ success: true, inspection });
  } catch (error: any) {
    console.error('Error logging inspection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
