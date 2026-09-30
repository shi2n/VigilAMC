import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAuditActivity } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['NEW', 'CONTACTED', 'IN_DISCUSSION', 'QUALIFIED', 'CLOSED', 'NOT_SUITABLE'];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
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

    // Log admin audit activity
    await logAuditActivity({
      organizationId: auth.organization.id,
      userId: auth.user.id,
      action: 'UPDATE_INVESTOR_STATUS',
      entityType: 'INVESTOR_LEAD',
      entityId: id,
      details: JSON.stringify({ previousStatus: body.oldStatus, newStatus: status }),
    }).catch((e) => console.error('Audit log error:', e));

    return NextResponse.json({
      success: true,
      investor: updated,
    });
  } catch (error: any) {
    console.error('Error updating investor lead:', error);
    const statusCode = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ error: error.message || 'Failed to update investor record' }, { status: statusCode });
  }
}
