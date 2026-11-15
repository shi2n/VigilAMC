'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AppleRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Apple-quiet scroll reveal: opacity + 14px translate3d only, stagger <= 80ms.
 * Immediately static under prefers-reduced-motion. Zero layout shift (CLS = 0).
 */
export function AppleReveal({
  children,
  className = '',
  delayMs = 0,
}: AppleRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReduced(true);
      setVisible(true);
      return;
    }

    const onChange = () => {
      if (mq.matches) {
        setReduced(true);
        setVisible(true);
      }
    };
    mq.addEventListener('change', onChange);

    const el = ref.current;
    if (!el) return () => mq.removeEventListener('change', onChange);

    const checkVisible = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.98) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkVisible()) {
      return () => mq.removeEventListener('change', onChange);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || checkVisible()) {
            setVisible(true);
            io.disconnect();
            window.removeEventListener('scroll', onScroll);
            break;
          }
        }
      },
      { rootMargin: '120px 0px 0px 0px', threshold: 0 }
    );

    const onScroll = () => {
      if (checkVisible()) {
        io.disconnect();
        window.removeEventListener('scroll', onScroll);
      }
    };

    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  const style: React.CSSProperties = reduced
    ? { opacity: 1, transform: 'none' }
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 14px, 0)',
        transition: `opacity 520ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 520ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
      };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
