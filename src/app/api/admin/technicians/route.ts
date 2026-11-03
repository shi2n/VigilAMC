import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAuditActivity } from '@/lib/auth';
import { checkPlanLimit, getAgencySubscriptionAndUsage } from '@/lib/plans';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { hashPin } from '@/lib/techSession';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function cleanPhoneDigits(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

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
          deletionRequests: {
            where: { status: 'PENDING' },
            select: { id: true, requestedAt: true, status: true },
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
        activeJobsCount: tech.assignedJobs.filter(
          (j: any) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS'
        ).length,
        hasPendingDeletion: tech.deletionRequests && tech.deletionRequests.length > 0,
        pendingDeletionRequest: tech.deletionRequests?.[0] || null,
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
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      employeeId,
      password,
      assignedBuildingIds = [],
      status = 'ACTIVE',
    } = body;

    const trimmedName = (fullName || '').trim();
    const rawEmail = (email || '').trim().toLowerCase();
    const rawPhone = (phone || '').trim();
    const cleanedPhone = cleanPhoneDigits(rawPhone);

    if (!trimmedName) {
      return NextResponse.json({ error: 'Technician full name is required' }, { status: 400 });
    }

    if (cleanedPhone.length < 10 && (!rawEmail || !rawEmail.includes('@'))) {
      return NextResponse.json(
        { error: 'A valid 10-digit Indian Mobile Number (or email address) is required' },
        { status: 400 }
      );
    }

    if (!password || String(password).length < 6) {
      return NextResponse.json(
        { error: 'Password / PIN must be at least 6 characters long (e.g. 6-digit PIN)' },
        { status: 400 }
      );
    }

    // 1. Parallelize initial validation & queries to minimize DB roundtrips to Supabase
    let resolvedEmployeeId = (employeeId || '').trim().toUpperCase();
    const cleanEmpSlug = resolvedEmployeeId
      ? resolvedEmployeeId.toLowerCase().replace(/[^a-z0-9]/g, '')
      : 'tech';
    const tentativeEmail =
      rawEmail && rawEmail.includes('@')
        ? rawEmail
        : cleanedPhone.length >= 10
        ? `${cleanedPhone.slice(-10)}@tech.vigilamc.app`
        : `${cleanEmpSlug}@tech.vigilamc.app`;

    const [limitCheck, existingTechs, existingByEmail, validBuildings] = await Promise.all([
      status === 'ACTIVE'
        ? checkPlanLimit(organizationId, 'technicians', 1)
        : Promise.resolve({ allowed: true, message: '', current: 0, max: 999999, planName: 'Basic' }),
      !resolvedEmployeeId
        ? (db as any).userProfile.findMany({
            where: { organizationId, role: 'TECHNICIAN' },
            select: { employeeId: true },
          })
        : Promise.resolve([]),
      (db as any).userProfile.findUnique({
        where: { email: tentativeEmail },
        select: { id: true },
      }),
      Array.isArray(assignedBuildingIds) && assignedBuildingIds.length > 0
        ? (db as any).building.findMany({
            where: {
              id: { in: assignedBuildingIds },
              organizationId,
            },
            select: { id: true, name: true, address: true, city: true },
          })
        : Promise.resolve([]),
    ]);

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

    if (!resolvedEmployeeId) {
      let maxNum = 100;
      for (const t of (existingTechs as any[])) {
        const match = String(t.employeeId || '').match(/(\d+)/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n) && n >= 100 && n < 99999 && n > maxNum) {
            maxNum = n;
          }
        }
      }
      resolvedEmployeeId = `TECH-${maxNum + 1}`;
    }

    let normalizedEmail = tentativeEmail;
    if (existingByEmail) {
      if (!rawEmail) {
        normalizedEmail = `${cleanedPhone.slice(-10)}.${organizationId.slice(-4).toLowerCase()}@tech.vigilamc.app`;
      } else {
        return NextResponse.json(
          { error: `An account with email "${normalizedEmail}" already exists in the system.` },
          { status: 409 }
        );
      }
    }

    const formattedPhone =
      cleanedPhone.length === 10 ? `+91 ${cleanedPhone.slice(0, 5)} ${cleanedPhone.slice(5)}` : rawPhone || null;

    // 4. Create user in Supabase Auth via Admin API
    const supabaseAdmin = getSupabaseAdmin();
    let authUserId: string;

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: {
        full_name: trimmedName,
        role: 'TECHNICIAN',
        phone: formattedPhone || '',
        employeeId: resolvedEmployeeId,
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
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password: String(password),
            user_metadata: {
              full_name: trimmedName,
              role: 'TECHNICIAN',
              phone: formattedPhone || '',
              employeeId: resolvedEmployeeId,
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

    // 5. Create UserProfile with building assignments in ONE single query (no extra roundtrips)
    const buildingAssignData = (validBuildings as any[]).map((b: any) => ({
      buildingId: b.id,
      assignedById: auth.user.id,
    }));

    const technician = await (db as any).userProfile.create({
      data: {
        id: authUserId,
        email: normalizedEmail,
        fullName: trimmedName,
        phone: formattedPhone,
        employeeId: resolvedEmployeeId,
        role: 'TECHNICIAN',
        status: status || 'ACTIVE',
        organizationId: organizationId,
        ...(buildingAssignData.length > 0
          ? {
              assignedBuildings: {
                create: buildingAssignData,
              },
            }
          : {}),
      },
    });

    // 6. Non-blocking audit action in background (does not block HTTP response)
    logAuditActivity({
      organizationId,
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'TECHNICIAN_CREATED',
      entityType: 'UserProfile',
      entityId: technician.id,
      details: `Created technician account for "${trimmedName}" (ID: ${resolvedEmployeeId}, Mobile: ${formattedPhone || '—'}) with status ${status}`,
    }).catch((err) => console.error('Failed to log audit activity:', err));

    // 7. Calculate updated seat usage without re-querying 4 tables from scratch
    const newActive = (limitCheck.current || 0) + (status === 'ACTIVE' ? 1 : 0);
    const maxT = limitCheck.max ?? 5;
    const isUnlim = typeof maxT === 'string' ? maxT.toLowerCase() === 'unlimited' : Number(maxT) >= 999999;
    const computedSeatUsage = {
      active: newActive,
      max: isUnlim ? 'Unlimited' : maxT,
      maxNumeric: maxT,
      available: isUnlim ? 'Unlimited' : Math.max(0, Number(maxT) - newActive),
      availableNumeric: isUnlim ? 999999 : Math.max(0, Number(maxT) - newActive),
      percentUsed: isUnlim ? 0 : Math.min(100, Math.round((newActive / Number(maxT)) * 100)),
      isAtLimit: isUnlim ? false : newActive >= Number(maxT),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Technician account created successfully',
        technician: {
          id: technician.id,
          fullName: technician.fullName,
          email: technician.email,
          phone: technician.phone,
          employeeId: technician.employeeId,
          status: technician.status,
          assignedBuildings: validBuildings,
          createdAt: technician.createdAt,
        },
        seatUsage: computedSeatUsage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating technician:', error);
    const status = error.message?.startsWith('UNAUTHORIZED')
      ? 401
      : error.message?.startsWith('FORBIDDEN')
      ? 403
      : 500;
    return NextResponse.json({ error: error.message || 'Failed to create technician' }, { status });
  }
}
