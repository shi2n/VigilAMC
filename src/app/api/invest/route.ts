import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendInvestorNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

// In-memory rate limiter for serverless instance (max 5 submissions per IP per 5 minutes)
const ipRequestMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);
  if (!entry || entry.expiresAt < now) {
    ipRequestMap.set(ip, { count: 1, expiresAt: now + 5 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 5) {
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
        { error: 'Too many submissions. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check for bots
    if (body.botField || body.companyWebsite) {
      return NextResponse.json({
        success: true,
        message: 'Your expression of interest has been received.',
      });
    }

    const fullName = (body.fullName || '').trim();
    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 400 }
      );
    }

    const email = (body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const investorType = (body.investorType || '').trim();
    if (!investorType) {
      return NextResponse.json(
        { error: 'Please select your investor profile or classification.' },
        { status: 400 }
      );
    }

    if (!body.consent) {
      return NextResponse.json(
        { error: 'Please acknowledge the expression of interest confirmation.' },
        { status: 400 }
      );
    }

    const phone = (body.phone || '').trim() || null;
    const city = (body.city || '').trim() || null;
    const country = (body.country || 'India').trim();
    const organization = (body.organization || '').trim() || null;
    const websiteLinkedin = (body.websiteLinkedin || '').trim() || null;
    const investmentExperience = (body.investmentExperience || '').trim() || null;
    const investmentRange = (body.investmentRange || '').trim() || null;
    const investmentTimeline = (body.investmentTimeline || '').trim() || null;
    const interestMessage = (body.interestMessage || '').trim() || null;
    const contributionMessage = (body.contributionMessage || '').trim() || null;

    // Save record to PostgreSQL database via Prisma
    const submission = await (db as any).investorInterest.create({
      data: {
        fullName,
        email,
        phone,
        city,
        country,
        investorType,
        organization,
        websiteLinkedin,
        investmentExperience,
        investmentRange,
        investmentTimeline,
        interestMessage,
        contributionMessage,
        consent: true,
        status: 'NEW',
      },
    });

    // Send notification in background
    sendInvestorNotification({
      fullName,
      email,
      phone,
      city,
      country,
      investorType,
      organization,
      websiteLinkedin,
      investmentExperience,
      investmentRange,
      investmentTimeline,
      interestMessage,
      contributionMessage,
      submittedAt: submission.createdAt,
    }).catch((err) => console.error('Investor email alert background error:', err));

    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest in VigilAMC. Our founding team will review your submission and connect with you shortly.',
      id: submission.id,
    });
  } catch (error: any) {
    console.error('Error recording investor interest:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit expression of interest. Please try again or reach out directly at vigilamc@gmail.com.' },
      { status: 500 }
    );
  }
}
