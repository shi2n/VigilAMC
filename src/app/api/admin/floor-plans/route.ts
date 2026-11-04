import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { logAuditActivity } from '@/lib/auth';
import { ensureR2PhotoUrl } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    const where: any = {
      organizationId: auth.organization.id,
    };
    if (buildingId) {
      where.buildingId = buildingId;
    }

    const floorPlans = await (db as any).floorPlan.findMany({
      where,
      include: {
        pins: {
          include: {
            equipment: {
              select: {
                id: true,
                qrCode: true,
                type: true,
                capacity: true,
                location: true,
                floor: true,
                lastServiceDate: true,
                nextDueDate: true,
                hydroDueDate: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { uploadedAt: 'asc' },
    });

    return NextResponse.json({ floorPlans });
  } catch (error: any) {
    console.error('Error fetching floor plans:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, buildingId, floorLabel, imageUrl, floorPlanId, equipmentId, xPct, yPct } = body;
    const orgId = auth.organization.id;

    if (action === 'CREATE_PIN') {
      if (!floorPlanId || !equipmentId || xPct === undefined || yPct === undefined) {
        return NextResponse.json(
          { error: 'floorPlanId, equipmentId, xPct, and yPct are required' },
          { status: 400 }
        );
      }

      const plan = await (db as any).floorPlan.findFirst({
        where: { id: floorPlanId, organizationId: orgId },
      });
      if (!plan) {
        return NextResponse.json({ error: 'Floor plan not found' }, { status: 404 });
      }

      const clamp = (n: number) => Math.max(0, Math.min(100, Number(n.toFixed(2))));
      const createdPin = await (db as any).floorPlanPin.create({
        data: {
          floorPlanId: plan.id,
          buildingId: plan.buildingId,
          equipmentId: String(equipmentId),
          xPct: clamp(Number(xPct)),
          yPct: clamp(Number(yPct)),
        },
        include: {
          equipment: {
            select: {
              id: true,
              qrCode: true,
              type: true,
              capacity: true,
              location: true,
              floor: true,
              lastServiceDate: true,
              nextDueDate: true,
              hydroDueDate: true,
              status: true,
            },
          },
        },
      });

      await logAuditActivity({
        organizationId: orgId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'FLOOR_PLAN_PIN_PLACED',
        entityType: 'FloorPlanPin',
        entityId: createdPin.id,
        details: `Placed asset pin ${createdPin.equipment?.qrCode || equipmentId} on ${plan.floorLabel} at (${createdPin.xPct}%, ${createdPin.yPct}%)`,
      });

      return NextResponse.json({ success: true, pin: createdPin });
    }

    // Default: CREATE_PLAN
    if (!buildingId || !floorLabel || !imageUrl) {
      return NextResponse.json(
        { error: 'buildingId, floorLabel, and imageUrl are required' },
        { status: 400 }
      );
    }

    const bldg = await (db as any).building.findFirst({
      where: { id: buildingId, organizationId: orgId },
    });
    if (!bldg) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    let resolvedUrl = String(imageUrl);
    if (resolvedUrl.startsWith('data:image/')) {
      const uploaded = await ensureR2PhotoUrl({
        photoUrl: resolvedUrl,
        organizationId: orgId,
        folder: 'equipment',
      });
      if (uploaded) resolvedUrl = uploaded;
    }

    const createdPlan = await (db as any).floorPlan.create({
      data: {
        organizationId: orgId,
        buildingId: bldg.id,
        floorLabel: String(floorLabel).trim(),
        imageUrl: resolvedUrl,
      },
      include: {
        pins: {
          include: {
            equipment: {
              select: {
                id: true,
                qrCode: true,
                type: true,
                capacity: true,
                location: true,
                floor: true,
                lastServiceDate: true,
                nextDueDate: true,
                hydroDueDate: true,
                status: true,
              },
            },
          },
        },
      },
    });

    await logAuditActivity({
      organizationId: orgId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'FLOOR_PLAN_UPLOADED',
      entityType: 'FloorPlan',
      entityId: createdPlan.id,
      details: `Uploaded floor plan "${createdPlan.floorLabel}" for ${bldg.name}`,
    });

    return NextResponse.json({ success: true, floorPlan: createdPlan });
  } catch (error: any) {
    console.error('Error creating floor plan or pin:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pinId, xPct, yPct } = body;

    if (!pinId || xPct === undefined || yPct === undefined) {
      return NextResponse.json({ error: 'pinId, xPct, and yPct are required' }, { status: 400 });
    }

    const pin = await (db as any).floorPlanPin.findUnique({
      where: { id: pinId },
      include: { floorPlan: true, equipment: { select: { qrCode: true } } },
    });

    if (!pin || pin.floorPlan.organizationId !== auth.organization.id) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    const clamp = (n: number) => Math.max(0, Math.min(100, Number(n.toFixed(2))));
    const updatedPin = await (db as any).floorPlanPin.update({
      where: { id: pin.id },
      data: {
        xPct: clamp(Number(xPct)),
        yPct: clamp(Number(yPct)),
      },
      include: {
        equipment: {
          select: {
            id: true,
            qrCode: true,
            type: true,
            capacity: true,
            location: true,
            floor: true,
            lastServiceDate: true,
            nextDueDate: true,
            hydroDueDate: true,
            status: true,
          },
        },
      },
    });

    await logAuditActivity({
      organizationId: auth.organization.id,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'FLOOR_PLAN_PIN_MOVED',
      entityType: 'FloorPlanPin',
      entityId: updatedPin.id,
      details: `Moved pin ${pin.equipment?.qrCode || pin.equipmentId} to (${updatedPin.xPct}%, ${updatedPin.yPct}%)`,
    });

    return NextResponse.json({ success: true, pin: updatedPin });
  } catch (error: any) {
    console.error('Error updating floor plan pin:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pinId = searchParams.get('pinId');
    const floorPlanId = searchParams.get('floorPlanId');

    if (pinId) {
      const pin = await (db as any).floorPlanPin.findUnique({
        where: { id: pinId },
        include: { floorPlan: true, equipment: { select: { qrCode: true } } },
      });
      if (!pin || pin.floorPlan.organizationId !== auth.organization.id) {
        return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
      }
      await (db as any).floorPlanPin.delete({ where: { id: pin.id } });
      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'FLOOR_PLAN_PIN_DELETED',
        entityType: 'FloorPlanPin',
        entityId: pin.id,
        details: `Deleted pin ${pin.equipment?.qrCode || pin.equipmentId} from ${pin.floorPlan.floorLabel}`,
      });
      return NextResponse.json({ success: true });
    }

    if (floorPlanId) {
      const plan = await (db as any).floorPlan.findFirst({
        where: { id: floorPlanId, organizationId: auth.organization.id },
      });
      if (!plan) {
        return NextResponse.json({ error: 'Floor plan not found' }, { status: 404 });
      }
      await (db as any).floorPlan.delete({ where: { id: plan.id } });
      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'FLOOR_PLAN_DELETED',
        entityType: 'FloorPlan',
        entityId: plan.id,
        details: `Deleted floor plan "${plan.floorLabel}"`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'pinId or floorPlanId required' }, { status: 400 });
  } catch (error: any) {
    console.error('Error deleting floor plan or pin:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
