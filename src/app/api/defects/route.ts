import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ensureR2PhotoUrl } from '@/lib/r2';
import { EVIDENCE_NO_STORE_HEADERS, resolveSignedEvidenceUrlMap } from '@/lib/evidencePhotos';

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

    const signedMap = await resolveSignedEvidenceUrlMap(
      defects.map((d: any) => d.photoUrl),
      auth.organization.id
    );
    const signedDefects = defects.map((d: any) => ({
      ...d,
      photoUrl: d.photoUrl ? signedMap.get(String(d.photoUrl).trim()) ?? null : null,
    }));

    return NextResponse.json({ defects: signedDefects }, { headers: EVIDENCE_NO_STORE_HEADERS });
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
        photoUrl: await ensureR2PhotoUrl({
          photoUrl,
          organizationId: auth.organization.id,
          folder: 'defects',
        }),
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
