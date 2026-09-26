import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = {};
    if (buildingId && buildingId !== 'ALL') {
      where.buildingId = buildingId;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { qrCode: { contains: search } },
        { location: { contains: search } },
        { capacity: { contains: search } },
        { type: { contains: search } },
      ];
    }

    const equipments = await db.equipment.findMany({
      where,
      include: {
        building: {
          select: { id: true, name: true, client: { select: { name: true } } },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    const now = new Date();
    const evaluated = equipments.map((eq: any) => {
      const diffDays = Math.ceil((new Date(eq.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const liveStatus = diffDays < 0 ? 'OVERDUE' : diffDays <= 30 ? 'DUE_SOON' : 'COMPLIANT';
      return {
        ...eq,
        diffDays,
        liveStatus,
      };
    });

    return NextResponse.json({ equipments: evaluated });
  } catch (error: any) {
    console.error('Error querying equipments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      isSingle,
      buildingId,
      qrCode,
      type,
      capacity,
      location,
      prefix,
      count,
      locationBase,
      serviceIntervalMonths,
      lastServiceDate,
    } = body;

    const building = await db.building.findUnique({
      where: { id: buildingId },
      include: { equipments: true },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const intervalMos = Number(serviceIntervalMonths) || 12;
    const now = lastServiceDate ? new Date(lastServiceDate) : new Date();
    const nextDue = new Date(now.getTime() + intervalMos * 30 * 24 * 60 * 60 * 1000);

    // Single Equipment Creation
    if (isSingle) {
      if (!qrCode) {
        return NextResponse.json({ error: 'QR Code identifier is required' }, { status: 400 });
      }

      // Check for duplicate QR code
      const existing = await db.equipment.findUnique({ where: { qrCode: qrCode.trim().toUpperCase() } });
      if (existing) {
        return NextResponse.json({ error: `QR Tag '${qrCode}' already exists in database.` }, { status: 400 });
      }

      const eq = await db.equipment.create({
        data: {
          buildingId: building.id,
          qrCode: qrCode.trim().toUpperCase(),
          type: type || 'Fire Extinguisher',
          capacity: capacity || 'ABC Dry Powder 6kg',
          location: location || 'Ground Floor Landing',
          lastServiceDate: now,
          nextDueDate: nextDue,
          serviceIntervalMonths: intervalMos,
          status: 'COMPLIANT',
        },
      });

      await db.serviceLog.create({
        data: {
          equipmentId: eq.id,
          technicianName: 'Admin Registration',
          servicedAt: now,
          nextDueDate: nextDue,
          actionType: 'Equipment Commissioning & Tagging',
          notes: 'Asset registered in database.',
        },
      });

      return NextResponse.json({ success: true, count: 1, equipment: eq });
    }

    // Bulk Equipment Creation
    const qty = Number(count) || 5;
    const startIdx = building.equipments.length + 1;
    const tagPrefix = (prefix || building.name.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'EQP').toUpperCase();

    const createdEquipments = [];

    for (let i = 0; i < qty; i++) {
      const num = startIdx + i;
      const tag = `${tagPrefix}-${String(num).padStart(2, '0')}`;
      const floorNum = Math.floor((num - 1) / 3) + 1;
      const loc = locationBase ? `${locationBase} #${num}` : `Floor ${floorNum} - Corridor ${num}`;

      // Skip if tag exists
      const exists = await db.equipment.findUnique({ where: { qrCode: tag } });
      if (exists) continue;

      const eq = await db.equipment.create({
        data: {
          buildingId: building.id,
          qrCode: tag,
          type: type || 'Fire Extinguisher',
          capacity: capacity || 'ABC Dry Powder 6kg',
          location: loc,
          lastServiceDate: now,
          nextDueDate: nextDue,
          serviceIntervalMonths: intervalMos,
          status: 'COMPLIANT',
        },
      });

      await db.serviceLog.create({
        data: {
          equipmentId: eq.id,
          technicianName: 'Admin Bulk Import',
          servicedAt: now,
          nextDueDate: nextDue,
          actionType: 'Initial Commissioning & Tagging',
          notes: 'Unit registered with auto-generated QR code.',
        },
      });

      createdEquipments.push(eq);
    }

    return NextResponse.json({
      success: true,
      count: createdEquipments.length,
      equipments: createdEquipments,
    });
  } catch (error: any) {
    console.error('Error saving equipment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
