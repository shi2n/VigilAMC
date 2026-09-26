import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const buildings = await db.building.findMany({
      include: {
        company: true,
        assets: {
          select: {
            id: true,
            status: true,
            type: true,
            nextRefillDueDate: true,
            nextHydroTestDueDate: true,
          },
        },
        amcs: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
        certificates: {
          orderBy: { issueDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { nocExpiryDate: 'asc' }, // Prioritize buildings with nearest NOC expiry!
    });

    return NextResponse.json({ buildings });
  } catch (error: any) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let company = await db.company.findFirst();

    if (!company) {
      company = await db.company.create({
        data: {
          name: 'Vigil Fire & Safety Solutions Pvt Ltd',
          licenseNumber: 'MH/FIRE/LIC/2022/A-412',
          state: 'Maharashtra',
          email: 'ops@vigilfire.in',
          phone: '+91 98201 54321',
          signatoryName: 'Er. Rajeshwar Patil',
        },
      });
    }

    const {
      name,
      address,
      city,
      pincode,
      occupancyType,
      totalFloors,
      basements,
      contactPerson,
      contactPhone,
      contactEmail,
      fireNocNumber,
      nocAuthority,
      nocIssueDate,
      nocExpiryDate,
      notes,
    } = body;

    const building = await db.building.create({
      data: {
        companyId: company.id,
        name,
        address,
        city: city || 'Mumbai',
        pincode: pincode || '400001',
        occupancyType: occupancyType || 'Commercial',
        totalFloors: Number(totalFloors) || 5,
        basements: Number(basements) || 1,
        contactPerson: contactPerson || 'Facility Manager',
        contactPhone: contactPhone || '+91 98000 00000',
        contactEmail: contactEmail || 'info@building.com',
        fireNocNumber: fireNocNumber || `NOC-${Math.floor(1000 + Math.random() * 9000)}`,
        nocAuthority: nocAuthority || 'Municipal Fire Services',
        nocIssueDate: new Date(nocIssueDate || new Date()),
        nocExpiryDate: new Date(nocExpiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        notes,
      },
    });

    return NextResponse.json({ success: true, building });
  } catch (error: any) {
    console.error('Error creating building:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
