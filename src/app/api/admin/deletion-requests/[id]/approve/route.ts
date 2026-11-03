import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAuditActivity } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;
    const requestId = params.id;

    const deletionRequest = await (db as any).accountDeletionRequest.findFirst({
      where: {
        id: requestId,
        organizationId,
      },
      include: {
        userProfile: true,
      },
    });

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'Deletion request not found or does not belong to your agency.' },
        { status: 404 }
      );
    }

    if (deletionRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This deletion request has already been ${deletionRequest.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    const userProfileId = deletionRequest.userProfileId;
    const oldStaffName = deletionRequest.userProfile?.fullName || 'Technician';

    // 1. Delete user's DeviceToken rows
    await (db as any).deviceToken.deleteMany({
      where: { technicianId: userProfileId },
    }).catch(() => {});

    // 2. Delete pending SyncQueue (outbox) items for this technician
    await (db as any).syncQueue.deleteMany({
      where: {
        technicianId: userProfileId,
        status: 'PENDING',
      },
    }).catch(() => {});

    // 3. Remove active building assignments
    await (db as any).technicianBuildingAssignment.deleteMany({
      where: { technicianId: userProfileId },
    }).catch(() => {});

    // 4. Anonymize UserProfile:
    // name -> "Deleted user", clear phone/email/PIN/employeeId/avatarUrl
    // set Field-Team status to "INACTIVE" (blocked)
    // NOTE: Keep Inspection, InspectionPhoto, WorkOrder, VisitStamp untouched (statutory evidence)
    const anonymizedEmail = `deleted-${userProfileId.slice(0, 10)}@anonymized.vigilamc.app`;
    await (db as any).userProfile.update({
      where: { id: userProfileId },
      data: {
        fullName: 'Deleted user',
        phone: null,
        email: anonymizedEmail,
        passwordHash: null,
        employeeId: null,
        avatarUrl: null,
        status: 'INACTIVE',
      },
    });

    // 5. Delete Supabase Auth account to revoke all future login sessions
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.auth.admin.deleteUser(userProfileId);
    } catch (authErr) {
      console.warn('Supabase auth user deletion note:', authErr);
    }

    // 6. Update AccountDeletionRequest status
    const updatedRequest = await (db as any).accountDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        processedBy: auth.user.id,
      },
    });

    // 7. Write Activity Trail entry
    await logAuditActivity({
      organizationId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'ACCOUNT_DELETION_APPROVED',
      entityType: 'UserProfile',
      entityId: userProfileId,
      details: `Account deletion approved by agency admin for "${oldStaffName}" (ID: ${userProfileId}). Personal identifiers permanently anonymized; credentials and device tokens cleared. Statutory fire inspection records preserved under DPDP Act / fire safety audit retention.`,
    });

    return NextResponse.json({
      success: true,
      message: `Account for "${oldStaffName}" has been permanently anonymized and deactivated.`,
      request: updatedRequest,
    });
  } catch (error: any) {
    console.error('Error in approving deletion request:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to approve account deletion' }, { status });
  }
}
