import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ensureR2PhotoUrl } from '@/lib/r2';

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
        building: { select: { id: true, name: true, address: true } },
        equipment: { select: { id: true, qrCode: true, type: true, capacity: true, location: true, status: true } },
        issues: true,
        partsUsed: true,
        inspectionPhotos: true,
        job: { select: { id: true, jobNumber: true, title: true } },
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
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      buildingId,
      equipmentId,
      status,
      checklist,
      remarks,
      technicianName,
      photoUrl,
      photos,
      latitude,
      longitude,
    } = body;

    if (!buildingId) {
      return NextResponse.json({ error: 'Building ID is required' }, { status: 400 });
    }

    let resolvedPhotoArray: string[] = [];
    if (Array.isArray(photos)) {
      for (const p of photos) {
        const u = await ensureR2PhotoUrl({
          photoUrl: p,
          organizationId: auth.organization.id,
          folder: 'inspections',
        });
        if (u) resolvedPhotoArray.push(u);
      }
    } else if (typeof photos === 'string' && photos.trim()) {
      try {
        const parsed = JSON.parse(photos);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            const u = await ensureR2PhotoUrl({
              photoUrl: p,
              organizationId: auth.organization.id,
              folder: 'inspections',
            });
            if (u) resolvedPhotoArray.push(u);
          }
        }
      } catch {
        const u = await ensureR2PhotoUrl({
          photoUrl: photos,
          organizationId: auth.organization.id,
          folder: 'inspections',
        });
        if (u) resolvedPhotoArray.push(u);
      }
    } else if (photoUrl) {
      const u = await ensureR2PhotoUrl({
        photoUrl,
        organizationId: auth.organization.id,
        folder: 'inspections',
      });
      if (u) resolvedPhotoArray.push(u);
    }

    const normalizedPhotos = resolvedPhotoArray.length > 0 ? JSON.stringify(resolvedPhotoArray) : null;

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
        photos: normalizedPhotos,
        latitude: latitude !== undefined ? Number(latitude) : null,
        longitude: longitude !== undefined ? Number(longitude) : null,
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
