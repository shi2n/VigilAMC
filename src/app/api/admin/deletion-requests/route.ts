import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    const organizationId = auth.organization.id;

    const requests = await (db as any).accountDeletionRequest.findMany({
      where: {
        organizationId,
      },
      include: {
        userProfile: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            phone: true,
            email: true,
            role: true,
            status: true,
            inspections: {
              select: { id: true },
            },
            workOrders: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    const formatted = requests.map((r: any) => ({
      id: r.id,
      userProfileId: r.userProfileId,
      status: r.status,
      requestedAt: r.requestedAt,
      processedAt: r.processedAt,
      processedBy: r.processedBy,
      staffName: r.userProfile?.fullName || 'Staff Member',
      employeeId: r.userProfile?.employeeId || '-',
      phone: r.userProfile?.phone || '-',
      email: r.userProfile?.email || '-',
      role: r.userProfile?.role || 'TECHNICIAN',
      currentStatus: r.userProfile?.status || 'ACTIVE',
      inspectionCount: r.userProfile?.inspections?.length || 0,
      workOrderCount: r.userProfile?.workOrders?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      requests: formatted,
    });
  } catch (error: any) {
    console.error('Error fetching deletion requests:', error);
    const status = error.message?.startsWith('UNAUTHORIZED') ? 401 : error.message?.startsWith('FORBIDDEN') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch deletion requests' }, { status });
  }
}
