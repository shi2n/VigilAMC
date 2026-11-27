import { createClient } from '@supabase/supabase-js';
import {
  calculateCouponDiscount,
  getAuthoritativeBaseAmount,
  isValidBillingCycle,
  isValidPlanId,
  type BillingCycle,
  type CouponDiscountType,
  type PrepareCheckoutErrorResponse,
  type PrepareCheckoutSuccessResponse,
  type SubscriptionPlanId,
} from './pricing';

export interface PrepareCheckoutEnv {
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  ALLOWED_ORIGINS?: string;
}

interface CouponRow {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number | string;
  max_uses: number | null;
  times_used: number | null;
  expires_at: string | null;
  is_active: boolean;
}

const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://www.vigilamc.com',
  'https://vigilamc.com',
  'https://vigilamc.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function buildCorsHeaders(request: Request, env: PrepareCheckoutEnv): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Vary: 'Origin',
  });

  const origin = request.headers.get('origin');
  if (!origin) return headers;

  const extraOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (DEFAULT_ALLOWED_ORIGINS.has(origin) || extraOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    headers.set('Access-Control-Max-Age', '86400');
  }

  return headers;
}

function jsonResponse(
  body: PrepareCheckoutSuccessResponse | PrepareCheckoutErrorResponse,
  status: number,
  request: Request,
  env: PrepareCheckoutEnv
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildCorsHeaders(request, env),
  });
}

function resolveSupabaseConfig(env: PrepareCheckoutEnv): {
  supabaseUrl: string;
  serviceRoleKey: string;
} {
  const rawUrl = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseUrl = rawUrl.replace(/\/+$/, '');
  const serviceRoleKey = (
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SECRET_KEY ||
    ''
  ).trim();

  return { supabaseUrl, serviceRoleKey };
}

export function handlePrepareCheckoutOptions(
  request: Request,
  env: PrepareCheckoutEnv
): Response {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request, env),
  });
}

/**
 * Cloudflare Worker & Next.js App Router compatible handler for POST /api/prepare-checkout.
 *
 * Security invariants:
 * - Requires a valid Supabase JWT in `Authorization: Bearer <access_token>`.
 * - Uses `SUPABASE_SERVICE_ROLE_KEY` (server-only, with `SUPABASE_SECRET_KEY` alias support)
 *   to query `public.coupons` under RLS — never falls back to anon key.
 * - Never trusts client-supplied amounts; computes `baseAmount`, `discountAmount`, and
 *   `finalAmount` authoritatively on the server from `(planId, billingCycle)`.
 */
