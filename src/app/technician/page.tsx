'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scan,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  LogOut,
  RefreshCw,
  User,
  ShieldCheck,
  FileText,
  Search,
  Check,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TechnicianPortalPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'BUILDINGS' | 'WORK_ORDERS' | 'RECENT_SERVICES'>('BUILDINGS');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTechnicianData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/technician/dashboard');
      if (res.status === 401) {
        router.push('/login?redirect=/technician');
        return;
      }
      if (res.status === 403) {
        const d = await res.json();
        setError(d.error || 'Access denied. Account may be inactive.');
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load technician dashboard');
      }
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Error loading technician workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/scan/${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0077B6] mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading technician workspace...</p>
          <p className="text-xs text-slate-400">Verifying assigned facilities and jobs</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={fetchTechnicianData}
              className="w-full py-2.5 px-4 bg-[#0077B6] text-white text-xs font-bold rounded-xl hover:bg-[#023E8A] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleSignOut}
              className="w-full py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Sign In with Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const stats = data?.stats;
  const assignedBuildings = data?.assignedBuildings || [];
  const workOrders = data?.workOrders || [];
  const jobs = data?.jobs || [];
  const recentServices = data?.recentServices || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-[#023E8A] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-200 border border-white/20">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">VigilAMC</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                  Technician App
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80 truncate max-w-[200px] sm:max-w-sm">
                {profile?.agencyName || 'Fire Safety Operations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">{profile?.fullName}</span>
              <span className="text-[10px] text-cyan-200">{profile?.employeeId ? `ID: ${profile.employeeId}` : profile?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Banner & Quick Scan */}
        <div className="bg-gradient-to-br from-[#0077B6] to-[#023E8A] rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-200 bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                  Field Operations Hub
                </span>
                <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                  Welcome back, {profile?.fullName?.split(' ')[0] || 'Technician'}
                </h1>
                <p className="text-xs sm:text-sm text-cyan-100 mt-0.5">
                  Scan equipment QR stickers to record maintenance checks, upload evidence, or update service status.
                </p>
              </div>

              <Link
                href="/scan"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#023E8A] font-bold text-sm shadow-md hover:bg-slate-100 transition-all active:scale-[0.98] shrink-0"
              >
                <Scan className="w-4 h-4 text-[#0077B6]" />
                <span>Launch QR Scanner</span>
              </Link>
            </div>

            {/* Quick QR code entry */}
            <form onSubmit={handleQuickScan} className="pt-2 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter QR Code tag (e.g. EXT-01, HYD-04)..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-100/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs sm:text-sm transition-colors"
              >
                Lookup
              </button>
            </form>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Assigned Sites
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats?.assignedBuildingsCount || 0}</span>
              <Building2 className="w-4 h-4 text-[#0077B6]" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Authorized facilities</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Active Work Orders
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{stats?.openWorkOrdersCount || 0}</span>
              <Wrench className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Assigned to you</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Scheduled Jobs
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats?.activeJobsCount || 0}</span>
              <Calendar className="w-4 h-4 text-[#023E8A]" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Maintenance visits</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block">
              Services Logged
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{stats?.totalServicesLogged || 0}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Verified records</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('BUILDINGS')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'BUILDINGS'
                ? 'border-[#0077B6] text-[#0077B6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Assigned Facilities ({assignedBuildings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('WORK_ORDERS')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'WORK_ORDERS'
                ? 'border-[#0077B6] text-[#0077B6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Work Orders ({workOrders.length + jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('RECENT_SERVICES')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'RECENT_SERVICES'
                ? 'border-[#0077B6] text-[#0077B6]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>My Service History ({recentServices.length})</span>
          </button>
        </div>

        {/* Tab 1: Assigned Buildings */}
        {activeTab === 'BUILDINGS' && (
          <div className="space-y-4">
            {assignedBuildings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Facilities Assigned Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your agency administrator hasn't assigned specific buildings to your account yet. Check back soon or contact your admin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedBuildings.map((building: any) => (
                  <div
                    key={building.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{building.name}</h3>
                        </div>
                        <p className="text-xs text-[#0077B6] font-semibold mt-0.5">{building.clientName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{building.address}</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 shrink-0">
                        {building.totalAssets} Assets
                      </span>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-slate-100">
                      {building.overdueCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-semibold border border-red-200">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          {building.overdueCount} Overdue
                        </span>
                      )}
                      {building.dueSoonCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {building.dueSoonCount} Due Soon
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {building.compliantCount} Compliant
                      </span>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/buildings/${building.id}`}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors border border-slate-200"
                      >
                        <span>View Facility Inventory & Compliance</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Work Orders & Jobs */}
        {activeTab === 'WORK_ORDERS' && (
          <div className="space-y-4">
            {workOrders.length === 0 && jobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Open Work Orders Assigned</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You currently have no pending service tickets or scheduled jobs. When your administrator assigns tasks, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workOrders.map((wo: any) => (
                  <div
                    key={wo.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {wo.priority}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{wo.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{wo.description}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                        <span>Facility: <strong>{wo.building?.name || '—'}</strong></span>
                        {wo.equipment?.qrCode && (
                          <span>• Asset: <strong>{wo.equipment.qrCode} ({wo.equipment.type})</strong></span>
                        )}
                        {wo.dueDate && (
                          <span>• Due: <strong>{new Date(wo.dueDate).toLocaleDateString('en-IN')}</strong></span>
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {wo.equipment?.qrCode ? (
                        <Link
                          href={`/scan/${wo.equipment.qrCode}`}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0077B6] hover:bg-[#023E8A] text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Scan className="w-3.5 h-3.5" />
                          <span>Scan & Service</span>
                        </Link>
                      ) : (
                        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                          {wo.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {jobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {job.serviceType}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{job.title || job.jobNumber}</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        {job.building?.name} ({job.client?.name})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Scheduled: {new Date(job.scheduledDate).toLocaleDateString('en-IN')} • Priority: {job.priority}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {job.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recent Service History */}
        {activeTab === 'RECENT_SERVICES' && (
          <div className="space-y-4">
            {recentServices.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Services Logged Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you scan assets and record service actions, your completed verification entries will appear here for audit reference.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {recentServices.map((log: any) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {log.equipment?.qrCode || 'Asset'}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {log.equipment?.type || 'Fire Equipment'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{log.actionType}</p>
                        <p className="text-[11px] text-slate-400">
                          {log.equipment?.building?.name || 'Facility'} • Serviced on {new Date(log.servicedAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                          Next Due: {new Date(log.nextDueDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
