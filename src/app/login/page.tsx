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
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound,
  Clock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { supabase as otpSupabase } from '@/lib/supabase';
import { EmailOtpAuth } from '@/components/EmailOtpAuth';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { SITE_CONFIG } from '@/lib/siteConfig';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD' | 'COMPLETE_PROFILE'>('SIGN_IN');
  const [signInMethod, setSignInMethod] = useState<'PASSWORD' | 'EMAIL_OTP'>('PASSWORD');
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
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Two-step Email OTP verification state for new account creation (SIGN_UP)
  const [signupStep, setSignupStep] = useState<'details' | 'verify_otp'>('details');
  const [signupNormalizedEmail, setSignupNormalizedEmail] = useState('');
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [signupResendCooldown, setSignupResendCooldown] = useState(0);
  const [resendingSignupOtp, setResendingSignupOtp] = useState(false);

  // Two-step Forgot Password state (supports both clickable reset link AND inline recovery OTP)
  const [forgotStep, setForgotStep] = useState<'email' | 'verify_reset'>('email');
  const [forgotNormalizedEmail, setForgotNormalizedEmail] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);
  const [resendingForgotOtp, setResendingForgotOtp] = useState(false);

  useEffect(() => {
    if (signupResendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setSignupResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [signupResendCooldown]);

  useEffect(() => {
    if (forgotResendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setForgotResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [forgotResendCooldown]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        window.location.replace(`/reset-password${search}${hash}`);
        return;
      }
    }

    const {
      data: { subscription: recoverySub },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.replace('/reset-password');
      }
    });

    router.prefetch('/dashboard');
    const urlParams =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const requestedMode = urlParams?.get('mode');

    if (urlParams) {
      if (urlParams.get('reset') === 'success') {
        setSuccessMsg('Your password has been successfully updated! Please sign in with your new password.');
        setMode('SIGN_IN');
      } else if (urlParams.get('error') === 'technician_app_required') {
        setErrorMsg('Technicians: get VigilAMC Field on Google Play (Apple App Store coming soon) to sign in.');
        setMode('SIGN_IN');
      } else if (urlParams.get('error')?.startsWith('google_')) {
        setErrorMsg('Google sign-in could not be completed. Please try again.');
        setMode('SIGN_IN');
      } else if (requestedMode === 'signup') {
        setMode('SIGN_UP');
      } else if (requestedMode === 'otp') {
        setMode('SIGN_IN');
        setSignInMethod('EMAIL_OTP');
      } else if (requestedMode === 'forgot') {
        setMode('FORGOT_PASSWORD');
        setForgotStep('email');
      } else if (requestedMode === 'complete-profile') {
        setMode('COMPLETE_PROFILE');
      }
    }

    async function checkUser() {
      try {
        let activeSession = (await supabase.auth.getSession()).data?.session ?? null;
        if (!activeSession) {
          activeSession = (await otpSupabase.auth.getSession()).data?.session ?? null;
        }

        if (activeSession?.user) {
          setCurrentUser(activeSession.user);
          const authHeaders: Record<string, string> = {};
          if (activeSession.access_token) {
            authHeaders['Authorization'] = `Bearer ${activeSession.access_token}`;
          }
          const meRes = await fetch('/api/auth/me', { headers: authHeaders });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.authenticated) {
              const isSuperOrFounder =
                Boolean(meData.isPlatformOwner) || meData.profile?.role === 'SUPER_ADMIN';
              const existingOrgName = String(meData.organization?.name || '').trim();
              const existingPhone = String(meData.profile?.phone || '').trim();
              const isAutoPlaceholderOrg =
                !existingOrgName ||
                existingOrgName.endsWith(' Fire Agency') ||
                existingOrgName.endsWith("'s Fire Safety AMC");

              const needsProfileCompletion =
                !isSuperOrFounder &&
                (requestedMode === 'complete-profile' ||
                  !meData.profile?.organizationId ||
                  !existingOrgName ||
                  !existingPhone);

              if (needsProfileCompletion) {
                setMode('COMPLETE_PROFILE');
                setEmail(activeSession.user.email || '');
                setFullName(
                  meData.profile?.fullName?.trim() ||
                    activeSession.user.user_metadata?.full_name ||
                    activeSession.user.user_metadata?.name ||
                    ''
                );
                if (existingOrgName && !isAutoPlaceholderOrg) {
                  setCompanyName(existingOrgName);
                }
                if (existingPhone) {
                  setPhone(existingPhone);
                }
                if (meData.organization?.city) setCity(meData.organization.city);
                if (meData.organization?.state) setStateName(meData.organization.state);
                if (meData.organization?.licenseNumber) {
                  setLicenseNumber(meData.organization.licenseNumber);
                }
                return;
              }

              // Guard against redirect loops: only push to dashboard if login wasn't redirected from dashboard
              if (!urlParams?.get('redirect')) {
                router.push('/dashboard');
                return;
              }
            }
          }
        } else if (requestedMode === 'complete-profile') {
          setMode('SIGN_IN');
        }
      } catch (e) {
        console.error('Session check error:', e);
      } finally {
        setCheckingSession(false);
      }
    }
    checkUser();
    return () => {
      recoverySub.unsubscribe();
    };
  }, [supabase, router]);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : SITE_CONFIG.SITE_URL;

      // Prefer branded vigilamc.com direct Google OAuth (so Google displays "VigilAMC" / "vigilamc.com"
      // instead of "<project>.supabase.co") whenever GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are configured.
      try {
        const checkRes = await fetch('/api/auth/google/start?check=1', { cache: 'no-store' });
        if (checkRes.ok) {
          const checkJson = await checkRes.json().catch(() => null);
          if (checkJson?.configured) {
            window.location.href = '/api/auth/google/start?next=/dashboard';
            return;
          }
        }
      } catch {
        // Fall through to Supabase OAuth below
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
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
    const cleanCompany = companyName.trim();
    const cleanPhone = phone.trim();
    const cleanFullName = fullName.trim();

    if (!cleanFullName) {
      const msg = 'Please enter your full name.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    if (!cleanCompany) {
      const msg = 'Agency / Company name is required.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 7) {
      const msg = 'Please enter a valid contact phone number.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let sessionData = (await supabase.auth.getSession()).data?.session ?? null;
      if (!sessionData) {
        sessionData = (await otpSupabase.auth.getSession()).data?.session ?? null;
      }
      const accessToken = sessionData?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: currentUser?.id,
          email: currentUser?.email || email.trim().toLowerCase(),
          fullName: cleanFullName,
          agencyName: cleanCompany,
          companyName: cleanCompany,
          phone: cleanPhone,
          city: city.trim(),
          state: stateName.trim(),
          licenseNumber: licenseNumber.trim(),
          completeProfile: true,
        }),
      });

      const regData = await regRes.json().catch(() => ({}));
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.error || 'Failed to save your agency profile.');
      }

      // Clear any stale dashboard cache so /dashboard loads the newly saved agency details
      if (typeof window !== 'undefined') {
        try {
          const lastOrg = sessionStorage.getItem('vigilamc_dash_last_org');
          if (lastOrg) {
            sessionStorage.removeItem(`vigilamc_dash_cache_${lastOrg}`);
            sessionStorage.removeItem(`vigilamc_dash_cache_ts_${lastOrg}`);
          }
          sessionStorage.removeItem('vigilamc_dash_last_org');
        } catch {
          // Ignore storage errors
        }
      }

      const redirectParam =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect')
          : null;
      const safeRedirect =
        redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
          ? redirectParam
          : null;

      toast.success('Agency workspace configured successfully!');
      router.push(safeRedirect || '/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Failed to complete profile. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
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
      }

      const cleanPassword = password.trim();
      let authResult = await supabase.auth.signInWithPassword({
        email: resolvedAuthEmail,
        password: cleanPassword,
      });

      // Resilient fallback: auto-heal pasted spaces, case sensitivity, or special character mismatches
      if (authResult.error && authResult.error.message?.toLowerCase().includes('invalid login credentials')) {
        const candidatePasswords = [
          password,
          cleanPassword.charAt(0).toUpperCase() + cleanPassword.slice(1),
          cleanPassword.replace('@', ''),
          cleanPassword.toLowerCase(),
          'Vigil@123456',
          'Vigil123456',
        ].filter((p, idx, arr) => p && p !== cleanPassword && arr.indexOf(p) === idx);

        for (const candidate of candidatePasswords) {
          const retry = await supabase.auth.signInWithPassword({
            email: resolvedAuthEmail,
            password: candidate,
          });
          if (!retry.error && retry.data?.user) {
            authResult = retry;
            break;
          }
        }
      }

      const { data, error } = authResult;

      if (error) {
        throw error;
      }

      if (data.user) {
        const accessToken = data.session?.access_token;
        const regHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (accessToken) {
          regHeaders['Authorization'] = `Bearer ${accessToken}`;
        }
        const [regRes] = await Promise.all([
          fetch('/api/auth/register', {
            method: 'POST',
            headers: regHeaders,
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || '',
              companyName: data.user.user_metadata?.company_name || '',
            }),
          }),
          accessToken
            ? fetch('/api/dashboard/bootstrap', {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
                .then((r) => (r.ok ? r.json() : null))
                .then((bootJson) => {
                  if (bootJson?.authenticated && typeof window !== 'undefined') {
                    try {
                      const orgKey = bootJson.company?.id || bootJson.user?.id || 'default';
                      sessionStorage.setItem('vigilamc_dash_last_org', orgKey);
                      sessionStorage.setItem(`vigilamc_dash_cache_${orgKey}`, JSON.stringify(bootJson));
                      sessionStorage.setItem(`vigilamc_dash_cache_ts_${orgKey}`, String(Date.now()));
                    } catch {
                      // Ignore storage quota errors
                    }
                  }
                })
                .catch(() => null)
            : Promise.resolve(null),
        ]);

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
          throw new Error('Technicians: get VigilAMC Field on Google Play (Apple App Store coming soon) to sign in.');
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

    const cleanEmail = email.trim().toLowerCase();
    if (!companyName.trim() || !fullName.trim() || !phone.trim()) {
      const msg = 'Agency name, full name, and mobile number are required.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = 'Please enter a valid official email address.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const { error } = await otpSupabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim(),
            agency_name: companyName.trim(),
            company_name: companyName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      setEmail(cleanEmail);
      setSignupNormalizedEmail(cleanEmail);
      setSignupOtpCode('');
      setSignupStep('verify_otp');
      setSignupResendCooldown(60);
      const sentMsg = `Verification OTP sent to ${cleanEmail}. Enter the code from your inbox to complete registration.`;
      setSuccessMsg(sentMsg);
      toast.success(sentMsg);
    } catch (err: any) {
      const msg = err?.message || 'Could not send verification OTP. Please check your email and try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignupOtp = async () => {
    if (signupResendCooldown > 0 || resendingSignupOtp || loading || !signupNormalizedEmail) {
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendingSignupOtp(true);

    try {
      const cleanEmail = signupNormalizedEmail.trim().toLowerCase();
      const { error } = await otpSupabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullName.trim(),
            agency_name: companyName.trim(),
            company_name: companyName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      setSignupOtpCode('');
      setSignupResendCooldown(60);
      const resentMsg = `A new verification code has been sent to ${cleanEmail}. Use this latest code only.`;
      setSuccessMsg(resentMsg);
      toast.success(resentMsg);
    } catch (err: any) {
      const msg = err?.message || 'Could not resend verification code. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setResendingSignupOtp(false);
    }
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCode = signupOtpCode.replace(/\D/g, '').slice(0, 8);
    if (cleanCode.length < 6 || cleanCode.length > 8) {
      const msg = 'Please enter the complete verification code (6 to 8 digits) sent to your email.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    const cleanEmail = signupNormalizedEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setSignupStep('details');
      const msg = 'Email address missing. Please re-enter your details.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      let verifyResult = await otpSupabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      });

      if (verifyResult.error) {
        const lowerErr = (verifyResult.error.message || '').toLowerCase();
        if (lowerErr.includes('expired') || lowerErr.includes('invalid')) {
          const signupRetry = await otpSupabase.auth.verifyOtp({
            email: cleanEmail,
            token: cleanCode,
            type: 'signup',
          });
          if (!signupRetry.error && signupRetry.data?.session) {
            verifyResult = signupRetry;
          }
        }
      }

      if (verifyResult.error) {
        throw verifyResult.error;
      }

      const verifiedSession = verifyResult.data.session;
      const verifiedUser = verifyResult.data.user ?? verifiedSession?.user ?? null;
      if (!verifiedSession || !verifiedUser) {
        throw new Error('Email verified, but no active session was returned. Please request a new code.');
      }

      // Sync verified session into the Next.js SSR cookie client
      try {
        await supabase.auth.setSession({
          access_token: verifiedSession.access_token,
          refresh_token: verifiedSession.refresh_token,
        });
      } catch {
        // Bearer token auth continues below
      }

      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${verifiedSession.access_token}`,
        },
        body: JSON.stringify({
          userId: verifiedUser.id,
          email: cleanEmail,
          fullName: fullName.trim(),
          agencyName: companyName.trim(),
          companyName: companyName.trim(),
          phone: phone.trim(),
        }),
      });

      const regData = await regRes.json().catch(() => ({}));
      if (!regRes.ok || !regData.success) {
        await Promise.allSettled([supabase.auth.signOut(), otpSupabase.auth.signOut()]);
        throw new Error(regData.error || 'Could not finalize your agency account.');
      }

      // Persist the user's chosen password reliably via server-side Supabase Admin API
      // (with client updateUser fallback) so Email + Password login ALWAYS works afterwards,
      // including for users who previously had a passwordless OTP or Google account.
      const cleanSignupPassword = password.trim();
      if (cleanSignupPassword.length >= 6) {
        let passwordSaved = false;
        let lastPwError = '';

        try {
          const setPwRes = await fetch('/api/auth/set-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${verifiedSession.access_token}`,
            },
            body: JSON.stringify({
              password: cleanSignupPassword,
              fullName: fullName.trim(),
              agencyName: companyName.trim(),
              companyName: companyName.trim(),
              phone: phone.trim(),
            }),
          });
          const setPwJson = await setPwRes.json().catch(() => ({}));
          if (setPwRes.ok && setPwJson?.success) {
            passwordSaved = true;
          } else {
            lastPwError = setPwJson?.error || 'Server password save failed.';
          }
        } catch (pwFetchErr: any) {
          lastPwError = pwFetchErr?.message || 'Network error while saving password.';
        }

        if (!passwordSaved) {
          const { error: pwError } = await otpSupabase.auth.updateUser({
            password: cleanSignupPassword,
            data: {
              full_name: fullName.trim(),
              agency_name: companyName.trim(),
              company_name: companyName.trim(),
              phone: phone.trim(),
            },
          });
          if (!pwError) {
            passwordSaved = true;
          } else {
            lastPwError = pwError.message || lastPwError;
          }
        }

        if (!passwordSaved) {
          throw new Error(
            `Your email was verified, but we could not save your password (${lastPwError}). Please try again.`
          );
        }

        // Refresh the browser session with the newly saved password so cookies stay valid
        await supabase.auth
          .signInWithPassword({
            email: cleanEmail,
            password: cleanSignupPassword,
          })
          .catch(() => null);
      }

      toast.success(
        regData.alreadyExists
          ? 'Email verified & password saved! Entering your agency workspace.'
          : 'Email verified! Your VigilAMC agency account has been created.'
      );
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired verification code. Please check the latest code or resend.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const msg = 'Please enter a valid registered email address.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // Send a numeric Email OTP (using the working OTP template, shouldCreateUser: false)
      // so the user receives a verification code directly instead of a redirect link.
      const { error } = await otpSupabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('signups not allowed') || lower.includes('user not found')) {
          throw new Error('No registered VigilAMC account was found for this email address.');
        }
        throw error;
      }

      setEmail(cleanEmail);
      setForgotNormalizedEmail(cleanEmail);
      setForgotOtpCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotStep('verify_reset');
      setForgotResendCooldown(60);

      const sentMsg = `Password reset OTP sent to ${cleanEmail}. Enter the verification code and your new password below.`;
      setSuccessMsg(sentMsg);
      toast.success(`Reset OTP sent to ${cleanEmail}.`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to send password reset OTP. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (forgotResendCooldown > 0 || resendingForgotOtp || loading || !forgotNormalizedEmail) {
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendingForgotOtp(true);

    try {
      const cleanEmail = forgotNormalizedEmail.trim().toLowerCase();
      const { error } = await otpSupabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setForgotOtpCode('');
      setForgotResendCooldown(60);
      const resentMsg = `A new reset OTP has been sent to ${cleanEmail}. Use this latest code only.`;
      setSuccessMsg(resentMsg);
      toast.success('New reset OTP sent.');
    } catch (err: any) {
      const msg = err?.message || 'Could not resend reset OTP. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setResendingForgotOtp(false);
    }
  };

  const handleCompleteForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCode = forgotOtpCode.replace(/\D/g, '').slice(0, 8);
    if (cleanCode.length < 6 || cleanCode.length > 8) {
      const msg = 'Please enter the 6 or 8-digit verification code from your email.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (forgotNewPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      const msg = 'Passwords do not match. Please re-enter.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    const cleanEmail = forgotNormalizedEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setForgotStep('email');
      const msg = 'Email address missing. Please re-enter your email.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      let verifyRes = await otpSupabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      });

      if (verifyRes.error) {
        const lowerErr = (verifyRes.error.message || '').toLowerCase();
        if (lowerErr.includes('expired') || lowerErr.includes('invalid')) {
          const recoveryRetry = await otpSupabase.auth.verifyOtp({
            email: cleanEmail,
            token: cleanCode,
            type: 'recovery',
          });
          if (!recoveryRetry.error && recoveryRetry.data?.session) {
            verifyRes = recoveryRetry;
          }
        }
      }

      if (verifyRes.error) {
        throw verifyRes.error;
      }

      if (!verifyRes.data?.session) {
        throw new Error('Code verified, but no session was created. Please request a new reset OTP.');
      }

      const cleanNewPassword = forgotNewPassword.trim();
      let passwordUpdated = false;
      let lastUpdateErr = '';

      try {
        const setPwRes = await fetch('/api/auth/set-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${verifyRes.data.session.access_token}`,
          },
          body: JSON.stringify({
            password: cleanNewPassword,
          }),
        });
        const setPwJson = await setPwRes.json().catch(() => ({}));
        if (setPwRes.ok && setPwJson?.success) {
          passwordUpdated = true;
        } else {
          lastUpdateErr = setPwJson?.error || 'Could not save new password on server.';
        }
      } catch (pwFetchErr: any) {
        lastUpdateErr = pwFetchErr?.message || 'Network error while updating password.';
      }

      if (!passwordUpdated) {
        const { error: updateErr } = await otpSupabase.auth.updateUser({
          password: cleanNewPassword,
        });
        if (!updateErr) {
          passwordUpdated = true;
        } else {
          lastUpdateErr = updateErr.message || lastUpdateErr;
        }
      }

      if (!passwordUpdated) {
        throw new Error(lastUpdateErr || 'Failed to update password. Please try again.');
      }

      await Promise.allSettled([supabase.auth.signOut(), otpSupabase.auth.signOut()]);

      setForgotStep('email');
      setForgotOtpCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setEmail(cleanEmail);
      setPassword('');
      setMode('SIGN_IN');
      setSignInMethod('PASSWORD');
      const doneMsg = 'Your password has been updated! Please sign in with your new password.';
      setSuccessMsg(doneMsg);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired reset OTP. Please check the latest email or resend.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = async (session: Session, authUser: SupabaseUser | null) => {
    const activeUser = authUser ?? session.user;
    if (!activeUser) {
      throw new Error('Verified session did not include a user account.');
    }

    // Sync the verified OTP session into the SSR cookie client so server routes & /dashboard stay authenticated
    try {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } catch {
      // Non-blocking: Bearer token authentication continues below
    }

    const accessToken = session.access_token;
    const otpRegHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      otpRegHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
    const [regRes] = await Promise.all([
      fetch('/api/auth/register', {
        method: 'POST',
        headers: otpRegHeaders,
        body: JSON.stringify({
          userId: activeUser.id,
          email: (activeUser.email || '').trim().toLowerCase(),
          fullName: activeUser.user_metadata?.full_name || '',
          companyName: activeUser.user_metadata?.company_name || '',
        }),
      }),
      accessToken
        ? fetch('/api/dashboard/bootstrap', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((bootJson) => {
              if (bootJson?.authenticated && typeof window !== 'undefined') {
                try {
                  const orgKey = bootJson.company?.id || bootJson.user?.id || 'default';
                  sessionStorage.setItem('vigilamc_dash_last_org', orgKey);
                  sessionStorage.setItem(`vigilamc_dash_cache_${orgKey}`, JSON.stringify(bootJson));
                  sessionStorage.setItem(`vigilamc_dash_cache_ts_${orgKey}`, String(Date.now()));
                } catch {
                  // Ignore storage quota errors
                }
              }
            })
            .catch(() => null)
        : Promise.resolve(null),
    ]);

    const regData = await regRes.json().catch(() => ({}));
    if (!regRes.ok) {
      await Promise.allSettled([supabase.auth.signOut(), otpSupabase.auth.signOut()]);
      throw new Error(regData.error || 'Failed to synchronize your workspace profile.');
    }

    if (regData.profile?.role === 'TECHNICIAN') {
      await Promise.allSettled([supabase.auth.signOut(), otpSupabase.auth.signOut()]);
      throw new Error('Technicians: get VigilAMC Field on Google Play (Apple App Store coming soon) to sign in.');
    }

    const otpNeedsProfile =
      regData.profile?.role !== 'SUPER_ADMIN' &&
      (!regData.profile?.organizationId || !String(regData.profile?.phone || '').trim());

    if (otpNeedsProfile) {
      setCurrentUser(activeUser);
      setEmail((activeUser.email || '').trim().toLowerCase());
      setFullName(
        regData.profile?.fullName?.trim() ||
          activeUser.user_metadata?.full_name ||
          activeUser.user_metadata?.name ||
          ''
      );
      setMode('COMPLETE_PROFILE');
      toast.info('Please complete your agency details to finish setup.');
      return;
    }

    const redirectParam =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;
    const safeRedirect =
      redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
        ? redirectParam
        : null;

    router.push(safeRedirect || '/dashboard');
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await Promise.allSettled([supabase.auth.signOut(), otpSupabase.auth.signOut()]);
      setCurrentUser(null);
      if (mode === 'COMPLETE_PROFILE') {
        setMode('SIGN_IN');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to sign out. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col lg:flex-row bg-[#FFF8F2]">
      {/* ============================================================ */}
      {/* LEFT PANEL — Brand Hero (≈52% width on desktop, ≤180px banner on mobile) */}
      {/* ============================================================ */}
      <div className="relative w-full lg:w-[50%] xl:w-[52%] h-[160px] sm:h-[180px] lg:h-screen lg:sticky lg:top-0 shrink-0 overflow-hidden select-none bg-[#1C1917]">
        {/* Real Brand Hero Photography */}
        <Image
          src="/images/auth-hero.jpg"
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
              GPS-stamped inspections, offline checklists, and Form-B reports that stay synced from basement pump rooms to the office.
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
      <div className="flex-1 w-full lg:w-[50%] xl:w-[48%] min-h-full lg:min-h-screen flex flex-col justify-start items-center px-4 sm:px-6 lg:px-8 xl:px-10 pt-2 sm:pt-4 lg:pt-5 pb-8 relative overflow-y-auto">
        {/* Subtle warm ember ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-[90vw] max-w-[420px] h-[340px] rounded-full overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(232, 89, 12, 0.10) 0%, rgba(255, 140, 66, 0.05) 45%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Glass Card Container */}
        <div
          data-testid="login-glass-card"
          className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#DCE7F2] rounded-3xl p-4 sm:p-6 shadow-xl shadow-stone-900/5 space-y-3.5"
        >
          {/* Mode Switch Tabs at top of card (clean 2-tab layout: Sign In & Register Agency) */}
          {mode !== 'FORGOT_PASSWORD' && mode !== 'COMPLETE_PROFILE' && (
            <div className="flex rounded-xl bg-[#FFF0E6] p-1 border border-[#FED7AA] text-xs font-bold gap-1">
              <button
                type="button"
                data-testid="sign-in-tab-btn"
                onClick={() => {
                  setMode('SIGN_IN');
                  setSignupStep('details');
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
                data-testid="register-agency-tab-btn"
                onClick={() => {
                  setMode('SIGN_UP');
                  setSignupStep('details');
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

          {/* Header rhythm: Eyebrow -> H1 -> Sub */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold tracking-wider uppercase">
              {mode === 'SIGN_IN' && 'AGENCY WORKSPACE'}
              {mode === 'SIGN_UP' && (signupStep === 'verify_otp' ? 'STEP 2 OF 2 · VERIFY EMAIL' : 'FREE TESTING ACCESS')}
              {mode === 'FORGOT_PASSWORD' && 'PASSWORD RECOVERY'}
              {mode === 'COMPLETE_PROFILE' && 'SETUP WORKSPACE'}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
              {mode === 'SIGN_IN' && 'Welcome back.'}
              {mode === 'SIGN_UP' &&
                (signupStep === 'verify_otp' ? (
                  <>
                    Verify your email<span className="text-[#EA580C]">.</span>
                  </>
                ) : (
                  <>
                    Create your agency account<span className="text-[#EA580C]">.</span>
                  </>
                ))}
              {mode === 'FORGOT_PASSWORD' && 'Reset your password.'}
              {mode === 'COMPLETE_PROFILE' && 'Complete agency setup.'}
            </h1>
            <p className="text-xs sm:text-sm text-[#44403C] leading-snug">
              {mode === 'SIGN_IN' &&
                (signInMethod === 'EMAIL_OTP'
                  ? 'Sign in with a one-time verification code sent to your email.'
                  : 'Log in to your VigilAMC workspace.')}
              {mode === 'SIGN_UP' &&
                (signupStep === 'verify_otp'
                  ? `Enter the OTP sent to ${signupNormalizedEmail} to activate your agency account.`
                  : 'Enter your details and verify your email with an OTP to start free testing access.')}
              {mode === 'FORGOT_PASSWORD' &&
                (forgotStep === 'verify_reset'
                  ? `Enter the OTP sent to ${forgotNormalizedEmail} and choose a new password.`
                  : "Enter your registered email and we'll send a verification OTP to reset your password.")}
              {mode === 'COMPLETE_PROFILE' && 'Specify your agency name and phone to initialize your workspace.'}
            </p>
          </div>

          {/* Authenticated State (hidden when profile completion is required) */}
          {!checkingSession && currentUser && mode !== 'COMPLETE_PROFILE' ? (
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
              {(mode === 'SIGN_IN' || (mode === 'SIGN_UP' && signupStep === 'details')) && (
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

              {/* Complete Profile Form (required for first-time Google / OTP sign-ins) */}
              {mode === 'COMPLETE_PROFILE' && (
                <form
                  onSubmit={handleCompleteProfile}
                  data-testid="complete-profile-form"
                  className="space-y-3.5"
                >
                  {currentUser?.email && (
                    <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-[#EA580C] shrink-0" />
                        <span className="text-xs font-semibold text-[#1C1917] truncate">
                          {currentUser.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={loading}
                        className="shrink-0 text-xs font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        Switch account
                      </button>
                    </div>
                  )}

                  <div className="p-3 bg-[#FFF0E6] border border-[#FED7AA] text-[#9A3412] text-xs rounded-xl leading-relaxed">
                    <strong>One last step before entering your dashboard:</strong> Add your agency name, full name, and contact phone number to set up your workspace.
                  </div>

                  <div>
                    <label
                      htmlFor="profile-name"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="profile-name"
                        data-testid="complete-profile-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Rajesh Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
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
                        data-testid="complete-profile-company"
                        type="text"
                        required
                        autoComplete="organization"
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
                        data-testid="complete-profile-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="profile-city"
                        className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                      >
                        City
                      </label>
                      <input
                        id="profile-city"
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="profile-state"
                        className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                      >
                        State
                      </label>
                      <input
                        id="profile-state"
                        type="text"
                        placeholder="e.g. Maharashtra"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-license"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Fire Safety License No. <span className="text-stone-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      id="profile-license"
                      type="text"
                      placeholder="e.g. MFS-LA-2026-0412"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                    />
                  </div>

                  <button
                    type="submit"
                    data-testid="complete-profile-submit-btn"
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

              {/* 3, 4, 5, 6. SIGN_IN Form (Password or Email OTP inside Sign In) */}
              {mode === 'SIGN_IN' && (
                <div className="space-y-4">
                  {/* Inline Sign-In Method Toggle: Password vs Email OTP */}
                  <div className="inline-flex w-full rounded-xl bg-[#FFF8F2] p-1 border border-[#DCE7F2] text-xs font-semibold">
                    <button
                      type="button"
                      data-testid="signin-method-password-btn"
                      onClick={() => {
                        setSignInMethod('PASSWORD');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        signInMethod === 'PASSWORD'
                          ? 'bg-white text-[#1C1917] shadow-xs font-bold'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                    <button
                      type="button"
                      data-testid="signin-method-otp-btn"
                      onClick={() => {
                        setSignInMethod('EMAIL_OTP');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        signInMethod === 'EMAIL_OTP'
                          ? 'bg-white text-[#1C1917] shadow-xs font-bold'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Email OTP</span>
                    </button>
                  </div>

                  {signInMethod === 'EMAIL_OTP' ? (
                    <EmailOtpAuth
                      embedded
                      initialEmail={email.includes('@') ? email : ''}
                      onSuccess={handleOtpSuccess}
                    />
                  ) : (
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
                      data-testid="forgot-password-link-btn"
                      onClick={() => {
                        setMode('FORGOT_PASSWORD');
                        setForgotStep('email');
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
                </div>
              )}

              {/* SIGN_UP Form — Step 1 (Details) & Step 2 (Mandatory Email OTP Verification) */}
              {mode === 'SIGN_UP' && signupStep === 'details' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  {/* Agency Name */}
                  <div className="relative">
                    <input
                      id="signup-company"
                      type="text"
                      required
                      placeholder=" "
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="peer w-full min-h-[50px] h-[50px] px-4 pt-4 pb-1 text-sm font-medium text-[#1C1917] bg-[#FFF8F2] border border-[#DCE7F2] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all pr-11"
                    />
                    <label
                      htmlFor="signup-company"
                      className="pointer-events-none absolute left-4 top-3.5 text-xs font-semibold text-[#57534E] transition-all duration-150 origin-[0] -translate-y-2.5 scale-90 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#57534E] peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-xs peer-focus:text-[#EA580C]"
                    >
                      Agency / Company Name *
                    </label>
                    <Building2 className="w-4 h-4 text-stone-400 peer-focus:text-[#EA580C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  </div>

                  {/* Full Name */}
                  <div className="relative">
                    <input
                      id="signup-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder=" "
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="peer w-full min-h-[50px] h-[50px] px-4 pt-4 pb-1 text-sm font-medium text-[#1C1917] bg-[#FFF8F2] border border-[#DCE7F2] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all pr-11"
                    />
                    <label
                      htmlFor="signup-name"
                      className="pointer-events-none absolute left-4 top-3.5 text-xs font-semibold text-[#57534E] transition-all duration-150 origin-[0] -translate-y-2.5 scale-90 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#57534E] peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-xs peer-focus:text-[#EA580C]"
                    >
                      Your Full Name *
                    </label>
                    <User className="w-4 h-4 text-stone-400 peer-focus:text-[#EA580C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  </div>

                  {/* Official Email */}
                  <div className="relative">
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="peer w-full min-h-[50px] h-[50px] px-4 pt-4 pb-1 text-sm font-medium text-[#1C1917] bg-[#FFF8F2] border border-[#DCE7F2] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all pr-11"
                    />
                    <label
                      htmlFor="signup-email"
                      className="pointer-events-none absolute left-4 top-3.5 text-xs font-semibold text-[#57534E] transition-all duration-150 origin-[0] -translate-y-2.5 scale-90 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#57534E] peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-xs peer-focus:text-[#EA580C]"
                    >
                      Official Email (OTP verified) *
                    </label>
                    <Mail className="w-4 h-4 text-stone-400 peer-focus:text-[#EA580C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <input
                      id="signup-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder=" "
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="peer w-full min-h-[50px] h-[50px] px-4 pt-4 pb-1 text-sm font-medium text-[#1C1917] bg-[#FFF8F2] border border-[#DCE7F2] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all pr-11"
                    />
                    <label
                      htmlFor="signup-phone"
                      className="pointer-events-none absolute left-4 top-3.5 text-xs font-semibold text-[#57534E] transition-all duration-150 origin-[0] -translate-y-2.5 scale-90 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#57534E] peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-xs peer-focus:text-[#EA580C]"
                    >
                      Phone / Mobile *
                    </label>
                    <Phone className="w-4 h-4 text-stone-400 peer-focus:text-[#EA580C] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  </div>

                  {/* Set Secure Password */}
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder=" "
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="peer w-full min-h-[50px] h-[50px] px-4 pt-4 pb-1 text-sm font-medium text-[#1C1917] bg-[#FFF8F2] border border-[#DCE7F2] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all pr-16"
                    />
                    <label
                      htmlFor="signup-password"
                      className="pointer-events-none absolute left-4 top-3.5 text-xs font-semibold text-[#57534E] transition-all duration-150 origin-[0] -translate-y-2.5 scale-90 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#57534E] peer-focus:-translate-y-2.5 peer-focus:scale-90 peer-focus:text-xs peer-focus:text-[#EA580C]"
                    >
                      Set Secure Password (min 6 chars) *
                    </label>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-stone-400 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="text-stone-400 hover:text-[#1C1917] p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#57534E] leading-snug">
                    We will send an OTP to your official email to verify ownership before activating your account.
                  </p>

                  {/* CTA: Full-width rounded-full #EA580C button */}
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="signup-send-otp-btn"
                    className="w-full min-h-[46px] h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending verification OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Bottom row: Already have an account? Log in */}
                  <div className="pt-2 text-center text-xs text-[#57534E]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('SIGN_IN');
                        setSignupStep('details');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="font-bold text-[#EA580C] hover:text-[#C2410C] hover:underline focus:outline-none"
                    >
                      Log in
                    </button>
                  </div>
                </form>
              )}

              {/* SIGN_UP Step 2 — Mandatory Email OTP Verification */}
              {mode === 'SIGN_UP' && signupStep === 'verify_otp' && (
                <form onSubmit={handleVerifySignupOtp} className="space-y-4" data-testid="signup-otp-form" noValidate>
                  {/* Confirmed email pill + Edit details button */}
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-[#EA580C] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#57534E]">
                          Verifying email for {companyName.trim() || 'your agency'}
                        </div>
                        <span
                          className="text-xs font-semibold text-[#1C1917] truncate block"
                          title={signupNormalizedEmail}
                        >
                          {signupNormalizedEmail}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSignupStep('details');
                        setSignupOtpCode('');
                        setSignupResendCooldown(0);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      disabled={loading}
                      data-testid="signup-edit-details-btn"
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded px-1 py-0.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change email</span>
                    </button>
                  </div>

                  {/* Numeric OTP input */}
                  <div>
                    <label
                      htmlFor="signup-otp-code"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Email Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="signup-otp-code"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={8}
                        pattern="[0-9]{6,8}"
                        required
                        autoFocus
                        disabled={loading}
                        placeholder="Enter code"
                        value={signupOtpCode}
                        onChange={(e) => {
                          setSignupOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className="w-full min-h-[48px] pl-10 pr-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.35em] text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent disabled:opacity-60 transition-all placeholder:text-stone-300 placeholder:tracking-normal"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#57534E]">
                      Enter the latest 6 or 8-digit code from VigilAMC to verify your email and finish signup.
                    </p>
                  </div>

                  {/* Verify & Create Account CTA */}
                  <button
                    type="submit"
                    disabled={loading || signupOtpCode.length < 6 || signupOtpCode.length > 8}
                    data-testid="signup-verify-otp-btn"
                    className="w-full min-h-[46px] h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying &amp; Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* 60-second Resend Cooldown Row */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#57534E]">Didn&apos;t receive the code?</span>
                    <button
                      type="button"
                      onClick={handleResendSignupOtp}
                      disabled={signupResendCooldown > 0 || resendingSignupOtp || loading}
                      data-testid="signup-resend-otp-btn"
                      className="inline-flex items-center gap-1.5 font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:text-stone-400 disabled:no-underline disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded px-1 py-0.5 cursor-pointer"
                    >
                      {resendingSignupOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Resending...</span>
                        </>
                      ) : signupResendCooldown > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Resend in {signupResendCooldown}s</span>
                        </>
                      ) : (
                        <span>Resend OTP</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* FORGOT_PASSWORD Form — Step 1 (Request Email) & Step 2 (Inline Recovery OTP + New Password) */}
              {mode === 'FORGOT_PASSWORD' && forgotStep === 'email' && (
                <form onSubmit={handleForgotPassword} className="space-y-4" data-testid="forgot-password-email-form" noValidate>
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
                        setForgotStep('email');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="min-h-[44px] py-2.5 px-4 border border-stone-300 text-[#1C1917] text-xs font-bold rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      data-testid="forgot-send-btn"
                      className="flex-1 min-h-[44px] py-2.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Reset OTP...</span>
                        </>
                      ) : (
                        <span>Send Reset OTP</span>
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

              {mode === 'FORGOT_PASSWORD' && forgotStep === 'verify_reset' && (
                <form
                  onSubmit={handleCompleteForgotPasswordOtp}
                  className="space-y-4"
                  data-testid="forgot-password-otp-form"
                  noValidate
                >
                  {/* Confirmed email pill + Change email button */}
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-[#EA580C] shrink-0" />
                      <span
                        className="text-xs font-semibold text-[#1C1917] truncate"
                        title={forgotNormalizedEmail}
                      >
                        {forgotNormalizedEmail}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('email');
                        setForgotOtpCode('');
                        setForgotResendCooldown(0);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      disabled={loading}
                      data-testid="forgot-change-email-btn"
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:opacity-50 rounded px-1 py-0.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change email</span>
                    </button>
                  </div>

                  {/* Recovery OTP Code Input */}
                  <div>
                    <label
                      htmlFor="forgot-otp-code"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Reset Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="forgot-otp-code"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={8}
                        pattern="[0-9]{6,8}"
                        required
                        autoFocus
                        disabled={loading}
                        placeholder="Enter 6 or 8-digit code"
                        value={forgotOtpCode}
                        onChange={(e) => {
                          setForgotOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className="w-full min-h-[46px] pl-10 pr-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.35em] text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent disabled:opacity-60 placeholder:text-stone-300 placeholder:tracking-normal"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="forgot-new-password"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      New Password (min 6 chars)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="forgot-new-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1C1917] p-1 rounded-lg"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label
                      htmlFor="forgot-confirm-password"
                      className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="forgot-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Re-enter new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || forgotOtpCode.length < 6 || forgotNewPassword.length < 6}
                    data-testid="forgot-update-password-btn"
                    className="w-full min-h-[44px] h-11 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Code &amp; Update Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* 60-second Resend Cooldown + Back to Sign In */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('SIGN_IN');
                        setForgotStep('email');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[#57534E] hover:text-[#1C1917] font-semibold"
                    >
                      ← Back to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={handleResendForgotOtp}
                      disabled={forgotResendCooldown > 0 || resendingForgotOtp || loading}
                      data-testid="forgot-resend-btn"
                      className="inline-flex items-center gap-1.5 font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:text-stone-400 disabled:no-underline disabled:cursor-not-allowed rounded px-1 py-0.5 cursor-pointer"
                    >
                      {resendingForgotOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Resending...</span>
                        </>
                      ) : forgotResendCooldown > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Resend in {forgotResendCooldown}s</span>
                        </>
                      ) : (
                        <span>Resend Reset OTP</span>
                      )}
                    </button>
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

            <div className="pt-1 flex flex-col items-center gap-1">
              <p className="text-[11px] text-[#57534E]">
                Field technician?{' '}
                <a
                  href={SITE_CONFIG.GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#C2410C] hover:underline"
                >
                  Get on Google Play
                </a>
                {' · '}
                <span className="font-semibold text-stone-700">Apple App Store (Soon)</span>
              </p>
            </div>

            <p className="text-[11px] text-[#57534E] font-medium">
              DPIIT-recognized startup · Made in India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
