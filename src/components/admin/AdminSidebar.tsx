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
  onLogout: () => void;
  onOpenExport: () => void;
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
  onLogout,
  onOpenExport,
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
    { id: 'FIRE_ASSETS', label: 'Fire Assets & QRs', icon: Flame },
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a101f] border-r border-slate-800 text-slate-300 w-64 select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md">
            <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <span>VigilAMC</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-extrabold border border-amber-500/30">
                OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
              {company?.name || 'Fire AMC Admin'}
            </p>
          </div>
        </div>

        {/* Close button on mobile */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    item.badgeColor || (isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300')
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
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Tools
          </div>

          <button
            onClick={() => {
              onOpenExport();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-950/20 hover:text-emerald-300 border border-emerald-500/20 transition-all mb-1"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>

          <Link
            href="/assets/print-qr"
            onClick={onCloseMobile}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print QR Labels</span>
          </Link>
        </div>
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {userEmail?.split('@')[0] || 'Agency Admin'}
            </div>
            <div className="text-[10px] text-amber-400 font-semibold truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Primary Admin</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 transition-colors"
            title="Sign Out of Admin OS"
          >
            <LogOut className="w-4 h-4 text-red-400" />
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
