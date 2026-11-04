'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getResetPasswordRedirectUrl } from '@/lib/auth-helpers';
import { GooglePlayBadge } from '@/components/GooglePlayBadge';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD' | 'COMPLETE_PROFILE'>('SIGN_IN');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          // Check if profile exists and has company
          const meRes = await fetch('/api/auth/me');
          if (meRes.ok) {
            const meData = await meRes.json();
            if (!meData.profile?.organizationId || !meData.profile?.phone) {
              setMode('COMPLETE_PROFILE');
              setEmail(session.user.email || '');
              setFullName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '');
            } else {
              router.push('/dashboard');
              return;
            }
          } else {
            router.push('/dashboard');
            return;
          }
        }
      } catch (e) {
        console.error('Session check error:', e);
      } finally {
        setCheckingSession(false);
      }
    }
    checkUser();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reset') === 'success') {
        setSuccessMsg('Your password has been successfully updated! Please sign in with your new password.');
        setMode('SIGN_IN');
      }
    }
  }, [supabase]);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'https://vigilamc.vercel.app';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes('not enabled') ||
          error.message?.toLowerCase().includes('unsupported provider') ||
          error.message?.toLowerCase().includes('configuration')
        ) {
          toast.error('Google Sign-In is not enabled in Supabase Auth settings.');
          setErrorMsg('Google Sign-In is not enabled yet in your Supabase project dashboard. Please enable the Google provider in Supabase Authentication settings.');
          return;
        } else {
          throw error;
        }
      }

      if (data?.url) {
        // Pre-flight probe Supabase authorize URL to detect unconfigured provider before navigating away
        try {
          // redirect: 'manual' — an enabled provider answers with a 302 to Google
          // (opaqueredirect); only a readable 400 "provider is not enabled" means unconfigured.
          const probe = await fetch(data.url, { method: 'GET', redirect: 'manual' });
          if (probe.type !== 'opaqueredirect' && probe.status === 400) {
            const probeJson = await probe.json().catch(() => null);
            if (
              probeJson?.msg?.toLowerCase().includes('not enabled') ||
              probeJson?.msg?.toLowerCase().includes('unsupported provider')
            ) {
              toast.error('Google Sign-In is not enabled yet in your Supabase project.');
              setErrorMsg('Google Sign-In is not enabled yet in your Supabase project. To fix this, open your Supabase Dashboard > Authentication > Providers > Google, toggle "Enable Google provider", paste your Google Client ID & Secret, and save.');
              return;
            }
          }
        } catch {
          // If probe blocked or CORS variation, proceed with redirect
        }

        window.location.href = data.url;
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('provider') ||
        msg.toLowerCase().includes('not enabled') ||
        msg.toLowerCase().includes('not configured')
      ) {
        toast.error('Google Sign-In is not enabled yet in Supabase Auth settings.');
        setErrorMsg('Google Sign-In is not enabled yet in your Supabase project. Please enable the Google provider in Supabase Authentication settings.');
      } else {
        setErrorMsg(msg || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim()) {
      setErrorMsg('Agency/Company name and phone number are required.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          email: currentUser?.email || email.trim().toLowerCase(),
          fullName: fullName.trim() || currentUser?.user_metadata?.full_name || 'Agency Owner',
          agencyName: companyName.trim(),
          companyName: companyName.trim(),
          phone: phone.trim(),
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.error || 'Failed to complete profile');
      }

      toast.success('Agency workspace configured successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const rawIdentifier = email.trim();
      let resolvedAuthEmail = rawIdentifier.toLowerCase();

      if (!rawIdentifier.includes('@')) {
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: rawIdentifier }),
        });
        const resolveData = await resolveRes.json();
        if (!resolveRes.ok || !resolveData.email) {
          throw new Error(
            resolveData.error || 'Could not find account with this Mobile Number or Staff ID.'
          );
        }
        resolvedAuthEmail = resolveData.email.trim().toLowerCase();
      } else {
        // Also check if email user is deactivated before signing in
        const resolveRes = await fetch('/api/auth/resolve-identifier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: resolvedAuthEmail }),
        });
        if (resolveRes.status === 403) {
          const resolveData = await resolveRes.json();
          throw new Error(resolveData.error || 'This account has been deactivated.');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedAuthEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Ensure profile exists and is active in database
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || '',
            companyName: data.user.user_metadata?.company_name || '',
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          await supabase.auth.signOut();
          throw new Error(regData.error || 'Failed to authenticate profile.');
        }

        const redirectParam =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('redirect')
            : null;
        const safeRedirect =
          redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
            ? redirectParam
            : null;

        if (regData.profile?.role === 'TECHNICIAN') {
          await supabase.auth.signOut();
          throw new Error('Technicians: get VigilAMC Field on Google Play to sign in.');
        } else {
          router.push(safeRedirect || '/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          agencyName: companyName.trim(),
          companyName: companyName.trim(),
          phone: phone.trim(),
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.error || 'Registration failed');
      }

      // Immediately authenticate session
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        setSuccessMsg('Agency account created successfully! Please sign in with your credentials.');
        setMode('SIGN_IN');
      } else if (loginData.session) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const redirectUrl = getResetPasswordRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSuccessMsg('Password reset instructions have been sent to your email. Click the link in the email to set a new password.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setLoading(false);
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4 bg-[#FFF8F2] overflow-hidden" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 45%, #FFE8D6 100%)" }}>
      <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[380px] rounded-full" style={{ background: "radial-gradient(circle, rgba(232, 89, 12, 0.22) 0%, rgba(255, 140, 66, 0.14) 50%, rgba(255, 248, 242, 0) 74%)", filter: "blur(85px)" }} />
      <div data-testid="login-glass-card" className="relative z-10 max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Brand */}
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'SIGN_IN' && 'Sign In to VigilAMC'}
            {mode === 'SIGN_UP' && 'Create Agency Account'}
            {mode === 'FORGOT_PASSWORD' && 'Reset Password'}
            {mode === 'COMPLETE_PROFILE' && 'Complete Agency Setup'}
          </h1>
          <p className="text-xs text-slate-500">
            Fire Safety AMC Management &amp; Form-B Compliance Platform
          </p>
        </div>

        {/* If user is already authenticated */}
        {!checkingSession && currentUser ? (
          <div className="p-4 bg-[#FFF0E6] border border-[#FED7AA] rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C2410C] text-white flex items-center justify-center font-bold">
                {currentUser.email?.[0].toUpperCase()}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs text-slate-500">Logged in as</div>
                <div className="text-sm font-bold text-slate-900 truncate">{currentUser.email}</div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 py-2.5 px-4 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs rounded-lg text-center transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="py-2.5 px-3 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            {mode !== 'FORGOT_PASSWORD' && mode !== 'COMPLETE_PROFILE' && (
              <div className="flex rounded-xl bg-[#FFF0E6] p-1 border border-[#FED7AA] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_IN');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === 'SIGN_IN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_UP');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    mode === 'SIGN_UP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Register Agency
                </button>
              </div>
            )}

            {/* Error & Success Banners */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Google Sign-In Button (Module I1) */}
            {(mode === 'SIGN_IN' || mode === 'SIGN_UP') && (
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  data-testid="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-xs flex items-center justify-center gap-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-[#FFF8F2] px-3 text-[11px] text-slate-500 absolute uppercase tracking-wider font-semibold">
                    or continue with email
                  </span>
                </div>
              </div>
            )}

            {/* Complete Profile Form for First-Time Google Login (Module I2) */}
            {mode === 'COMPLETE_PROFILE' && (
              <form onSubmit={handleCompleteProfile} className="space-y-4">
                <div className="p-3 bg-orange-50 border border-orange-200 text-[#9A3412] text-xs rounded-xl">
                  <strong>Complete Your Agency Profile:</strong> Please specify your fire safety agency name and contact phone number to initialize your workspace.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Agency / Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Fire Protection Services"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup &amp; Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form */}
            {mode === 'SIGN_IN' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number, Staff ID, or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210, TECH-101, or email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('FORGOT_PASSWORD')}
                      className="text-xs text-[#C2410C] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'SIGN_UP' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Agency / Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Fire Protection Services"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="vikram@apexfire.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone / Mobile *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98000 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Set Secure Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 pt-3"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Agency Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Register &amp; Launch Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {mode === 'FORGOT_PASSWORD' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered work email and we will send you a password reset link.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@agency.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('SIGN_IN');
                      setErrorMsg(null);
                    }}
                    className="py-2.5 px-4 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Field Technician Android App Notice */}
        <div className="pt-3 border-t border-slate-100 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-xs text-slate-600 font-medium">
            <a
              href={SITE_CONFIG.GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener"
              className="text-[#C2410C] hover:text-[#9A3412] font-semibold hover:underline transition-colors"
            >
              Technicians: get VigilAMC Field on Google Play
            </a>
          </p>
          <GooglePlayBadge size="sm" theme="light" />
          <span className="text-[11px] text-slate-500">
            Offline inspections · GPS evidence · Install in one tap
          </span>
        </div>

        {/* Security Notice */}
        <div className="pt-2 border-t border-slate-100 flex flex-col items-center justify-center gap-1 text-slate-400 text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
            <span>Secure sign-in</span>
          </div>
          <span className="text-[11px] text-[#78716C] font-medium">
            DPIIT-recognized startup · Made in India
          </span>
        </div>
      </div>
    </div>
  );
}
