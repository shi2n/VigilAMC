import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendInquiryNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

// In-memory rate limiter for serverless instance (max 10 requests per IP per 5 minutes)
const ipRequestMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);
  if (!entry || entry.expiresAt < now) {
    ipRequestMap.set(ip, { count: 1, expiresAt: now + 5 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 10) {
    return true;
  }
  entry.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check for bots (if 'website' or 'botField' is filled, drop silently)
    if (body.website || body.botField) {
      return NextResponse.json({ success: true, message: 'Enquiry received successfully.' });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid corporate or work email address is required.' }, { status: 400 });
    }

    const name = (body.name || body.fullName || '').trim();
    const phone = (body.phone || '').trim();
    const company = (body.company || '').trim();
    const city = (body.city || '').trim();
    const type = (body.type || 'DEMO').trim(); // DEMO, CONTACT, QUICK_INQUIRY, NEWSLETTER
    const facilityType = (body.facilityType || '').trim();
    const assetCount = (body.assetCount || body.buildingsCount || '').trim();
    const preferredDate = (body.preferredDate || '').trim();
    const preferredTime = (body.preferredTime || '').trim();
    const rawMessage = (body.message || '').trim();
    const technicianCount = (body.technicianCount || '').trim();
    const trackingMethod = (body.trackingMethod || '').trim();
    const message = [
      rawMessage,
      technicianCount ? `Technicians: ${technicianCount}` : null,
      trackingMethod ? `Current tracking method: ${trackingMethod}` : null,
    ].filter(Boolean).join(' | ');
    const source = (body.source || 'Website Lead Form').trim();

    // Store in Supabase PostgreSQL via Prisma
    const enquiry = await (db as any).enquiry.create({
      data: {
        type,
        name,
        email,
        phone,
        company,
        city,
        facilityType,
        assetCount,
        preferredDate,
        preferredTime,
        message,
        source,
        status: 'NEW',
      },
    });

    // Send email notification to admin (vigilamc@gmail.com)
    sendInquiryNotification({
      name,
      company,
      phone,
      email,
      requirement: facilityType ? `${facilityType} (${assetCount || 'Standard'})` : assetCount,
      message,
      submittedAt: enquiry.createdAt,
      source,
      type,
      preferredDate,
      preferredTime,
    }).catch((err) => console.error('Email dispatch background error:', err));

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our compliance advisory team will reach out shortly.',
      id: enquiry.id,
    });
  } catch (error: any) {
    console.error('Error saving enquiry:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit enquiry. Please try again or contact us directly.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (type && type !== 'ALL') where.type = type;

    const enquiries = await (db as any).enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and new status are required' }, { status: 400 });
    }

    const updated = await (db as any).enquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error: any) {
    console.error('Error updating enquiry status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
