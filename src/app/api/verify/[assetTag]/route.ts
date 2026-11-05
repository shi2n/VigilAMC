import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkVerifyRateLimit } from '@/lib/portalSession';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { qrCode?: string; assetTag?: string } }
) {
  try {
    const rawTag = params.assetTag || params.qrCode || '';
    const assetTag = decodeURIComponent(rawTag).trim();

    if (!assetTag) {
      return NextResponse.json({ error: 'Record not available' }, { status: 404 });
    }

    // Rate-limiting: max 30 lookups per minute per IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';
    const rateCheck = checkVerifyRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many lookup requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    // DEMO ASSET TAG (Feature Demonstration H3)
    if (assetTag.toUpperCase() === 'EXT-DEMO-01' || assetTag.toUpperCase() === 'DEMO-EXT-01') {
      return NextResponse.json({
        assetTag: 'DEMO-EXT-01',
        type: 'ABC Dry Powder 6kg (IS 15683)',
        capacity: '6kg Stored Pressure',
        buildingName: 'Horizon Tower Alpha (Sample Demonstration)',
        city: 'Noida',
        status: 'OK',
        lastApprovedInspectionDate: '2026-11-02T10:00:00.000Z',
        nextServiceDue: '2027-05-02T10:00:00.000Z',
        agencyName: 'Apex Shield Fire Safety AMC (Demo Agency)',
        agencyLogoUrl: '/brand/logo-tile-192.png',
        recordId: 'rec_demo_asset_001',
        isDemo: true,
      });
    }

    // Lookup equipment by qrCode or id
    const equipment = await (db as any).equipment.findFirst({
      where: {
        OR: [
          { qrCode: assetTag },
          { id: assetTag },
        ],
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            city: true,
            organizationId: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            brandLogoUrl: true,
            publicVerificationEnabled: true,
          },
        },
      },
    });

    // Generic 404 if not found
    if (!equipment || !equipment.building) {
      return NextResponse.json({ error: 'Record not available' }, { status: 404 });
    }

    // Privacy toggle check: if agency disabled public verification, return generic 404
    if (equipment.organization && equipment.organization.publicVerificationEnabled === false) {
      return NextResponse.json({ error: 'Record not available' }, { status: 404 });
    }

    // Compute status from real due date
    const now = new Date();
    const dueDate = equipment.nextDueDate ? new Date(equipment.nextDueDate) : null;
    const diffDays =
      dueDate && !isNaN(dueDate.getTime())
        ? Math.ceil((dueDate.getTime() - now.getTime()) / 86400000)
        : null;

    let computedStatus = 'OK';
    if ((diffDays !== null && diffDays < 0) || equipment.status === 'OVERDUE') {
      computedStatus = 'EXPIRED';
    } else if ((diffDays !== null && diffDays <= 30) || equipment.status === 'DUE_SOON') {
      computedStatus = 'DUE_SOON';
    }

    // Latest approved inspection only
    const latestInspection = await (db as any).inspection.findFirst({
      where: {
        equipmentId: equipment.id,
        approvalStatus: 'APPROVED',
      },
      select: {
        date: true,
        status: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // STRICT PRIVACY GUARANTEE: NO address, NO photos, NO GPS, NO client contact, NO technician PII
    return NextResponse.json({
      assetTag: equipment.qrCode || equipment.id,
      type: equipment.type,
      capacity: equipment.capacity || 'Standard ISI Unit',
      buildingName: equipment.building.name,
      city: equipment.building.city || 'India',
      status: computedStatus,
      lastApprovedInspectionDate: latestInspection?.date || null,
      nextServiceDue: equipment.nextDueDate ? equipment.nextDueDate.toISOString() : null,
      agencyName: equipment.organization?.name || 'Licensed Fire Safety Agency',
      agencyLogoUrl: equipment.organization?.brandLogoUrl || null,
      recordId: equipment.id,
    });
  } catch (error: any) {
    console.error('[Public Verify API Error]:', error);
    return NextResponse.json({ error: 'Record not available' }, { status: 404 });
  }
}
