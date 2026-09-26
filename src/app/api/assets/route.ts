import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (buildingId) where.buildingId = buildingId;
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { qrCode: { contains: search } },
        { serialNumber: { contains: search } },
        { locationFloor: { contains: search } },
        { locationWing: { contains: search } },
        { locationSpecific: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    const assets = await db.asset.findMany({
      where,
      include: {
        building: {
          select: { id: true, name: true, city: true, occupancyType: true },
        },
        inspections: {
          orderBy: { inspectedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ assets });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if batch creation
    if (Array.isArray(body.assets)) {
      const created = [];
      for (const item of body.assets) {
        const asset = await db.asset.create({
          data: {
            ...item,
            lastRefillDate: new Date(item.lastRefillDate || new Date()),
            nextRefillDueDate: new Date(item.nextRefillDueDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
            lastHydroTestDate: new Date(item.lastHydroTestDate || new Date()),
            nextHydroTestDueDate: new Date(item.nextHydroTestDueDate || new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000)),
          },
        });
        created.push(asset);
      }
      return NextResponse.json({ success: true, count: created.length, assets: created });
    }

    // Single asset creation
    const {
      buildingId,
      qrCode,
      type,
      capacity,
      brand,
      serialNumber,
      locationFloor,
      locationWing,
      locationSpecific,
      mfgYear,
      lastRefillDate,
      nextRefillDueDate,
      lastHydroTestDate,
      nextHydroTestDueDate,
      status,
      weightKg,
    } = body;

    const newAsset = await db.asset.create({
      data: {
        buildingId,
        qrCode: qrCode || `VGL-${Date.now().toString().slice(-6)}`,
        type: type || 'ABC_DRY_POWDER',
        capacity: capacity || '6 KG',
        brand: brand || 'Ceasefire',
        serialNumber: serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
        locationFloor: locationFloor || 'Floor 1',
        locationWing: locationWing || 'Main Wing',
        locationSpecific: locationSpecific || 'Near Corridor Exit',
        mfgYear: Number(mfgYear) || new Date().getFullYear(),
        lastRefillDate: new Date(lastRefillDate || new Date()),
        nextRefillDueDate: new Date(nextRefillDueDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        lastHydroTestDate: new Date(lastHydroTestDate || new Date()),
        nextHydroTestDueDate: new Date(nextHydroTestDueDate || new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000)),
        status: status || 'OPERATIONAL',
        weightKg: weightKg ? parseFloat(weightKg) : null,
      },
    });

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error: any) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