export async function handlePrepareCheckout(
  request: Request,
  env: PrepareCheckoutEnv
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handlePrepareCheckoutOptions(request, env);
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      { valid: false, message: 'Method not allowed. Use POST.' },
      405,
      request,
      env
    );
  }

  const { supabaseUrl, serviceRoleKey } = resolveSupabaseConfig(env);
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        valid: false,
        message:
          'Checkout validation service is missing Supabase server credentials.',
      },
      500,
      request,
      env
    );
  }

  // 1. Extract and verify Supabase Bearer JWT
  const authHeader =
    request.headers.get('authorization') ||
    request.headers.get('Authorization') ||
    '';

  if (!authHeader.startsWith('Bearer ')) {
    return jsonResponse(
      {
        valid: false,
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in with Email OTP to continue.',
      },
      401,
      request,
      env
    );
  }

  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    return jsonResponse(
      {
        valid: false,
        error: 'Unauthorized',
        message: 'Missing access token. Please sign in again.',
      },
      401,
      request,
      env
    );
  }

  // Server-only Supabase admin client (supports both legacy service_role JWT & sb_secret_* keys,
  // and runs cleanly on both Cloudflare Workers and Node/Edge runtimes).
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let verifiedUserId: string | null = null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (!error && data?.user?.id) {
      verifiedUserId = data.user.id;
    }
  } catch {
    return jsonResponse(
      {
        valid: false,
        message: 'Unable to verify your session right now. Please try again.',
      },
      502,
      request,
      env
    );
  }

  if (!verifiedUserId) {
    return jsonResponse(
      {
        valid: false,
        error: 'Unauthorized',
        message: 'Your session is invalid or has expired. Please sign in again.',
      },
      401,
      request,
      env
    );
  }

  // 2. Parse & validate request payload
  let payload: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid JSON body');
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(
      { valid: false, message: 'Invalid JSON request payload.' },
      400,
      request,
      env
    );
  }

  const rawPlanId = String(payload.planId ?? '').trim().toLowerCase();
  const rawBillingCycle = String(payload.billingCycle ?? '').trim().toLowerCase();

  if (!isValidPlanId(rawPlanId)) {
    return jsonResponse(
      {
        valid: false,
        message: 'Invalid plan selected. Choose basic, pro, or advanced.',
      },
      400,
      request,
      env
    );
  }

  if (!isValidBillingCycle(rawBillingCycle)) {
    return jsonResponse(
      {
        valid: false,
        message: 'Invalid billing cycle. Choose monthly or yearly.',
      },
      400,
      request,
      env
    );
  }

  const planId: SubscriptionPlanId = rawPlanId;
  const billingCycle: BillingCycle = rawBillingCycle;

  // 3. Authoritative server-side base amount
  const baseAmount = getAuthoritativeBaseAmount(planId, billingCycle);

  // 4. Optional coupon validation against public.coupons
  const normalizedCouponCode =
    typeof payload.couponCode === 'string'
      ? payload.couponCode.trim().toUpperCase()
      : '';

  if (!normalizedCouponCode) {
    return jsonResponse(
      {
        valid: true,
        planId,
        billingCycle,
        userId: verifiedUserId,
        baseAmount,
        discountAmount: 0,
        finalAmount: baseAmount,
        appliedCoupon: null,
      },
      200,
      request,
      env
    );
  }

  let coupon: CouponRow | null = null;
  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select(
        'id, code, discount_type, discount_value, max_uses, times_used, expires_at, is_active'
      )
      .eq('code', normalizedCouponCode)
      .maybeSingle<CouponRow>();

    if (error) {
      return jsonResponse(
        {
          valid: false,
          message: 'Coupon validation is temporarily unavailable. Please try again.',
        },
        500,
        request,
        env
      );
    }

    coupon = data;
  } catch {
    return jsonResponse(
      {
        valid: false,
        message: 'Could not reach coupon validation service. Please try again.',
      },
      502,
      request,
      env
    );
  }

  if (!coupon) {
    return jsonResponse(
      {
        valid: false,
        message: `Coupon code "${normalizedCouponCode}" is not valid.`,
      },
      200,
      request,
      env
    );
  }

  if (!coupon.is_active) {
    return jsonResponse(
      {
        valid: false,
        message: `Coupon code "${coupon.code}" is no longer active.`,
      },
      200,
      request,
      env
    );
  }

  if (coupon.expires_at) {
    const expiresAtMs = new Date(coupon.expires_at).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
      return jsonResponse(
        {
          valid: false,
          message: `Coupon code "${coupon.code}" has expired.`,
        },
        200,
        request,
        env
      );
    }
  }

  const timesUsed = Number(coupon.times_used ?? 0);
  if (
    coupon.max_uses !== null &&
    coupon.max_uses !== undefined &&
    timesUsed >= Number(coupon.max_uses)
  ) {
    return jsonResponse(
      {
        valid: false,
        message: `Coupon code "${coupon.code}" has reached its maximum usage limit.`,
      },
      200,
      request,
      env
    );
  }

  const discountType = coupon.discount_type as CouponDiscountType;
  const discountValue = Number(coupon.discount_value);

  if (
    (discountType !== 'percentage' && discountType !== 'fixed') ||
    !Number.isFinite(discountValue) ||
    discountValue <= 0
  ) {
    return jsonResponse(
      {
        valid: false,
        message: `Coupon code "${coupon.code}" has an invalid discount configuration.`,
      },
      200,
      request,
      env
    );
  }

  const { discountAmount, finalAmount } = calculateCouponDiscount(
    baseAmount,
    discountType,
    discountValue
  );

  return jsonResponse(
    {
      valid: true,
      planId,
      billingCycle,
      userId: verifiedUserId,
      baseAmount,
      discountAmount,
      finalAmount,
      appliedCoupon: {
        id: coupon.id,
        code: coupon.code,
        discountType,
        discountValue,
      },
    },
    200,
    request,
    env
  );
}
