import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, logAuditActivity } from '@/lib/auth';
import { isFounderOwner } from '@/lib/founderAuth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['NEW', 'CONTACTED', 'IN_DISCUSSION', 'QUALIFIED', 'CLOSED', 'NOT_SUITABLE'];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getCurrentUser(request);
  if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
    return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
  }

  const investor = await (db as any).investorInterest.findUnique({
    where: { id: params.id },
  });
  return NextResponse.json({ investor });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Investor ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await (db as any).investorInterest.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { contributionMessage: notes } : {}),
      },
    });

    if (auth.organization?.id) {
      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        action: 'UPDATE_INVESTOR_STATUS',
        entityType: 'INVESTOR_LEAD',
        entityId: id,
        details: JSON.stringify({ previousStatus: body.oldStatus, newStatus: status }),
      }).catch((e) => console.error('Audit log error:', e));
    }

    return NextResponse.json({
      success: true,
      investor: updated,
    });
  } catch (error: any) {
    console.error('Error updating investor lead:', error);
    return NextResponse.json({ error: error.message || 'Forbidden' }, { status: 403 });
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  return PATCH(request, context);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
    }

    await (db as any).investorInterest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error: any) {
    console.error('Error deleting investor lead:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete investor record' }, { status: 500 });
  }
}
