-- VigilAMC Subscription Coupons Table & Row Level Security
-- Server-only access via SUPABASE_SERVICE_ROLE_KEY (no public or authenticated read policies).
-- Idempotent migration safe to run in Supabase SQL Editor or via migration runner.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  discount_type text NOT NULL,
  discount_value numeric(10, 2) NOT NULL,
  max_uses integer,
  times_used integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coupons_code_unique UNIQUE (code),
  CONSTRAINT coupons_code_uppercase_check CHECK (
    code = upper(btrim(code)) AND char_length(code) > 0
  ),
  CONSTRAINT coupons_discount_type_check CHECK (
    discount_type IN ('percentage', 'fixed')
  ),
  CONSTRAINT coupons_discount_value_check CHECK (
    discount_value > 0
    AND (discount_type <> 'percentage' OR discount_value <= 100)
  ),
  CONSTRAINT coupons_max_uses_check CHECK (
    max_uses IS NULL OR max_uses > 0
  ),
  CONSTRAINT coupons_times_used_check CHECK (
    times_used >= 0
  )
);

-- Keep codes normalized to trimmed uppercase on insert/update
CREATE OR REPLACE FUNCTION public.normalize_coupon_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.code := upper(btrim(NEW.code));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_coupons_normalize_code ON public.coupons;
CREATE TRIGGER trg_coupons_normalize_code
  BEFORE INSERT OR UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_coupon_code();

-- Helpful lookup index for active codes
CREATE INDEX IF NOT EXISTS idx_coupons_active_code
  ON public.coupons (code)
  WHERE is_active = true;

-- Enable Row Level Security with NO public / authenticated policies.
-- Only Supabase service_role (which bypasses RLS) can read or mutate coupons.
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.coupons FROM PUBLIC;
REVOKE ALL ON TABLE public.coupons FROM anon;
REVOKE ALL ON TABLE public.coupons FROM authenticated;
GRANT ALL ON TABLE public.coupons TO service_role;

-- Optional: atomic redemption helper callable only by service_role after payment confirmation
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.coupons
  SET times_used = times_used + 1,
      updated_at = now()
  WHERE code = upper(btrim(p_coupon_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR times_used < max_uses);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_coupon_usage(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_coupon_usage(text) FROM anon;
REVOKE ALL ON FUNCTION public.increment_coupon_usage(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO service_role;
