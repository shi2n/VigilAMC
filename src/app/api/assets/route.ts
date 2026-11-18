import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { addCalendarMonths, toDbDate, todayCalendarDateString } from '@/lib/dates';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (buildingId && buildingId !== 'ALL') where.buildingId = buildingId;
    if (status && status !== 'ALL') where.status = status;
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
          select: { id: true, name: true, address: true },
        },
        serviceLogs: {
          orderBy: { servicedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const assets = equipments.map((eq: any) => ({
      ...eq,
      serialNumber: eq.qrCode,
      locationFloor: eq.floor || eq.location,
      locationWing: eq.wing || '',
      locationSpecific: eq.location,
      brand: eq.manufacturer || 'Standard ISI',
      lastRefillDate: eq.lastServiceDate,
      nextRefillDueDate: eq.refillDueDate || eq.nextDueDate,
      lastHydroTestDate: eq.lastServiceDate,
      nextHydroTestDueDate: eq.hydroDueDate || eq.nextDueDate,
    }));

    return NextResponse.json({ assets });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawAssets = Array.isArray(body.assets) ? body.assets : [];

    if (rawAssets.length === 0) {
      return NextResponse.json({ error: 'At least one asset is required' }, { status: 400 });
    }
    if (rawAssets.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 assets can be created per batch' }, { status: 400 });
    }

    const buildingIds = Array.from(
      new Set(rawAssets.map((a: any) => a?.buildingId).filter((id: any) => typeof id === 'string' && id.trim()))
    ) as string[];

    if (buildingIds.length === 0) {
      return NextResponse.json({ error: 'Valid buildingId is required for every asset' }, { status: 400 });
    }

    const ownedBuildings = await (db as any).building.findMany({
      where: {
        id: { in: buildingIds },
        organizationId: auth.organization.id,
      },
      select: { id: true },
    });

    const ownedSet = new Set(ownedBuildings.map((b: any) => b.id));
    if (buildingIds.some((id) => !ownedSet.has(id))) {
      return NextResponse.json({ error: 'Forbidden: Building not found in your organization' }, { status: 403 });
    }

    const todayStr = todayCalendarDateString();
    for (const item of rawAssets) {
      const tag = String(item.qrCode || '').trim().toUpperCase();
      if (!tag || !item.buildingId) {
        return NextResponse.json({ error: 'Each asset requires buildingId and qrCode tag' }, { status: 400 });
      }
    }

    const created = await (db as any).$transaction(async (tx: any) => {
      const results: any[] = [];
      for (const item of rawAssets) {
        const tag = String(item.qrCode).trim().toUpperCase();
        const lastStr = item.lastRefillDate || item.lastServiceDate || todayStr;
        const nextStr = item.nextRefillDueDate || item.nextDueDate || addCalendarMonths(todayStr, 12);
        const hydroStr = item.nextHydroTestDueDate || item.hydroDueDate || null;

        const eq = await tx.equipment.create({
          data: {
            buildingId: item.buildingId,
            organizationId: auth.organization.id,
            qrCode: tag,
            type: String(item.type || 'ABC_DRY_POWDER').trim(),
            capacity: String(item.capacity || '6 KG').trim(),
            location: String(item.locationSpecific || item.location || 'Facility Zone').trim(),
            floor: item.locationFloor ? String(item.locationFloor).trim() : null,
            wing: item.locationWing ? String(item.locationWing).trim() : null,
            manufacturer: item.brand ? String(item.brand).trim() : null,
            serialNumber: item.serialNumber ? String(item.serialNumber).trim() : null,
            lastServiceDate: toDbDate(lastStr),
            nextDueDate: toDbDate(nextStr),
            refillDueDate: toDbDate(nextStr),
            hydroDueDate: hydroStr ? toDbDate(hydroStr) : null,
            serviceIntervalMonths: Number(item.serviceIntervalMonths) || 12,
            status: 'COMPLIANT',
          },
        });
        results.push(eq);
      }
      return results;
    });

    return NextResponse.json({ success: true, count: created.length, assets: created }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate Asset Tag ID detected. Please use unique Asset Tag IDs.' }, { status: 409 });
    }
    console.error('Error creating assets:', error);
    return NextResponse.json({ error: error.message || 'Failed to create assets' }, { status: 500 });
  }
}
