'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  CheckCircle2,
  FileText,
  Settings,
  LogOut,
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
}: AdminSidebarProps) {
  const prefersReducedMotion = useReducedMotion();
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
      badgeColor: 'bg-[#B91C1C] text-white',
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

  const renderNavList = (layoutGroupId: string) => (
    <div className="flex flex-col h-full bg-white border-r border-[#DCE7F2] text-slate-700 w-64 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#DCE7F2] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
          <div className="bg-white p-1 rounded-xl border border-[#DCE7F2] shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="VigilAMC Logo"
              className="h-8 w-auto object-contain rounded-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#023E8A]">
                Vigil<span className="text-[#0077B6]">AMC</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#EAF6FF] text-[#0077B6] border border-[#0077B6]/30">
                Testing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-[130px]">
              {company?.name || 'Fire AMC Agency'}
            </p>
          </div>
        </Link>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-[#F4F8FB] hover:bg-[#EAF6FF] text-slate-600 hover:text-[#023E8A]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List with layoutId sliding pill + hover micro-bounce */}
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
              className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                isActive
                  ? 'text-[#0077B6] font-bold'
                  : 'text-slate-600 hover:text-[#023E8A] hover:bg-[#F4F8FB] font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={prefersReducedMotion ? undefined : layoutGroupId}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-[#EAF6FF] border border-[#0077B6]/30 shadow-xs"
                />
              )}
              <div className="relative z-10 flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? 'text-[#0077B6]' : 'text-slate-400 group-hover:text-[#0077B6]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                    item.badgeColor || 'bg-[#EAF6FF] text-[#0077B6]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Launch Mobile Field App Button */}
        <div className="pt-2 mt-2 border-t border-[#DCE7F2]">
          <Link
            href="/technician"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#023E8A] to-[#0077B6] hover:from-[#03045E] hover:to-[#023E8A] text-white shadow-xs transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 truncate">
              <Smartphone className="w-4 h-4 shrink-0 text-[#EAF6FF]" />
              <span className="truncate">📱 Open Mobile Field App</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className="p-3.5 border-t border-[#DCE7F2] bg-[#F4F8FB] space-y-2">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077B6] to-[#023E8A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#023E8A] truncate">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {roleName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#B91C1C] hover:bg-rose-50 transition-colors"
              title="Sign out of agency dashboard"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {renderNavList('sidebar-active-pill-desktop')}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">
            {renderNavList('sidebar-active-pill-mobile')}
          </div>
        </div>
      )}
    </>
  );
}
