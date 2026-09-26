'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (currentScroll > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  const circleRadius = 18;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white text-[#0077B6] shadow-xl border border-slate-200 hover:border-[#0077B6] hover:text-[#023E8A] transition-all transform hover:-translate-y-1 active:translate-y-0 group focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
      aria-label="Scroll back to top"
      title="Back to top"
    >
      {/* Circular Progress Ring */}
      <svg className="w-10 h-10 -rotate-90 absolute -inset-0 m-auto pointer-events-none" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={circleRadius}
          className="text-slate-100"
          strokeWidth="2.5"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="22"
          cy="22"
          r={circleRadius}
          className="text-[#0077B6] transition-all duration-150"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <ArrowUp className="w-4 h-4 relative z-10 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}
