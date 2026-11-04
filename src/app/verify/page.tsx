'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, Flame, ArrowRight, Sparkles, Building2 } from 'lucide-react';

export default function PublicVerifyLookupPage() {
  const router = useRouter();
  const [tag, setTag] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    router.push(`/verify/${encodeURIComponent(cleanTag)}`);
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
        data-testid="verify-lookup-card"
        className="relative z-10 max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/60 bg-white/70 backdrop-blur-xl"
      >
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-tile-192.png"
              alt="VigilAMC Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-200 text-[#C2410C] text-xs font-bold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Public Fire Equipment Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1C1917] tracking-tight">
            Check Asset Compliance Status
          </h1>
          <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed">
            Verify readiness, statutory inspection timestamps, and testing schedules for any physical fire extinguisher or hydrant bearing a VigilAMC asset tag.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="verify-tag" className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              Asset Tag ID / Serial Number
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="verify-tag"
                type="text"
                required
                placeholder="e.g. EXT-01, EXT-DEMO-01, HYD-04"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-sm font-semibold text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="verify-lookup-submit"
            className="w-full py-3.5 px-4 bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm transition-colors duration-150"
          >
            <span>Verify Compliance Record</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Tag Quick Click (H3) */}
        <div className="p-3 bg-[#FFF8F2] border border-[#FED7AA] rounded-2xl text-xs space-y-1 text-center">
          <span className="text-[#78716C] block">Want to see how public records look?</span>
          <Link
            href="/verify/DEMO-EXT-01"
            className="font-bold text-[#EA580C] hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verify Sample Asset Tag (DEMO-EXT-01) →</span>
          </Link>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-[#78716C] border-t border-[#F0E4D8]">
          <span>Publishing controlled by the servicing agency · </span>
          <Link href="/privacy" className="hover:text-[#EA580C] underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
