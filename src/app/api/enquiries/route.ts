import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// In-memory rate limiter for serverless instance (max 5 requests per IP per 5 minutes)
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

    // Honeypot check for bots (if 'website' or 'company_url' is filled, drop silently)
    if (body.website || body.botField) {
      return NextResponse.json({ success: true, message: 'Enquiry received successfully.' });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
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
    const message = (body.message || '').trim();

    // Store in Supabase via Prisma
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
        status: 'NEW',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our compliance team will reach out shortly.',
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

export async function GET() {
  try {
    const enquiries = await (db as any).enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
