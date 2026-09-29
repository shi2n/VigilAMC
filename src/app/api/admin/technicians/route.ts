import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAuditActivity } from '@/lib/auth';
import { checkPlanLimit, getAgencySubscriptionAndUsage } from '@/lib/plans';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const [technicians, { usage, plan }, buildings] = await Promise.all([
      (db as any).userProfile.findMany({
        where: {
          organizationId,
          role: 'TECHNICIAN',
        },
        include: {
          assignedBuildings: {
            include: {
              building: {
                select: { id: true, name: true, address: true, city: true },
              },
            },
          },
          inspections: {
            select: { id: true },
          },
          assignedJobs: {
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      getAgencySubscriptionAndUsage(organizationId),
      (db as any).building.findMany({
        where: { organizationId },
        select: { id: true, name: true, address: true, city: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const formattedTechnicians = technicians.map((tech: any) => {
      const completedJobsCount = tech.assignedJobs.filter((j: any) => j.status === 'COMPLETED').length;
      const totalInspectionsCount = tech.inspections.length;

      return {
        id: tech.id,
        fullName: tech.fullName || 'Unnamed Technician',
        email: tech.email,
        phone: tech.phone || '—',
        employeeId: tech.employeeId || '—',
        status: tech.status || 'ACTIVE',
        lastLoginAt: tech.lastLoginAt,
        createdAt: tech.createdAt,
        assignedBuildings: tech.assignedBuildings.map((ab: any) => ab.building),
        completedJobs: completedJobsCount + totalInspectionsCount,
        activeJobsCount: tech.assignedJobs.filter((j: any) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS').length,
      };
    });

    return NextResponse.json({
      success: true,
      technicians: formattedTechnicians,
      seatUsage: usage.technicians,
      plan,
      buildings,
    });
  } catch (error: any) {
    console.error('Error fetching technicians:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const body = await request.json();
    const { fullName, email, phone, employeeId, password, assignedBuildingIds = [], status = 'ACTIVE' } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (fullName || '').trim();

    if (!trimmedName) {
      return NextResponse.json({ error: 'Technician full name is required' }, { status: 400 });
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid login email address is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 1. Enforce Server-Side Technician Seat Limits
    if (status === 'ACTIVE') {
      const limitCheck = await checkPlanLimit(organizationId, 'technicians', 1);
      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: limitCheck.message,
            code: 'PLAN_LIMIT_EXCEEDED',
            current: limitCheck.current,
            max: limitCheck.max,
            planName: limitCheck.planName,
          },
          { status: 403 }
        );
      }
    }

    // 2. Check if email is already in use in user profiles
    const existingProfile = await (db as any).userProfile.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: `An account with email "${normalizedEmail}" already exists in the system.` },
        { status: 409 }
      );
    }

    // 3. Create user in Supabase Auth via Admin API
    const supabaseAdmin = getSupabaseAdmin();
    let authUserId: string;

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: trimmedName,
        role: 'TECHNICIAN',
        phone: phone || '',
        organizationId: organizationId,
        agency_name: auth.organization.name,
      },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes('already registered')) {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = usersData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
        if (existing) {
          authUserId = existing.id;
          // Update their password and metadata
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            user_metadata: {
              full_name: trimmedName,
              role: 'TECHNICIAN',
              organizationId,
            },
          });
        } else {
          return NextResponse.json({ error: createError.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
    } else {
      authUserId = createData.user.id;
    }

    // 4. Create UserProfile in database
    const technician = await (db as any).userProfile.create({
      data: {
        id: authUserId,
        email: normalizedEmail,
        fullName: trimmedName,
        phone: phone || null,
        employeeId: employeeId?.trim() || null,
        role: 'TECHNICIAN',
        status: status || 'ACTIVE',
        organizationId: organizationId,
      },
    });

    // 5. Create Building Assignments if provided
    if (Array.isArray(assignedBuildingIds) && assignedBuildingIds.length > 0) {
      // Validate all buildings belong to this agency
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
                technicianId: technician.id,
                buildingId: b.id,
                assignedById: auth.user.id,
              },
            })
          )
        );
      }
    }

    // 6. Log audit action
    await logAuditActivity({
      organizationId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'TECHNICIAN_CREATED',
      entityType: 'UserProfile',
      entityId: technician.id,
      details: `Created technician account for "${trimmedName}" (${normalizedEmail}) with status ${status}`,
    });

    // Fetch refreshed technician with assignments
    const finalTech = await (db as any).userProfile.findUnique({
      where: { id: technician.id },
      include: {
        assignedBuildings: {
          include: { building: true },
        },
      },
    });

    // Get refreshed usage
    const { usage } = await getAgencySubscriptionAndUsage(organizationId);

    return NextResponse.json(
      {
        success: true,
        message: 'Technician account created successfully',
        technician: {
          id: finalTech.id,
          fullName: finalTech.fullName,
          email: finalTech.email,
          phone: finalTech.phone,
          employeeId: finalTech.employeeId,
          status: finalTech.status,
          assignedBuildings: finalTech.assignedBuildings.map((ab: any) => ab.building),
          createdAt: finalTech.createdAt,
        },
        seatUsage: usage.technicians,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating technician:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to create technician' }, { status });
  }
}
