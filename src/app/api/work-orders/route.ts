import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';

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
    const {
      buildingId,
      equipmentId,
      defectId,
      assignedToId,
      title,
      description,
      priority,
      dueDate,
    } = body;

    if (!buildingId || !title) {
      return NextResponse.json({ error: 'Building ID and title are required' }, { status: 400 });
    }

    const cleanEquipmentId =
      equipmentId && String(equipmentId).trim() !== '' ? String(equipmentId).trim() : null;
    const cleanDefectId =
      defectId && String(defectId).trim() !== '' ? String(defectId).trim() : null;
    const cleanAssignedToId =
      assignedToId && String(assignedToId).trim() !== '' ? String(assignedToId).trim() : null;

    let parsedDueDate: Date | null = null;
    if (dueDate && String(dueDate).trim() !== '') {
      const dt = new Date(dueDate);
      if (!isNaN(dt.getTime())) {
        parsedDueDate = dt;
      }
    }

    const workOrder = await (db as any).workOrder.create({
      data: {
        organizationId: auth.organization.id,
        buildingId,
        equipmentId: cleanEquipmentId,
        defectId: cleanDefectId,
        assignedToId: cleanAssignedToId,
        title: title.trim(),
        description: (description || '').trim(),
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        dueDate: parsedDueDate,
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
    const { id, status } = body;

    if (!status || !VALID_WORK_ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const existing = await (db as any).workOrder.findFirst({
      where: {
        id,
        organizationId: auth.organization.id,
      },
      select: { id: true, defectId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }

    const workOrder = await (db as any).workOrder.update({
      where: {
        id: existing.id,
        organizationId: auth.organization.id,
      },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      include: WORK_ORDER_INCLUDE,
    });

    if (existing.defectId) {
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

    return NextResponse.json({ success: true, workOrder });
  } catch (error: any) {
    console.error('Error updating work order status:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update work order' }, { status: 500 });
  }
}
