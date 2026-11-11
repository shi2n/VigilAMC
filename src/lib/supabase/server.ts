import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl =
    envUrl && !envUrl.includes('hkjaaqpfkpflifqekztk')
      ? envUrl
      : 'https://hgsgboleolmgrggzodxa.supabase.co';

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseKey =
    envKey && !envUrl.includes('hkjaaqpfkpflifqekztk')
      ? envKey
      : 'sb_publishable_r6t5us-FRTOa2Pogh7XBEg_gEvUQ4he';

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored in Server Component
        }
      },
    },
  });
}
