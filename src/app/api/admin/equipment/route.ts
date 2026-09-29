import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, logAuditActivity } from '@/lib/auth';
import { checkPlanLimit } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ equipments: [] });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = {
      organizationId: auth.organization.id,
    };

    if (buildingId && buildingId !== 'ALL') {
      where.buildingId = buildingId;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.AND = [
        {
          OR: [
            { qrCode: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { capacity: { contains: search, mode: 'insensitive' } },
            { type: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const equipments = await (db as any).equipment.findMany({
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
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const building = await (db as any).building.findFirst({
      where: {
        id: buildingId,
        organizationId: auth.organization.id,
      },
      include: { equipments: true },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found or access denied' }, { status: 404 });
    }

    const intervalMos = Number(serviceIntervalMonths) || 12;
    const now = lastServiceDate ? new Date(lastServiceDate) : new Date();
    const nextDue = new Date(now.getTime() + intervalMos * 30 * 24 * 60 * 60 * 1000);

    // Single Equipment Creation
    if (isSingle) {
      if (!qrCode) {
        return NextResponse.json({ error: 'QR Code identifier is required' }, { status: 400 });
      }

      // Enforce Asset Limit for Single Addition
      const limitCheck = await checkPlanLimit(auth.organization.id, 'assets', 1);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: limitCheck.message,
            code: 'PLAN_LIMIT_EXCEEDED',
            current: limitCheck.current,
            max: limitCheck.max,
            planName: limitCheck.planName,
          },
          { status: 403 }
        );
      }

      const existing = await (db as any).equipment.findUnique({ where: { qrCode: qrCode.trim().toUpperCase() } });
      if (existing) {
        return NextResponse.json({ error: `QR Tag '${qrCode}' already exists in database.` }, { status: 400 });
      }

      const eq = await (db as any).equipment.create({
        data: {
          organizationId: auth.organization.id,
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

      await (db as any).serviceLog.create({
        data: {
          equipmentId: eq.id,
          technicianName: auth.profile?.fullName || 'Agency Admin',
          servicedAt: now,
          nextDueDate: nextDue,
          actionType: 'Equipment Commissioning & Tagging',
          notes: 'Asset registered in database.',
        },
      });

      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'ASSET_CREATED',
        entityType: 'Equipment',
        entityId: eq.id,
        details: `Created fire asset "${eq.type} (${eq.capacity})" with QR "${eq.qrCode}" at "${building.name}"`,
      });

      return NextResponse.json({ success: true, count: 1, equipment: eq });
    }

    // Bulk Equipment Creation
    const qty = Number(count) || 5;

    // Enforce Asset Limit for Bulk Addition
    const limitCheck = await checkPlanLimit(auth.organization.id, 'assets', qty);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
          code: 'PLAN_LIMIT_EXCEEDED',
          current: limitCheck.current,
          max: limitCheck.max,
          planName: limitCheck.planName,
        },
        { status: 403 }
      );
    }

    const startIdx = building.equipments.length + 1;
    const tagPrefix = (prefix || building.name.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'EQP').toUpperCase();

    const createdEquipments = [];

    for (let i = 0; i < qty; i++) {
      const num = startIdx + i;
      const tag = `${tagPrefix}-${String(num).padStart(2, '0')}`;
      const floorNum = Math.floor((num - 1) / 3) + 1;
      const loc = locationBase ? `${locationBase} #${num}` : `Floor ${floorNum} - Corridor ${num}`;

      const exists = await (db as any).equipment.findUnique({ where: { qrCode: tag } });
      if (exists) continue;

      const eq = await (db as any).equipment.create({
        data: {
          organizationId: auth.organization.id,
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

      await (db as any).serviceLog.create({
        data: {
          equipmentId: eq.id,
          technicianName: auth.profile?.fullName || 'Agency Admin Bulk Import',
          servicedAt: now,
          nextDueDate: nextDue,
          actionType: 'Initial Commissioning & Tagging',
          notes: 'Unit registered with auto-generated QR code.',
        },
      });

      createdEquipments.push(eq);
    }

    if (createdEquipments.length > 0) {
      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'ASSETS_BULK_CREATED',
        entityType: 'Equipment',
        entityId: building.id,
        details: `Bulk created ${createdEquipments.length} fire assets (${type || 'Fire Extinguisher'}) at "${building.name}"`,
      });
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
