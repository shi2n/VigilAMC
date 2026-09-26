import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kncfoiafddjftpbkuuaa.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ciHiV_UxZ3hkJlpsiftbDQ_6knRhTu1';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
