import { createBrowserClient } from '@supabase/ssr';

export function getSupabasePublicConfig(): { supabaseUrl: string; supabaseKey: string } {
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

  return { supabaseUrl, supabaseKey };
}

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabasePublicConfig();
  return createBrowserClient(supabaseUrl, supabaseKey);
}

