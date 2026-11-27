import {
  handlePrepareCheckout,
  handlePrepareCheckoutOptions,
  type PrepareCheckoutEnv,
} from '@/lib/prepareCheckoutCore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readServerEnv(): PrepareCheckoutEnv {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handlePrepareCheckoutOptions(request, readServerEnv());
}

export async function POST(request: Request): Promise<Response> {
  return handlePrepareCheckout(request, readServerEnv());
}
