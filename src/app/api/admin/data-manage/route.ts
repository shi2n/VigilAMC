import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({
        company: null,
        counts: {
          clients: 0,
          buildings: 0,
          equipments: 0,
          serviceLogs: 0,
        },
      });
    }

    const organizationId = auth.organization.id;
    const clientCount = await (db as any).client.count({ where: { organizationId } });
    const buildingCount = await (db as any).building.count({ where: { organizationId } });
    const equipmentCount = await (db as any).equipment.count({ where: { organizationId } });

    return NextResponse.json({
      company: auth.organization,
      counts: {
        clients: clientCount,
        buildings: buildingCount,
        equipments: equipmentCount,
        serviceLogs: 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching data stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    const organizationId = auth.organization.id;

    // Reset current user's organization data only
    if (action === 'WIPE_ALL_DEMO') {
      await (db as any).inspection.deleteMany({ where: { organizationId } });
      await (db as any).defect.deleteMany({ where: { organizationId } });
      await (db as any).workOrder.deleteMany({ where: { organizationId } });
      await (db as any).complianceReport.deleteMany({ where: { organizationId } });
      await (db as any).equipment.deleteMany({ where: { organizationId } });
      await (db as any).building.deleteMany({ where: { organizationId } });
      await (db as any).client.deleteMany({ where: { organizationId } });

      return NextResponse.json({
        success: true,
        message: 'Your organization account has been reset to an empty state.',
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
