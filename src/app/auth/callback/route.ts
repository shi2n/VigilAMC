import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { isFounderOwner } from '@/lib/founderAuth';

export const dynamic = 'force-dynamic';

function sanitizeNextPath(rawNext: string | null): string {
  if (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')) {
    return rawNext;
  }
  return '/dashboard';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next =
    type === 'recovery'
      ? '/reset-password'
      : sanitizeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Never intercept password recovery redirects
      if (type === 'recovery' || next === '/reset-password') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      const authUser = data?.user ?? (await supabase.auth.getUser()).data?.user;
      if (authUser) {
        const normalizedEmail = (authUser.email || '').trim().toLowerCase();
        const isFounder = isFounderOwner(normalizedEmail);

        if (!isFounder) {
          try {
            let profile = await (db as any).userProfile.findUnique({
              where: { id: authUser.id },
              include: { organization: true },
            });

            if (!profile && normalizedEmail) {
              profile = await (db as any).userProfile.findUnique({
                where: { email: normalizedEmail },
                include: { organization: true },
              });
            }

            if (profile?.role === 'TECHNICIAN') {
              return NextResponse.redirect(`${origin}/login?error=technician_app_required`);
            }

            const isSuperAdmin = profile?.role === 'SUPER_ADMIN';
            const hasOrgName = Boolean(profile?.organization?.name?.trim());
            const hasPhone = Boolean(profile?.phone?.trim());

            if (!isSuperAdmin && (!profile || !profile.organizationId || !hasOrgName || !hasPhone)) {
              const completeUrl = new URL(`${origin}/login`);
              completeUrl.searchParams.set('mode', 'complete-profile');
              if (next && next !== '/dashboard') {
                completeUrl.searchParams.set('redirect', next);
              }
              return NextResponse.redirect(completeUrl.toString());
            }
          } catch (lookupErr) {
            console.error('[auth/callback] Profile completeness check failed:', lookupErr);
            return NextResponse.redirect(`${origin}/login?mode=complete-profile`);
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
