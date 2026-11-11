import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    const body = await request.json().catch(() => ({}));

    // Hidden honeypot check for bots (silent success)
    if (body.website || body.botField || body.companyHp) {
      return NextResponse.json({
        success: true,
        message: "✓ You're subscribed!",
      });
    }

    const rawEmail = typeof body.email === 'string' ? body.email : '';
    const email = rawEmail.trim().toLowerCase();

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return NextResponse.json(
        { error: "That email didn't work — try again" },
        { status: 400 }
      );
    }

    const source = typeof body.source === 'string' && body.source.trim() ? body.source.trim() : 'footer';

    // Idempotent upsert: if already subscribed, no duplicate row is created
    const subscriber = await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: {
        email,
        source,
      },
    });

    return NextResponse.json({
      success: true,
      message: "✓ You're subscribed!",
      id: subscriber.id,
      email: subscriber.email,
    });
  } catch (error: any) {
    console.error('Error saving newsletter subscriber:', error);
    return NextResponse.json(
      { error: "That email didn't work — try again" },
      { status: 500 }
    );
  }
}
