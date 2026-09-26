import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
        { location: { contains: search } },
        { capacity: { contains: search } },
        { type: { contains: search } },
      ];
    }

    const equipments = await db.equipment.findMany({
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
      locationFloor: eq.location,
      locationWing: '',
      locationSpecific: eq.location,
      brand: 'Standard ISI',
      lastRefillDate: eq.lastServiceDate,
      nextRefillDueDate: eq.nextDueDate,
      lastHydroTestDate: eq.lastServiceDate,
      nextHydroTestDueDate: eq.nextDueDate,
    }));

    return NextResponse.json({ assets });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
