'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Search,
  Building2,
  Users,
  Wrench,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  IndianRupee,
  CalendarClock,
  CloudCog,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Edit3,
  X,
  Filter,
  Database,
  Clock,
  UserCheck,
  Briefcase,
  ChevronRight,
  Sparkles,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface OwnerConsoleClientProps {
  ownerEmail: string;
}

type FeedCategory =
  | 'ALL'
  | 'AGENCY'
  | 'USER'
  | 'TECHNICIAN'
  | 'INSPECTION'
  | 'REPORT'
  | 'WORK_ORDER'
  | 'CORRECTIVE_ACTION'
  | 'PORTAL'
  | 'SUBSCRIPTION';

function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return 'Never';
  const ts = new Date(isoString).getTime();
  if (isNaN(ts)) return 'Unknown';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 0) {
    const aheadDays = Math.ceil(Math.abs(diffSec) / 86400);
    return `in ${aheadDays}d`;
  }
  if (diffSec < 45) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatShortDate(isoString?: string | null): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatInr(amount?: number | null): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Lightweight SVG 7-day sparkline rendered strictly from real DB series.
 */
function RealSparkline({ series, color = '#EA580C' }: { series: number[]; color?: string }) {
  const safeSeries = Array.isArray(series) && series.length > 0 ? series : [0, 0, 0, 0, 0, 0, 0];
  const width = 112;
  const height = 28;
  const pad = 3;
  const min = Math.min(...safeSeries);
  const max = Math.max(...safeSeries);
  const span = max - min || 1;

  const points = safeSeries.map((val, idx) => {
    const x = pad + (idx / Math.max(1, safeSeries.length - 1)) * (width - pad * 2);
    const y =
      max === min
        ? height / 2
        : height - pad - ((val - min) / span) * (height - pad * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const linePath = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'}${pt.x},${pt.y}`)
    .join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0"
      aria-label="7-day trend sparkline"
    >
      <path d={areaPath} fill={color} fillOpacity={0.12} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
}

/**
 * Strictly enforces the 3 allowed status colors:
 * EXPIRED #DC2626 | DUE SOON #D97706 | OK #059669
 */
function StatusToneChip({
  label,
  tone,
}: {
  label: string;
  tone: 'OK' | 'DUE_SOON' | 'EXPIRED';
}) {
  if (tone === 'EXPIRED') {
    return (
      <span
        style={{
          color: '#DC2626',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
        {label}
      </span>
    );
  }
  if (tone === 'DUE_SOON') {
    return (
      <span
        style={{
          color: '#B45309',
          backgroundColor: '#FFFBEB',
          borderColor: '#FDE68A',
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
        {label}
      </span>
    );
  }
  return (
    <span
      style={{
        color: '#047857',
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wide"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
      {label}
    </span>
  );
}

function getAgencyStatusTone(
  status?: string | null,
  expiresAt?: string | null
): 'OK' | 'DUE_SOON' | 'EXPIRED' {
  const s = (status || 'ACTIVE').toUpperCase();
  if (s === 'EXPIRED') return 'EXPIRED';
  if (s === 'TRIAL') return 'DUE_SOON';
  if (expiresAt) {
    const diffDays = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= 30) return 'DUE_SOON';
  }
  return 'OK';
}

export default function OwnerConsoleClient({ ownerEmail }: OwnerConsoleClientProps) {
  const supabase = useMemo(() => createClient(), []);

  const [statsData, setStatsData] = useState<any | null>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [workspaceData, setWorkspaceData] = useState<any | null>(null);

  // Live Activity Feed state
  const [feedEvents, setFeedEvents] = useState<any[]>([]);
  const [feedTotal, setFeedTotal] = useState<number>(0);
  const [feedHasMore, setFeedHasMore] = useState<boolean>(false);
  const [feedOffset, setFeedOffset] = useState<number>(0);
  const [feedCategory, setFeedCategory] = useState<FeedCategory>('ALL');
  const [feedAgencyId, setFeedAgencyId] = useState<string>('');
  const [feedRange, setFeedRange] = useState<'today' | '7d' | '30d' | 'all'>('all');
  const [loadingMoreFeed, setLoadingMoreFeed] = useState<boolean>(false);

  // Global search & filter state
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [peopleTab, setPeopleTab] = useState<'USERS' | 'TECHNICIANS'>('USERS');
  const [peopleRoleFilter, setPeopleRoleFilter] = useState<string>('ALL');
  const [peopleAgencyFilter, setPeopleAgencyFilter] = useState<string>('ALL');
  const [peopleSearch, setPeopleSearch] = useState<string>('');

  const [workTab, setWorkTab] = useState<'INSPECTIONS' | 'REPORTS' | 'WORK_ORDERS' | 'CORRECTIVE_ACTIONS'>('INSPECTIONS');
  const [woStatusFilter, setWoStatusFilter] = useState<string>('ALL');
  const [woAgencyFilter, setWoAgencyFilter] = useState<string>('ALL');
  const [woAgeFilter, setWoAgeFilter] = useState<string>('ALL');

  // Loading & error banner states
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  // Subscription Edit Modal state
  const [editingAgency, setEditingAgency] = useState<any | null>(null);
  const [editPlan, setEditPlan] = useState<string>('FOUNDING_MONTHLY');
  const [editMonthlyPrice, setEditMonthlyPrice] = useState<string>('3999');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [editExpiresAt, setEditExpiresAt] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingSubscription, setSavingSubscription] = useState<boolean>(false);

  // Owner Login ID & Password Edit Modal state
  const [activeOwnerLoginId, setActiveOwnerLoginId] = useState<string>(ownerEmail);
  const [isCredModalOpen, setIsCredModalOpen] = useState<boolean>(false);
  const [newOwnerLoginId, setNewOwnerLoginId] = useState<string>(ownerEmail);
  const [currentOwnerPassword, setCurrentOwnerPassword] = useState<string>('');
  const [newOwnerPassword, setNewOwnerPassword] = useState<string>('');
  const [confirmOwnerPassword, setConfirmOwnerPassword] = useState<string>('');
  const [showOwnerPasswords, setShowOwnerPasswords] = useState<boolean>(false);
  const [savingOwnerCreds, setSavingOwnerCreds] = useState<boolean>(false);
  const [ownerCredError, setOwnerCredError] = useState<string | null>(null);

  const knownEventIdsRef = useRef<Set<string>>(new Set());

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Rely on server cookies if getSession fails
    }
    return headers;
  }, [supabase]);

  const fetchActivityFeed = useCallback(
    async (opts?: {
      offset?: number;
      append?: boolean;
      prependOnly?: boolean;
      category?: FeedCategory;
      agencyId?: string;
      range?: string;
      q?: string;
    }) => {
      const targetOffset = opts?.offset ?? 0;
      const cat = opts?.category ?? feedCategory;
      const agId = opts?.agencyId ?? feedAgencyId;
      const rng = opts?.range ?? feedRange;
      const q = opts?.q ?? globalSearch;

      const params = new URLSearchParams();
      params.set('limit', '50');
      params.set('offset', String(targetOffset));
      if (cat && cat !== 'ALL') params.set('type', cat);
      if (agId) params.set('agencyId', agId);
      if (rng) params.set('range', rng);
      if (q.trim()) params.set('q', q.trim());

      const headers = await getAuthHeaders();
      const res = await fetch(`/api/owner/activity?${params.toString()}`, {
        headers,
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`Failed to load activity feed (HTTP ${res.status})`);
      }
      const data = await res.json();
      const incoming: any[] = Array.isArray(data.events) ? data.events : [];

      if (opts?.append) {
        setFeedEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const uniqueIncoming = incoming.filter((e) => !existingIds.has(e.id));
          return [...prev, ...uniqueIncoming];
        });
      } else if (opts?.prependOnly) {
        setFeedEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const brandNew = incoming.filter((e) => !existingIds.has(e.id));
          if (brandNew.length === 0) return prev;
          return [...brandNew, ...prev];
        });
      } else {
        setFeedEvents(incoming);
      }

      for (const ev of incoming) {
        knownEventIdsRef.current.add(ev.id);
      }

      setFeedTotal(typeof data.totalMatching === 'number' ? data.totalMatching : incoming.length);
      setFeedHasMore(Boolean(data.hasMore));
      setFeedOffset(targetOffset);
    },
    [feedCategory, feedAgencyId, feedRange, globalSearch, getAuthHeaders]
  );

  const fetchAllConsoleData = useCallback(
    async (options?: { forceFresh?: boolean; isPolling?: boolean }) => {
      try {
        if (!options?.isPolling) {
          setRefreshing(true);
        }
        setLoadError(null);

        const headers = await getAuthHeaders();
        const statsUrl = options?.forceFresh ? '/api/owner/stats?fresh=1' : '/api/owner/stats';
        const wsParams = new URLSearchParams();
        if (globalSearch.trim().length >= 2) {
          wsParams.set('q', globalSearch.trim());
        }

        const [statsRes, agenciesRes, wsRes] = await Promise.all([
          fetch(statsUrl, { headers, cache: 'no-store' }),
          fetch('/api/owner/agencies', { headers, cache: 'no-store' }),
          fetch(`/api/owner/workspace?${wsParams.toString()}`, { headers, cache: 'no-store' }),
        ]);

        if (!statsRes.ok || !agenciesRes.ok || !wsRes.ok) {
          throw new Error(
            `Console sync returned HTTP ${statsRes.status}/${agenciesRes.status}/${wsRes.status}`
          );
        }

        const [statsJson, agenciesJson, wsJson] = await Promise.all([
          statsRes.json(),
          agenciesRes.json(),
          wsRes.json(),
        ]);

        setStatsData(statsJson);
        setAgencies(Array.isArray(agenciesJson.agencies) ? agenciesJson.agencies : []);
        setWorkspaceData(wsJson);

        await fetchActivityFeed({
          offset: 0,
          prependOnly: Boolean(options?.isPolling && feedOffset > 0),
        });

        setLastRefreshedAt(new Date().toISOString());
      } catch (err: any) {
        const msg = err?.message || 'Failed to load Owner Control Console data';
        setLoadError(msg);
        if (!options?.isPolling) {
          toast.error(msg);
        }
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [getAuthHeaders, globalSearch, fetchActivityFeed, feedOffset]
  );

  // Initial load
  useEffect(() => {
    fetchAllConsoleData();
  }, [fetchAllConsoleData]);

  // Re-fetch activity feed when filters change
  useEffect(() => {
    if (initialLoading) return;
    fetchActivityFeed({ offset: 0 }).catch((err: any) => {
      toast.error(err?.message || 'Failed to filter activity feed');
    });
  }, [feedCategory, feedAgencyId, feedRange, globalSearch, initialLoading, fetchActivityFeed]);

  // 30-second client polling (Section 2A)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllConsoleData({ isPolling: true });
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchAllConsoleData]);

  const handleLoadMoreFeed = async () => {
    if (loadingMoreFeed || !feedHasMore) return;
    setLoadingMoreFeed(true);
    try {
      const nextOffset = feedOffset + 50;
      await fetchActivityFeed({ offset: nextOffset, append: true });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load more activity events');
    } finally {
      setLoadingMoreFeed(false);
    }
  };

  const openEditModal = (agency: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAgency(agency);
    setEditPlan(agency.plan || 'FOUNDING_MONTHLY');
    setEditMonthlyPrice(String(agency.monthlyPrice ?? 3999));
    setEditStatus(agency.subscriptionStatus || 'ACTIVE');
    setEditExpiresAt(
      agency.subscriptionExpiresAt ? agency.subscriptionExpiresAt.slice(0, 10) : ''
    );
    setEditNotes(agency.subscriptionNotes || '');
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgency) return;

    setSavingSubscription(true);
    const snapshotAgencies = [...agencies];
    const parsedPrice = Math.max(0, Math.round(Number(editMonthlyPrice) || 0));

    // Optimistic update
    setAgencies((prev) =>
      prev.map((a) =>
        a.id === editingAgency.id
          ? {
              ...a,
              plan: editPlan,
              monthlyPrice: parsedPrice,
              mrrInr: editStatus === 'ACTIVE' ? parsedPrice : 0,
              subscriptionStatus: editStatus,
              subscriptionExpiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
              subscriptionNotes: editNotes.trim() || null,
            }
          : a
      )
    );

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/owner/agencies', {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyId: editingAgency.id,
          plan: editPlan,
          monthlyPrice: parsedPrice,
          status: editStatus,
          expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
          notes: editNotes.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Failed to update subscription (HTTP ${res.status})`);
      }

      toast.success(
        `Updated ${editingAgency.name} subscription to ${editPlan} (${formatInr(parsedPrice)}/mo · ${editStatus})`
      );

      if (data.activityEvent) {
        setFeedEvents((prev) => [data.activityEvent, ...prev]);
        setFeedTotal((t) => t + 1);
      }

      setEditingAgency(null);
      await fetchAllConsoleData({ forceFresh: true });
    } catch (err: any) {
      setAgencies(snapshotAgencies);
      toast.error(err?.message || 'Failed to update agency subscription');
    } finally {
      setSavingSubscription(false);
    }
  };

  const openCredentialsModal = async () => {
    setOwnerCredError(null);
    setCurrentOwnerPassword('');
    setNewOwnerPassword('');
    setConfirmOwnerPassword('');
    setNewOwnerLoginId(activeOwnerLoginId);
    setIsCredModalOpen(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/owner/credentials', { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.loginId) {
          setActiveOwnerLoginId(data.loginId);
          setNewOwnerLoginId(data.loginId);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Could not load current Owner Login ID');
    }
  };

  const handleSaveOwnerCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerCredError(null);

    if (!currentOwnerPassword) {
      const msg = 'Please enter your current Owner password.';
      setOwnerCredError(msg);
      toast.error(msg);
      return;
    }

    if (!newOwnerLoginId.trim() || newOwnerLoginId.trim().length < 3) {
      const msg = 'Login ID must be at least 3 characters.';
      setOwnerCredError(msg);
      toast.error(msg);
      return;
    }

    if (newOwnerPassword && newOwnerPassword.length < 6) {
      const msg = 'New password must be at least 6 characters.';
      setOwnerCredError(msg);
      toast.error(msg);
      return;
    }

    if (newOwnerPassword !== confirmOwnerPassword) {
      const msg = 'New password and Confirm password do not match.';
      setOwnerCredError(msg);
      toast.error(msg);
      return;
    }

    setSavingOwnerCreds(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/owner/credentials', {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: currentOwnerPassword,
          newLoginId: newOwnerLoginId.trim(),
          newPassword: newOwnerPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Failed to update credentials (HTTP ${res.status})`);
      }

      setActiveOwnerLoginId(data.loginId);
      setIsCredModalOpen(false);
      toast.success(
        `Owner Login ID updated to ${data.loginId}${data.passwordChanged ? ' and password changed!' : '!'}`
      );
      await fetchAllConsoleData({ forceFresh: true });
    } catch (err: any) {
      const msg = err?.message || 'Failed to update Owner credentials';
      setOwnerCredError(msg);
      toast.error(msg);
    } finally {
      setSavingOwnerCreds(false);
    }
  };

  const handleOwnerSignOut = async () => {
    try {
      const res = await fetch('/api/owner/auth', { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to sign out of Owner Console');
      }
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore if not signed in via Supabase
      }
      toast.success('Owner Console locked.');
      window.location.href = '/owner';
    } catch (err: any) {
      toast.error(err?.message || 'Error locking Owner Console');
    }
  };

  // Filtered agencies for Global Search
  const filteredAgencies = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return agencies;
    return agencies.filter((a) =>
      `${a.name} ${a.email} ${a.city} ${a.state} ${a.plan} ${a.subscriptionStatus}`
        .toLowerCase()
        .includes(q)
    );
  }, [agencies, globalSearch]);

  // Filtered People (Users & Technicians)
  const filteredUsers = useMemo(() => {
    const list: any[] = workspaceData?.people?.users || [];
    const q = (peopleSearch || globalSearch).trim().toLowerCase();
    return list.filter((u) => {
      if (peopleRoleFilter !== 'ALL' && u.role !== peopleRoleFilter) return false;
      if (peopleAgencyFilter !== 'ALL' && u.agencyId !== peopleAgencyFilter) return false;
      if (q) {
        const hay = `${u.name} ${u.email} ${u.role} ${u.agencyName} ${u.employeeId || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [workspaceData, peopleRoleFilter, peopleAgencyFilter, peopleSearch, globalSearch]);

  const filteredTechnicians = useMemo(() => {
    const list: any[] = workspaceData?.people?.technicians || [];
    const q = (peopleSearch || globalSearch).trim().toLowerCase();
    return list.filter((t) => {
      if (peopleAgencyFilter !== 'ALL' && t.agencyId !== peopleAgencyFilter) return false;
      if (q) {
        const hay = `${t.name} ${t.email} ${t.employeeId || ''} ${t.agencyName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [workspaceData, peopleAgencyFilter, peopleSearch, globalSearch]);

  // Filtered Work Orders (OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED)
  const filteredWorkOrders = useMemo(() => {
    const list: any[] = workspaceData?.work?.workOrders || [];
    const q = globalSearch.trim().toLowerCase();
    return list.filter((wo) => {
      if (woStatusFilter !== 'ALL' && wo.status !== woStatusFilter) return false;
      if (woAgencyFilter !== 'ALL' && wo.agencyId !== woAgencyFilter) return false;
      if (woAgeFilter === 'OVERDUE' && !wo.isOverdue) return false;
      if (woAgeFilter === '7D' && wo.ageDays > 7) return false;
      if (woAgeFilter === '30D' && wo.ageDays > 30) return false;
      if (q) {
        const hay = `${wo.title} ${wo.buildingName} ${wo.agencyName} ${wo.status} ${wo.assignedToName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [workspaceData, woStatusFilter, woAgencyFilter, woAgeFilter, globalSearch]);

  const kpis = statsData?.kpis;
  const health = statsData?.health;
  const revenue = statsData?.revenue;

  const formattedCurrentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col">
      {/* =====================================================================
          A) HEADER
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F0E4D8] shadow-xs">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                V
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-[#1C1917]">
                    VigilAMC Owner Console
                  </h1>
                  <span
                    data-testid="owner-live-indicator"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-extrabold uppercase tracking-wider"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse motion-reduce:animate-none" />
                    LIVE
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#44403C] flex items-center gap-2 flex-wrap">
                  <span>{formattedCurrentDate}</span>
                  <span>•</span>
                  <span>Owner: {activeOwnerLoginId}</span>
                  {lastRefreshedAt && (
                    <>
                      <span>•</span>
                      <span>Synced {formatRelativeTime(lastRefreshedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={openCredentialsModal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] text-[#1C1917] text-xs font-bold shadow-xs cursor-pointer"
                title="Edit Owner Login ID & Password"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Login / Pass</span>
              </button>
              <button
                type="button"
                data-testid="owner-refresh-btn"
                onClick={() => fetchAllConsoleData({ forceFresh: true })}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 md:w-72 lg:w-80">
              <Search className="w-4 h-4 text-[#44403C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                data-testid="owner-global-search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search agencies, users, techs, asset tags, report IDs..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] text-xs font-medium text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:border-[#EA580C] focus:bg-white"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#44403C] hover:text-[#1C1917]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              data-testid="owner-edit-credentials-btn"
              onClick={openCredentialsModal}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF8F2] hover:bg-[#FFF0E5] border border-[#E5D5C5] text-[#1C1917] text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              title="Edit Owner Login ID & Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Edit Login / Password</span>
            </button>

            <button
              type="button"
              onClick={() => fetchAllConsoleData({ forceFresh: true })}
              disabled={refreshing}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
              />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              data-testid="owner-logout-btn"
              onClick={handleOwnerSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FEF2F2] border border-[#E5D5C5] text-[#44403C] hover:text-[#DC2626] text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              title="Lock Owner Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* Error Banner if any network/API failure occurred */}
        {loadError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] flex items-center justify-between gap-3 text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchAllConsoleData({ forceFresh: true })}
              className="px-3 py-1 rounded-lg bg-[#DC2626] text-white font-bold hover:bg-[#B91C1C] cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Global Search Asset/Report Quick Results when searching */}
        {globalSearch.trim().length >= 2 &&
          Array.isArray(workspaceData?.matchedAssets) &&
          workspaceData.matchedAssets.length > 0 && (
            <section className="bg-white rounded-2xl border border-[#E5D5C5] p-4 shadow-xs space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#9A3412]">
                Matched Asset Tags ({workspaceData.matchedAssets.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {workspaceData.matchedAssets.map((asset: any) => (
                  <Link
                    key={asset.id}
                    href={asset.linkUrl}
                    className="p-2.5 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8] hover:border-[#EA580C] flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-extrabold text-[#1C1917]">
                        {asset.assetTag}
                      </div>
                      <div className="text-[11px] text-[#44403C]">
                        {asset.type} • {asset.buildingName} ({asset.agencyName})
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

        {/* =====================================================================
            B) KPI STRIP (10 real-stat cards, 2-col on 375px mobile, 5-col desktop)
           ===================================================================== */}
        <section aria-label="Platform KPI Strip" data-testid="owner-kpi-strip">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {/* KPI 1: Agencies total */}
            <div
              data-testid="kpi-card-agencies"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  1. Agencies Total
                </span>
                <Building2 className="w-4 h-4 text-[#EA580C] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-agencies"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? kpis.agencies.total : '—'}
                  </div>
                  <div className="text-[11px] font-bold text-[#047857] mt-1">
                    +{kpis?.agencies?.addedThisWeek ?? 0} this week
                  </div>
                </div>
                <RealSparkline series={kpis?.agencies?.sparkline7d || []} color="#EA580C" />
              </div>
            </div>

            {/* KPI 2: Active users */}
            <div
              data-testid="kpi-card-active-users"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  2. Active Users
                </span>
                <Users className="w-4 h-4 text-[#EA580C] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-active-users"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? kpis.activeUsers.total : '—'}
                  </div>
                  <div className="text-[11px] font-bold text-[#047857] mt-1">
                    +{kpis?.activeUsers?.addedThisWeek ?? 0} this week
                  </div>
                </div>
                <RealSparkline series={kpis?.activeUsers?.sparkline7d || []} color="#EA580C" />
              </div>
            </div>

            {/* KPI 3: Technicians */}
            <div
              data-testid="kpi-card-technicians"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  3. Technicians
                </span>
                <Wrench className="w-4 h-4 text-[#EA580C] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-technicians"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? `${kpis.technicians.total} / ${kpis.technicians.activeLast7d}` : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#44403C] mt-1">
                    Total / Active last 7d
                  </div>
                </div>
                <RealSparkline series={kpis?.technicians?.sparkline7d || []} color="#059669" />
              </div>
            </div>

            {/* KPI 4: Assets under management */}
            <div
              data-testid="kpi-card-assets"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  4. Assets (AUM)
                </span>
                <ShieldCheck className="w-4 h-4 text-[#EA580C] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-assets"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? kpis.assets.total : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#44403C] mt-1">
                    +{kpis?.assets?.addedThisWeek ?? 0} added 7d
                  </div>
                </div>
                <RealSparkline series={kpis?.assets?.sparkline7d || []} color="#EA580C" />
              </div>
            </div>

            {/* KPI 5: Inspections completed (30d) */}
            <div
              data-testid="kpi-card-inspections"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  5. Inspections (30d)
                </span>
                <ClipboardCheck className="w-4 h-4 text-[#EA580C] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-inspections"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? kpis.inspections.completedLast30d : '—'}
                  </div>
                  <div
                    className={`text-[11px] font-bold mt-1 ${
                      (kpis?.inspections?.delta ?? 0) >= 0 ? 'text-[#047857]' : 'text-[#B45309]'
                    }`}
                  >
                    {(kpis?.inspections?.delta ?? 0) >= 0 ? '+' : ''}
                    {kpis?.inspections?.delta ?? 0} vs prev 30d
                  </div>
                </div>
                <RealSparkline series={kpis?.inspections?.sparkline7d || []} color="#059669" />
              </div>
            </div>

            {/* KPI 6: Reports generated (30d) */}
            <div
              data-testid="kpi-card-reports"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  6. Reports (30d)
                </span>
                <FileText className="w-4 h-4 text-[#EA580C] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-reports"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? kpis.reports.generatedLast30d : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#44403C] mt-1">
                    {kpis?.reports?.totalAllTime ?? 0} total generated
                  </div>
                </div>
                <RealSparkline series={kpis?.reports?.sparkline7d || []} color="#EA580C" />
              </div>
            </div>

            {/* KPI 7: Work orders */}
            <div
              data-testid="kpi-card-work-orders"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  7. Work Orders
                </span>
                <Briefcase className="w-4 h-4 text-[#EA580C] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-work-orders"
                    className="text-xl sm:text-2xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis
                      ? `${kpis.workOrders.open + kpis.workOrders.assigned} / ${kpis.workOrders.inProgress} / ${kpis.workOrders.completedThisMonth}`
                      : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#44403C] mt-1">
                    Open / In-Prog / Done (Mo)
                  </div>
                </div>
                <RealSparkline series={kpis?.workOrders?.sparkline7d || []} color="#D97706" />
              </div>
            </div>

            {/* KPI 8: MRR estimate */}
            <div
              data-testid="kpi-card-mrr"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  8. MRR Estimate
                </span>
                <IndianRupee className="w-4 h-4 text-[#059669] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-mrr"
                    className="text-xl sm:text-2xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? formatInr(kpis.mrr.estimateInr) : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#44403C] mt-1">
                    {kpis?.mrr?.activePlansCount ?? 0} active plans
                  </div>
                </div>
                <RealSparkline series={kpis?.mrr?.sparkline7d || []} color="#059669" />
              </div>
            </div>

            {/* KPI 9: Renewals due (30d) */}
            <div
              data-testid="kpi-card-renewals"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  9. Renewals (30d)
                </span>
                <CalendarClock className="w-4 h-4 text-[#D97706] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-renewals"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? kpis.renewalsDue.dueNext30d : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#B45309] mt-1">
                    Expiring in ≤ 30 days
                  </div>
                </div>
                <RealSparkline series={kpis?.renewalsDue?.sparkline7d || []} color="#D97706" />
              </div>
            </div>

            {/* KPI 10: Sync health */}
            <div
              data-testid="kpi-card-sync"
              className="bg-white rounded-2xl border border-[#E5D5C5] p-3.5 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                  10. Sync Health
                </span>
                <CloudCog className="w-4 h-4 text-[#059669] shrink-0" />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div
                    data-testid="kpi-value-sync"
                    className="text-2xl sm:text-3xl font-black text-[#1C1917] leading-none"
                  >
                    {kpis ? `${kpis.syncHealth.pendingOutboxCount} pending` : '—'}
                  </div>
                  <div className="text-[11px] font-semibold text-[#44403C] mt-1 truncate max-w-[130px]">
                    Last: {formatRelativeTime(kpis?.syncHealth?.lastSuccessfulSyncAt)}
                  </div>
                </div>
                <RealSparkline series={kpis?.syncHealth?.sparkline7d || []} color="#059669" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            C) LIVE ACTIVITY FEED — the headline feature ("see all updates")
           ===================================================================== */}
        <section
          aria-label="Live Platform Activity Feed"
          data-testid="owner-activity-feed"
          className="bg-white rounded-2xl border border-[#E5D5C5] shadow-xs overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-[#F0E4D8] space-y-3 bg-[#FFF8F2]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-black text-[#1C1917] tracking-tight">
                  Live Platform Activity Feed
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[#9A3412] text-[11px] font-extrabold">
                  {feedTotal} events
                </span>
              </div>

              {/* Agency & Date Range Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  aria-label="Filter feed by agency"
                  data-testid="owner-feed-agency-filter"
                  value={feedAgencyId}
                  onChange={(e) => setFeedAgencyId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5C5] text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="">All Agencies ({agencies.length})</option>
                  {agencies.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}
                    </option>
                  ))}
                </select>

                <div className="inline-flex rounded-xl border border-[#E5D5C5] bg-white p-0.5">
                  {(
                    [
                      { id: 'today', label: 'Today' },
                      { id: '7d', label: '7 days' },
                      { id: '30d', label: '30 days' },
                      { id: 'all', label: 'All' },
                    ] as const
                  ).map((rng) => (
                    <button
                      key={rng.id}
                      type="button"
                      data-testid={`owner-feed-range-${rng.id}`}
                      onClick={() => setFeedRange(rng.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        feedRange === rng.id
                          ? 'bg-[#EA580C] text-white'
                          : 'text-[#44403C] hover:text-[#1C1917]'
                      }`}
                    >
                      {rng.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { id: 'ALL', label: 'All Updates' },
                  { id: 'INSPECTION', label: 'Inspections' },
                  { id: 'REPORT', label: 'Reports' },
                  { id: 'WORK_ORDER', label: 'Work Orders' },
                  { id: 'CORRECTIVE_ACTION', label: 'Corrective Actions' },
                  { id: 'AGENCY', label: 'Agencies' },
                  { id: 'USER', label: 'Users & Sign-Ins' },
                  { id: 'TECHNICIAN', label: 'Technicians & Sync' },
                  { id: 'PORTAL', label: 'Client Portal' },
                  { id: 'SUBSCRIPTION', label: 'Subscriptions' },
                ] as { id: FeedCategory; label: string }[]
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  data-testid={`feed-chip-${chip.id}`}
                  onClick={() => setFeedCategory(chip.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-colors cursor-pointer ${
                    feedCategory === chip.id
                      ? 'bg-[#1C1917] text-white border-[#1C1917]'
                      : 'bg-white text-[#44403C] border-[#E5D5C5] hover:border-[#EA580C] hover:text-[#1C1917]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Rows */}
          <div className="divide-y divide-[#F0E4D8] max-h-[540px] overflow-y-auto">
            {feedEvents.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-[#44403C]">
                {initialLoading
                  ? 'Loading live platform activity feed...'
                  : 'No platform events match the selected filters.'}
              </div>
            ) : (
              feedEvents.map((ev) => (
                <div
                  key={ev.id}
                  data-testid="owner-feed-row"
                  className="px-4 py-3 hover:bg-[#FFF8F2]/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="mt-0.5 w-7 h-7 rounded-lg bg-[#FFF0E6] border border-[#FED7AA] text-[#C2410C] flex items-center justify-center font-extrabold text-[10px] shrink-0">
                      {ev.category.slice(0, 3)}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-[#1C1917] leading-snug break-words">
                        {ev.sentence}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#FFF0E6] border border-[#FED7AA] text-[#9A3412] text-[11px] font-bold">
                          {ev.agencyName}
                        </span>
                        {ev.statusBadge && (
                          <StatusToneChip
                            label={ev.statusBadge.label}
                            tone={ev.statusBadge.tone}
                          />
                        )}
                        <span
                          className="text-[11px] font-semibold text-[#44403C]"
                          title={ev.timestamp}
                        >
                          {formatRelativeTime(ev.timestamp)} • {formatShortDate(ev.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end shrink-0 pl-10 sm:pl-0">
                    <Link
                      href={ev.linkUrl}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF8F2] hover:bg-[#FFF0E6] border border-[#E5D5C5] text-[#C2410C] font-bold text-[11px] transition-colors"
                    >
                      <span>{ev.linkLabel || 'Open'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Pagination (50 per page) */}
          <div className="px-4 py-3 bg-[#FFF8F2] border-t border-[#F0E4D8] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#44403C]">
              Showing {feedEvents.length} of {feedTotal} events
            </span>
            {feedHasMore && (
              <button
                type="button"
                data-testid="owner-feed-load-more"
                onClick={handleLoadMoreFeed}
                disabled={loadingMoreFeed}
                className="px-4 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {loadingMoreFeed ? 'Loading...' : 'Load more (50)'}
              </button>
            )}
          </div>
        </section>

        {/* =====================================================================
            D) AGENCIES TABLE + SUBSCRIPTION EDITING + DRILL-DOWN LINKS
           ===================================================================== */}
        <section
          aria-label="Agencies Directory and Subscriptions"
          data-testid="owner-agencies-section"
          className="bg-white rounded-2xl border border-[#E5D5C5] shadow-xs overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-[#F0E4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FFF8F2]/60">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#EA580C]" />
              <h2 className="text-sm sm:text-base font-black text-[#1C1917] tracking-tight">
                Agencies &amp; Subscription Control ({filteredAgencies.length})
              </h2>
            </div>
            <p className="text-xs font-semibold text-[#44403C]">
              Click any agency row for full drill-down or click &ldquo;Edit Plan&rdquo; to update subscription status &amp; MRR.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FFF8F2] border-b border-[#E5D5C5] text-[#44403C] font-extrabold uppercase text-[11px]">
                  <th className="py-3 px-3.5">Agency Name</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3 text-right">MRR</th>
                  <th className="py-3 px-2.5 text-right">Buildings</th>
                  <th className="py-3 px-2.5 text-right">Users</th>
                  <th className="py-3 px-2.5 text-right">Techs</th>
                  <th className="py-3 px-3 text-right">Insp (30d)</th>
                  <th className="py-3 px-3">Expires On</th>
                  <th className="py-3 px-3">Created On</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E4D8]">
                {filteredAgencies.map((ag) => {
                  const tone = getAgencyStatusTone(
                    ag.subscriptionStatus,
                    ag.subscriptionExpiresAt
                  );
                  return (
                    <tr
                      key={ag.id}
                      data-testid={`agency-row-${ag.id}`}
                      className="hover:bg-[#FFF8F2]/90 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-bold text-[#1C1917]">
                        <Link
                          href={`/owner/agencies/${ag.id}`}
                          className="hover:text-[#EA580C] inline-flex items-center gap-1"
                        >
                          <span>{ag.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#EA580C]" />
                        </Link>
                        <div className="text-[11px] font-medium text-[#44403C]">
                          {ag.email || 'No email'} {ag.city ? `• ${ag.city}` : ''}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusToneChip label={ag.subscriptionStatus || 'ACTIVE'} tone={tone} />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1C1917]">
                        {ag.plan || 'FOUNDING_MONTHLY'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-[#1C1917]">
                        {formatInr(ag.monthlyPrice)}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-bold text-[#1C1917]">
                        {ag.buildingsCount}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-bold text-[#1C1917]">
                        {ag.usersCount}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-bold text-[#1C1917]">
                        {ag.techniciansCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#047857]">
                        {ag.inspections30dCount}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {formatShortDate(ag.subscriptionExpiresAt)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {formatShortDate(ag.createdAt)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            data-testid={`edit-agency-plan-${ag.id}`}
                            onClick={(e) => openEditModal(ag, e)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF0E6] hover:bg-[#FED7AA]/60 border border-[#FED7AA] text-[#9A3412] font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Plan</span>
                          </button>
                          <Link
                            href={`/owner/agencies/${ag.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFF8F2] border border-[#E5D5C5] text-[#1C1917] font-bold text-[11px]"
                          >
                            <span>Drill-down</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================================
            E) PEOPLE (All Users + All Technicians across all agencies)
           ===================================================================== */}
        <section
          aria-label="Cross-Platform People Directory"
          data-testid="owner-people-section"
          className="bg-white rounded-2xl border border-[#E5D5C5] shadow-xs overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-[#F0E4D8] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FFF8F2]/60">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-black text-[#1C1917] tracking-tight">
                  People Across All Agencies
                </h2>
              </div>

              <div className="inline-flex rounded-xl border border-[#E5D5C5] bg-white p-0.5">
                <button
                  type="button"
                  data-testid="people-tab-users"
                  onClick={() => setPeopleTab('USERS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    peopleTab === 'USERS'
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#44403C] hover:text-[#1C1917]'
                  }`}
                >
                  All Users ({filteredUsers.length})
                </button>
                <button
                  type="button"
                  data-testid="people-tab-technicians"
                  onClick={() => setPeopleTab('TECHNICIANS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    peopleTab === 'TECHNICIANS'
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#44403C] hover:text-[#1C1917]'
                  }`}
                >
                  All Technicians ({filteredTechnicians.length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="search"
                value={peopleSearch}
                onChange={(e) => setPeopleSearch(e.target.value)}
                placeholder="Filter by name, email, staff ID..."
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E5D5C5] text-xs font-medium text-[#1C1917] placeholder:text-[#57534E]"
              />
              {peopleTab === 'USERS' && (
                <select
                  aria-label="Filter users by role"
                  value={peopleRoleFilter}
                  onChange={(e) => setPeopleRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5C5] text-xs font-semibold text-[#1C1917]"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ORG_ADMIN">ORG_ADMIN</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              )}
              <select
                aria-label="Filter people by agency"
                value={peopleAgencyFilter}
                onChange={(e) => setPeopleAgencyFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5C5] text-xs font-semibold text-[#1C1917]"
              >
                <option value="ALL">All Agencies</option>
                {agencies.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {peopleTab === 'USERS' ? (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#FFF8F2] border-b border-[#E5D5C5] text-[#44403C] font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3">Last Login</th>
                    <th className="py-2.5 px-3.5">Created On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FFF8F2]/80">
                      <td className="py-2.5 px-3.5 font-bold text-[#1C1917]">
                        {u.name}
                        {u.employeeId && (
                          <span className="ml-1.5 font-mono text-[11px] text-[#9A3412]">
                            ({u.employeeId})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#44403C]">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <StatusToneChip
                          label={u.role}
                          tone={u.status === 'ACTIVE' ? 'OK' : 'EXPIRED'}
                        />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">
                        {u.agencyId ? (
                          <Link
                            href={`/owner/agencies/${u.agencyId}`}
                            className="hover:text-[#EA580C] underline decoration-[#FED7AA]"
                          >
                            {u.agencyName}
                          </Link>
                        ) : (
                          u.agencyName
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {u.lastLoginAt
                          ? `${formatRelativeTime(u.lastLoginAt)} (${formatShortDate(u.lastLoginAt)})`
                          : 'Never recorded'}
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-[#44403C]">
                        {formatShortDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#FFF8F2] border-b border-[#E5D5C5] text-[#44403C] font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Technician</th>
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3">Last Active</th>
                    <th className="py-2.5 px-3">Devices / Sync Status</th>
                    <th className="py-2.5 px-3.5 text-right">Total Inspections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {filteredTechnicians.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FFF8F2]/80">
                      <td className="py-2.5 px-3.5 font-bold text-[#1C1917]">
                        <div>{t.name}</div>
                        <div className="text-[11px] font-mono text-[#44403C]">
                          {t.employeeId || t.email}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">
                        {t.agencyId ? (
                          <Link
                            href={`/owner/agencies/${t.agencyId}`}
                            className="hover:text-[#EA580C] underline decoration-[#FED7AA]"
                          >
                            {t.agencyName}
                          </Link>
                        ) : (
                          t.agencyName
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {t.lastActiveAt
                          ? `${formatRelativeTime(t.lastActiveAt)} (${formatShortDate(t.lastActiveAt)})`
                          : 'No activity yet'}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusToneChip
                            label={
                              t.failedSyncCount > 0
                                ? `${t.failedSyncCount} Failed`
                                : t.pendingOutboxCount > 0
                                ? `${t.pendingOutboxCount} Pending Outbox`
                                : 'Outbox Clear (0)'
                            }
                            tone={
                              t.failedSyncCount > 0
                                ? 'EXPIRED'
                                : t.pendingOutboxCount > 0
                                ? 'DUE_SOON'
                                : 'OK'
                            }
                          />
                          <span className="text-[11px] font-semibold text-[#44403C]">
                            {t.devicesCount} device{t.devicesCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-extrabold text-[#1C1917]">
                        {t.totalInspections}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================================
            F) WORK (Cross-Platform Operational View: Inspections, Reports, Work Orders)
           ===================================================================== */}
        <section
          aria-label="Cross-Platform Work Operations"
          data-testid="owner-work-section"
          className="bg-white rounded-2xl border border-[#E5D5C5] shadow-xs overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-[#F0E4D8] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#FFF8F2]/60">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#EA580C]" />
                <h2 className="text-sm sm:text-base font-black text-[#1C1917] tracking-tight">
                  Cross-Platform Work &amp; Compliance Operations
                </h2>
              </div>

              <div className="inline-flex rounded-xl border border-[#E5D5C5] bg-white p-0.5 flex-wrap">
                <button
                  type="button"
                  data-testid="work-tab-inspections"
                  onClick={() => setWorkTab('INSPECTIONS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    workTab === 'INSPECTIONS'
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#44403C] hover:text-[#1C1917]'
                  }`}
                >
                  Recent Inspections ({workspaceData?.work?.inspections?.length || 0})
                </button>
                <button
                  type="button"
                  data-testid="work-tab-reports"
                  onClick={() => setWorkTab('REPORTS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    workTab === 'REPORTS'
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#44403C] hover:text-[#1C1917]'
                  }`}
                >
                  Recent Reports ({workspaceData?.work?.reports?.length || 0})
                </button>
                <button
                  type="button"
                  data-testid="work-tab-work-orders"
                  onClick={() => setWorkTab('WORK_ORDERS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    workTab === 'WORK_ORDERS'
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#44403C] hover:text-[#1C1917]'
                  }`}
                >
                  Work Orders ({filteredWorkOrders.length})
                </button>
                <button
                  type="button"
                  data-testid="work-tab-corrective-actions"
                  onClick={() => setWorkTab('CORRECTIVE_ACTIONS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    workTab === 'CORRECTIVE_ACTIONS'
                      ? 'bg-[#EA580C] text-white'
                      : 'text-[#44403C] hover:text-[#1C1917]'
                  }`}
                >
                  Corrective Actions ({workspaceData?.work?.correctiveActions?.length || 0})
                </button>
              </div>
            </div>

            {workTab === 'WORK_ORDERS' && (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  aria-label="Filter work orders by status"
                  data-testid="wo-status-filter"
                  value={woStatusFilter}
                  onChange={(e) => setWoStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5C5] text-xs font-semibold text-[#1C1917]"
                >
                  <option value="ALL">All 5 Statuses</option>
                  <option value="OPEN">OPEN</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <select
                  aria-label="Filter work orders by age"
                  value={woAgeFilter}
                  onChange={(e) => setWoAgeFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5C5] text-xs font-semibold text-[#1C1917]"
                >
                  <option value="ALL">All Ages</option>
                  <option value="OVERDUE">Overdue Only</option>
                  <option value="7D">Created ≤ 7d</option>
                  <option value="30D">Created ≤ 30d</option>
                </select>

                <select
                  aria-label="Filter work orders by agency"
                  value={woAgencyFilter}
                  onChange={(e) => setWoAgencyFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5C5] text-xs font-semibold text-[#1C1917]"
                >
                  <option value="ALL">All Agencies</option>
                  {agencies.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {workTab === 'INSPECTIONS' && (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#FFF8F2] border-b border-[#E5D5C5] text-[#44403C] font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Building</th>
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3">Technician &amp; Asset</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Building Assets</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3.5 text-right">Report Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {(workspaceData?.work?.inspections || []).map((insp: any) => (
                    <tr key={insp.id} className="hover:bg-[#FFF8F2]/80">
                      <td className="py-2.5 px-3.5 font-bold text-[#1C1917]">
                        {insp.buildingName}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#44403C]">
                        {insp.agencyName}
                      </td>
                      <td className="py-2.5 px-3 text-[#1C1917]">
                        <span className="font-semibold">{insp.technicianName}</span>
                        <span className="text-[#44403C] font-mono ml-1.5">
                          ({insp.assetTag})
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusToneChip
                          label={insp.status}
                          tone={
                            insp.status === 'PASSED' || insp.status === 'VERIFIED'
                              ? 'OK'
                              : insp.status === 'FAILED' ||
                                insp.status === 'SERVICE_REQUIRED' ||
                                insp.status === 'REPLACEMENT_REQUIRED'
                              ? 'EXPIRED'
                              : 'DUE_SOON'
                          }
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1C1917]">
                        {insp.assetsCount}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {formatRelativeTime(insp.createdAt)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link
                          href={insp.linkUrl}
                          className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline"
                        >
                          <span>View Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {workTab === 'REPORTS' && (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#FFF8F2] border-b border-[#E5D5C5] text-[#44403C] font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Report Ref</th>
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3">Building</th>
                    <th className="py-2.5 px-3">Generated On</th>
                    <th className="py-2.5 px-3">Acknowledged?</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {(workspaceData?.work?.reports || []).map((rpt: any) => (
                    <tr key={rpt.id} className="hover:bg-[#FFF8F2]/80">
                      <td className="py-2.5 px-3.5 font-mono font-bold text-[#1C1917]">
                        {rpt.reportRef}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1C1917]">
                        {rpt.agencyName}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {rpt.buildingName} ({rpt.assetsCount} assets)
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {formatShortDate(rpt.generatedAt)} ({formatRelativeTime(rpt.generatedAt)})
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusToneChip
                          label={rpt.acknowledged ? 'ACKNOWLEDGED' : 'PENDING ACK'}
                          tone={rpt.acknowledged ? 'OK' : 'DUE_SOON'}
                        />
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link
                          href={rpt.linkUrl}
                          className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline"
                        >
                          <span>Open Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {workTab === 'WORK_ORDERS' && (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#FFF8F2] border-b border-[#E5D5C5] text-[#44403C] font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Work Order</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Age</th>
                    <th className="py-2.5 px-3">Agency &amp; Building</th>
                    <th className="py-2.5 px-3">Assigned To</th>
                    <th className="py-2.5 px-3.5 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {filteredWorkOrders.map((wo: any) => (
                    <tr key={wo.id} className="hover:bg-[#FFF8F2]/80">
                      <td className="py-2.5 px-3.5 font-bold text-[#1C1917]">
                        <div>{wo.title}</div>
                        {wo.isAutoScheduled && (
                          <span className="text-[10px] font-extrabold uppercase text-[#9A3412]">
                            Auto-Scheduler
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusToneChip
                          label={wo.status}
                          tone={
                            wo.status === 'COMPLETED'
                              ? 'OK'
                              : wo.isOverdue
                              ? 'EXPIRED'
                              : 'DUE_SOON'
                          }
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#44403C]">
                        {wo.ageDays}d {wo.isOverdue ? '(OVERDUE)' : ''}
                      </td>
                      <td className="py-2.5 px-3 text-[#1C1917]">
                        <div className="font-semibold">{wo.agencyName}</div>
                        <div className="text-[11px] text-[#44403C]">{wo.buildingName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#44403C]">
                        {wo.assignedToName}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link
                          href={wo.linkUrl}
                          className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline"
                        >
                          <span>View Building</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {workTab === 'CORRECTIVE_ACTIONS' && (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-[#FFF8F2] border-b border-[#E5D5C5] text-[#44403C] font-extrabold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Finding / Corrective Action</th>
                    <th className="py-2.5 px-3">Status &amp; Urgency</th>
                    <th className="py-2.5 px-3">Age</th>
                    <th className="py-2.5 px-3">Agency &amp; Building</th>
                    <th className="py-2.5 px-3.5 text-right">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D8]">
                  {(workspaceData?.work?.correctiveActions || []).map((ca: any) => (
                    <tr key={ca.id} className="hover:bg-[#FFF8F2]/80">
                      <td className="py-2.5 px-3.5 font-bold text-[#1C1917]">
                        {ca.title}{' '}
                        {ca.assetRef && (
                          <span className="font-mono text-[11px] text-[#9A3412]">
                            ({ca.assetRef})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusToneChip
                          label={
                            ca.isOverdue
                              ? `OVERDUE • ${ca.status}`
                              : ca.isDueSoon
                              ? `DUE SOON • ${ca.status}`
                              : ca.status
                          }
                          tone={
                            ca.status === 'VERIFIED' || ca.status === 'CLOSED'
                              ? 'OK'
                              : ca.isOverdue || ca.severity === 'HIGH'
                              ? 'EXPIRED'
                              : 'DUE_SOON'
                          }
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#44403C]">
                        {ca.ageDays}d
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#1C1917]">{ca.agencyName}</div>
                        <div className="text-[11px] text-[#44403C]">{ca.buildingName}</div>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link
                          href={ca.linkUrl}
                          className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline"
                        >
                          <span>View Report</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =====================================================================
            H) REVENUE SECTION (MRR, ARR, Renewals Due 30d, Recent Plan Changes)
           ===================================================================== */}
        <section
          aria-label="Platform Revenue Tracking"
          data-testid="owner-revenue-section"
          className="bg-white rounded-2xl border border-[#E5D5C5] p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#059669]" />
              <h2 className="text-sm sm:text-base font-black text-[#1C1917] tracking-tight">
                Revenue &amp; Subscription Renewals
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#44403C]">
              Derived live from Agency subscription fields
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                Current Monthly Recurring Revenue (MRR)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1C1917] mt-1">
                {formatInr(revenue?.currentMrrInr)}
              </div>
              <div className="text-xs font-semibold text-[#047857] mt-1">
                {revenue?.activeAgenciesCount ?? 0} ACTIVE • {revenue?.trialAgenciesCount ?? 0} TRIAL •{' '}
                {revenue?.expiredAgenciesCount ?? 0} EXPIRED
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                Annual Run-Rate (ARR = MRR × 12)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#1C1917] mt-1">
                {formatInr(revenue?.annualRunRateInr)}
              </div>
              <div className="text-xs font-semibold text-[#44403C] mt-1">
                Projected 12-month subscription run-rate
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8F2] border border-[#F0E4D8]">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#44403C]">
                Renewals Due in Next 30 Days
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#B45309] mt-1">
                {revenue?.renewalsDue30d?.length ?? 0} Agencies
              </div>
              <div className="text-xs font-semibold text-[#44403C] mt-1">
                Total value:{' '}
                {formatInr(
                  (revenue?.renewalsDue30d || []).reduce(
                    (s: number, r: any) => s + (r.monthlyPrice || 0),
                    0
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Renewals due in 30 days list */}
            <div className="rounded-xl border border-[#F0E4D8] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-[#FFF8F2] border-b border-[#F0E4D8] text-xs font-extrabold text-[#1C1917]">
                Renewals Due in 30 Days ({revenue?.renewalsDue30d?.length ?? 0})
              </div>
              <div className="divide-y divide-[#F0E4D8] max-h-56 overflow-y-auto">
                {(revenue?.renewalsDue30d || []).length === 0 ? (
                  <div className="p-4 text-xs font-semibold text-[#44403C]">
                    No subscriptions expiring within the next 30 days.
                  </div>
                ) : (
                  (revenue?.renewalsDue30d || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <Link
                          href={`/owner/agencies/${item.id}`}
                          className="font-bold text-[#1C1917] hover:text-[#EA580C]"
                        >
                          {item.name}
                        </Link>
                        <div className="text-[11px] font-medium text-[#44403C]">
                          {item.plan} • Expires {formatShortDate(item.subscriptionExpiresAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-[#1C1917]">
                          {formatInr(item.monthlyPrice)}
                        </span>
                        <StatusToneChip label="DUE SOON" tone="DUE_SOON" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Plan Changes list */}
            <div className="rounded-xl border border-[#F0E4D8] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-[#FFF8F2] border-b border-[#F0E4D8] text-xs font-extrabold text-[#1C1917]">
                Recent Plan Changes ({revenue?.recentPlanChanges?.length ?? 0})
              </div>
              <div className="divide-y divide-[#F0E4D8] max-h-56 overflow-y-auto">
                {(revenue?.recentPlanChanges || []).length === 0 ? (
                  <div className="p-4 text-xs font-semibold text-[#44403C]">
                    No manual plan changes recorded yet. Use &ldquo;Edit Plan&rdquo; on any agency above.
                  </div>
                ) : (
                  (revenue?.recentPlanChanges || []).map((chg: any) => (
                    <div
                      key={chg.id}
                      className="px-3.5 py-2.5 flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#1C1917]">{chg.details}</div>
                        <div className="text-[11px] text-[#44403C]">
                          {formatRelativeTime(chg.createdAt)} • {formatShortDate(chg.createdAt)}
                        </div>
                      </div>
                      <StatusToneChip label="UPDATED" tone="OK" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            G) HEALTH STRIP (Small, bottom)
           ===================================================================== */}
        <section
          aria-label="System Health Strip"
          data-testid="owner-health-strip"
          className="bg-white rounded-2xl border border-[#E5D5C5] p-4 shadow-xs space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#059669]" />
              <span className="font-extrabold text-[#1C1917]">System Health Strip</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#44403C]">DB Round-Trip (SELECT 1):</span>
                <StatusToneChip
                  label={`${health?.dbPingMs ?? '—'} ms`}
                  tone={(health?.dbPingMs ?? 0) > 400 ? 'DUE_SOON' : 'OK'}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#44403C]">Sync Queue:</span>
                <StatusToneChip
                  label={`${health?.pendingSyncCount ?? 0} Pending / ${health?.failedSyncCount ?? 0} Failed`}
                  tone={
                    (health?.failedSyncCount ?? 0) > 0
                      ? 'EXPIRED'
                      : (health?.pendingSyncCount ?? 0) > 0
                      ? 'DUE_SOON'
                      : 'OK'
                  }
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#44403C]">Auto-Scheduler:</span>
                <span className="font-bold text-[#1C1917]">
                  Last run {formatRelativeTime(health?.autoSchedulerLastRunAt)} •{' '}
                  {health?.autoSchedulerCreatedToday ?? 0} WOs created today
                </span>
              </div>
            </div>
          </div>

          {Array.isArray(health?.anomalies) && health.anomalies.length > 0 && (
            <div className="pt-2 border-t border-[#F0E4D8] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9A3412] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                Platform Anomalies:
              </span>
              {health.anomalies.map((anom: any, idx: number) => (
                <StatusToneChip key={idx} label={anom.message} tone={anom.severity} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* =====================================================================
          SUBSCRIPTION EDIT MODAL (Section 2D)
         ===================================================================== */}
      {editingAgency && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="owner-subscription-modal"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#E5D5C5] shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-3">
              <div>
                <h3 className="text-base font-black text-[#1C1917]">
                  Edit Agency Subscription
                </h3>
                <p className="text-[11px] font-semibold text-[#44403C]">
                  {editingAgency.name} ({editingAgency.email || editingAgency.id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAgency(null)}
                className="p-1 rounded-lg text-[#44403C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="space-y-3.5">
              <div>
                <label className="block font-extrabold text-[#1C1917] mb-1">
                  Subscription Plan
                </label>
                <select
                  data-testid="modal-plan-select"
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#1C1917]"
                >
                  <option value="TRIAL">TRIAL</option>
                  <option value="FOUNDING_MONTHLY">FOUNDING_MONTHLY</option>
                  <option value="FOUNDING_ANNUAL">FOUNDING_ANNUAL</option>
                  <option value="BIG_AGENCY">BIG_AGENCY</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-[#1C1917] mb-1">
                    Monthly Price (Rs.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    data-testid="modal-price-input"
                    value={editMonthlyPrice}
                    onChange={(e) => setEditMonthlyPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-mono font-bold text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-[#1C1917] mb-1">
                    Subscription Status
                  </label>
                  <select
                    data-testid="modal-status-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#1C1917]"
                  >
                    <option value="TRIAL">TRIAL</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-[#1C1917] mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="date"
                  data-testid="modal-expires-input"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-semibold text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-[#1C1917] mb-1">
                  Owner Subscription Notes
                </label>
                <textarea
                  rows={3}
                  data-testid="modal-notes-input"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Deal terms, custom tower limits, renewal contact..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-medium text-[#1C1917]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0E4D8]">
                <button
                  type="button"
                  onClick={() => setEditingAgency(null)}
                  disabled={savingSubscription}
                  className="px-4 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#44403C] hover:text-[#1C1917] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="modal-save-subscription-btn"
                  disabled={savingSubscription}
                  className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {savingSubscription ? 'Saving...' : 'Save Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCredModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="owner-credentials-modal"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#E5D5C5] shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF3E8] border border-[#FED7AA] text-[#EA580C] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1C1917]">
                    Edit Owner Login ID &amp; Password
                  </h3>
                  <p className="text-[11px] font-semibold text-[#44403C]">
                    Update your private /owner console Login ID or Password
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCredModalOpen(false)}
                className="p-1 rounded-lg text-[#44403C] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ownerCredError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] font-semibold flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{ownerCredError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOwnerCredentials} className="space-y-3.5">
              <div>
                <label className="block font-extrabold text-[#1C1917] mb-1">
                  Owner Login ID (Username or Email)
                </label>
                <input
                  type="text"
                  required
                  data-testid="cred-login-id-input"
                  value={newOwnerLoginId}
                  onChange={(e) => setNewOwnerLoginId(e.target.value)}
                  placeholder="e.g. shaizan@vigilamc.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#1C1917]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-extrabold text-[#1C1917]">
                    Current Owner Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOwnerPasswords((p) => !p)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EA580C] hover:text-[#C2410C]"
                  >
                    {showOwnerPasswords ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Show
                      </>
                    )}
                  </button>
                </div>
                <input
                  type={showOwnerPasswords ? 'text' : 'password'}
                  required
                  data-testid="cred-current-password-input"
                  value={currentOwnerPassword}
                  onChange={(e) => setCurrentOwnerPassword(e.target.value)}
                  placeholder="Enter current password to confirm"
                  className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-semibold text-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-[#1C1917] mb-1">
                    New Password (Optional)
                  </label>
                  <input
                    type={showOwnerPasswords ? 'text' : 'password'}
                    data-testid="cred-new-password-input"
                    value={newOwnerPassword}
                    onChange={(e) => setNewOwnerPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-semibold text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-[#1C1917] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showOwnerPasswords ? 'text' : 'password'}
                    data-testid="cred-confirm-password-input"
                    value={confirmOwnerPassword}
                    onChange={(e) => setConfirmOwnerPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-semibold text-[#1C1917]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0E4D8]">
                <button
                  type="button"
                  onClick={() => setIsCredModalOpen(false)}
                  disabled={savingOwnerCreds}
                  className="px-4 py-2 rounded-xl bg-[#FFF8F2] border border-[#E5D5C5] font-bold text-[#44403C] hover:text-[#1C1917] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="cred-save-btn"
                  disabled={savingOwnerCreds}
                  className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {savingOwnerCreds ? 'Saving...' : 'Save Login & Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
