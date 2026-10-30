import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }
    const userId = auth.user.id;
    const organizationId = auth.organization?.id;
    if (!organizationId) {
      return NextResponse.json({ error: 'No associated organization found' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'all'; // 'week', 'month', 'all'
    const buildingFilter = searchParams.get('buildingId');
    const resultFilter = searchParams.get('result'); // 'PASSED', 'FAILED', 'SERVICE_REQUIRED'
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const now = new Date();
    let startDate: Date | null = null;
    if (dateRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 1. Fetch completed inspections for this technician
    const inspWhere: any = {
      organizationId,
      OR: [
        { technicianId: userId },
        { technicianName: auth.profile?.fullName || auth.user.email },
      ],
    };
    if (startDate) {
      inspWhere.date = { gte: startDate };
    }
    if (buildingFilter && buildingFilter !== 'ALL') {
      inspWhere.buildingId = buildingFilter;
    }
    if (resultFilter && resultFilter !== 'ALL') {
      inspWhere.status = resultFilter;
    }

    const inspections = await (db as any).inspection.findMany({
      where: inspWhere,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        equipment: {
          select: {
            id: true,
            qrCode: true,
            type: true,
            location: true,
            floor: true,
            status: true,
          },
        },
        inspectionPhotos: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            photoUrl: true,
            caption: true,
            category: true,
            capturedAt: true,
            dayOfWeek: true,
            latitude: true,
            longitude: true,
            gpsAccuracy: true,
            gpsSource: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    // 2. Fetch completed WorkOrders for this technician
    const woWhere: any = {
      organizationId,
      status: 'COMPLETED',
      assignedToId: userId,
    };
    if (startDate) {
      woWhere.completedAt = { gte: startDate };
    }
    if (buildingFilter && buildingFilter !== 'ALL') {
      woWhere.buildingId = buildingFilter;
    }

    const completedWorkOrders = await (db as any).workOrder.findMany({
      where: woWhere,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
          },
        },
        equipment: {
          select: {
            id: true,
            qrCode: true,
            type: true,
            location: true,
            floor: true,
            status: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    // Unify into history list
    const history: any[] = [];

    for (const insp of inspections) {
      let floorZone = insp.equipment?.floor || '';
      if (!floorZone && insp.equipment?.location) {
        const m = insp.equipment.location.match(/^(B\d|Basement\s*\d?|Ground(?:\s*Floor)?|GF|Floor\s*\d+|Level\s*\d+|Terrace|Pump\s*Room|Lobby|Gate)/i);
        floorZone = m ? m[1] : insp.equipment.location.split(/[-–•,]/)[0]?.trim() || 'Main Zone';
      }
      if (!floorZone) floorZone = 'General';

      // Parse legacy photo JSON if inspectionPhotos is empty
      let photos = insp.inspectionPhotos || [];
      if (photos.length === 0 && insp.photos) {
        try {
          const parsed = JSON.parse(insp.photos);
          if (Array.isArray(parsed)) {
            photos = parsed.map((url: string, idx: number) => ({
              id: `legacy-${insp.id}-${idx}`,
              photoUrl: url,
              caption: insp.remarks || null,
              category: 'GAUGE',
              capturedAt: insp.date,
              dayOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date(insp.date).getDay()],
              latitude: insp.latitude,
              longitude: insp.longitude,
              gpsAccuracy: insp.gpsAccuracy,
              gpsSource: 'LIVE',
            }));
          }
        } catch {}
      }

      history.push({
        id: insp.id,
        source: 'INSPECTION',
        date: insp.date,
        building: {
          id: insp.building?.id,
          name: insp.building?.name || 'Building',
          address: insp.building?.address,
          latitude: insp.building?.latitude ?? insp.latitude,
          longitude: insp.building?.longitude ?? insp.longitude,
        },
        assetTag: insp.equipment?.qrCode || insp.equipment?.id || 'General Inspection',
        equipmentType: insp.equipment?.type || 'Fire Safety Equipment',
        floorZone,
        result: insp.status || 'PASSED', // PASSED, FAILED, SERVICE_REQUIRED
        remarks: insp.remarks || '',
        customerSignature: insp.customerSignature || null,
        technicianSignature: insp.technicianSignature || null,
        photos,
        syncStatus: 'SYNCED',
        latitude: insp.latitude,
        longitude: insp.longitude,
        gpsAccuracy: insp.gpsAccuracy,
      });
    }

    for (const wo of completedWorkOrders) {
      if (resultFilter && resultFilter !== 'ALL' && resultFilter !== 'PASSED') continue;
      let floorZone = wo.equipment?.floor || '';
      if (!floorZone && wo.equipment?.location) {
        const m = wo.equipment.location.match(/^(B\d|Basement\s*\d?|Ground(?:\s*Floor)?|GF|Floor\s*\d+|Level\s*\d+|Terrace|Pump\s*Room|Lobby|Gate)/i);
        floorZone = m ? m[1] : wo.equipment.location.split(/[-–•,]/)[0]?.trim() || 'Main Zone';
      }
      if (!floorZone) floorZone = 'General';

      history.push({
        id: wo.id,
        source: 'WORK_ORDER',
        date: wo.completedAt || wo.updatedAt,
        building: {
          id: wo.building?.id,
          name: wo.building?.name || 'Building',
          address: wo.building?.address,
          latitude: wo.building?.latitude,
          longitude: wo.building?.longitude,
        },
        assetTag: wo.equipment?.qrCode || wo.equipment?.id || 'Work Order',
        equipmentType: wo.title,
        floorZone,
        result: 'COMPLETED',
        remarks: wo.description + (wo.notes ? `\nNotes: ${wo.notes}` : ''),
        photos: [],
        syncStatus: 'SYNCED',
        latitude: wo.building?.latitude,
        longitude: wo.building?.longitude,
      });
    }

    // Sort reverse chronological
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply client-requested text search if present
    const filteredHistory = search
      ? history.filter((item) => {
          const bName = (item.building?.name || '').toLowerCase();
          const tag = (item.assetTag || '').toLowerCase();
          const eqType = (item.equipmentType || '').toLowerCase();
          const rem = (item.remarks || '').toLowerCase();
          return bName.includes(search) || tag.includes(search) || eqType.includes(search) || rem.includes(search);
        })
      : history;

    return NextResponse.json({
      success: true,
      history: filteredHistory,
      totalCount: filteredHistory.length,
    });
  } catch (error: any) {
    console.error('Error fetching technician history:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
