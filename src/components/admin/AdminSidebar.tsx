'use client';

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CheckCircle2,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Moon,
  Sun,
  X,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export type AdminNavTab =
  | 'HOME'
  | 'SITES'
  | 'INSPECTIONS'
  | 'REPAIRS'
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
  isPlatformOwner?: boolean;
  onLogout: () => void;
  openRepairsCount?: number;
  unreadLeadsCount?: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
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
  isPlatformOwner = false,
  onLogout,
  openRepairsCount = 0,
  unreadLeadsCount = 0,
  isDarkMode = false,
  onToggleDarkMode,
}: AdminSidebarProps) {
  const isMobile = isMobileOpen ?? isOpenMobile ?? false;

  const navItems: {
    id: AdminNavTab;
    label: string;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'HOME', label: 'Home', icon: LayoutDashboard },
    { id: 'SITES', label: 'Sites', icon: Building2 },
    { id: 'INSPECTIONS', label: 'Inspections', icon: CheckCircle2 },
    {
      id: 'REPAIRS',
      label: 'Repairs',
      icon: Wrench,
      badge: openRepairsCount > 0 ? openRepairsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'REPORTS', label: 'Reports', icon: FileText },
    {
      id: 'SETTINGS',
      label: 'Team & Settings',
      icon: Settings,
      badge: isPlatformOwner && unreadLeadsCount > 0 ? unreadLeadsCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
  ];

  // User display metadata
  const displayName = userProfile?.fullName?.trim() || userEmail?.split('@')[0] || 'Agency Admin';
  const roleName = isPlatformOwner ? 'Owner' : userProfile?.role === 'SUPER_ADMIN' ? 'Owner' : 'Agency Admin';
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('') || 'A';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a101f] border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 w-64 select-none shadow-xs transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC Logo"
              className="h-8 w-auto object-contain rounded-md"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#023E8A] dark:text-white">
                Vigil<span className="text-[#0077B6]">AMC</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400">
                Testing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
              {company?.name || 'Fire AMC Agency'}
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

      {/* Navigation List (6 Items Only) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-blue-50 text-[#023E8A] font-bold shadow-xs dark:bg-[#0077B6]/25 dark:text-white border border-blue-200 dark:border-[#0077B6]/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#0077B6] dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                    item.badgeColor || 'bg-blue-100 text-[#0077B6]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077B6] to-[#023E8A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {roleName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-red-950/30 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agency License Badge in Profile Footer */}
        {company?.licenseNumber && (
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            Lic: {company.licenseNumber}
          </div>
        )}
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
