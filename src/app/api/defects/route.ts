import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ defects: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const defects = await (db as any).defect.findMany({
      where,
      include: {
        building: { select: { id: true, name: true } },
        equipment: { select: { id: true, qrCode: true, type: true, location: true } },
      },
      orderBy: { reportedAt: 'desc' },
    });

    return NextResponse.json({ defects });
  } catch (error: any) {
    console.error('Error fetching defects:', error);
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
    const { buildingId, equipmentId, description, severity, photoUrl } = body;

    if (!buildingId || !description) {
      return NextResponse.json({ error: 'Building ID and description are required' }, { status: 400 });
    }

    const defect = await (db as any).defect.create({
      data: {
        organizationId: auth.organization.id,
        buildingId,
        equipmentId: equipmentId || null,
        description: description.trim(),
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        photoUrl: photoUrl || null,
      },
    });

    if (equipmentId) {
      await (db as any).equipment.update({
        where: { id: equipmentId },
        data: { status: 'DEFECTIVE' },
      });
    }

    return NextResponse.json({ success: true, defect });
  } catch (error: any) {
    console.error('Error reporting defect:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
