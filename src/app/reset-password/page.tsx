'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { supabase as implicitSupabase } from '@/lib/supabase';

function ResetPasswordContent() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeClientType, setActiveClientType] = useState<'ssr' | 'implicit'>('ssr');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const ssrSupabase = createClient();

    async function initRecovery() {
      try {
        if (typeof window === 'undefined') return;

        // 1. Check for error parameters in query string or URL hash
        const searchParams = new URLSearchParams(window.location.search);
        const hashString = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hashString);

        const errorDesc =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error') ||
          hashParams.get('error');

        if (errorDesc) {
          if (isMounted) {
            setErrorMsg(
              decodeURIComponent(errorDesc).replace(/\+/g, ' ') ||
                'This password reset link is invalid or has expired.'
            );
            setCheckingSession(false);
          }
          return;
        }

        // 2. Handle implicit hash tokens (#access_token=...&refresh_token=...&type=recovery)
        //    Works across browsers, devices, and apex/vercel domains without PKCE verifier cookies.
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const { data, error } = await ssrSupabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error && data?.session) {
            // Also keep implicit client in sync and remove sensitive hash from URL
            await implicitSupabase.auth
              .setSession({ access_token: accessToken, refresh_token: refreshToken })
              .catch(() => null);
            try {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch {
              // ignore history API errors
            }
            if (isMounted) {
              setActiveClientType('ssr');
              setHasRecoverySession(true);
              setUserEmail(data.session.user.email || '');
              setCheckingSession(false);
            }
            return;
          }

          if (error && isMounted) {
            setErrorMsg(
              error.message ||
                'This password reset link has expired or is invalid. Please request a new one.'
            );
            setCheckingSession(false);
            return;
          }
        }

        // 3. Handle token_hash query param (?token_hash=...&type=recovery)
        const tokenHash = searchParams.get('token_hash');
        if (tokenHash) {
          const typeParam = (searchParams.get('type') || 'recovery') as 'recovery' | 'email';
          const { data, error } = await ssrSupabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: typeParam,
          });
          if (error) {
            if (isMounted) {
              setErrorMsg(
                error.message ||
                  'This password reset link has expired or is invalid. Please request a new one.'
              );
              setCheckingSession(false);
            }
            return;
          }
          if (data?.session && isMounted) {
            setActiveClientType('ssr');
            setHasRecoverySession(true);
            setUserEmail(data.session.user.email || '');
            setCheckingSession(false);
            return;
          }
        }

        // 4. Handle PKCE code exchange if present in query parameters (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await ssrSupabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (isMounted) {
              setErrorMsg(
                'This reset link could not be verified in this browser (expired or opened on a different device). Please request a fresh reset email below.'
              );
              setCheckingSession(false);
            }
            return;
          }

          if (data?.session && isMounted) {
            setActiveClientType('ssr');
            setHasRecoverySession(true);
            setUserEmail(data.session.user.email || '');
            setCheckingSession(false);
            return;
          }
        }

        // 5. Check existing active recovery session on either client
        const {
          data: { session: ssrSession },
        } = await ssrSupabase.auth.getSession();

        if (ssrSession?.user && isMounted) {
          setActiveClientType('ssr');
          setHasRecoverySession(true);
          setUserEmail(ssrSession.user.email || '');
          setCheckingSession(false);
          return;
        }

        const {
          data: { session: implicitSession },
        } = await implicitSupabase.auth.getSession();

        if (implicitSession?.user && isMounted) {
          setActiveClientType('implicit');
          setHasRecoverySession(true);
          setUserEmail(implicitSession.user.email || '');
          setCheckingSession(false);
          return;
        }

        // Give Supabase auth state listener a brief window before showing expired notice
        const timer = setTimeout(() => {
          if (isMounted) {
            setCheckingSession(false);
          }
        }, 1200);

        return () => clearTimeout(timer);
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err?.message || 'Unable to verify password reset link.');
          setCheckingSession(false);
        }
      }
    }

    initRecovery();

    // 6. Listen for auth state change (PASSWORD_RECOVERY or SIGNED_IN)
    const {
      data: { subscription },
    } = ssrSupabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session?.user)) {
        setActiveClientType('ssr');
        setHasRecoverySession(true);
        setUserEmail(session?.user?.email || '');
        setCheckingSession(false);
        setErrorMsg(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match. Please re-enter.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const targetClient = activeClientType === 'implicit' ? implicitSupabase : createClient();
      const { error } = await targetClient.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      // Sign out temporary recovery session so user signs in cleanly with new password
      await Promise.allSettled([createClient().auth.signOut(), implicitSupabase.auth.signOut()]);

      setIsSuccess(true);
      const okMsg = 'Your password has been successfully updated! Redirecting to sign in...';
      setSuccessMsg(okMsg);
      toast.success('Password updated successfully!');

      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Your reset session may have expired.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF8F2]">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl border border-[#DCE7F2] rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C] rounded-xl group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-tile-192.png"
              alt="VigilAMC Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-cover mx-auto rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] text-[#C2410C] text-xs font-bold border border-[#FED7AA]">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Account Security</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-[#44403C]">
            {userEmail ? (
              <span>
                Updating password for <strong className="text-[#1C1917]">{userEmail}</strong>
              </span>
            ) : (
              <span>Choose a new secure password for your VigilAMC workspace.</span>
            )}
          </p>
        </div>

        {/* State 1: Checking Session */}
        {checkingSession && (
          <div className="py-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto" />
            <p className="text-sm font-semibold text-[#1C1917]">Verifying your reset link...</p>
            <p className="text-xs text-[#57534E]">
              Validating secure credentials with VigilAMC Auth
            </p>
          </div>
        )}

        {/* State 2: Success state */}
        {!checkingSession && isSuccess && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#ECFDF5] text-[#059669] rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#A7F3D0]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1C1917]">Password Changed!</h3>
            <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed max-w-sm mx-auto">
              Your password has been successfully updated. You can now sign in to your VigilAMC agency workspace with your new credentials.
            </p>
            <div className="pt-2">
              <Link
                href="/login?reset=success"
                className="w-full min-h-[44px] py-3 px-4 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Active recovery session -> Form */}
        {!checkingSession && !isSuccess && hasRecoverySession && (
          <form onSubmit={handleUpdatePassword} className="space-y-4" data-testid="reset-password-form">
            {errorMsg && (
              <div
                role="alert"
                aria-live="polite"
                className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                aria-live="polite"
                className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
              >
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1C1917] p-1 rounded-lg cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#57534E] mt-1">Must contain at least 6 characters.</p>
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
              >
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="confirm-new-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1C1917] p-1 rounded-lg cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="save-new-password-btn"
              className="w-full min-h-[44px] py-3 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* State 4: Invalid, expired, or missing recovery session */}
        {!checkingSession && !isSuccess && !hasRecoverySession && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-[#92400E] font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>Reset Link Expired or Invalid</span>
              </div>
              <p className="text-xs text-[#92400E] leading-relaxed">
                {errorMsg ||
                  'This password reset link is invalid or has already been used. Request a fresh password reset email or use Email OTP sign-in.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/login?mode=forgot"
                className="w-full min-h-[44px] py-3 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow text-center flex items-center justify-center transition-colors"
              >
                Request a New Reset Email
              </Link>
              <Link
                href="/login?mode=otp"
                className="w-full min-h-[44px] py-2.5 px-4 bg-[#FFF0E6] hover:bg-[#FFE4D6] text-[#C2410C] border border-[#FED7AA] font-bold text-xs rounded-xl text-center flex items-center justify-center transition-colors"
              >
                Sign In Instantly with Email OTP
              </Link>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="pt-2 border-t border-[#DCE7F2]/80 flex items-center justify-center gap-1.5 text-[#57534E] text-xs">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span>Secured with encrypted VigilAMC Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF8F2]">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#EA580C] mx-auto" />
            <p className="text-sm font-semibold text-[#1C1917]">Loading security portal...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
