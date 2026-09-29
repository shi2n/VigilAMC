import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAuditActivity } from '@/lib/auth';
import { checkPlanLimit, getAgencySubscriptionAndUsage } from '@/lib/plans';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;
    const technicianId = params.id;

    const technician = await (db as any).userProfile.findFirst({
      where: {
        id: technicianId,
        organizationId,
        role: 'TECHNICIAN',
      },
      include: {
        assignedBuildings: {
          include: { building: true },
        },
        inspections: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            building: { select: { id: true, name: true } },
            equipment: { select: { id: true, qrCode: true, type: true, capacity: true } },
          },
        },
        assignedJobs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            building: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found or does not belong to your agency.' }, { status: 404 });
    }

    // Fetch technician activity
    const activity = await (db as any).activityLog.findMany({
      where: {
        organizationId,
        userId: technician.id,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      technician: {
        ...technician,
        assignedBuildings: technician.assignedBuildings.map((ab: any) => ab.building),
        activity,
      },
    });
  } catch (error: any) {
    console.error('Error fetching technician detail:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;
    const technicianId = params.id;

    // Verify technician exists and belongs to this organization
    const technician = await (db as any).userProfile.findFirst({
      where: {
        id: technicianId,
        organizationId,
        role: 'TECHNICIAN',
      },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found or does not belong to your agency.' }, { status: 404 });
    }

    const body = await request.json();
    const { fullName, phone, employeeId, status, assignedBuildingIds, newPassword } = body;

    // 1. Status change enforcement
    if (status && status !== technician.status) {
      if (status === 'ACTIVE') {
        // Enforce seat limit when activating an inactive technician
        const limitCheck = await checkPlanLimit(organizationId, 'technicians', 1);
        if (!limitCheck.allowed) {
          return NextResponse.json(
            {
              error: `Cannot activate technician: ${limitCheck.message}`,
              code: 'PLAN_LIMIT_EXCEEDED',
              current: limitCheck.current,
              max: limitCheck.max,
              planName: limitCheck.planName,
            },
            { status: 403 }
          );
        }
      }
    }

    // 2. Prepare profile updates
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (employeeId !== undefined) updateData.employeeId = employeeId.trim() || null;
    if (status !== undefined) updateData.status = status;

    const updatedProfile = await (db as any).userProfile.update({
      where: { id: technicianId },
      data: updateData,
    });

    // 3. Update Building Assignments if provided
    if (Array.isArray(assignedBuildingIds)) {
      // Remove current assignments
      await (db as any).technicianBuildingAssignment.deleteMany({
        where: { technicianId },
      });

      // Filter valid buildings that belong to this agency
      if (assignedBuildingIds.length > 0) {
        const validBuildings = await (db as any).building.findMany({
          where: {
            id: { in: assignedBuildingIds },
            organizationId,
          },
          select: { id: true },
        });

        if (validBuildings.length > 0) {
          await Promise.all(
            validBuildings.map((b: any) =>
              (db as any).technicianBuildingAssignment.create({
                data: {
                  technicianId,
                  buildingId: b.id,
                  assignedById: auth.user.id,
                },
              })
            )
          );
        }
      }

      await logAuditActivity({
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'TECHNICIAN_BUILDINGS_ASSIGNED',
        entityType: 'TechnicianBuildingAssignment',
        entityId: technicianId,
        details: `Updated building assignments for technician "${updatedProfile.fullName}" (${assignedBuildingIds.length} assigned)`,
      });
    }

    // 4. Handle Password Reset
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      const supabaseAdmin = getSupabaseAdmin();
      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(technicianId, {
        password: newPassword,
      });

      if (resetError) {
        console.error('Failed to reset technician password in Supabase Auth:', resetError);
        return NextResponse.json({ error: `Failed to reset password: ${resetError.message}` }, { status: 400 });
      }

      await logAuditActivity({
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'TECHNICIAN_PASSWORD_RESET',
        entityType: 'UserProfile',
        entityId: technicianId,
        details: `Admin reset password for technician "${updatedProfile.fullName}"`,
      });
    }

    // 5. Log audit action if general profile or status updated
    if (status && status !== technician.status) {
      await logAuditActivity({
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: status === 'ACTIVE' ? 'TECHNICIAN_ACTIVATED' : 'TECHNICIAN_DEACTIVATED',
        entityType: 'UserProfile',
        entityId: technicianId,
        details: `Technician "${updatedProfile.fullName}" status updated from ${technician.status} to ${status}`,
      });
    } else if (Object.keys(updateData).length > 0) {
      await logAuditActivity({
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'TECHNICIAN_UPDATED',
        entityType: 'UserProfile',
        entityId: technicianId,
        details: `Updated details for technician "${updatedProfile.fullName}"`,
      });
    }

    // Fetch refreshed technician with assignments
    const finalTech = await (db as any).userProfile.findUnique({
      where: { id: technicianId },
      include: {
        assignedBuildings: {
          include: { building: true },
        },
      },
    });

    const { usage } = await getAgencySubscriptionAndUsage(organizationId);

    return NextResponse.json({
      success: true,
      message: 'Technician updated successfully',
      technician: {
        ...finalTech,
        assignedBuildings: finalTech.assignedBuildings.map((ab: any) => ab.building),
      },
      seatUsage: usage.technicians,
    });
  } catch (error: any) {
    console.error('Error updating technician:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to update technician' }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;
    const technicianId = params.id;

    // Verify technician belongs to agency
    const technician = await (db as any).userProfile.findFirst({
      where: {
        id: technicianId,
        organizationId,
        role: 'TECHNICIAN',
      },
      include: {
        inspections: { select: { id: true }, take: 1 },
        assignedJobs: { select: { id: true }, take: 1 },
        workOrders: { select: { id: true }, take: 1 },
      },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found or does not belong to your agency.' }, { status: 404 });
    }

    const hasHistoricalRecords =
      technician.inspections.length > 0 ||
      technician.assignedJobs.length > 0 ||
      technician.workOrders.length > 0;

    if (hasHistoricalRecords) {
      // PRESERVE HISTORICAL RECORDS FOR COMPLIANCE AUDITING:
      // Deactivate account, remove active building assignments, and free the active seat
      await (db as any).userProfile.update({
        where: { id: technicianId },
        data: {
          status: 'INACTIVE',
        },
      });

      await (db as any).technicianBuildingAssignment.deleteMany({
        where: { technicianId },
      });

      await logAuditActivity({
        organizationId,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'TECHNICIAN_DEACTIVATED_AND_ARCHIVED',
        entityType: 'UserProfile',
        entityId: technicianId,
        details: `Technician "${technician.fullName}" has historical inspection/job records and was safely deactivated rather than deleted to protect audit trails. Active seat was freed.`,
      });

      const { usage } = await getAgencySubscriptionAndUsage(organizationId);

      return NextResponse.json({
        success: true,
        archived: true,
        message: `Technician "${technician.fullName}" has recorded historical inspections/work and was safely deactivated. Historical records and compliance certificates are fully preserved, and the active seat has been freed.`,
        seatUsage: usage.technicians,
      });
    }

    // If zero historical records, safe to completely delete
    await (db as any).technicianBuildingAssignment.deleteMany({
      where: { technicianId },
    });

    await (db as any).userProfile.delete({
      where: { id: technicianId },
    });

    // Also delete from Supabase Auth
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.auth.admin.deleteUser(technicianId);
    } catch (e) {
      console.warn('Supabase auth deletion warning:', e);
    }

    await logAuditActivity({
      organizationId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'TECHNICIAN_REMOVED',
      entityType: 'UserProfile',
      entityId: technicianId,
      details: `Removed technician account "${technician.fullName}" (${technician.email})`,
    });

    const { usage } = await getAgencySubscriptionAndUsage(organizationId);

    return NextResponse.json({
      success: true,
      removed: true,
      message: `Technician "${technician.fullName}" removed successfully.`,
      seatUsage: usage.technicians,
    });
  } catch (error: any) {
    console.error('Error removing technician:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to remove technician' }, { status });
  }
}
