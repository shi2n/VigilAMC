const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VigilAMC clean, unbranded enterprise data model...');

  // Clear tables
  await prisma.serviceLog.deleteMany({});
  await prisma.complianceReport.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.company.deleteMany({});

  // 1. Company (AMC Company)
  const company = await prisma.company.create({
    data: {
      name: 'National Fire Safety & AMC Services',
      licenseNumber: 'DL/FIRE/LIC/2024/098',
      phone: '+91 98200 11223',
      email: 'support@nationalfireamc.in',
      address: 'Plot 24, Okhla Industrial Area Phase III, New Delhi, Delhi NCR - 110020',
    },
  });

  const now = new Date();
  const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const subDays = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  // 2. Client 1: Horizon Tech IT Park (Commercial Facility)
  const client1 = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'Cyber Park Facility Management',
      contactPerson: 'Suresh Iyer (Facility Director)',
      phone: '+91 98210 55443',
      email: 'facilities@cyberpark.in',
    },
  });

  const building1 = await prisma.building.create({
    data: {
      clientId: client1.id,
      name: 'Horizon Tech IT Tower',
      address: 'Plot 14, DLF Cyber City, Sector 24, Gurugram, Delhi NCR 122002',
      complianceCycle: 'Delhi NCR Statutory Form-B (Half-Yearly)',
      cycleIntervalMos: 6,
      nextFilingDueDate: addDays(24), // filing due in 24 days (Amber)
    },
  });

  const b1Equipments = [
    {
      qrCode: 'HTP-EXT-01',
      type: 'Fire Extinguisher',
      capacity: 'ABC Dry Powder 6kg',
      location: 'Ground Floor - Main Reception',
      lastServiceDate: subDays(350),
      nextDueDate: addDays(15), // DUE SOON (15 days left)
      status: 'DUE_SOON',
    },
    {
      qrCode: 'HTP-EXT-02',
      type: 'Fire Extinguisher',
      capacity: 'CO2 Gas 4.5kg',
      location: 'Floor 2 - Server Rack Room',
      lastServiceDate: subDays(340),
      nextDueDate: addDays(25), // DUE SOON (25 days left)
      status: 'DUE_SOON',
    },
    {
      qrCode: 'HTP-HYD-01',
      type: 'Hydrant Valve',
      capacity: 'Single Head 63mm Gunmetal',
      location: 'Floor 1 - Landing Staircase A',
      lastServiceDate: subDays(80),
      nextDueDate: addDays(100),
      status: 'COMPLIANT',
    },
    {
      qrCode: 'HTP-HSR-01',
      type: 'Hose Reel',
      capacity: '30m Swinging Type Drum',
      location: 'Floor 1 - Corridor B',
      lastServiceDate: subDays(80),
      nextDueDate: addDays(100),
      status: 'COMPLIANT',
    },
    {
      qrCode: 'HTP-ALM-01',
      type: 'Alarm Panel',
      capacity: '8-Zone Microprocessor Panel',
      location: 'Ground Floor - Security Control Room',
      lastServiceDate: subDays(60),
      nextDueDate: addDays(120),
      status: 'COMPLIANT',
    },
  ];

  for (const eq of b1Equipments) {
    const created = await prisma.equipment.create({
      data: {
        ...eq,
        buildingId: building1.id,
      },
    });
    await prisma.serviceLog.create({
      data: {
        equipmentId: created.id,
        technicianName: 'Rajesh Kumar',
        servicedAt: eq.lastServiceDate,
        nextDueDate: eq.nextDueDate,
        actionType: 'Routine Refill & Pressure Gauge Inspection',
        notes: 'Inspected and certified in working order.',
      },
    });
  }

  // 3. Client 2: Emerald Heights (Residential Society)
  const client2 = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'Emerald Heights Co-op Housing Society',
      contactPerson: 'Ramesh Sharma (Secretary)',
      phone: '+91 98190 22334',
      email: 'society@emeraldheights.org',
    },
  });

  const building2 = await prisma.building.create({
    data: {
      clientId: client2.id,
      name: 'Emerald Heights Tower A',
      address: 'Sector 62, Electronic City, Noida, Delhi NCR 201301',
      complianceCycle: 'Delhi NCR Statutory Form-B (Half-Yearly)',
      cycleIntervalMos: 6,
      nextFilingDueDate: addDays(90),
    },
  });

  const b2Equipments = [
    {
      qrCode: 'EHT-EXT-01',
      type: 'Fire Extinguisher',
      capacity: 'ABC Dry Powder 4kg',
      location: 'Main Entrance Lobby',
      lastServiceDate: subDays(60),
      nextDueDate: addDays(305),
      status: 'COMPLIANT',
    },
    {
      qrCode: 'EHT-EXT-02',
      type: 'Fire Extinguisher',
      capacity: 'Mechanical Foam 9L',
      location: 'Basement Parking Bay 4',
      lastServiceDate: subDays(60),
      nextDueDate: addDays(305),
      status: 'COMPLIANT',
    },
    {
      qrCode: 'EHT-HYD-01',
      type: 'Hydrant Valve',
      capacity: 'Double Head 63mm',
      location: 'Ground Floor Compound',
      lastServiceDate: subDays(60),
      nextDueDate: addDays(120),
      status: 'COMPLIANT',
    },
  ];

  for (const eq of b2Equipments) {
    const created = await prisma.equipment.create({
      data: {
        ...eq,
        buildingId: building2.id,
      },
    });
    await prisma.serviceLog.create({
      data: {
        equipmentId: created.id,
        technicianName: 'Amit Verma',
        servicedAt: eq.lastServiceDate,
        nextDueDate: eq.nextDueDate,
        actionType: 'Quarterly Inspection',
        notes: 'Inspected and certified.',
      },
    });
  }

  console.log('Seeding completed successfully with zero trademarked/demo names.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
