'use client';

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  UserCheck,
  Flame,
  CheckCircle2,
  Wrench,
  FileText,
  Settings,
  Mail,
  LogOut,
  Sparkles,
  CreditCard,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  X
} from 'lucide-react';
import Link from 'next/link';

export type AdminNavTab =
  | 'DASHBOARD'
  | 'AGENCY'
  | 'ADMIN_USERS'
  | 'TECHNICIANS'
  | 'CLIENTS'
  | 'BUILDINGS'
  | 'FIRE_ASSETS'
  | 'INSPECTIONS'
  | 'WORK_ORDERS'
  | 'REPORTS'
  | 'SETTINGS';

interface AdminSidebarProps {
  activeTab: AdminNavTab;
  onSelectTab: (tab: AdminNavTab) => void;
  isOpenMobile?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile: () => void;
  company?: any;
  userEmail?: string;
  userProfile?: any;
  onLogout: () => void;
  onOpenExport: () => void;
  onOpenImport?: () => void;
  unreadLeadsCount?: number;
  techSeatUsageText?: string;
  subscription?: any;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  isOpenMobile,
  isMobileOpen,
  onCloseMobile,
  company,
  userEmail,
  userProfile,
  onLogout,
  onOpenExport,
  onOpenImport,
  unreadLeadsCount = 0,
  techSeatUsageText,
  subscription,
}: AdminSidebarProps) {
  const isMobile = isMobileOpen ?? isOpenMobile ?? false;

  const navItems: {
    id: AdminNavTab;
    label: string;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'AGENCY', label: 'Agency & Plan', icon: Building2 },
    { id: 'ADMIN_USERS', label: 'Admin Users', icon: UserCheck },
    {
      id: 'TECHNICIANS',
      label: 'Technician Users',
      icon: Users,
      badge: techSeatUsageText,
    },
    { id: 'CLIENTS', label: 'Clients & Societies', icon: ShieldCheck },
    { id: 'BUILDINGS', label: 'Buildings / Towers', icon: Building2 },
    { id: 'FIRE_ASSETS', label: 'Fire Assets & Schedule', icon: Flame },
    { id: 'INSPECTIONS', label: 'Inspections', icon: CheckCircle2 },
    { id: 'WORK_ORDERS', label: 'Work Orders', icon: Wrench },
    { id: 'REPORTS', label: 'Reports & Form-B', icon: FileText },
    {
      id: 'SETTINGS',
      label: 'Settings & Leads',
      icon: Settings,
      badge: unreadLeadsCount > 0 ? unreadLeadsCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
  ];

  // User display metadata
  const displayName = userProfile?.fullName?.trim() || userEmail?.split('@')[0] || 'Agency Admin';
  const roleName = userProfile?.role ? userProfile.role.replace(/_/g, ' ') : 'Primary Admin';
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('') || 'A';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a101f] border-r border-[#DCE7F2] dark:border-slate-800 text-slate-700 dark:text-slate-300 w-64 select-none shadow-sm transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#DCE7F2] dark:border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC Logo"
              className="h-8 w-auto object-contain rounded-md"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#073F8F] dark:text-white">
                Vigil<span className="text-[#007DB8]">AMC</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-[#EAF6FF] text-[#007DB8] border border-[#007DB8]/30 dark:bg-blue-950/60 dark:text-blue-300">
                OS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
              {company?.name || 'Fire AMC Admin'}
            </p>
          </div>
        </Link>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-[#EAF6FF] text-[#073F8F] border border-[#007DB8]/30 font-black shadow-sm dark:bg-[#0077B6]/25 dark:text-white dark:border-[#0077B6]/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#007DB8] dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                    item.badgeColor ||
                    (isActive
                      ? 'bg-[#007DB8] text-white'
                      : 'bg-[#EAF6FF] text-[#007DB8] dark:bg-slate-800 dark:text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Utility Shortcuts */}
        <div className="pt-3">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Quick Tools
          </div>

          {onOpenImport && (
            <button
              onClick={() => {
                onOpenImport();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#007DB8] hover:bg-[#EAF6FF] border border-[#007DB8]/20 transition-all mb-1.5 dark:text-amber-400 dark:hover:bg-amber-950/20 dark:border-amber-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Existing Data</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenExport();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-300/60 transition-all mb-1.5 dark:text-emerald-400 dark:hover:bg-emerald-950/20 dark:border-emerald-500/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>

          <Link
            href="/assets/print-qr"
            onClick={onCloseMobile}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
          >
            <Printer className="w-4 h-4 text-[#007DB8] dark:text-amber-400" />
            <span>Equipment Schedule</span>
          </Link>
        </div>
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className="p-3.5 border-t border-[#DCE7F2] dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007DB8] to-[#073F8F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="capitalize">{roleName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shrink-0 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-300 dark:border-red-800/40"
            title="Sign Out of Admin OS"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      {isMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
