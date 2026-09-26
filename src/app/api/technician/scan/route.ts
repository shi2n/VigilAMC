import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('qrCode') || searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
    }

    const equipment = await db.equipment.findUnique({
      where: { qrCode: code.trim() },
      include: {
        building: {
          include: {
            client: true,
          },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: `No equipment found with QR code "${code}"` }, { status: 404 });
    }

    // Evaluate live status
    const now = new Date();
    const diffDays = Math.ceil((new Date(equipment.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let currentStatus = 'COMPLIANT';
    if (diffDays < 0) currentStatus = 'OVERDUE';
    else if (diffDays <= 30) currentStatus = 'DUE_SOON';

    return NextResponse.json({
      equipment: {
        ...equipment,
        liveStatus: currentStatus,
        daysRemaining: diffDays,
      },
    });
  } catch (error: any) {
    console.error('Error in technician scan lookup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCode, equipmentId, intervalMonths = 12, technicianName = 'Field Technician', notes } = body;

    let eq = null;
    if (qrCode) {
      eq = await db.equipment.findUnique({ where: { qrCode } });
    } else if (equipmentId) {
      eq = await db.equipment.findUnique({ where: { id: equipmentId } });
    }

    if (!eq) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    const now = new Date();
    const months = Number(intervalMonths) || 12;
    // Calculate new due date (e.g. +12 months)
    const nextDueDate = new Date(now.getTime() + months * 30.5 * 24 * 60 * 60 * 1000);

    // 1. Create Service Log
    const log = await db.serviceLog.create({
      data: {
        equipmentId: eq.id,
        technicianName,
        servicedAt: now,
        nextDueDate,
        actionType: months === 12 ? 'Annual Refill & IS 2190 Pressure Overhaul' : 'Half-Yearly Maintenance Check',
        notes: notes || `Service verified by ${technicianName}. Next due set to ${nextDueDate.toLocaleDateString('en-IN')}`,
      },
    });

    // 2. Update Equipment status to COMPLIANT and set new dates
    const updatedEquipment = await db.equipment.update({
      where: { id: eq.id },
      data: {
        lastServiceDate: now,
        nextDueDate,
        status: 'COMPLIANT',
        serviceIntervalMonths: months,
      },
      include: {
        building: {
          include: { client: true },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Service logged successfully! Next service due on ${nextDueDate.toLocaleDateString('en-IN')}.`,
      equipment: updatedEquipment,
      log,
    });
  } catch (error: any) {
    console.error('Error logging technician service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
