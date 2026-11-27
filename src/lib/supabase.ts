import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicConfig } from '@/lib/supabase/client';

interface ImportMetaWithEnv {
  env?: {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
  };
}

function getViteEnv(): { url: string; anonKey: string } {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as unknown as ImportMetaWithEnv).env
      : undefined;

  const url = (
    metaEnv?.VITE_SUPABASE_URL ||
    (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : undefined) ||
    ''
  ).trim();

  const anonKey = (
    metaEnv?.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : undefined) ||
    ''
  ).trim();

  return { url, anonKey };
}

const { url: viteUrl, anonKey: viteAnonKey } = getViteEnv();
const { supabaseUrl: fallbackUrl, supabaseKey: fallbackKey } = getSupabasePublicConfig();

const resolvedUrl = viteUrl && viteAnonKey ? viteUrl : fallbackUrl;
const resolvedAnonKey = viteUrl && viteAnonKey ? viteAnonKey : fallbackKey;

export const isSupabaseConfigured: boolean = Boolean(resolvedUrl && resolvedAnonKey);

/**
 * Shared @supabase/supabase-js client configured with `flowType: 'implicit'`.
 *
 * Important: `@supabase/ssr`'s `createBrowserClient` forces `flowType: 'pkce'`,
 * which attaches `code_challenge` to `signInWithOtp` requests and stores a
 * `pkce_`-prefixed token hash that fails numeric `verifyOtp({ email, token, type: 'email' })`
 * with "Token has expired or is invalid". Using `flowType: 'implicit'` keeps numeric
 * Email OTP verification working reliably.
 */
export const supabase: SupabaseClient = createSupabaseJsClient(resolvedUrl, resolvedAnonKey, {
  auth: {
    flowType: 'implicit',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
