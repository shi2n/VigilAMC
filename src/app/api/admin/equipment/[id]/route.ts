import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await db.equipment.findUnique({
      where: { id: params.id },
      include: {
        building: {
          include: { client: true },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json({ equipment });
  } catch (error: any) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      qrCode,
      type,
      capacity,
      location,
      lastServiceDate,
      nextDueDate,
      serviceIntervalMonths,
      status,
      buildingId,
    } = body;

    const existing = await db.equipment.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Check if qrCode is being changed and if new code already exists
    if (qrCode && qrCode.trim().toUpperCase() !== existing.qrCode) {
      const duplicate = await db.equipment.findUnique({ where: { qrCode: qrCode.trim().toUpperCase() } });
      if (duplicate) {
        return NextResponse.json({ error: `QR Code '${qrCode}' already in use.` }, { status: 400 });
      }
    }

    const updated = await db.equipment.update({
      where: { id: params.id },
      data: {
        qrCode: qrCode ? qrCode.trim().toUpperCase() : existing.qrCode,
        type: type !== undefined ? type : existing.type,
        capacity: capacity !== undefined ? capacity : existing.capacity,
        location: location !== undefined ? location : existing.location,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : existing.lastServiceDate,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : existing.nextDueDate,
        serviceIntervalMonths: serviceIntervalMonths !== undefined ? Number(serviceIntervalMonths) : existing.serviceIntervalMonths,
        status: status !== undefined ? status : existing.status,
        buildingId: buildingId !== undefined ? buildingId : existing.buildingId,
      },
    });

    return NextResponse.json({ success: true, equipment: updated });
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.equipment.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    await db.equipment.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Equipment deleted' });
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
