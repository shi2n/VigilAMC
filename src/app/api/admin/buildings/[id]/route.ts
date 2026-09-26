import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const building = await (db as any).building.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
      include: {
        client: true,
        equipments: {
          orderBy: { location: 'asc' },
        },
        reports: {
          orderBy: { generatedAt: 'desc' },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    return NextResponse.json({ building });
  } catch (error: any) {
    console.error('Error fetching building:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, complianceCycle, cycleIntervalMos, nextFilingDueDate, clientId } = body;

    const existing = await (db as any).building.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Building not found or access denied' }, { status: 404 });
    }

    const updated = await (db as any).building.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        address: address !== undefined ? address.trim() : existing.address,
        complianceCycle: complianceCycle !== undefined ? complianceCycle : existing.complianceCycle,
        cycleIntervalMos: cycleIntervalMos !== undefined ? Number(cycleIntervalMos) : existing.cycleIntervalMos,
        nextFilingDueDate: nextFilingDueDate ? new Date(nextFilingDueDate) : existing.nextFilingDueDate,
        clientId: clientId !== undefined ? clientId : existing.clientId,
      },
      include: { client: true },
    });

    return NextResponse.json({ success: true, building: updated });
  } catch (error: any) {
    console.error('Error updating building:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await (db as any).building.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Building not found or access denied' }, { status: 404 });
    }

    await (db as any).building.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Building and associated equipment deleted' });
  } catch (error: any) {
    console.error('Error deleting building:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
