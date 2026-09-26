'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';

interface StickyCTAProps {
  onOpenDemo: () => void;
}

export function StickyCTA({ onOpenDemo }: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past hero section (e.g. 280px)
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-2xl border border-slate-200 hover:border-[#0077B6] flex items-center gap-3 transition-all transform hover:scale-[1.02]">
        <button
          onClick={onOpenDemo}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-[#0077B6] to-[#023E8A] hover:from-[#006494] hover:to-[#011F48] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0077B6]/20 transition-all group"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
          </span>
          <span>Schedule Live Demo</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <div className="hidden sm:flex flex-col pr-3 text-left">
          <span className="text-[11px] font-bold text-[#023E8A] leading-tight">
            Stop Missed Audits
          </span>
          <span className="text-[10px] text-slate-500 leading-tight">
            15-min guided pilot
          </span>
        </div>
      </div>
    </div>
  );
}
