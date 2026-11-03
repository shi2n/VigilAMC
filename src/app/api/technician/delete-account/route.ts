import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedActor, verifyPin } from '@/lib/techSession';
import { isDuplicateSubmission, clearSubmissionLock } from '@/lib/submissionGuard';
import { logAuditActivity } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }

    const pendingRequest = await (db as any).accountDeletionRequest.findFirst({
      where: {
        userProfileId: auth.profile.id,
        status: 'PENDING',
      },
      orderBy: { requestedAt: 'desc' },
      select: {
        id: true,
        status: true,
        requestedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      hasPendingRequest: !!pendingRequest,
      request: pendingRequest || null,
    });
  } catch (error: any) {
    console.error('Error fetching deletion request status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedActor(request);
    if (!auth || !auth.user) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
    }

    const userId = auth.profile.id;
    const body = await request.json().catch(() => ({}));
    const action = String(body?.action || '').trim().toLowerCase();
    const pin = String(body?.pin || '').trim();

    if (action !== 'request' && action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid action. Expected "request" or "cancel".' }, { status: 400 });
    }

    const guardKey = `deletion-request-${userId}-${action}`;
    if (isDuplicateSubmission(guardKey, 3000)) {
      return NextResponse.json(
        { error: 'A deletion action is already being processed. Please wait a moment.' },
        { status: 429 }
      );
    }

    if (action === 'cancel') {
      const existingPending = await (db as any).accountDeletionRequest.findFirst({
        where: {
          userProfileId: userId,
          status: 'PENDING',
        },
      });

      if (!existingPending) {
        return NextResponse.json({
          success: true,
          message: 'No pending deletion request found to cancel.',
          hasPendingRequest: false,
        });
      }

      const cancelled = await (db as any).accountDeletionRequest.update({
        where: { id: existingPending.id },
        data: {
          status: 'CANCELLED',
        },
      });

      if (auth.organization?.id) {
        await logAuditActivity({
          organizationId: auth.organization.id,
          userId: auth.user.id,
          userEmail: auth.user.email,
          action: 'ACCOUNT_DELETION_CANCELLED',
          entityType: 'UserProfile',
          entityId: userId,
          details: `Staff member ${auth.profile.fullName || userId} cancelled their pending account deletion request.`,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Account deletion request has been cancelled.',
        hasPendingRequest: false,
        request: cancelled,
      });
    }

    // Action === 'request'
    if (!pin) {
      clearSubmissionLock(guardKey);
      return NextResponse.json({ error: 'PIN is required to confirm account deletion request.' }, { status: 400 });
    }

    // Verify PIN server-side
    let verified = false;
    if (auth.profile.passwordHash) {
      verified = verifyPin(pin, auth.profile.passwordHash);
    }

    if (!verified && auth.profile.email) {
      try {
        const supabase = createServerSupabaseClient();
        const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
          email: auth.profile.email,
          password: pin,
        });
        if (!supaErr && supaData?.user) {
          verified = true;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!verified) {
      clearSubmissionLock(guardKey);
      return NextResponse.json(
        { error: 'Incorrect PIN. Please re-enter your current 6-digit login PIN.' },
        { status: 401 }
      );
    }

    // Check if request already pending
    const existing = await (db as any).accountDeletionRequest.findFirst({
      where: {
        userProfileId: userId,
        status: 'PENDING',
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'A deletion request is already pending review by your agency administrator.',
        hasPendingRequest: true,
        request: existing,
      });
    }

    const newRequest = await (db as any).accountDeletionRequest.create({
      data: {
        userProfileId: userId,
        organizationId: auth.organization?.id || null,
        status: 'PENDING',
        requestedAt: new Date(),
      },
    });

    if (auth.organization?.id) {
      await logAuditActivity({
        organizationId: auth.organization.id,
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: 'ACCOUNT_DELETION_REQUESTED',
        entityType: 'UserProfile',
        entityId: userId,
        details: `Staff member ${auth.profile.fullName || userId} submitted an account deletion request under DPDP Act 2023. Admin review required within 7 days.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion requested successfully. Your agency admin will process this within 7 days.',
      hasPendingRequest: true,
      request: newRequest,
    });
  } catch (error: any) {
    console.error('Error in POST /api/technician/delete-account:', error);
    return NextResponse.json({ error: error.message || 'Failed to process deletion request' }, { status: 500 });
  }
}
