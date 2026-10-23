'use client';

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  CheckCircle2,
  FileText,
  Settings,
  LogOut,
  Moon,
  Sun,
  X,
  Flame,
  Users,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

export type AdminNavTab =
  | 'OVERVIEW'
  | 'CLIENTS_SITES'
  | 'FIRE_EQUIPMENT'
  | 'INSPECTIONS_WORK'
  | 'FIELD_TEAM'
  | 'REPORTS'
  | 'SETTINGS'
  // Backward compatibility aliases
  | 'HOME'
  | 'SITES'
  | 'INSPECTIONS'
  | 'REPAIRS';

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
  openRepairsCount?: number;
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
  onLogout,
  openRepairsCount = 0,
  isDarkMode = false,
  onToggleDarkMode,
}: AdminSidebarProps) {
  const isMobile = isMobileOpen ?? isOpenMobile ?? false;

  // Normalize legacy tab names
  const normalizedActiveTab: AdminNavTab =
    activeTab === 'HOME'
      ? 'OVERVIEW'
      : activeTab === 'SITES'
      ? 'CLIENTS_SITES'
      : activeTab === 'INSPECTIONS' || activeTab === 'REPAIRS'
      ? 'INSPECTIONS_WORK'
      : activeTab;

  const navItems: {
    id: AdminNavTab;
    label: string;
    icon: any;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'CLIENTS_SITES', label: 'Clients & Sites', icon: Building2 },
    { id: 'FIRE_EQUIPMENT', label: 'Fire Equipment', icon: Flame },
    {
      id: 'INSPECTIONS_WORK',
      label: 'Inspections & Work',
      icon: CheckCircle2,
      badge: openRepairsCount > 0 ? openRepairsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'FIELD_TEAM', label: 'Field Team', icon: Users },
    { id: 'REPORTS', label: 'Reports', icon: FileText },
    {
      id: 'SETTINGS',
      label: 'Settings',
      icon: Settings,
    },
  ];

  // User display metadata — clean fallback from profile.fullName -> email prefix
  const rawFullName = userProfile?.fullName?.trim();
  const cleanFullName =
    rawFullName && rawFullName.toLowerCase() !== 'jordan michael' ? rawFullName : '';
  const emailPrefix = userEmail?.split('@')[0] || '';
  const formattedEmailPrefix = emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : 'Agency Admin';
  const displayName = cleanFullName || formattedEmailPrefix;
  const roleName = userProfile?.role === 'TECHNICIAN' ? 'Technician' : 'Agency Admin';
  const userInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0].toUpperCase())
      .join('') || 'A';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#293548] text-slate-700 dark:text-[#94A3B8] w-64 select-none shadow-xs transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#293548] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC Logo"
              className="h-8 w-auto object-contain rounded-md"
              onError={(e) => {
                // If logo.jpg is not found, fallback silently
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#1D4ED8] dark:text-[#F8FAFC]">
                Vigil<span className="text-[#2563EB]">AMC</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                Testing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate max-w-[130px]">
              {company?.name || 'Fire AMC Agency'}
            </p>
          </div>
        </Link>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#172033] dark:text-[#94A3B8] dark:hover:text-white"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List (6 Items Only) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = normalizedActiveTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-bold shadow-xs dark:bg-[#172033] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#2563EB]/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] dark:hover:bg-[#172033]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#2563EB] dark:text-[#60A5FA]' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                    item.badgeColor || 'bg-blue-100 text-[#2563EB]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Launch Mobile Field App Button */}
        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-[#293548]/60">
          <Link
            href="/technician"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#023E8A] to-[#0077B6] hover:from-[#03045E] hover:to-[#023E8A] text-white shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Smartphone className="w-4 h-4 shrink-0 text-cyan-300" />
              <span className="truncate">📱 Open Mobile Field App</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#293548] bg-slate-50/70 dark:bg-[#0B1220]/70 space-y-2">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#94A3B8] truncate">
                {roleName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-slate-200 dark:hover:bg-[#172033] transition-colors"
                title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-blue-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign out of agency dashboard"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agency License Badge in Profile Footer */}
        {company?.licenseNumber && (
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate pt-1 border-t border-slate-200/60 dark:border-[#293548]/60">
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
