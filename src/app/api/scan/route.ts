import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
    }

    const asset = await db.asset.findUnique({
      where: { qrCode: code },
      include: {
        building: {
          include: {
            company: true,
          },
        },
        inspections: {
          orderBy: { inspectedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found for this QR Code' }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error: any) {
    console.error('Error in scan lookup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      qrCode,
      technicianName,
      actionType,
      pressureGaugeOk,
      sealIntact,
      nozzleHoseOk,
      weightOk,
      bodyRustPass,
      remarks,
      newStatus,
    } = body;

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code required' }, { status: 400 });
    }

    const asset = await db.asset.findUnique({
      where: { qrCode },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const now = new Date();
    const isRefill = actionType === 'ANNUAL_REFILL';
    const isHydro = actionType === 'HYDRO_PRESSURE_TEST';

    // Calculate new dates based on action
    const updateData: any = {
      pressureGaugeOk: Boolean(pressureGaugeOk),
      safetyPinIntact: Boolean(sealIntact),
      status: newStatus || (pressureGaugeOk && sealIntact && nozzleHoseOk && bodyRustPass ? 'OPERATIONAL' : 'PRESSURE_LOW'),
    };

    if (isRefill) {
      updateData.lastRefillDate = now;
      // IS 2190 standard: 1 year from refill
      updateData.nextRefillDueDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      updateData.status = 'OPERATIONAL';
    }

    if (isHydro) {
      updateData.lastHydroTestDate = now;
      // 3 years (ABC/Foam) or 5 years (CO2)
      const years = asset.type === 'CO2' || asset.type === 'CLEAN_AGENT_FM200' ? 5 : 3;
      updateData.nextHydroTestDueDate = new Date(now.getTime() + years * 365 * 24 * 60 * 60 * 1000);
    }

    // 1. Create inspection log
    const log = await db.inspectionLog.create({
      data: {
        assetId: asset.id,
        technicianName: technicianName || 'Certified Technician',
        actionType: actionType || 'ROUTINE_INSPECTION',
        pressureGaugeOk: Boolean(pressureGaugeOk),
        sealIntact: Boolean(sealIntact),
        nozzleHoseOk: Boolean(nozzleHoseOk),
        weightOk: Boolean(weightOk),
        bodyRustPass: Boolean(bodyRustPass),
        remarks: remarks || `Inspected per IS 2190 guidelines on ${now.toLocaleDateString()}`,
        inspectedAt: now,
      },
    });

    // 2. Update asset status and timestamps
    const updatedAsset = await db.asset.update({
      where: { id: asset.id },
      data: updateData,
      include: {
        building: true,
        inspections: {
          orderBy: { inspectedAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      asset: updatedAsset,
      log,
      message: isRefill
        ? 'Refill recorded! Next due date automatically extended by 1 year per IS 2190.'
        : 'Inspection successfully logged and asset health updated.',
    });
  } catch (error: any) {
    console.error('Error recording inspection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
