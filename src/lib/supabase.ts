import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

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

const hasViteConfig = Boolean(viteUrl && viteAnonKey);
const hasNextConfig = Boolean(
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    true // src/lib/supabase/client.ts provides the active VigilAMC publishable project config
);

export const isSupabaseConfigured: boolean = hasViteConfig || hasNextConfig;

export const supabase: SupabaseClient = hasViteConfig
  ? createSupabaseJsClient(viteUrl, viteAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createBrowserSupabaseClient();

export default supabase;
