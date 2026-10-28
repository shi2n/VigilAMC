'use client';

import React, { useState, useEffect } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
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

  // Persisted collapse state for desktop
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vigilamc:sidebar-collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // localStorage may fail in private mode; fallback to false
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vigilamc:sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  };

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
      badgeColor: 'bg-[#DC2626] text-white',
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

  const renderNavList = (layoutGroupId: string, collapsed: boolean) => (
    <div
      data-testid="admin-glass-sidebar"
      className={`flex flex-col h-full glass-panel-dense border-y-0 border-l-0 text-[#1C1917] select-none ${
        prefersReducedMotion ? '' : 'transition-[width] duration-200 ease-out'
      } ${collapsed ? 'w-[72px]' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div
        className={`border-b border-[#1C1917]/10 flex items-center ${
          collapsed ? 'p-3 flex-col gap-2 justify-center' : 'p-4 sm:p-5 justify-between'
        }`}
      >
        <Link
          href="/"
          className={`flex items-center gap-3 group shrink-0 min-w-0 ${
            collapsed ? 'justify-center w-full' : ''
          }`}
          title={collapsed ? 'VigilAMC Home' : undefined}
        >
          <div className="bg-white/85 p-1 rounded-xl border border-[#FED7AA] shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
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
          {!collapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-150">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base tracking-tight text-[#1C1917]">
                  Vigil<span className="text-[#C2410C]">AMC</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#C2410C] border border-[#FED7AA]">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-[#44403C] truncate max-w-[130px]">
                {company?.name || 'Fire AMC Agency'}
              </p>
            </div>
          )}
        </Link>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          onClick={handleToggleCollapse}
          className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg text-[#44403C] hover:text-[#C2410C] hover:bg-[#FFF0E6] transition-colors ${
            collapsed ? 'w-full mt-1' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#C2410C]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-[#FFF4EC] hover:bg-[#FFF0E6] text-[#44403C] hover:text-[#1C1917]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List with layoutId sliding pill */}
      <div className={`flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = normalizedActiveTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`relative w-full flex items-center rounded-xl text-xs transition-colors ${
                  collapsed
                    ? 'justify-center p-2.5'
                    : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'text-[#C2410C] font-bold'
                    : 'text-[#1C1917] hover:text-[#C2410C] hover:bg-[#FFF0E6]/70 font-medium'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId={prefersReducedMotion ? undefined : layoutGroupId}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 rounded-xl border border-[#EA580C]/25 shadow-xs ${
                      collapsed ? 'border-l-[3px] border-l-[#C2410C]' : 'border-l-[3px] border-l-[#C2410C]'
                    }`}
                    style={{ backgroundColor: 'rgba(234, 88, 12, 0.10)' }}
                  />
                )}
                
                <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 truncate'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? 'text-[#C2410C]' : 'text-[#44403C] group-hover:text-[#C2410C]'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {/* Badge when expanded */}
                {!collapsed && item.badge && (
                  <span
                    className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                      item.badgeColor || 'bg-[#FFF0E6] text-[#C2410C]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Red dot indicator when collapsed */}
                {collapsed && item.badge && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#DC2626] border-2 border-white shadow-xs"
                    title={`${item.badge} open repairs`}
                  />
                )}
              </button>

              {/* Tooltip on hover when collapsed */}
              {collapsed && (
                <div
                  role="tooltip"
                  className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1C1917] text-[#FAFAF9] text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 border border-[#EA580C]/30 flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#DC2626] text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Launch Mobile Field App Button */}
        <div className="pt-2 mt-2 border-t border-[#1C1917]/10">
          <div className="relative group">
            <Link
              href="/technician"
              className={`btn-flame w-full flex items-center rounded-xl text-xs font-bold text-white shadow-xs transition-all active:scale-[0.98] ${
                collapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
              }`}
              aria-label="Open Mobile Field App"
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 truncate'}`}>
                <Smartphone className="w-4 h-4 shrink-0 text-[#FFF8F2]" />
                {!collapsed && <span className="truncate">Open Field App</span>}
              </div>
            </Link>

            {/* Field App tooltip in collapsed mode */}
            {collapsed && (
              <div
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1C1917] text-[#FAFAF9] text-[11px] font-bold rounded-lg shadow-xl whitespace-nowrap z-50 border border-[#EA580C]/30"
              >
                Open Mobile Field App
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className={`border-t border-[#1C1917]/10 bg-white/45 ${collapsed ? 'p-2.5' : 'p-3.5 space-y-2'}`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2 justify-center' : 'justify-between gap-2 min-w-0'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`} title={displayName}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {userInitials}
            </div>
            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-150">
                <div className="text-xs font-bold text-[#1C1917] truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-[#44403C] truncate">
                  {roleName}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-[#C2410C] hover:text-[#9A3412] hover:bg-[#FFF0E6] transition-colors"
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
        {renderNavList('sidebar-active-pill-desktop', isCollapsed)}
      </aside>

      {/* Mobile Drawer Sidebar (Always full-width drawer) */}
      {isMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">
            {renderNavList('sidebar-active-pill-mobile', false)}
          </div>
        </div>
      )}
    </>
  );
}
