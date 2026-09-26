import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getNocStatus, getAssetRefillStatus } from '@/lib/compliance';

export async function GET() {
  try {
    const buildings = await db.building.findMany({
      include: {
        assets: true,
        amcs: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    const assets = await db.asset.findMany({
      include: {
        building: {
          select: { name: true, city: true },
        },
      },
      orderBy: { nextRefillDueDate: 'asc' },
    });

    const amcs = await db.amcContract.findMany();
    const certificates = await db.complianceCertificate.findMany({
      include: {
        building: { select: { name: true } },
      },
      orderBy: { issueDate: 'desc' },
      take: 5,
    });

    // NOC Expiry categorization
    let expiredNocs = 0;
    let criticalNocs = 0; // <= 30 days
    let warningNocs = 0;  // <= 60 days
    let healthyNocs = 0;

    const buildingNocAlerts: any[] = [];

    buildings.forEach((b: any) => {
      const noc = getNocStatus(b.nocExpiryDate);
      if (noc.status === 'EXPIRED') expiredNocs++;
      else if (noc.status === 'CRITICAL') criticalNocs++;
      else if (noc.status === 'WARNING') warningNocs++;
      else healthyNocs++;

      if (noc.status === 'EXPIRED' || noc.status === 'CRITICAL' || noc.status === 'WARNING') {
        buildingNocAlerts.push({
          id: b.id,
          name: b.name,
          fireNocNumber: b.fireNocNumber,
          nocExpiryDate: b.nocExpiryDate,
          daysRemaining: noc.daysRemaining,
          status: noc.status,
          contactPerson: b.contactPerson,
          contactPhone: b.contactPhone,
          contactEmail: b.contactEmail,
          totalAssets: b.assets.length,
          overdueAssets: b.assets.filter((a: any) => a.status === 'REFILL_DUE' || a.status === 'PRESSURE_LOW').length,
        });
      }
    });

    // Extinguisher status counts
    let totalAssets = assets.length;
    let operationalAssets = 0;
    let refillDueAssets = 0;
    let hydroDueAssets = 0;
    let pressureLowAssets = 0;

    const urgentAssets: any[] = [];

    assets.forEach((a: any) => {
      const refill = getAssetRefillStatus(a.nextRefillDueDate);
      if (a.status === 'OPERATIONAL') operationalAssets++;
      if (a.status === 'REFILL_DUE' || refill.status === 'OVERDUE') refillDueAssets++;
      if (a.status === 'HYDRO_TEST_DUE') hydroDueAssets++;
      if (a.status === 'PRESSURE_LOW') pressureLowAssets++;

      if (a.status !== 'OPERATIONAL' || refill.status === 'OVERDUE' || refill.status === 'DUE_SOON') {
        urgentAssets.push({
          id: a.id,
          qrCode: a.qrCode,
          buildingName: a.building.name,
          type: a.type,
          capacity: a.capacity,
          location: `${a.locationFloor}, ${a.locationWing}`,
          nextRefillDueDate: a.nextRefillDueDate,
          status: a.status,
          refillStatus: refill,
        });
      }
    });

    // AMC Revenue metrics
    const activeAmcs = amcs.filter((c: any) => c.status === 'ACTIVE');
    const totalAnnualValue = activeAmcs.reduce((acc: number, curr: any) => acc + curr.annualValue, 0);
    const mrr = Math.round(totalAnnualValue / 12);

    return NextResponse.json({
      kpis: {
        totalBuildings: buildings.length,
        nocs: {
          expired: expiredNocs,
          critical: criticalNocs,
          warning: warningNocs,
          healthy: healthyNocs,
        },
        assets: {
          total: totalAssets,
          operational: operationalAssets,
          refillDue: refillDueAssets,
          hydroDue: hydroDueAssets,
          pressureLow: pressureLowAssets,
          complianceRate: totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 100,
        },
        amc: {
          activeCount: activeAmcs.length,
          totalContracts: amcs.length,
          totalAnnualValue,
          mrr,
        },
      },
      buildingNocAlerts: buildingNocAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining),
      urgentAssets: urgentAssets.slice(0, 10),
      recentCertificates: certificates,
    });
  } catch (error: any) {
    console.error('Error in dashboard aggregation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
