'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Cookie,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Check,
  Lock,
  Info,
  BarChart3,
  Sparkles,
  Megaphone
} from 'lucide-react';

export interface CookieConsentState {
  necessary: true; // Always required & locked true
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'vigilamc_cookie_consent_v1';
const COOKIE_NAME = 'vigilamc_consent';
const CUSTOM_EVENT_NAME = 'vigilamc:open-cookie-preferences';

export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME));
  }
}

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [preferences, setPreferences] = useState<CookieConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: true,
    updatedAt: '',
  });

  // Automatically suppress on authenticated app routes and standalone white-label viewer routes
  const isSuppressedRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/founder') ||
    pathname?.startsWith('/technician') ||
    pathname?.startsWith('/report') ||
    pathname?.startsWith('/verify');

  const persistConsent = useCallback((nextState: Omit<CookieConsentState, 'necessary' | 'updatedAt'>) => {
    const finalConsent: CookieConsentState = {
      necessary: true,
      analytics: Boolean(nextState.analytics),
      marketing: Boolean(nextState.marketing),
      personalization: Boolean(nextState.personalization),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalConsent));
      const maxAge = 365 * 24 * 60 * 60; // 365 days
      const compactValue = encodeURIComponent(
        JSON.stringify({
          n: 1,
          a: finalConsent.analytics ? 1 : 0,
          m: finalConsent.marketing ? 1 : 0,
          p: finalConsent.personalization ? 1 : 0,
          t: finalConsent.updatedAt,
        })
      );
      document.cookie = `${COOKIE_NAME}=${compactValue}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch (err) {
      console.error('Unable to persist cookie consent:', err);
    }

    setPreferences(finalConsent);
    setShowBanner(false);
    setShowModal(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
        if (parsed && typeof parsed === 'object' && parsed.updatedAt) {
          setPreferences({
            necessary: true,
            analytics: Boolean(parsed.analytics),
            marketing: Boolean(parsed.marketing),
            personalization: parsed.personalization !== undefined ? Boolean(parsed.personalization) : true,
            updatedAt: parsed.updatedAt,
          });
          setShowBanner(false);
          return;
        }
      }
      // First-time visitor: show banner after brief polite delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 600);
      return () => clearTimeout(timer);
    } catch {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    const handleOpenPreferences = () => {
      setShowModal(true);
    };

    window.addEventListener(CUSTOM_EVENT_NAME, handleOpenPreferences);
    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleOpenPreferences);
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  if (!mounted || isSuppressedRoute) {
    return null;
  }

  const handleAcceptAll = () => {
    persistConsent({
      analytics: true,
      marketing: true,
      personalization: true,
    });
  };

  const handleRejectNonEssential = () => {
    persistConsent({
      analytics: false,
      marketing: false,
      personalization: false,
    });
  };

  const handleSaveGranular = () => {
    persistConsent({
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      personalization: preferences.personalization,
    });
  };

  return (
    <>
      {/* Subtle confirmation toast when preferences are saved */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 print:hidden no-print bg-[#1C1917] text-white px-4 py-2.5 rounded-xl shadow-xl border border-cyan-400/30 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Cookie preferences saved</span>
        </div>
      )}

      {/* Floating First-Visit Cookie Consent Banner */}
      {showBanner && !showModal && (
        <aside
          aria-label="Cookie consent notice"
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 print:hidden no-print animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-5 text-slate-800">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2410C] to-[#1C1917] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Cookie className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#1C1917] leading-tight">
                      Privacy &amp; Cookie Transparency
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Zero Ad Trackers
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enterprise Fire Safety Compliance Platform
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Dismiss with essential cookies only"
                title="Continue with essential cookies only"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              We use strictly necessary cookies to secure agency logins, prevent CSRF attacks, and store your consent choices. We do <strong>not</strong> run third-party ad pixels. You can customize optional preferences anytime or review our{' '}
              <Link
                href="/cookies"
                className="text-[#C2410C] font-semibold hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#1C1917] hover:from-[#9A3412] hover:to-[#9A3412] text-white text-xs font-bold shadow-sm transition-all text-center cursor-pointer"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors text-center cursor-pointer"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-[#C2410C] text-slate-700 hover:text-[#1C1917] text-xs font-semibold transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Manage</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Granular Cookie Preferences Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 print:hidden no-print flex items-center justify-center bg-slate-900 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="bg-[#1C1917] px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C2410C] flex items-center justify-center text-white border border-cyan-300/30">
                  <ShieldCheck className="w-5 h-5 text-cyan-200" />
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="text-base sm:text-lg font-bold leading-snug">
                    Granular Cookie &amp; Storage Preferences
                  </h3>
                  <p className="text-xs text-cyan-200 mt-0.5">
                    Control how VigilAMC stores session and preference data on your browser
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
                aria-label="Close cookie preferences modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-700">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>B2B Enterprise Privacy Commitment:</strong> VigilAMC never sells agency or building inspection records. You can modify your storage preferences below at any time.
                  {preferences.updatedAt && (
                    <span className="block text-[11px] text-emerald-700 mt-1">
                      Last saved: {new Date(preferences.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Category 1: Strictly Necessary (Locked) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#1C1917]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      1. Strictly Necessary &amp; Security
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Required for Supabase agency authentication (<code>sb-*-auth-token</code>), CSRF protection, offline technician queue sync (<code>vigil_offline_queue</code>), and saving this consent state.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    aria-label="Strictly Necessary Cookies (Always Active)"
                    className="w-4 h-4 accent-[#C2410C] rounded cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              {/* Category 2: Functional & Personalization */}
              <label className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-start justify-between gap-4 cursor-pointer transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C2410C]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      2. Functional &amp; UI Personalization
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Remembers dismissed onboarding notices (<code>vigil_dismissed_notices</code>), preferred report view modes, and dashboard filter states across sessions.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={preferences.personalization}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, personalization: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#C2410C] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* Category 3: Analytics & Performance */}
              <label className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-start justify-between gap-4 cursor-pointer transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#C2410C]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      3. Analytics &amp; Performance Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Helps us measure page load reliability and aggregate feature usage so we can improve Form-B PDF compilation speeds. No third-party profiling is used.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#C2410C] rounded cursor-pointer"
                  />
                </div>
              </label>

              {/* Category 4: Marketing & Attribution */}
              <label className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex items-start justify-between gap-4 cursor-pointer transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#C2410C]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      4. Marketing &amp; Campaign Attribution
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Optional campaign attribution parameters when visiting from partner fire-safety directories or webinar links. Disabled by default.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#C2410C] rounded cursor-pointer"
                  />
                </div>
              </label>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span>
                  Storage key: <code className="font-mono text-slate-700">{STORAGE_KEY}</code>
                </span>
                <Link
                  href="/cookies"
                  onClick={() => setShowModal(false)}
                  className="text-[#C2410C] font-semibold hover:underline"
                >
                  Read Full Cookie Policy &rarr;
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-[#C2410C]/30 bg-ocean-50 hover:bg-ocean-100 text-[#1C1917] text-xs font-bold transition-colors cursor-pointer"
                >
                  Accept All
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveGranular}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C2410C] to-[#1C1917] hover:from-[#9A3412] hover:to-[#9A3412] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CookieConsentBanner;
