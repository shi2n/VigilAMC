import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const company = await db.company.findFirst();
    const clientCount = await db.client.count();
    const buildingCount = await db.building.count();
    const equipmentCount = await db.equipment.count();
    const serviceLogCount = await db.serviceLog.count();

    return NextResponse.json({
      company,
      counts: {
        clients: clientCount,
        buildings: buildingCount,
        equipments: equipmentCount,
        serviceLogs: serviceLogCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching data stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, companyName, licenseNumber, phone, email, address } = body;

    // 1. WIPE ALL DEMO DATA: Clears all clients, buildings, equipments, logs completely
    if (action === 'WIPE_ALL_DEMO') {
      await db.serviceLog.deleteMany({});
      await db.complianceReport.deleteMany({});
      await db.equipment.deleteMany({});
      await db.building.deleteMany({});
      await db.client.deleteMany({});

      // Update or reset Company profile to clean defaults
      let company = await db.company.findFirst();
      if (!company) {
        company = await db.company.create({
          data: {
            name: companyName || 'My Fire Safety AMC Company',
            licenseNumber: licenseNumber || 'LIC-FIRE-2024-001',
            phone: phone || '+91 98000 00000',
            email: email || 'contact@myfireamc.in',
            address: address || 'Main Service Center, Industrial Area',
          },
        });
      } else if (companyName || licenseNumber || phone || email || address) {
        company = await db.company.update({
          where: { id: company.id },
          data: {
            name: companyName || company.name,
            licenseNumber: licenseNumber || company.licenseNumber,
            phone: phone || company.phone,
            email: email || company.email,
            address: address || company.address,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'All demo data successfully removed. Database is now 100% clean for your real clients.',
        company,
      });
    }

    // 2. SEED CLEAN UNBRANDED OPERATIONAL DATA (Clean generic examples without trademarked names)
    if (action === 'SEED_CLEAN') {
      await db.serviceLog.deleteMany({});
      await db.complianceReport.deleteMany({});
      await db.equipment.deleteMany({});
      await db.building.deleteMany({});
      await db.client.deleteMany({});

      let company = await db.company.findFirst();
      if (!company) {
        company = await db.company.create({
          data: {
            name: companyName || 'National Fire Safety & AMC Services',
            licenseNumber: licenseNumber || 'MH/FIRE/LIC/2024/098',
            phone: phone || '+91 98200 11223',
            email: email || 'support@nationalfireamc.in',
            address: address || 'Service HQ, Sector 18, Commercial District, Navi Mumbai',
          },
        });
      }

      const now = new Date();
      const addDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
      const subDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

      // Clean Client 1: Horizon Tech IT Park (Action pending: due soon)
      const c1 = await db.client.create({
        data: {
          companyId: company.id,
          name: 'Cyber Park Facility Management',
          contactPerson: 'Suresh Iyer (Facility Head)',
          phone: '+91 98210 55443',
          email: 'facilities@cyberpark.in',
        },
      });

      const b1 = await db.building.create({
        data: {
          clientId: c1.id,
          name: 'Horizon Tech IT Tower',
          address: 'Plot 12, IT Corridor, Navi Mumbai 400708',
          complianceCycle: 'Maharashtra Form-B (Half-Yearly)',
          cycleIntervalMos: 6,
          nextFilingDueDate: addDays(24),
        },
      });

      const b1Equipments = [
        { qrCode: 'HTP-EXT-01', type: 'Fire Extinguisher', capacity: 'ABC Dry Powder 6kg', location: 'Ground Floor Reception', lastServiceDate: subDays(350), nextDueDate: addDays(15), status: 'DUE_SOON' },
        { qrCode: 'HTP-EXT-02', type: 'Fire Extinguisher', capacity: 'CO2 Gas 4.5kg', location: 'Server Room Floor 2', lastServiceDate: subDays(340), nextDueDate: addDays(25), status: 'DUE_SOON' },
        { qrCode: 'HTP-HYD-01', type: 'Hydrant Valve', capacity: 'Single Head 63mm Gunmetal', location: 'Staircase Landing Floor 1', lastServiceDate: subDays(80), nextDueDate: addDays(100), status: 'COMPLIANT' },
        { qrCode: 'HTP-HSR-01', type: 'Hose Reel', capacity: '30m Swinging Type Drum', location: 'Corridor B Floor 1', lastServiceDate: subDays(80), nextDueDate: addDays(100), status: 'COMPLIANT' },
      ];

      for (const eq of b1Equipments) {
        const created = await db.equipment.create({ data: { ...eq, buildingId: b1.id } });
        await db.serviceLog.create({
          data: {
            equipmentId: created.id,
            technicianName: 'Santosh Shinde',
            servicedAt: eq.lastServiceDate,
            nextDueDate: eq.nextDueDate,
            actionType: 'Routine Inspection & Refill',
            notes: 'Inspected and certified in order.',
          },
        });
      }

      // Clean Client 2: Emerald Residency (Compliant)
      const c2 = await db.client.create({
        data: {
          companyId: company.id,
          name: 'Emerald Heights Co-op Housing Society',
          contactPerson: 'Ramesh Sharma (Secretary)',
          phone: '+91 98190 22334',
          email: 'secretary@emeraldheights.org',
        },
      });

      const b2 = await db.building.create({
        data: {
          clientId: c2.id,
          name: 'Emerald Heights Tower A',
          address: 'Link Road, Goregaon West, Mumbai 400104',
          complianceCycle: 'Maharashtra Form-B (Half-Yearly)',
          cycleIntervalMos: 6,
          nextFilingDueDate: addDays(90),
        },
      });

      const b2Equipments = [
        { qrCode: 'EHT-EXT-01', type: 'Fire Extinguisher', capacity: 'ABC Dry Powder 4kg', location: 'Main Entrance Lobby', lastServiceDate: subDays(60), nextDueDate: addDays(305), status: 'COMPLIANT' },
        { qrCode: 'EHT-EXT-02', type: 'Fire Extinguisher', capacity: 'Mechanical Foam 9L', location: 'Basement Parking Bay 4', lastServiceDate: subDays(60), nextDueDate: addDays(305), status: 'COMPLIANT' },
        { qrCode: 'EHT-HYD-01', type: 'Hydrant Valve', capacity: 'Double Head 63mm', location: 'Ground Floor Compound', lastServiceDate: subDays(60), nextDueDate: addDays(120), status: 'COMPLIANT' },
      ];

      for (const eq of b2Equipments) {
        const created = await db.equipment.create({ data: { ...eq, buildingId: b2.id } });
        await db.serviceLog.create({
          data: {
            equipmentId: created.id,
            technicianName: 'Amit Verma',
            servicedAt: eq.lastServiceDate,
            nextDueDate: eq.nextDueDate,
            actionType: 'Quarterly Servicing & Pressure Check',
            notes: 'All seals and pressure indicators verified.',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Loaded clean starter data with non-trademarked realistic structures.',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
