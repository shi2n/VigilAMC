import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor } from '@/lib/techSession';
import { isFounderOwner } from '@/lib/founderAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { confusingText, missingFeatures, fairPrice, rating } = body;

    const feedback = await (db as any).feedback.create({
      data: {
        organizationId: auth?.organization?.id || null,
        userId: auth?.user?.id || null,
        userEmail: auth?.user?.email || null,
        confusingText: confusingText?.trim() || null,
        missingFeatures: missingFeatures?.trim() || null,
        fairPrice: fairPrice?.trim() || null,
        rating: typeof rating === 'number' ? rating : null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth?.user?.email || !isFounderOwner(auth.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Founder privileges required' }, { status: 403 });
    }
    const feedbackList = await (db as any).feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, feedback: feedbackList });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: error.message || 'Forbidden' }, { status: 403 });
  }
}
