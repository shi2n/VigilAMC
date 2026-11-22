import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { getCurrentUser } from '@/lib/auth';
import { notifyOnAssignment } from '@/lib/notify';
import { toDateInputString, toDbDate } from '@/lib/dates';
import { logEquipmentHistory } from '@/lib/equipmentHistory';
import { validateTaskCompletionAction } from '@/lib/i18n/taskAction';
import {
  EVIDENCE_NO_STORE_HEADERS,
  sanitizeIdSegment,
  signWorkOrderRecords,
  validateStoredPhotoUrl,
} from '@/lib/evidencePhotos';

export const dynamic = 'force-dynamic';

const VALID_WORK_ORDER_STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

const WORK_ORDER_INCLUDE = {
  building: { select: { id: true, name: true } },
  equipment: { select: { id: true, qrCode: true, type: true, location: true } },
  defect: { select: { id: true, description: true, severity: true } },
  assignedTo: { select: { id: true, fullName: true, email: true } },
  photos: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true,
      clientPhotoId: true,
      photoUrl: true,
      caption: true,
      capturedAt: true,
      dayOfWeek: true,
      latitude: true,
      longitude: true,
      gpsAccuracy: true,
      gpsSource: true,
      createdAt: true,
    },
  },
};

export async function GET(request: Request) {
  try {
    const auth = (await getCurrentUser(request)) || (await getAuthenticatedActor(request));
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: EVIDENCE_NO_STORE_HEADERS });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const workOrdersRaw = await (db as any).workOrder.findMany({
      where,
      include: WORK_ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    const workOrders = await signWorkOrderRecords(workOrdersRaw, auth.organization.id);

    return NextResponse.json({ workOrders }, { headers: EVIDENCE_NO_STORE_HEADERS });
  } catch (error: any) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: EVIDENCE_NO_STORE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const auth = (await getCurrentUser(request)) || (await getAuthenticatedActor(request));
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let {
      buildingId,
      equipmentId,
      defectId,
      assignedToId,
      technicianId,
      type,
      title,
      description,
      notes,
      priority,
      dueDate,
    } = body;

    const cleanEquipmentId =
      equipmentId && String(equipmentId).trim() !== '' ? String(equipmentId).trim() : null;

    let targetBuildingId = buildingId ? String(buildingId).trim() : null;
    let equipmentQr = '';

    if (cleanEquipmentId) {
      const eq = await (db as any).equipment.findFirst({
        where: { id: cleanEquipmentId, organizationId: auth.organization.id },
        select: { id: true, buildingId: true, qrCode: true },
      });
      if (eq) {
        equipmentQr = eq.qrCode || '';
        if (!targetBuildingId) {
          targetBuildingId = eq.buildingId;
        }
      }
    }

    if (!targetBuildingId) {
      return NextResponse.json({ error: 'Building ID is required' }, { status: 400 });
    }

    const resolvedTitle = (
      title ||
      (type ? `${type} · ${equipmentQr || 'Asset'}` : 'Equipment Task')
    ).trim();

    if (!resolvedTitle) {
      return NextResponse.json({ error: 'Task title or type is required' }, { status: 400 });
    }

    const resolvedAssignedToId =
      (assignedToId || technicianId) && String(assignedToId || technicianId).trim() !== ''
        ? String(assignedToId || technicianId).trim()
        : null;

    const cleanDefectId =
      defectId && String(defectId).trim() !== '' ? String(defectId).trim() : null;

    const resolvedDescription = (
      description ||
      notes ||
      (type ? `Task type: ${type}` : '')
    ).trim();

    let parsedDueDate: Date | null = null;
    if (dueDate && String(dueDate).trim() !== '') {
      parsedDueDate = toDbDate(dueDate);
    }

    // When assigned to a technician by human admin, status is 'ASSIGNED'. Unassigned tasks start as 'OPEN'.
    const initialStatus = resolvedAssignedToId ? 'ASSIGNED' : 'OPEN';

    const workOrder = await (db as any).workOrder.create({
      data: {
        organizationId: auth.organization.id,
        buildingId: targetBuildingId,
        equipmentId: cleanEquipmentId,
        defectId: cleanDefectId,
        assignedToId: resolvedAssignedToId,
        title: resolvedTitle,
        description: resolvedDescription,
        priority: priority || 'MEDIUM',
        status: initialStatus,
        dueDate: parsedDueDate,
        notes: (notes || '').trim() || null,
      },
      include: WORK_ORDER_INCLUDE,
    });

    if (cleanDefectId) {
      await (db as any).defect
        .update({
          where: { id: cleanDefectId },
          data: { status: 'IN_PROGRESS' },
        })
        .catch(() => null);
    }

    // Dispatch localized push notification & in-app notification row to assigned technician
    if (resolvedAssignedToId) {
      await notifyOnAssignment({
        type: 'WORK_ORDER',
        technicianId: resolvedAssignedToId,
        organizationId: auth.organization.id,
        taskTitle: resolvedTitle,
        taskId: workOrder.id,
        dueDate: parsedDueDate,
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, workOrder });
  } catch (error: any) {
    console.error('Error creating work order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = (await getCurrentUser(request)) || (await getAuthenticatedActor(request));
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, status, assignedToId, dueDate, isReschedule, notes, photoUrl, photoRecords } = body;
    const rawActionTaken = body.actionTaken ?? body.action_taken;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    if (status && !VALID_WORK_ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Strict server-side validation: reject any non-https (blob:/data:) photo URLs
    let validatedPrimaryPhotoUrl: string | undefined;
    if (photoUrl !== undefined && photoUrl !== null && String(photoUrl).trim() !== '') {
      const check = validateStoredPhotoUrl(photoUrl, auth.organization.id);
      if (!check.valid) {
        return NextResponse.json({ error: check.error }, { status: check.status });
      }
      validatedPrimaryPhotoUrl = check.url;
    }

    const validatedPhotoRows: Array<{
      clientPhotoId: string;
      photoUrl: string;
      caption: string | null;
      capturedAt: Date;
      dayOfWeek: string | null;
      latitude: number | null;
      longitude: number | null;
      gpsAccuracy: number | null;
      gpsSource: string | null;
    }> = [];
    if (Array.isArray(photoRecords)) {
      for (let i = 0; i < photoRecords.length; i++) {
        const pr = photoRecords[i];
        const rawU = pr?.photoUrl || pr?.storageUrl;
        if (!rawU) continue;
        const check = validateStoredPhotoUrl(rawU, auth.organization.id);
        if (!check.valid) {
          return NextResponse.json({ error: check.error }, { status: check.status });
        }
        const cpid = sanitizeIdSegment(pr?.clientPhotoId || `wo-${id}-${i}`, `wo-${id}-${i}`);
        const capDate = pr?.capturedAt ? new Date(pr.capturedAt) : new Date();
        validatedPhotoRows.push({
          clientPhotoId: cpid,
          photoUrl: check.url,
          caption: pr?.caption || null,
          capturedAt: isNaN(capDate.getTime()) ? new Date() : capDate,
          dayOfWeek: pr?.dayOfWeek || null,
          latitude: pr?.latitude != null ? Number(pr.latitude) : null,
          longitude: pr?.longitude != null ? Number(pr.longitude) : null,
          gpsAccuracy: pr?.gpsAccuracy != null ? Number(pr.gpsAccuracy) : null,
          gpsSource: pr?.gpsSource || null,
        });
      }
      if (!validatedPrimaryPhotoUrl && validatedPhotoRows[0]) {
        validatedPrimaryPhotoUrl = validatedPhotoRows[0].photoUrl;
      }
    }

    const existing = await (db as any).workOrder.findFirst({
      where: {
        id,
        organizationId: auth.organization.id,
      },
      select: {
        id: true,
        title: true,
        defectId: true,
        equipmentId: true,
        assignedToId: true,
        dueDate: true,
        status: true,
        rescheduledCount: true,
        equipment: { select: { qrCode: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const updateData: any = {};
    let isReschedulingAction = false;
    let oldDueDateStr = existing.dueDate ? toDateInputString(existing.dueDate) : 'None';
    let newDueDateStr = '';

    if (isReschedule && dueDate) {
      const dt = toDbDate(dueDate);
      if (dt && !isNaN(dt.getTime())) {
        isReschedulingAction = true;
        updateData.dueDate = dt;
        newDueDateStr = toDateInputString(dt);
        // Returns to the queue: ASSIGNED if has technician, else OPEN
        updateData.status = existing.assignedToId ? 'ASSIGNED' : 'OPEN';
        updateData.rescheduledCount = (existing.rescheduledCount || 0) + 1;
        updateData.lastRescheduledAt = new Date();
      }
    } else if (dueDate !== undefined) {
      if (dueDate && String(dueDate).trim() !== '') {
        const dt = toDbDate(dueDate);
        if (dt && !isNaN(dt.getTime())) {
          updateData.dueDate = dt;
        }
      } else {
        updateData.dueDate = null;
      }
    }

    if (status && !isReschedulingAction) {
      updateData.status = status;
      updateData.completedAt = status === 'COMPLETED' ? new Date() : null;
    }
    if (rawActionTaken !== undefined) {
      const validation = validateTaskCompletionAction(rawActionTaken, notes);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      updateData.actionTaken = validation.actionTaken;
      if (notes !== undefined) {
        updateData.notes = validation.notes;
      }
    } else if (notes !== undefined) {
      const trimmed = typeof notes === 'string' ? notes.trim() : '';
      updateData.notes = trimmed.length > 0 ? trimmed : null;
    }
    if (assignedToId !== undefined) {
      updateData.assignedToId =
        assignedToId && String(assignedToId).trim() !== '' ? String(assignedToId).trim() : null;
      // If assigning a technician and status is not explicitly overridden, transition OPEN -> ASSIGNED
      if (updateData.assignedToId && (!status || status === 'OPEN')) {
        updateData.status = 'ASSIGNED';
      } else if (!updateData.assignedToId && existing.status === 'ASSIGNED' && !status) {
        updateData.status = 'OPEN';
      }
    }

    if (validatedPrimaryPhotoUrl) {
      updateData.photoUrl = validatedPrimaryPhotoUrl;
    }

    for (const pr of validatedPhotoRows) {
      await (db as any).workOrderPhoto.upsert({
        where: { clientPhotoId: pr.clientPhotoId },
        update: {
          workOrderId: existing.id,
          photoUrl: pr.photoUrl,
          caption: pr.caption,
        },
        create: {
          workOrderId: existing.id,
          organizationId: auth.organization.id,
          clientPhotoId: pr.clientPhotoId,
          photoUrl: pr.photoUrl,
          caption: pr.caption,
          capturedAt: pr.capturedAt,
          dayOfWeek: pr.dayOfWeek,
          latitude: pr.latitude,
          longitude: pr.longitude,
          gpsAccuracy: pr.gpsAccuracy,
          gpsSource: pr.gpsSource,
        },
      });
    }

    const workOrderRaw = await (db as any).workOrder.update({
      where: {
        id: existing.id,
        organizationId: auth.organization.id,
      },
      data: updateData,
      include: WORK_ORDER_INCLUDE,
    });
    const [workOrder] = await signWorkOrderRecords([workOrderRaw], auth.organization.id);

    if (existing.defectId && status) {
      const defectStatus =
        status === 'COMPLETED'
          ? 'RESOLVED'
          : status === 'IN_PROGRESS' || status === 'ASSIGNED'
          ? 'IN_PROGRESS'
          : 'OPEN';
      await (db as any).defect
        .update({
          where: { id: existing.defectId },
          data: {
            status: defectStatus,
            resolvedAt: status === 'COMPLETED' ? new Date() : null,
          },
        })
        .catch(() => null);
    }

    if (isReschedulingAction) {
      if (existing.equipmentId) {
        await logEquipmentHistory({
          equipmentId: existing.equipmentId,
          actorName: (auth as any).fullName || (auth as any).name || (auth as any).profile?.fullName || 'Admin',
          actorRole: 'ADMIN',
          action: 'RE_SCHEDULE',
          changes: [
            { field: 'Due Date', old: oldDueDateStr, new: newDueDateStr },
            { field: 'Task Status', old: existing.status, new: updateData.status },
          ],
        }).catch(() => null);
      }
      if (workOrder.assignedToId) {
        await notifyOnAssignment({
          type: 'WORK_ORDER',
          actionType: 'RESCHEDULE',
          assetTag: existing.equipment?.qrCode || workOrder.title,
          technicianId: workOrder.assignedToId,
          organizationId: auth.organization.id,
          taskTitle: workOrder.title,
          taskId: workOrder.id,
          dueDate: updateData.dueDate,
        }).catch(() => null);
      }
    }

    // Trigger notifyOnAssignment when newly assigned or status changed to ASSIGNED
    const newAssignedId = workOrder.assignedToId;
    if (
      newAssignedId &&
      (newAssignedId !== existing.assignedToId || (status === 'ASSIGNED' && existing.status !== 'ASSIGNED'))
    ) {
      await notifyOnAssignment({
        type: 'WORK_ORDER',
        technicianId: newAssignedId,
        organizationId: auth.organization.id,
        taskTitle: workOrder.title,
        taskId: workOrder.id,
        dueDate: workOrder.dueDate,
      }).catch(() => null);
    }

    return NextResponse.json({ success: true, workOrder });
  } catch (error: any) {
    console.error('Error updating work order status:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update work order' }, { status: 500 });
  }
}
