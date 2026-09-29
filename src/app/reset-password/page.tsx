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
  Mail
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

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

        // 2. Handle PKCE code exchange if present in query parameters (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error:', error);
            if (isMounted) {
              setErrorMsg(
                error.message ||
                  'The password reset link has expired or is invalid. Please request a new one.'
              );
              setCheckingSession(false);
            }
            return;
          }

          if (data?.session && isMounted) {
            setHasRecoverySession(true);
            setUserEmail(data.session.user.email || '');
            setCheckingSession(false);
            return;
          }
        }

        // 3. Check for implicit hash session or active user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          setHasRecoverySession(true);
          setUserEmail(session.user.email || '');
          setCheckingSession(false);
        } else {
          // Allow onAuthStateChange to fire if Supabase is still parsing hash fragment
          const timer = setTimeout(() => {
            if (isMounted) {
              setCheckingSession((current) => {
                if (current) {
                  // If after timeout we still don't have a session, show expired/invalid notice
                  return false;
                }
                return false;
              });
            }
          }, 2000);

          return () => clearTimeout(timer);
        }
      } catch (err: any) {
        console.error('Recovery init exception:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Unable to verify password reset token.');
          setCheckingSession(false);
        }
      }
    }

    initRecovery();

    // 4. Listen for auth state change (PASSWORD_RECOVERY or SIGNED_IN)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session?.user)) {
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
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      setSuccessMsg('Your password has been successfully updated! Redirecting to sign in...');

      // Auto-redirect to login after short delay
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2200);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Failed to update password. Your reset session may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC"
              className="h-16 w-auto object-contain mx-auto mix-blend-multiply"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Account Security</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500">
            {userEmail ? (
              <span>Updating password for <strong className="text-slate-800">{userEmail}</strong></span>
            ) : (
              <span>Choose a new secure password for your VigilAMC workspace.</span>
            )}
          </p>
        </div>

        {/* State 1: Checking Session */}
        {checkingSession && (
          <div className="py-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0077B6] mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Verifying your reset link...
            </p>
            <p className="text-xs text-slate-400">
              Validating secure credentials with Supabase Auth
            </p>
          </div>
        )}

        {/* State 2: Success state */}
        {!checkingSession && isSuccess && (
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Password Changed!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your password has been successfully updated. You can now sign in to your VigilAMC agency workspace with your new credentials.
            </p>
            <div className="pt-2">
              <Link
                href="/login?reset=success"
                className="w-full py-3 px-4 bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Active recovery session -> Form */}
        {!checkingSession && !isSuccess && hasRecoverySession && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must contain at least 6 characters.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
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
              className="w-full py-3 bg-[#0077B6] hover:bg-[#023E8A] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
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
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-left">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Reset Link Expired or Invalid</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {errorMsg ||
                  'This password reset link is invalid or has already been used. For your security, recovery links can only be used once and expire shortly after delivery.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full py-3 px-4 bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold text-xs rounded-xl shadow text-center block transition-colors"
              >
                Request a New Reset Link
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl text-center block transition-colors"
              >
                Back to VigilAMC Home
              </Link>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#0077B6]" />
          <span>Secured with 256-bit Supabase Cloud Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0077B6] mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Loading security portal...
            </p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
