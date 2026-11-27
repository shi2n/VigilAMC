import {
  handlePrepareCheckout,
  type PrepareCheckoutEnv,
} from '../../../src/lib/prepareCheckoutCore';

/**
 * Cloudflare Worker entrypoint for VigilAMC `/api/prepare-checkout`.
 *
 * Configure secrets via Wrangler (never commit keys):
 *   wrangler secret put SUPABASE_URL
 *   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
 */
const worker = {
  async fetch(request: Request, env: PrepareCheckoutEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/prepare-checkout' || url.pathname === '/api/prepare-checkout/') {
      return handlePrepareCheckout(request, env);
    }

    return new Response(
      JSON.stringify({ valid: false, message: 'Not found.' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  },
};

export default worker;
