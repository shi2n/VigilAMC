import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ inspections: [] });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (buildingId && buildingId !== 'ALL') {
      where.buildingId = buildingId;
    }

    const inspections = await (db as any).inspection.findMany({
      where,
      include: {
        building: { select: { id: true, name: true } },
        equipment: { select: { id: true, qrCode: true, type: true, location: true } },
        defects: true,
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return NextResponse.json({ inspections });
  } catch (error: any) {
    console.error('Error fetching inspections:', error);
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
    const { buildingId, equipmentId, status, checklist, remarks, technicianName } = body;

    if (!buildingId) {
      return NextResponse.json({ error: 'Building ID is required' }, { status: 400 });
    }

    const inspection = await (db as any).inspection.create({
      data: {
        organizationId: auth.organization.id,
        buildingId,
        equipmentId: equipmentId || null,
        technicianId: auth.user.id,
        technicianName: technicianName || auth.profile?.fullName || 'Field Technician',
        status: status || 'PASSED',
        checklist: typeof checklist === 'string' ? checklist : JSON.stringify(checklist || {}),
        remarks: remarks || '',
      },
    });

    if (equipmentId) {
      await (db as any).equipment.update({
        where: { id: equipmentId },
        data: {
          lastServiceDate: new Date(),
          status: status === 'FAILED' ? 'DEFECTIVE' : 'COMPLIANT',
        },
      });
    }

    return NextResponse.json({ success: true, inspection });
  } catch (error: any) {
    console.error('Error logging inspection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
