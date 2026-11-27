'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type EmailOtpStep = 'email' | 'otp';

export interface EmailOtpAuthProps {
  /** Invoked when OTP verification creates a Supabase session */
  onSuccess?: (session: Session, user: User | null) => void | Promise<void>;
  /** Optional prefilled email address */
  initialEmail?: string;
  /** Render without outer card chrome when embedded inside another card */
  embedded?: boolean;
  /** Optional container className */
  className?: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function EmailOtpAuth({
  onSuccess,
  initialEmail = '',
  embedded = false,
  className = '',
}: EmailOtpAuthProps) {
  const [step, setStep] = useState<EmailOtpStep>('email');
  const [emailInput, setEmailInput] = useState<string>(initialEmail);
  const [normalizedEmail, setNormalizedEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // 60-second resend cooldown countdown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  // Move focus cleanly when switching steps
  useEffect(() => {
    if (step === 'otp') {
      otpInputRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanEmail = normalizeEmail(emailInput);
    if (!cleanEmail || !EMAIL_PATTERN.test(cleanEmail)) {
      const msg = 'Please enter a valid work email address.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isSupabaseConfigured) {
      const msg =
        'Authentication service is not configured. Please contact support.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setEmailInput(cleanEmail);
      setNormalizedEmail(cleanEmail);
      setToken('');
      setStep('otp');
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      const sentMsg = `A 6-digit verification code has been sent to ${cleanEmail}.`;
      setStatusMessage(sentMsg);
      toast.success(sentMsg);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Could not send Email OTP. Please check your email and try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || sendingOtp || verifyingOtp || !normalizedEmail) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setSendingOtp(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setToken('');
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      const resentMsg = `A new 6-digit code has been sent to ${normalizedEmail}.`;
      setStatusMessage(resentMsg);
      toast.success(resentMsg);
      otpInputRef.current?.focus();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to resend Email OTP. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanToken = token.replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (cleanToken.length !== OTP_LENGTH) {
      const msg = 'Please enter the complete 6-digit verification code.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!normalizedEmail) {
      const msg = 'Email address is missing. Please go back and enter your email.';
      setErrorMessage(msg);
      toast.error(msg);
      setStep('email');
      return;
    }

    setVerifyingOtp(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error(
          'Verification completed, but no active session was returned. Please request a new code and try again.'
        );
      }

      setStatusMessage('Email verified! Signing you in...');
      toast.success('Email verified successfully.');

      if (onSuccess) {
        await onSuccess(data.session, data.user ?? data.session.user ?? null);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Invalid or expired OTP code. Please check the code or request a new one.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setToken('');
    setCooldownSeconds(0);
    setErrorMessage(null);
    setStatusMessage(null);
    if (normalizedEmail) {
      setEmailInput(normalizedEmail);
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setToken(digitsOnly);
    if (errorMessage) setErrorMessage(null);
  };

  const isBusy = sendingOtp || verifyingOtp;

  const content = (
    <div className="space-y-4">
      {!embedded && (
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold tracking-wider uppercase">
            EMAIL OTP ACCESS
          </div>
          <h2 className="text-xl font-extrabold text-[#1C1917] tracking-tight">
            {step === 'email' ? 'Sign in or create account' : 'Enter verification code'}
          </h2>
          <p className="text-xs sm:text-sm text-[#44403C] leading-snug">
            {step === 'email'
              ? 'We will send a one-time 6-digit verification code to your email.'
              : `Enter the 6-digit code sent to ${normalizedEmail}.`}
          </p>
        </div>
      )}

      {/* Accessible error and status banners */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          data-testid="email-otp-error"
          className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs rounded-xl flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          data-testid="email-otp-status"
          className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs rounded-xl flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
          <span className="leading-snug">{statusMessage}</span>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email-otp-address"
              className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
            >
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={emailInputRef}
                id="email-otp-address"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                disabled={isBusy}
                placeholder="name@company.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent disabled:opacity-60 transition-all placeholder:text-stone-400"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#57534E]">
              Works for both existing accounts and new signups — no password needed.
            </p>
          </div>

          <button
            type="submit"
            disabled={isBusy || !emailInput.trim()}
            data-testid="send-email-otp-btn"
            className="w-full min-h-[44px] h-11 sm:h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
          >
            {sendingOtp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending Email OTP...</span>
              </>
            ) : (
              <>
                <span>Send Email OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
          {/* Confirmed email pill + Change email button */}
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-4 h-4 text-[#EA580C] shrink-0" />
              <span
                className="text-xs font-semibold text-[#1C1917] truncate"
                title={normalizedEmail}
              >
                {normalizedEmail}
              </span>
            </div>
            <button
              type="button"
              onClick={handleChangeEmail}
              disabled={isBusy}
              data-testid="change-email-btn"
              className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded px-1 py-0.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change email</span>
            </button>
          </div>

          {/* 6-digit OTP input */}
          <div>
            <label
              htmlFor="email-otp-code"
              className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5"
            >
              6-Digit Email Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={otpInputRef}
                id="email-otp-code"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                pattern="[0-9]{6}"
                required
                disabled={verifyingOtp}
                placeholder="000000"
                value={token}
                onChange={handleTokenChange}
                className="w-full min-h-[48px] pl-10 pr-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.45em] text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent disabled:opacity-60 transition-all placeholder:text-stone-300 placeholder:tracking-[0.45em]"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#57534E]">
              Check your inbox or spam folder for the 6-digit code from VigilAMC.
            </p>
          </div>

          {/* Verify OTP CTA */}
          <button
            type="submit"
            disabled={isBusy || token.length !== OTP_LENGTH}
            data-testid="verify-email-otp-btn"
            className="w-full min-h-[44px] h-11 sm:h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
          >
            {verifyingOtp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying OTP...</span>
              </>
            ) : (
              <>
                <span>Verify OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend cooldown row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[#57534E]">Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldownSeconds > 0 || isBusy}
              data-testid="resend-email-otp-btn"
              className="inline-flex items-center gap-1.5 font-bold text-[#C2410C] hover:text-[#9A3412] hover:underline disabled:text-stone-400 disabled:no-underline disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded px-1 py-0.5 cursor-pointer"
            >
              {sendingOtp ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resend in {cooldownSeconds}s</span>
                </>
              ) : (
                <span>Resend OTP</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  if (embedded) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={`w-full max-w-md bg-white/95 backdrop-blur-xl border border-[#DCE7F2] rounded-3xl p-5 sm:p-6 shadow-xl shadow-stone-900/5 ${className}`}
    >
      {content}
    </div>
  );
}

export default EmailOtpAuth;
