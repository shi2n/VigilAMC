'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const formEmail = (formData.get('email') as string) || email;
    const formHp = (formData.get('website') as string) || honeypot;
    const trimmed = formEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setStatus('error');
      setMessage("That email didn't work — try again");
      return;
    }

    setStatus('loading');
    setMessage(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmed,
          website: formHp, // Honeypot field
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || "That email didn't work — try again");
        return;
      }

      setStatus('success');
      setMessage(data.message || "✓ You're subscribed!");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage("That email didn't work — try again");
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        {/* Hidden Honeypot Input for anti-bot protection */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="newsletter-website-hp">Website</label>
          <input
            id="newsletter-website-hp"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setMessage(null);
                }
              }}
              placeholder="Enter your work email"
              disabled={status === 'loading'}
              className="w-full h-11 px-3.5 py-2.5 rounded-xl bg-white border border-[#44403C]/25 text-[#1C1917] placeholder:text-[#57534E]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] transition-all disabled:opacity-60 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="h-11 px-5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] active:bg-[#7C2D12] text-white text-sm font-bold shadow-[0_4px_14px_-2px_rgba(194,65,12,0.35)] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                <span>Subscribing...</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {/* Accessible Inline Status Alert */}
        <div aria-live="polite" className="min-h-[22px]">
          {status === 'success' && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{message || "✓ You're subscribed!"}</span>
            </p>
          )}

          {status === 'error' && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden="true" />
              <span>{message || "That email didn't work — try again"}</span>
            </p>
          )}

          {status === 'idle' && (
            <p className="text-[12px] text-[#57534E] leading-relaxed">
              Monthly compliance tips &amp; product updates. No spam, unsubscribe anytime.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
