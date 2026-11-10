import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { toDbDate } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ workOrders: [] });
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
      include: {
        building: { select: { id: true, name: true } },
        equipment: { select: { id: true, qrCode: true, type: true, location: true } },
        defect: { select: { id: true, description: true, severity: true } },
      },
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
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { buildingId, equipmentId, defectId, title, description, priority, dueDate } = body;

    if (!buildingId || !title) {
      return NextResponse.json({ error: 'Building ID and title are required' }, { status: 400 });
    }

    const workOrder = await (db as any).workOrder.create({
      data: {
        organizationId: auth.organization.id,
        buildingId,
        equipmentId: equipmentId || null,
        defectId: defectId || null,
        title: title.trim(),
        description: (description || '').trim(),
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        dueDate: dueDate ? toDbDate(dueDate) : null,
      },
    });

    if (defectId) {
      await (db as any).defect.update({
        where: { id: defectId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json({ success: true, workOrder });
  } catch (error: any) {
    console.error('Error creating work order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, assignedToId, priority, dueDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Work order ID required' }, { status: 400 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
    if (priority) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? toDbDate(dueDate) : null;

    const workOrder = await (db as any).workOrder.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, workOrder });
  } catch (error: any) {
    console.error('Error updating work order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
