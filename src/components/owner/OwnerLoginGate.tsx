'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function OwnerLoginGate() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!loginId.trim() || !password) {
      const msg = 'Please enter both your Owner Login ID and Password.';
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/owner/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: loginId.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data?.error || 'Invalid Owner Login ID or Password.';
        setErrorBanner(errMsg);
        toast.error(errMsg);
        setSubmitting(false);
        return;
      }

      toast.success(`Welcome back, ${data.loginId || loginId.trim()}!`);
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      const errMsg = err?.message || 'Network error while verifying Owner credentials.';
      setErrorBanner(errMsg);
      toast.error(errMsg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle radial ember glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(234,88,12,0.22) 0%, rgba(255,140,66,0.06) 65%, transparent 100%)',
        }}
      />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-[#F3E5D8] rounded-2xl shadow-[0_24px_60px_-24px_rgba(28,25,23,0.18)] p-6 sm:p-8 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#EA580C] text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF3E8] text-[#C2410C] border border-[#FED7AA] mb-0.5">
              <Lock className="w-3 h-3" />
              PRIVATE SUPER-ADMIN ACCESS
            </div>
            <h1 className="text-xl font-bold text-[#1C1917] tracking-tight">
              VigilAMC Owner Console
            </h1>
          </div>
        </div>

        <p className="text-sm text-[#44403C] mb-6 leading-relaxed">
          Enter your private Owner Login ID and Password to unlock live platform activity, agency subscriptions, and system health.
        </p>

        {errorBanner && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorBanner}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="owner-login-id"
              className="block text-xs font-bold uppercase tracking-wider text-[#44403C] mb-1.5"
            >
              Owner Login ID
            </label>
            <div className="relative">
              <input
                id="owner-login-id"
                type="text"
                autoComplete="username"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. shaizan@vigilamc.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8F2] border border-[#E7D8C9] text-sm text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="owner-password"
              className="block text-xs font-bold uppercase tracking-wider text-[#44403C] mb-1.5"
            >
              Owner Password
            </label>
            <div className="relative">
              <input
                id="owner-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter owner password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#FFF8F2] border border-[#E7D8C9] text-sm text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#57534E] hover:text-[#1C1917] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:ring-offset-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying Owner Access...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Unlock Owner Console
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#F3E5D8] flex items-center justify-between text-[11px] text-[#57534E]">
          <span>Server-Side Protected Gate</span>
          <span>Login ID &amp; Password editable inside console</span>
        </div>
      </div>
    </div>
  );
}
