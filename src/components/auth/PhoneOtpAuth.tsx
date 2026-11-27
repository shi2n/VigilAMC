'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Clock,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CountryCodeOption {
  code: string;
  label: string;
  country: string;
  flag: string;
  placeholder: string;
}

const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+91', label: 'India (+91)', country: 'IN', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: '+971', label: 'UAE (+971)', country: 'AE', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: '+65', label: 'Singapore (+65)', country: 'SG', flag: '🇸🇬', placeholder: '9123 4567' },
  { code: '+966', label: 'Saudi Arabia (+966)', country: 'SA', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: '+974', label: 'Qatar (+974)', country: 'QA', flag: '🇶🇦', placeholder: '5512 3456' },
  { code: '+968', label: 'Oman (+968)', country: 'OM', flag: '🇴🇲', placeholder: '9123 4567' },
  { code: '+60', label: 'Malaysia (+60)', country: 'MY', flag: '🇲🇾', placeholder: '12 345 6789' },
  { code: '+44', label: 'UK (+44)', country: 'GB', flag: '🇬🇧', placeholder: '7700 900123' },
  { code: '+1', label: 'US / Canada (+1)', country: 'US', flag: '🇺🇸', placeholder: '555 234 5678' },
  { code: '+61', label: 'Australia (+61)', country: 'AU', flag: '🇦🇺', placeholder: '412 345 678' },
];

const RESEND_COOLDOWN_SECONDS = 60;
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export interface PhoneOtpAuthProps {
  /** Called once OTP verification succeeds and a Supabase session is created. */
  onSuccess?: (session: Session, user: User | null) => void | Promise<void>;
  /** Initial country dialing code (defaults to '+91' for India). */
  defaultCountryCode?: string;
  /** Render without outer card chrome when embedded inside another card. */
  embedded?: boolean;
  /** Optional container class overrides. */
  className?: string;
}

/**
 * Normalizes a country code and local phone number into strict E.164 format
 * (e.g., '+91' + '98765 43210' -> '+919876543210').
 */
export function formatPhoneToE164(countryCodeInput: string, localNumberInput: string): {
  e164: string;
  error: string | null;
} {
  const rawLocal = localNumberInput.trim();
  if (!rawLocal) {
    return { e164: '', error: 'Please enter your mobile number.' };
  }

  // If the user pasted a full international number starting with '+', honor it directly
  if (rawLocal.startsWith('+')) {
    const digitsOnly = rawLocal.replace(/\D/g, '');
    const candidate = `+${digitsOnly}`;
    if (!E164_REGEX.test(candidate)) {
      return {
        e164: '',
        error: 'Enter a valid international mobile number in E.164 format (e.g., +919876543210).',
      };
    }
    return { e164: candidate, error: null };
  }

  const ccDigits = countryCodeInput.replace(/\D/g, '');
  if (!ccDigits || ccDigits.length > 4 || ccDigits.startsWith('0')) {
    return {
      e164: '',
      error: 'Enter a valid country code (e.g., +91).',
    };
  }

  let nationalDigits = rawLocal.replace(/\D/g, '');

  // Strip trunk leading '0' (common in India, e.g., 09876543210 -> 9876543210)
  if (nationalDigits.startsWith('0') && nationalDigits.length > 7) {
    nationalDigits = nationalDigits.replace(/^0+/, '');
  }

  // If user pasted country code + local digits without '+', avoid duplicating the country code
  if (ccDigits === '91' && nationalDigits.length === 12 && nationalDigits.startsWith('91')) {
    nationalDigits = nationalDigits.slice(2);
  }

  if (ccDigits === '91' && nationalDigits.length !== 10) {
    return {
      e164: '',
      error: 'Please enter a valid 10-digit Indian mobile number.',
    };
  }

  const candidate = `+${ccDigits}${nationalDigits}`;
  if (!E164_REGEX.test(candidate)) {
    return {
      e164: '',
      error: 'Enter a valid mobile number (7 to 15 digits including country code).',
    };
  }

  return { e164: candidate, error: null };
}

function getFriendlyOtpError(err: unknown, fallback: string): string {
  const rawMessage =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message?: unknown }).message || '')
        : '';

  const lower = rawMessage.toLowerCase();
  if (lower.includes('phone provider') || lower.includes('sms') && lower.includes('disabled') || lower.includes('unsupported phone provider')) {
    return 'Phone SMS OTP is not enabled on the Supabase project yet. Please configure an SMS provider in Supabase Auth settings.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_sms_send_rate_limit')) {
    return 'Too many OTP requests. Please wait a minute before requesting another code.';
  }
  if (lower.includes('expired') || lower.includes('invalid') && lower.includes('token')) {
    return 'That 6-digit OTP is invalid or has expired. Please check the code or request a new OTP.';
  }
  return rawMessage || fallback;
}

