'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { getPortalDictionary } from '@/lib/i18n/portal';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [directLink, setDirectLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const dict = getPortalDictionary(lang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/portal/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send login link');
      }

      if (data.directLink) {
        setDirectLink(data.directLink);
      } else {
        setDirectLink(null);
      }
      setSentSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to request sign-in link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 bg-[#FFF8F2] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 45%, #FFE8D6 100%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[400px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232, 89, 12, 0.20) 0%, rgba(255, 140, 66, 0.12) 50%, rgba(255, 248, 242, 0) 74%)',
          filter: 'blur(90px)',
        }}
      />

      <div
        data-testid="portal-login-card"
        className="relative z-10 max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/60 bg-white/70 backdrop-blur-xl"
      >
        {/* Language selector & Brand */}
        <div className="flex items-center justify-between pb-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-tile-192.png"
              alt="VigilAMC Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-cover rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
            <div className="text-left">
              <span className="text-base font-bold text-[#1C1917] tracking-tight block">VigilAMC</span>
              <span className="text-xs text-[#EA580C] font-semibold tracking-wider uppercase block">Client Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-1 bg-[#FFF8F2] p-1 rounded-lg border border-[#FFE4D6]">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                lang === 'en' ? 'bg-[#EA580C] text-white' : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 text-xs font-semibold rounded ${
                lang === 'hi' ? 'bg-[#EA580C] text-white' : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-[#1C1917] tracking-tight">{dict.loginTitle}</h1>
          <p className="text-sm text-[#44403C] leading-relaxed">{dict.loginSubtitle}</p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 bg-red-50/90 border border-red-200 text-[#991B1B] text-xs sm:text-sm rounded-xl flex items-start gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#DC2626] mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        {/* Success Notification */}
        {sentSuccess ? (
          <div className="space-y-4 py-2">
            {directLink ? (
              <div className="p-4 bg-orange-50 border border-orange-200 text-[#1C1917] rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#EA580C] mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#1C1917]">Magic Access Link Ready</p>
                    <p className="text-xs text-[#44403C] mt-0.5">
                      SMTP email server is not configured in this environment. You can sign in immediately using your direct access link below:
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={directLink}
                    className="w-full text-center py-2.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-xl text-xs transition-colors shadow-sm block"
                  >
                    Open Client Portal Now &rarr;
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(directLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full text-center py-2 px-4 bg-white hover:bg-orange-50 text-[#C2410C] border border-[#FED7AA] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied Link to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Sign-In Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 text-[#065F46] rounded-2xl flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-[#059669] mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{dict.loginSentMsg}</p>
                  <p className="text-xs text-[#047857]">
                    Sent to <strong className="font-semibold">{email}</strong>. The link expires in 30 minutes and can only be used once.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSentSuccess(false);
                setDirectLink(null);
                setEmail('');
              }}
              className="w-full text-center text-xs font-semibold text-[#EA580C] hover:text-[#C2410C] underline py-1"
            >
              Send link to a different email address
            </button>
          </div>
        ) : (
          /* Sign-in Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="portal-email" className="block text-xs font-bold text-[#1C1917] tracking-wider uppercase">
                {dict.loginEmailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="portal-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="contact@society.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-sm font-medium text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition"
                />
              </div>
              <p className="text-[11px] text-[#78716C]">
                Sign in without passwords. A single-use verification link will be delivered to your inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              data-testid="portal-login-submit"
              className="w-full py-3.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{dict.loginLoading}</span>
                </>
              ) : (
                <>
                  <span>{dict.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Agency Login Divert */}
        <div className="pt-4 border-t border-[#F5EBE1] text-center">
          <Link
            href="/login"
            className="text-xs font-medium text-[#78716C] hover:text-[#EA580C] transition-colors inline-block leading-relaxed"
          >
            {dict.loginAgencyLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
