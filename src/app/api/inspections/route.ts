import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, logAuditActivity } from '@/lib/auth';
import { ensureR2PhotoUrl } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ inspections: [] });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (buildingId && buildingId !== 'ALL') {
      where.buildingId = buildingId;
    }

    const inspections = await (db as any).inspection.findMany({
      where,
      include: {
        building: { select: { id: true, name: true, address: true } },
        equipment: {
          select: { id: true, qrCode: true, type: true, capacity: true, location: true, status: true },
        },
        issues: true,
        partsUsed: true,
        inspectionPhotos: true,
        job: { select: { id: true, jobNumber: true, title: true } },
        defects: true,
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return NextResponse.json({ inspections });
  } catch (error: any) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request);
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

    let resolvedPhotoArray: string[] = [];
    if (Array.isArray(photos)) {
      for (const p of photos) {
        const u = await ensureR2PhotoUrl({
          photoUrl: p,
          organizationId: auth.organization.id,
          folder: 'inspections',
        });
        if (u) resolvedPhotoArray.push(u);
      }
    } else if (typeof photos === 'string' && photos.trim()) {
      try {
        const parsed = JSON.parse(photos);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            const u = await ensureR2PhotoUrl({
              photoUrl: p,
              organizationId: auth.organization.id,
              folder: 'inspections',
            });
            if (u) resolvedPhotoArray.push(u);
          }
        }
      } catch {
        const u = await ensureR2PhotoUrl({
          photoUrl: photos,
          organizationId: auth.organization.id,
          folder: 'inspections',
        });
        if (u) resolvedPhotoArray.push(u);
      }
    } else if (photoUrl) {
      const u = await ensureR2PhotoUrl({
        photoUrl,
        organizationId: auth.organization.id,
        folder: 'inspections',
      });
      if (u) resolvedPhotoArray.push(u);
    }

    const normalizedPhotos =
      resolvedPhotoArray.length > 0 ? JSON.stringify(resolvedPhotoArray) : null;
    const primaryPhotoUrl = resolvedPhotoArray[0] || null;
    const resolvedTechName =
      technicianName || auth.profile?.fullName || auth.user?.email || 'Field Technician';

    const inspection = await (db as any).inspection.create({
      data: {
        organizationId: auth.organization.id,
        buildingId,
        equipmentId: equipmentId || null,
        technicianId: auth.user.id,
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

    if (equipmentId) {
      const eq = await (db as any).equipment.findUnique({
        where: { id: equipmentId },
        select: { id: true, qrCode: true, serviceIntervalMonths: true, photoUrl: true },
      });

      const now = new Date();
      const months = Number(eq?.serviceIntervalMonths) || 12;
      const nextDueDate = new Date(now.getTime() + months * 30.5 * 24 * 60 * 60 * 1000);
      const isDefect = status === 'FAILED' || status === 'SERVICE_REQUIRED' || status === 'REPLACEMENT_REQUIRED';

      await (db as any).equipment.update({
        where: { id: equipmentId },
        data: {
          lastServiceDate: now,
          nextDueDate: isDefect ? now : nextDueDate,
          status: isDefect ? 'DEFECTIVE' : 'COMPLIANT',
          ...(primaryPhotoUrl ? { photoUrl: primaryPhotoUrl } : {}),
        },
      });

      // Also create a ServiceLog so history is complete everywhere
      await (db as any).serviceLog.create({
        data: {
          equipmentId,
          technicianName: resolvedTechName,
          servicedAt: now,
          nextDueDate: isDefect ? now : nextDueDate,
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
              assignedToId: auth.user.id,
              title: `${eq?.qrCode || 'Asset'} — ${
                Array.isArray(issueChips) && issueChips.length > 0 ? issueChips[0] : 'Refill / Repair'
              }`,
              description: defectDesc,
              priority: 'HIGH',
              status: 'OPEN',
              dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
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
