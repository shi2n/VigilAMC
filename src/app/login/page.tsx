'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getResetPasswordRedirectUrl } from '@/lib/auth-helpers';
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
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          // Check if profile exists and has company
          const authHeaders: Record<string, string> = {};
          if (session.access_token) {
            authHeaders['Authorization'] = `Bearer ${session.access_token}`;
          }
          const meRes = await fetch('/api/auth/me', { headers: authHeaders });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.authenticated) {
              if (!meData.profile?.organizationId || !meData.profile?.phone) {
                setMode('COMPLETE_PROFILE');
                setEmail(session.user.email || '');
                setFullName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '');
                return;
              }
              // Guard against redirect loops: only push to dashboard if login wasn't redirected from dashboard
              const params = new URLSearchParams(window.location.search);
              if (!params.get('redirect')) {
                router.push('/dashboard');
                return;
              }
            }
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
  }, [supabase, router]);

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FFF8F2]">
      {/* ============================================================ */}
      {/* LEFT PANEL — Brand Hero (≈52% width on desktop, ≤180px banner on mobile) */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[52%] xl:w-[54%] h-[160px] sm:h-[180px] lg:h-auto lg:min-h-screen shrink-0 overflow-hidden select-none bg-[#1C1917]">
        {/* Real Brand Hero Photography */}
        <Image
          src="/images/hero-technician-v2.jpg"
          alt="VigilAMC Field Technician Inspecting Fire Safety Equipment"
          fill
          priority
          className="object-cover object-center lg:object-[center_35%]"
          sizes="(max-width: 1024px) 100vw, 54vw"
        />

        {/* Charcoal → Fire gradient overlay for contrast and legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(28, 25, 23, 0.82) 0%, rgba(28, 25, 23, 0.45) 38%, rgba(194, 65, 12, 0.65) 75%, rgba(28, 25, 23, 0.95) 100%)',
          }}
        />

        {/* Subtle ember ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(234, 88, 12, 0.35) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Left Panel Inner Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 xl:p-12 text-white">
          {/* Top Bar: VigilAMC flame-V logo + LIVE status chip */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-tile-192.png"
                alt="VigilAMC Logo"
                width={40}
                height={40}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-lg border border-white/20 transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none">
                    Vigil<span className="text-[#FF8C42]">AMC</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <span className="text-[11px] text-stone-200 font-medium tracking-tight mt-0.5 hidden sm:block">
                  Fire Safety AMC &amp; Compliance Platform
                </span>
              </div>
            </Link>

            {/* Quick Live Demo Link */}
            <Link
              href="/demo"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs text-white font-medium transition-all"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Desktop Value-Prop Headline + Support + Vocabulary Chips */}
          <div className="hidden lg:flex flex-col gap-4 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold tracking-wider uppercase">
                GPS-STAMPED
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold tracking-wider uppercase">
                WORKS OFFLINE
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Proof that survives the audit.
            </h2>

            <p className="text-sm xl:text-base text-stone-200 leading-relaxed font-normal">
              GPS-stamped inspections, offline checklists, and compliance reports — from basement plant rooms to boardrooms.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-stone-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF8C42]" /> NBC 2016 Part 4
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF8C42]" /> IS 2190 &amp; IS 3844
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF8C42]" /> Form-B Ready
              </span>
            </div>
          </div>

          {/* Mobile Compact Headline (≤180px banner) */}
          <div className="lg:hidden flex items-end justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Proof that survives the audit.
              </h2>
              <p className="text-[11px] text-stone-200 mt-0.5">
                Agency Workspace Login
              </p>
            </div>
            <span className="inline-flex sm:hidden items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL — Light Form Panel (≈48% width) */}
      {/* ============================================================ */}
      <div className="flex-1 w-full lg:w-[48%] xl:w-[46%] min-h-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 xl:p-12 relative overflow-y-auto">
        {/* Subtle warm ember ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-[420px] h-[340px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(232, 89, 12, 0.10) 0%, rgba(255, 140, 66, 0.05) 45%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Glass Card Container */}
        <div
          data-testid="login-glass-card"
          className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#DCE7F2] rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 space-y-5"
        >
          {/* Header rhythm: Eyebrow -> H1 -> Sub */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold tracking-wider uppercase">
              {mode === 'SIGN_IN' && 'AGENCY WORKSPACE'}
              {mode === 'SIGN_UP' && 'CREATE ACCOUNT'}
              {mode === 'FORGOT_PASSWORD' && 'PASSWORD RECOVERY'}
              {mode === 'COMPLETE_PROFILE' && 'SETUP WORKSPACE'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
              {mode === 'SIGN_IN' && 'Welcome back.'}
              {mode === 'SIGN_UP' && 'Create agency workspace.'}
              {mode === 'FORGOT_PASSWORD' && 'Reset your password.'}
              {mode === 'COMPLETE_PROFILE' && 'Complete agency setup.'}
            </h1>
            <p className="text-xs sm:text-sm text-[#44403C]">
              {mode === 'SIGN_IN' && 'Log in to your VigilAMC workspace.'}
              {mode === 'SIGN_UP' && 'Set up your agency profile and dispatch field inspections in minutes.'}
              {mode === 'FORGOT_PASSWORD' && "Enter your registered email and we'll send a password reset link."}
              {mode === 'COMPLETE_PROFILE' && 'Specify your agency name and phone to initialize your workspace.'}
            </p>
          </div>

          {/* Authenticated State */}
          {!checkingSession && currentUser ? (
            <div className="p-4 bg-[#FFF0E6] border border-[#FED7AA] rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C2410C] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {currentUser.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs text-[#57534E]">Logged in as</div>
                  <div className="text-sm font-bold text-[#1C1917] truncate">{currentUser.email}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Link
                  href="/dashboard"
                  className="flex-1 min-h-[44px] py-2.5 px-4 bg-[#C2410C] hover:bg-[#9A3412] active:bg-[#7C2D12] text-white font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="min-h-[44px] py-2.5 px-4 border border-stone-300 hover:bg-stone-50 text-[#1C1917] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Switch Tabs */}
              {mode !== 'FORGOT_PASSWORD' && mode !== 'COMPLETE_PROFILE' && (
                <div className="flex rounded-xl bg-[#FFF0E6] p-1 border border-[#FED7AA] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('SIGN_IN');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all min-h-[36px] ${
                      mode === 'SIGN_IN' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
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
                    className={`flex-1 py-2 rounded-lg transition-all min-h-[36px] ${
                      mode === 'SIGN_UP' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    Register Agency
                  </button>
                </div>
              )}

              {/* Error & Success Banners with accessible aria-live */}
              {errorMsg && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs rounded-xl flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div
                  role="status"
                  aria-live="polite"
                  className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs rounded-xl flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
                  <span className="leading-snug">{successMsg}</span>
                </div>
              )}

              {/* 1. Continue with Google Button */}
              {(mode === 'SIGN_IN' || mode === 'SIGN_UP') && (
                <div className="space-y-4">
                  <button
                    type="button"
                    data-testid="google-signin-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-[#FFF8F2] border border-[#DCE7F2] rounded-xl text-sm font-semibold text-[#1C1917] shadow-xs flex items-center justify-center gap-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EA580C] cursor-pointer"
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

                  {/* 2. Divider with centered label */}
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-[#DCE7F2] w-full" />
                    <span className="bg-white px-3 text-[11px] text-[#57534E] absolute uppercase tracking-wider font-semibold">
                      or continue with email
                    </span>
                  </div>
                </div>
              )}

              {/* Complete Profile Form (for first-time Google sign-ins) */}
              {mode === 'COMPLETE_PROFILE' && (
                <form onSubmit={handleCompleteProfile} className="space-y-4">
                  <div className="p-3 bg-[#FFF0E6] border border-[#FED7AA] text-[#9A3412] text-xs rounded-xl leading-relaxed">
                    <strong>Complete Your Agency Setup:</strong> Please enter your company name and contact phone number to initialize your workspace.
                  </div>

                  <div>
                    <label
                      htmlFor="profile-company"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Agency / Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-company"
                        type="text"
                        required
                        placeholder="e.g. Apex Fire Protection Services"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-phone"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Contact Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-phone"
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-name"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-name"
                        type="text"
                        placeholder="Your Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[44px] h-11 sm:h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
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

              {/* 3, 4, 5, 6. SIGN_IN Form */}
              {mode === 'SIGN_IN' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* 3. Email Input */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Work Email, Mobile, or Staff ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="login-email"
                        name="email"
                        type="text"
                        required
                        autoComplete="username"
                        placeholder="e.g. 9876543210, TECH-101, or email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  {/* 4. Password Input with Show/Hide toggle */}
                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1C1917] p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 5. Remember Me checkbox + Forgot Password link */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[#44403C] hover:text-[#1C1917]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-[#EA580C] focus:ring-[#EA580C] accent-[#EA580C]"
                      />
                      <span className="font-medium">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('FORGOT_PASSWORD');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="font-semibold text-[#C2410C] hover:text-[#9A3412] hover:underline focus:outline-none focus:ring-1 focus:ring-[#EA580C] rounded"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  {/* 6. Primary CTA button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[44px] h-11 sm:h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SIGN_UP Form */}
              {mode === 'SIGN_UP' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="signup-company"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1"
                    >
                      Agency / Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-company"
                        type="text"
                        required
                        placeholder="e.g. Apex Fire Protection Services"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1"
                    >
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Vikram Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1"
                    >
                      Official Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="vikram@apexfire.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-phone"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1"
                    >
                      Phone / Mobile *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+91 98000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1"
                    >
                      Set Secure Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[44px] h-11 sm:h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
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

              {/* FORGOT_PASSWORD Form */}
              {mode === 'FORGOT_PASSWORD' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Registered Official Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="reset-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="your.email@agency.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('SIGN_IN');
                        setErrorMsg(null);
                      }}
                      className="min-h-[44px] py-2.5 px-4 border border-stone-300 text-[#1C1917] text-xs font-bold rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 min-h-[44px] py-2.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Link...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <a
                      href="mailto:vigilamc@gmail.com?subject=Password%20Reset%20Assistance"
                      className="text-xs text-[#57534E] hover:text-[#C2410C] hover:underline"
                    >
                      Need help? vigilamc@gmail.com
                    </a>
                  </div>
                </form>
              )}
            </>
          )}

          {/* 7. Trust line */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#44403C] pt-1">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>🔒 Secure connection · TLS encryption</span>
          </div>

          {/* 8. Try-first line */}
          <div className="text-center text-xs text-[#44403C]">
            <span>Want to see it first? </span>
            <Link
              href="/demo"
              className="font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline"
            >
              Explore the live demo →
            </Link>
          </div>

          {/* 9. Footer row */}
          <div className="pt-3 border-t border-[#DCE7F2]/80 space-y-2 text-center">
            {mode === 'SIGN_IN' && (
              <p className="text-xs text-[#44403C]">
                New to VigilAMC?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_UP');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline"
                >
                  Create a free account →
                </button>
              </p>
            )}
            {mode === 'SIGN_UP' && (
              <p className="text-xs text-[#44403C]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('SIGN_IN');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline"
                >
                  Sign in to workspace →
                </button>
              </p>
            )}

            <p className="text-[11px] text-[#57534E]">
              <a
                href={SITE_CONFIG.GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1C1917] hover:underline"
              >
                Field technician? Get the Android app →
              </a>
            </p>

            <p className="text-[11px] text-[#57534E] font-medium">
              DPIIT-recognized startup · Made in India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
