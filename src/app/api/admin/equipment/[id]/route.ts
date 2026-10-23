import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ensureR2PhotoUrl, deleteFromR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

function deriveEquipmentDbStatus(nextDueDate: Date): string {
  const now = new Date();
  const diffDays = Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'OVERDUE';
  if (diffDays <= 30) return 'DUE_SOON';
  return 'COMPLIANT';
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const equipment = await (db as any).equipment.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
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
    const { requireAdmin } = await import('@/lib/auth');
    const auth = await requireAdmin(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      photoUrl,
    } = body;

    const existing = await (db as any).equipment.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Equipment not found or access denied' }, { status: 404 });
    }

    // Check if asset ID is being changed and if new code already exists
    if (qrCode && qrCode.trim().toUpperCase() !== existing.qrCode) {
      const duplicate = await (db as any).equipment.findUnique({ where: { qrCode: qrCode.trim().toUpperCase() } });
      if (duplicate) {
        return NextResponse.json({ error: `Asset ID '${qrCode}' already in use.` }, { status: 400 });
      }
    }

    const finalLastServiceDate = lastServiceDate ? new Date(lastServiceDate) : existing.lastServiceDate;
    const finalNextDueDate = nextDueDate ? new Date(nextDueDate) : existing.nextDueDate;
    const derivedStatus = deriveEquipmentDbStatus(new Date(finalNextDueDate));

    const updated = await (db as any).equipment.update({
      where: { id: params.id },
      data: {
        qrCode: qrCode ? qrCode.trim().toUpperCase() : existing.qrCode,
        type: type !== undefined ? type : existing.type,
        capacity: capacity !== undefined ? capacity : existing.capacity,
        location: location !== undefined ? location : existing.location,
        lastServiceDate: finalLastServiceDate,
        nextDueDate: finalNextDueDate,
        serviceIntervalMonths:
          serviceIntervalMonths !== undefined ? Number(serviceIntervalMonths) : existing.serviceIntervalMonths,
        status: nextDueDate ? derivedStatus : status !== undefined ? status : derivedStatus,
        buildingId: buildingId !== undefined ? buildingId : existing.buildingId,
        photoUrl:
          photoUrl !== undefined
            ? await ensureR2PhotoUrl({ photoUrl, organizationId: auth.organization.id, folder: 'equipment' })
            : existing.photoUrl,
      },
    });

    return NextResponse.json({ success: true, equipment: updated });
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    const status = error.message?.startsWith('FORBIDDEN') ? 403 : error.message?.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { requireAdmin } = await import('@/lib/auth');
    const auth = await requireAdmin(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await (db as any).equipment.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Equipment not found or access denied' }, { status: 404 });
    }

    if (existing.photoUrl && existing.photoUrl.includes('.r2.dev/')) {
      deleteFromR2(existing.photoUrl).catch(() => {});
    }
    await (db as any).equipment.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Equipment deleted' });
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    const status = error.message?.startsWith('FORBIDDEN') ? 403 : error.message?.startsWith('UNAUTHORIZED') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
