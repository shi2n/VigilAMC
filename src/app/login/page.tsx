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

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD'>('SIGN_IN');
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
          router.push('/technician');
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
            {mode !== 'FORGOT_PASSWORD' && (
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
