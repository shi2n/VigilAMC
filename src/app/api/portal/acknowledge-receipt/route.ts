import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPortalActor } from '@/lib/portalSession';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const actor = await getPortalActor(request);
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { reportRef, buildingId } = body;

    if (!reportRef || !buildingId) {
      return NextResponse.json(
        { error: 'reportRef and buildingId are required' },
        { status: 400 }
      );
    }

    // STRICT CROSS-CLIENT CHECK: Building MUST belong to this client
    const building = await (db as any).building.findFirst({
      where: {
        id: buildingId,
        clientId: actor.portalUser.clientOrgId,
      },
    });

    if (!building) {
      return NextResponse.json(
        { error: 'Forbidden: Building does not belong to your organization' },
        { status: 403 }
      );
    }

    // Idempotent upsert
    const ack = await (db as any).reportAck.upsert({
      where: {
        reportRef_portalUserId: {
          reportRef,
          portalUserId: actor.portalUser.id,
        },
      },
      create: {
        reportRef,
        buildingId,
        portalUserId: actor.portalUser.id,
        acknowledgedAt: new Date(),
      },
      update: {
        acknowledgedAt: new Date(),
      },
      include: {
        portalUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Write activity log entry
    await (db as any).activityLog.create({
      data: {
        organizationId: actor.organization.id,
        userId: null,
        userEmail: actor.portalUser.email,
        action: 'REPORT_RECEIPT_ACKNOWLEDGED',
        entityType: 'ReportAck',
        entityId: ack.id,
        details: `Client ${actor.portalUser.name} (${actor.client.name}) acknowledged receipt for report ${reportRef} (${building.name})`,
      },
    });

    return NextResponse.json({
      success: true,
      ack: {
        id: ack.id,
        reportRef: ack.reportRef,
        buildingId: ack.buildingId,
        acknowledgedAt: ack.acknowledgedAt,
        clientName: actor.portalUser.name,
      },
    });
  } catch (error: any) {
    console.error('[Acknowledge Receipt Error]:', error);
    return NextResponse.json({ error: 'Failed to record acknowledgement' }, { status: 500 });
  }
}
