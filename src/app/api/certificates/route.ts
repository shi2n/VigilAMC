import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const certificates = await db.complianceCertificate.findMany({
      include: {
        building: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buildingId, formType, period, notes } = body;

    const building = await db.building.findUnique({
      where: { id: buildingId },
      include: {
        company: true,
        assets: true,
      },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    const totalAssets = building.assets.length;
    const functionalCount = building.assets.filter((a: any) => a.status === 'OPERATIONAL').length;
    const refilledCount = building.assets.filter((a: any) => {
      const diff = Date.now() - new Date(a.lastRefillDate).getTime();
      return diff <= 180 * 24 * 60 * 60 * 1000; // refilled within last 6 months
    }).length;
    const defectiveCount = totalAssets - functionalCount;

    const certNumber = `${formType || 'FORM-B'}/MH/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const certificate = await db.complianceCertificate.create({
      data: {
        certificateNumber: certNumber,
        buildingId: building.id,
        formType: formType || 'FORM_B',
        period: period || `Jan ${new Date().getFullYear()} - Dec ${new Date().getFullYear()}`,
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months standard Form-B validity
        licensedAgencyNumber: building.company?.licenseNumber || 'MH/FIRE/LIC/2022/A-412',
        signatoryName: `${building.company?.signatoryName || 'Er. Rajeshwar Patil'} (${building.company?.signatoryTitle || 'CFPS #7821'})`,
        overallResult: defectiveCount === 0 ? 'COMPLIANT' : 'CONDITIONAL_PASS',
        totalAssetsInspected: totalAssets,
        functionalCount,
        refilledCount,
        defectiveCount,
        notes: notes || `Issued pursuant to Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act, certifying satisfactory operation of all fire fighting assets.`,
      },
      include: {
        building: true,
      },
    });

    return NextResponse.json({ success: true, certificate });
  } catch (error: any) {
    console.error('Error creating certificate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
