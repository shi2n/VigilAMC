import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { extractSupabaseTokenFromCookies } from '@/lib/techSession';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl =
    rawUrl && !rawUrl.includes('hkjaaqpfkpflifqekztk')
      ? rawUrl
      : 'https://hgsgboleolmgrggzodxa.supabase.co';

  const serviceKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function resolveAuthenticatedUser(request: Request) {
  const supabase = createServerSupabaseClient();

  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        return data.user;
      }
    }
  }

  const cookieToken = extractSupabaseTokenFromCookies(request);
  if (cookieToken) {
    const { data, error } = await supabase.auth.getUser(cookieToken);
    if (!error && data?.user) {
      return data.user;
    }
  }

  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) {
    return data.user;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const authUser = await resolveAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawPassword = typeof body?.password === 'string' ? body.password : '';
    const cleanPassword = rawPassword.trim();

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Password admin service unavailable', fallbackToClient: true },
        { status: 503 }
      );
    }

    const existingMeta =
      authUser.user_metadata && typeof authUser.user_metadata === 'object'
        ? authUser.user_metadata
        : {};
    const mergedMeta: Record<string, unknown> = { ...existingMeta };

    if (typeof body?.fullName === 'string' && body.fullName.trim()) {
      mergedMeta.full_name = body.fullName.trim();
    }
    if (typeof body?.agencyName === 'string' && body.agencyName.trim()) {
      mergedMeta.agency_name = body.agencyName.trim();
    }
    if (typeof body?.companyName === 'string' && body.companyName.trim()) {
      mergedMeta.company_name = body.companyName.trim();
    }
    if (typeof body?.phone === 'string' && body.phone.trim()) {
      mergedMeta.phone = body.phone.trim();
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(authUser.id, {
      password: cleanPassword,
      email_confirm: true,
      user_metadata: mergedMeta,
    });

    if (error) {
      console.error('Admin updateUserById password error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update password.', fallbackToClient: true },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id || authUser.id,
      email: data.user?.email || authUser.email,
    });
  } catch (error: any) {
    console.error('Error in POST /api/auth/set-password:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save password.' },
      { status: 500 }
    );
  }
}
