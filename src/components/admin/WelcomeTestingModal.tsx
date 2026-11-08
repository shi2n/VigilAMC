'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Building2, Smartphone, FileCheck2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminDictionary } from '@/lib/i18n/admin';
import { isDuplicateSubmission, clearSubmissionLock } from '@/lib/submissionGuard';
import { createClient } from '@/lib/supabase/client';

export interface WelcomeTestingModalProps {
  isOpen: boolean;
  fullName?: string | null;
  agencyName?: string | null;
  preferredLanguage?: string | null;
  onDismissed: (welcomeSeenAt: string) => void;
}

export function sanitizeWelcomeFirstName(rawFullName?: string | null): string {
  if (!rawFullName || typeof rawFullName !== 'string') return '';
  const trimmed = rawFullName.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower === 'undefined' || lower === 'null' || lower === 'user' || lower === 'agency admin') {
    return '';
  }
  const firstToken = trimmed.split(/\s+/)[0] || '';
  if (!firstToken || firstToken.toLowerCase() === 'undefined' || firstToken.toLowerCase() === 'null') {
    return '';
  }
  return firstToken;
}

export function sanitizeWelcomeAgencyName(rawAgencyName?: string | null): string {
  if (!rawAgencyName || typeof rawAgencyName !== 'string') return '';
  const trimmed = rawAgencyName.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower === 'undefined' ||
    lower === 'null' ||
    lower === 'vigilamc operating system' ||
    lower === "my's fire safety amc"
  ) {
    return '';
  }
  return trimmed;
}

export function WelcomeTestingModal({
  isOpen,
  fullName,
  agencyName,
  preferredLanguage = 'en',
  onDismissed,
}: WelcomeTestingModalProps) {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = getAdminDictionary(preferredLanguage || 'en');

  const firstName = sanitizeWelcomeFirstName(fullName);
  const cleanAgency = sanitizeWelcomeAgencyName(agencyName);

  const headingText = firstName
    ? t.welcomeHeading.replace('{firstName}', firstName)
    : t.welcomeHeadingFallback;

  const agencyDisplay = cleanAgency || t.welcomeAgencyFallback;
  const bodyText = t.welcomeBody.replace('{agency}', agencyDisplay);

  const handleDismiss = useCallback(
    async (source: 'cta' | 'close' | 'esc' | 'backdrop') => {
      const optimisticIso = new Date().toISOString();
      onDismissed(optimisticIso);

      // Return focus to the element that was active before modal opened
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        try {
          previousFocusRef.current.focus();
        } catch {
          // Ignore focus restore errors if element unmounted
        }
      }

      if (source === 'cta') {
        const guideEl = document.getElementById('getting-started-guide');
        if (guideEl && typeof guideEl.scrollIntoView === 'function') {
          guideEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
        }
      }

      const actionKey = 'welcome-seen';
      if (isDuplicateSubmission(actionKey, 3000)) {
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          reqHeaders['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/dashboard/welcome-seen', {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify({ source }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          clearSubmissionLock(actionKey);
          toast.error(json.error || 'Could not save welcome preference.');
          return;
        }

        if (json.welcomeSeenAt) {
          onDismissed(json.welcomeSeenAt);
        }
      } catch (err: any) {
        clearSubmissionLock(actionKey);
        toast.error(err?.message || 'Network error while saving welcome preference.');
      }
    },
    [onDismissed, prefersReducedMotion]
  );

  // Capture focus on open, move focus into dialog, and trap Tab + handle Escape
  useEffect(() => {
    if (!mounted || !isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = requestAnimationFrame(() => {
      primaryBtnRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleDismiss('esc');
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableSelectors = [
          'button:not([disabled])',
          'a[href]',
          'input:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(', ');
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const activeEl = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (activeEl === firstEl || !dialogRef.current.contains(activeEl)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (activeEl === lastEl || !dialogRef.current.contains(activeEl)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [mounted, isOpen, handleDismiss]);

  if (!mounted) return null;

  const bullets = [
    { icon: Building2, text: t.welcomeBullet1 },
    { icon: Smartphone, text: t.welcomeBullet2 },
    { icon: FileCheck2, text: t.welcomeBullet3 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="welcome-testing-backdrop"
          data-testid="welcome-testing-backdrop"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
          onClick={() => handleDismiss('backdrop')}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(28, 25, 23, 0.55)' }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-testing-modal-title"
            aria-describedby="welcome-testing-modal-desc"
            data-testid="welcome-testing-modal"
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, y: 0, scale: 1 }
                : { opacity: 0, y: 8, scale: 0.98 }
            }
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] rounded-2xl bg-[#FFFFFF] border border-[#FED7AA] p-6 sm:p-7 text-[#1C1917] shadow-[0_24px_60px_-24px_rgba(28,25,23,0.28),0_0_60px_rgba(232,89,12,0.12)]"
          >
            {/* Top row: Eyebrow chip + Close button */}
            <div className="flex items-start justify-between gap-3">
              <div
                data-testid="welcome-testing-eyebrow"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF8F2] border border-[#FED7AA] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#EA580C]"
              >
                <span>{t.welcomeEyebrow}</span>
              </div>

              <button
                type="button"
                data-testid="welcome-testing-close-btn"
                onClick={() => handleDismiss('close')}
                aria-label={t.welcomeCloseAria}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#44403C] hover:bg-[#FFF8F2] hover:text-[#EA580C] hover:border-[#FED7AA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Greeting Heading */}
            <h2
              id="welcome-testing-modal-title"
              data-testid="welcome-testing-heading"
              className="mt-4 text-2xl sm:text-[26px] font-black tracking-tight text-[#1C1917] leading-tight"
            >
              {headingText}
            </h2>

            {/* Body Copy */}
            <p
              id="welcome-testing-modal-desc"
              data-testid="welcome-testing-body"
              className="mt-2.5 text-sm leading-relaxed text-[#44403C]"
            >
              {bodyText}
            </p>

            {/* 3 Quick-Start Bullets */}
            <ul
              data-testid="welcome-testing-bullets"
              className="mt-5 space-y-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]/80 p-4"
            >
              {bullets.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] font-semibold text-[#1C1917]">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white border border-[#FED7AA] text-[#EA580C] mt-0.5">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="leading-snug">
                      {item.text}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Primary CTA Button */}
            <div className="mt-6">
              <button
                ref={primaryBtnRef}
                type="button"
                data-testid="welcome-testing-cta-btn"
                onClick={() => handleDismiss('cta')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] focus-visible:ring-offset-2"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                <span>{t.welcomeCta}</span>
              </button>
            </div>

            {/* Tiny Footer Line */}
            <p
              data-testid="welcome-testing-footer"
              className="mt-3.5 text-center text-[11px] font-medium text-[#64748B]"
            >
              {t.welcomeFooter.includes('vigilamc@gmail.com') ? (
                <>
                  {t.welcomeFooter.split('vigilamc@gmail.com')[0]}
                  <a
                    href="mailto:vigilamc@gmail.com"
                    className="font-semibold text-[#EA580C] hover:text-[#C2410C] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded-xs"
                  >
                    vigilamc@gmail.com
                  </a>
                  {t.welcomeFooter.split('vigilamc@gmail.com')[1]}
                </>
              ) : (
                t.welcomeFooter
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
