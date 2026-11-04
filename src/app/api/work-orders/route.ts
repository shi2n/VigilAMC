import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { notifyOnAssignment } from '@/lib/notify';

export const dynamic = 'force-dynamic';

const VALID_WORK_ORDER_STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

const WORK_ORDER_INCLUDE = {
  building: { select: { id: true, name: true } },
  equipment: { select: { id: true, qrCode: true, type: true, location: true } },
  defect: { select: { id: true, description: true, severity: true } },
  assignedTo: { select: { id: true, fullName: true, email: true } },
};

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const workOrders = await (db as any).workOrder.findMany({
      where,
      include: WORK_ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ workOrders });
  } catch (error: any) {
    console.error('Error fetching work orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
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
      const dt = new Date(dueDate);
      if (!isNaN(dt.getTime())) {
        parsedDueDate = dt;
      }
    }

    // NON-NEGOTIABLE RULE 5: Work order creation status is ALWAYS 'OPEN'
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
        status: 'OPEN',
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
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, status, assignedToId } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    if (status && !VALID_WORK_ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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
        assignedToId: true,
        dueDate: true,
        status: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      updateData.completedAt = status === 'COMPLETED' ? new Date() : null;
    }
    if (assignedToId !== undefined) {
      updateData.assignedToId =
        assignedToId && String(assignedToId).trim() !== '' ? String(assignedToId).trim() : null;
    }

    const workOrder = await (db as any).workOrder.update({
      where: {
        id: existing.id,
        organizationId: auth.organization.id,
      },
      data: updateData,
      include: WORK_ORDER_INCLUDE,
    });

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
