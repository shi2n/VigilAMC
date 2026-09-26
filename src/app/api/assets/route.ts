import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ assets: [] });
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
