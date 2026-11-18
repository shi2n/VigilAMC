import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser(request);
    if (!auth || !auth.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const building = await (db as any).building.findFirst({
      where: {
        id: params.id,
        organizationId: auth.organization.id,
      },
      include: {
        client: true,
        equipments: {
          include: {
            serviceLogs: {
              orderBy: { servicedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { location: 'asc' },
        },
        reports: {
          orderBy: { generatedAt: 'desc' },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const mapped = {
      ...building,
      city: building.city || building.address || '',
      occupancyType: building.occupancyType || 'Commercial / Residential',
      fireNocNumber: building.fireNocNumber || building.fscNumber || null,
      nocExpiryDate: building.fireNocExpiryDate || building.fscValidityDate || building.nextFilingDueDate,
      totalAssets: building.equipments?.length || 0,
      assets: building.equipments || [],
    };

    return NextResponse.json({ building: mapped });
  } catch (error: any) {
    console.error('Error fetching building details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