export function PhoneOtpAuth({
  onSuccess,
  defaultCountryCode = '+91',
  embedded = false,
  className = '',
}: PhoneOtpAuthProps) {
  const isPresetDefault = COUNTRY_CODES.some((c) => c.code === defaultCountryCode);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedCode, setSelectedCode] = useState<string>(
    isPresetDefault ? defaultCountryCode : 'CUSTOM'
  );
  const [customCountryCode, setCustomCountryCode] = useState<string>(
    isPresetDefault ? '+91' : defaultCountryCode
  );
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [e164Phone, setE164Phone] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [cooldown, setCooldown] = useState<number>(0);

  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [resendingOtp, setResendingOtp] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  const activeCountryCode = selectedCode === 'CUSTOM' ? customCountryCode : selectedCode;
  const activeCountryMeta =
    COUNTRY_CODES.find((c) => c.code === activeCountryCode) || COUNTRY_CODES[0];

  // Live preview of formatted E.164 number when input is valid
  const livePreview = mobileNumber.trim()
    ? formatPhoneToE164(activeCountryCode, mobileNumber)
    : null;

  // 60-second resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  // Move focus smoothly when switching between Step 1 and Step 2
  useEffect(() => {
    if (step === 'otp') {
      otpInputRef.current?.focus();
    } else {
      phoneInputRef.current?.focus();
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    const { e164, error: validationError } = formatPhoneToE164(activeCountryCode, mobileNumber);
    if (validationError || !e164) {
      const msg = validationError || 'Please enter a valid mobile number.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!isSupabaseConfigured) {
      const msg = 'Authentication service is not configured. Please contact support.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setE164Phone(e164);
      setToken('');
      setStep('otp');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      const sentMessage = `A 6-digit verification code has been sent to ${e164}.`;
      setStatusMsg(sentMessage);
      toast.success(sentMessage);
    } catch (err) {
      const friendly = getFriendlyOtpError(err, 'Could not send Phone OTP. Please try again.');
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);

    const cleanToken = token.replace(/\D/g, '').trim();
    if (cleanToken.length !== 6) {
      const msg = 'Please enter the 6-digit verification code sent via SMS.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!e164Phone) {
      const msg = 'Phone number missing. Please go back and enter your mobile number again.';
      setErrorMsg(msg);
      setStep('phone');
      toast.error(msg);
      return;
    }

    setVerifyingOtp(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164Phone,
        token: cleanToken,
        type: 'sms',
      });

      if (error) {
        throw error;
      }

      let activeSession: Session | null = data.session ?? null;
      let activeUser: User | null = data.user ?? activeSession?.user ?? null;

      if (!activeSession) {
        const sessionRes = await supabase.auth.getSession();
        activeSession = sessionRes.data.session ?? null;
        activeUser = activeSession?.user ?? activeUser;
      }

      if (!activeSession) {
        throw new Error('OTP verified, but no active session was created. Please try again.');
      }

      const verifiedMessage = `Verified ${e164Phone}. Signing you in...`;
      setStatusMsg(verifiedMessage);
      toast.success('Phone number verified successfully!');

      if (onSuccess) {
        await onSuccess(activeSession, activeUser);
      }
    } catch (err) {
      const friendly = getFriendlyOtpError(err, 'OTP verification failed. Please check the code and try again.');
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resendingOtp || !e164Phone) return;

    setErrorMsg(null);
    setStatusMsg(null);
    setResendingOtp(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setToken('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      const resentMessage = `A new 6-digit OTP has been sent to ${e164Phone}.`;
      setStatusMsg(resentMessage);
      toast.success(resentMessage);
      otpInputRef.current?.focus();
    } catch (err) {
      const friendly = getFriendlyOtpError(err, 'Could not resend OTP. Please try again.');
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setResendingOtp(false);
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setToken('');
    setCooldown(0);
    setErrorMsg(null);
    setStatusMsg(null);
  };

  const handleCustomCodeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setCustomCountryCode(digits ? `+${digits}` : '+');
  };

  const handleTokenChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 6);
    setToken(digitsOnly);
    if (errorMsg) setErrorMsg(null);
  };

  const isBusy = sendingOtp || verifyingOtp || resendingOtp;

  const content = (
    <div className="space-y-4" data-testid="phone-otp-auth">
      {!embedded && (
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] text-[11px] font-bold tracking-wider uppercase">
            SMS PHONE OTP
          </div>
          <h2 className="text-xl font-extrabold text-[#1C1917] tracking-tight">
            {step === 'phone' ? 'Sign in or sign up with Phone' : 'Enter verification code'}
          </h2>
          <p className="text-xs sm:text-sm text-[#44403C] leading-snug">
            {step === 'phone'
              ? 'We will send a 6-digit SMS verification code to your mobile number.'
              : `Enter the 6-digit SMS code sent to ${e164Phone}.`}
          </p>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
        <span className="inline-flex items-center gap-1.5 text-[#C2410C]">
          <span className="w-5 h-5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] inline-flex items-center justify-center text-[11px] font-extrabold">
            {step === 'phone' ? '1' : '2'}
          </span>
          {step === 'phone' ? 'Step 1 of 2 · Mobile Number' : 'Step 2 of 2 · Enter 6-Digit OTP'}
        </span>
        <span className="inline-flex items-center gap-1 text-[#059669]">
          <ShieldCheck className="w-3.5 h-3.5" />
          SMS OTP
        </span>
      </div>

      {/* Accessible error & status messages */}
      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          data-testid="phone-otp-error"
          className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs rounded-xl flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {statusMsg && !errorMsg && (
        <div
          role="status"
          aria-live="polite"
          data-testid="phone-otp-status"
          className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-xs rounded-xl flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
          <span className="leading-snug">{statusMsg}</span>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="phone-otp-country-code"
              className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider"
            >
              Country Code &amp; Mobile Number
            </label>

            <div className="flex gap-2">
              {/* Country code selector */}
              <div className="w-[126px] shrink-0">
                <select
                  id="phone-otp-country-code"
                  aria-label="Country code"
                  value={selectedCode}
                  onChange={(e) => {
                    setSelectedCode(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isBusy}
                  className="w-full min-h-[44px] px-2.5 py-2.5 text-sm font-semibold text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                  <option value="CUSTOM">Other (+)</option>
                </select>
              </div>

              {/* Custom country code input when 'Other (+)' is chosen */}
              {selectedCode === 'CUSTOM' && (
                <div className="w-[82px] shrink-0">
                  <input
                    id="phone-otp-custom-code"
                    type="tel"
                    inputMode="tel"
                    aria-label="Custom country code"
                    placeholder="+91"
                    value={customCountryCode}
                    onChange={(e) => handleCustomCodeChange(e.target.value)}
                    disabled={isBusy}
                    className="w-full min-h-[44px] px-2.5 py-2.5 text-sm font-semibold text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                  />
                </div>
              )}

              {/* Mobile number input */}
              <div className="relative flex-1 min-w-0">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={phoneInputRef}
                  id="phone-otp-mobile"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  required
                  disabled={isBusy}
                  placeholder={activeCountryMeta.placeholder}
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Live E.164 format preview */}
            <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-0.5">
              <span>Works for both login and new account signup.</span>
              {livePreview?.e164 && !livePreview.error && (
                <span
                  data-testid="phone-otp-e164-preview"
                  className="font-mono font-semibold text-[#C2410C] bg-[#FFF0E6] px-2 py-0.5 rounded-md border border-[#FED7AA]"
                >
                  {livePreview.e164}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isBusy || !mobileNumber.trim()}
            data-testid="send-phone-otp-btn"
            className="w-full min-h-[44px] h-11 sm:h-12 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EA580C]"
          >
            {sendingOtp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send Phone OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
          {/* Confirmed E.164 number chip + Change number action */}
          <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[#57534E]">OTP sent to</div>
              <div
                data-testid="phone-otp-target-number"
                className="text-sm font-mono font-bold text-[#1C1917] truncate"
              >
                {e164Phone}
              </div>
            </div>
            <button
              type="button"
              onClick={handleChangeNumber}
              disabled={verifyingOtp}
              data-testid="change-number-btn"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#C2410C] hover:text-[#9A3412] hover:bg-[#FFF0E6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#EA580C] shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change number</span>
            </button>
          </div>

          {/* 6-digit numeric OTP input */}
          <div className="space-y-1.5">
            <label
              htmlFor="phone-otp-code"
              className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider"
            >
              6-Digit Verification Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={otpInputRef}
                id="phone-otp-code"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                disabled={verifyingOtp}
                placeholder="• • • • • •"
                value={token}
                onChange={(e) => handleTokenChange(e.target.value)}
                data-testid="phone-otp-input"
                className="w-full min-h-[48px] pl-10 pr-4 py-2.5 text-center font-mono text-xl font-extrabold tracking-[0.45em] text-[#1C1917] bg-white rounded-xl border border-[#DCE7F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition-all placeholder:tracking-[0.25em] placeholder:text-stone-300"
              />
            </div>
          </div>

          {/* Verify OTP primary button */}
          <button
            type="submit"
            disabled={verifyingOtp || token.length !== 6}
            data-testid="verify-otp-btn"
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
            <span className="text-[#57534E] inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Didn't receive the SMS?"}
            </span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || resendingOtp || verifyingOtp}
              data-testid="resend-otp-btn"
              className="font-bold text-[#C2410C] hover:text-[#9A3412] disabled:text-stone-400 disabled:cursor-not-allowed hover:underline disabled:no-underline focus:outline-none focus:ring-2 focus:ring-[#EA580C] rounded px-1 py-0.5 transition-colors"
            >
              {resendingOtp
                ? 'Resending...'
                : cooldown > 0
                  ? `Resend OTP (${cooldown}s)`
                  : 'Resend OTP'}
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

export default PhoneOtpAuth;
