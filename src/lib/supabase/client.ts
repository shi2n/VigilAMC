import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl =
    envUrl && !envUrl.includes('hkjaaqpfkpflifqekztk')
      ? envUrl
      : 'https://kncfoiafddjftpbkuuaa.supabase.co';

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseKey =
    envKey && !envUrl.includes('hkjaaqpfkpflifqekztk')
      ? envKey
      : 'sb_publishable_ciHiV_UxZ3hkJlpsiftbDQ_6knRhTu1';

  return createBrowserClient(supabaseUrl, supabaseKey);
}

