'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Scan,
  ArrowRight,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@vigilfire.in');
  const [role, setRole] = useState<'ADMIN' | 'TECHNICIAN'>('ADMIN');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save demo user session in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('vigil_user', JSON.stringify({ email, role }));
    }

    setTimeout(() => {
      if (role === 'TECHNICIAN') {
        router.push('/scan');
      } else {
        router.push('/dashboard');
      }
    }, 400);
  };

  const quickLoginAs = (selectedRole: 'ADMIN' | 'TECHNICIAN') => {
    setLoading(true);
    const demoEmail = selectedRole === 'ADMIN' ? 'admin@vigilfire.in' : 'santosh.tech@vigilfire.in';
    if (typeof window !== 'undefined') {
      localStorage.setItem('vigil_user', JSON.stringify({ email: demoEmail, role: selectedRole }));
    }
    setTimeout(() => {
      if (selectedRole === 'TECHNICIAN') {
        router.push('/scan');
      } else {
        router.push('/dashboard');
      }
    }, 300);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC"
              className="h-16 w-auto object-contain mx-auto mix-blend-multiply"
            />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to VigilAMC</h1>
          <p className="text-xs text-slate-500">
            Fire Safety AMC Management &amp; Form-B Compliance Portal
          </p>
        </div>

        {/* Quick Demo Sign-in Tiles */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            1-Click Demo Login:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLoginAs('ADMIN')}
              disabled={loading}
              className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <Building2 className="w-4 h-4 text-blue-600" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="font-bold text-xs text-slate-900">Office Admin</div>
              <div className="text-[10px] text-slate-500">Manage buildings &amp; reports</div>
            </button>

            <button
              onClick={() => quickLoginAs('TECHNICIAN')}
              disabled={loading}
              className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <Scan className="w-4 h-4 text-emerald-600" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="font-bold text-xs text-slate-900">Field Technician</div>
              <div className="text-[10px] text-slate-500">Scan QR &amp; log 1-tap refill</div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <span className="bg-white px-2 text-[11px] font-semibold text-slate-400 uppercase">Or Sign In with Credentials</span>
          <div className="absolute inset-0 border-t border-slate-200 -z-10"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setRole('ADMIN'); setEmail('admin@vigilfire.in'); }}
                className={`py-2 rounded-lg font-bold border transition-colors ${
                  role === 'ADMIN' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Office Admin
              </button>
              <button
                type="button"
                onClick={() => { setRole('TECHNICIAN'); setEmail('tech@vigilfire.in'); }}
                className={`py-2 rounded-lg font-bold border transition-colors ${
                  role === 'TECHNICIAN' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Field Technician
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                defaultValue="••••••••"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : role === 'ADMIN' ? 'Enter Admin Dashboard →' : 'Launch Technician Scanner →'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
            ← Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
