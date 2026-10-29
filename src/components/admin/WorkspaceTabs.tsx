'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Minus,
  X,
  MoreHorizontal,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { AdminNavTab } from './AdminSidebar';

export interface WorkspaceTabItem {
  id: AdminNavTab;
  minimized: boolean;
  lastAccessed?: number;
}

export interface WorkspaceTabsProps {
  openTabs: WorkspaceTabItem[];
  activeTab: AdminNavTab;
  onSelectTab: (tabId: AdminNavTab) => void;
  onCloseTab: (tabId: AdminNavTab) => void;
  onMinimizeTab: (tabId: AdminNavTab) => void;
  onCloseOtherTabs: (tabId: AdminNavTab) => void;
  onCloseAllTabs: () => void;
  onResetWorkspace: () => void;
  tabConfig: Record<
    string,
    {
      label: string;
      icon: any;
      badge?: number | string;
      badgeColor?: string;
    }
  >;
  isDirtyTab?: (tabId: AdminNavTab) => boolean;
}

export function WorkspaceTabs({
  openTabs,
  activeTab,
  onSelectTab,
  onCloseTab,
  onMinimizeTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onResetWorkspace,
  tabConfig,
  isDirtyTab,
}: WorkspaceTabsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close overflow menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const unminimizedTabs = openTabs.filter((t) => !t.minimized);
  const minimizedCount = openTabs.filter((t) => t.minimized).length;

  // A1: hidden when only one tab is open (and nothing minimized in tray)
  if (unminimizedTabs.length <= 1 && minimizedCount === 0) {
    return null;
  }

  return (
    <div
      data-testid="workspace-tabs-strip"
      className="relative flex items-center justify-between gap-2 p-1.5 rounded-2xl glass-panel-dense border border-[#FED7AA]/60 text-xs select-none shadow-xs"
    >
      {/* Horizontally scrollable chip container */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 min-w-0">
        <AnimatePresence initial={false}>
          {unminimizedTabs.map((tab, idx) => {
            const config = tabConfig[tab.id];
            if (!config) return null;
            const Icon = config.icon;
            const isActive = tab.id === activeTab;
            const isDirty = isDirtyTab ? isDirtyTab(tab.id) : false;

            return (
              <motion.div
                key={tab.id}
                layout
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.95 }}
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 0.18,
                  ease: 'easeOut',
                }}
                className="shrink-0"
              >
                <div
                  role="tab"
                  tabIndex={0}
                  aria-selected={isActive}
                  aria-label={`${config.label} tab`}
                  data-testid={`workspace-tab-chip-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTab(tab.id);
                    }
                  }}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-150 outline-none ${
                    isActive
                      ? 'bg-[#FFF0E6] border-b-2 border-[#C2410C] text-[#1C1917] font-bold shadow-xs'
                      : 'bg-white/60 hover:bg-[#FFF8F2] text-[#44403C] hover:text-[#1C1917] border border-[#1C1917]/10'
                  }`}
                >
                  {/* Tab Icon */}
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isActive ? 'text-[#C2410C]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />

                  {/* Tab Label */}
                  <span className="truncate max-w-[130px] sm:max-w-[160px]">{config.label}</span>

                  {/* Optional Badge (e.g. Open repairs count) */}
                  {config.badge !== undefined && (
                    <span
                      data-testid={`workspace-tab-badge-${tab.id}`}
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#DC2626] text-white shrink-0"
                    >
                      {config.badge}
                    </span>
                  )}

                  {/* D2: Tiny Ember Dot when dirty */}
                  {isDirty && (
                    <span
                      data-testid={`workspace-tab-dirty-${tab.id}`}
                      className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0"
                      title="Active filters or changes"
                    />
                  )}

                  {/* Actions: Minimize (—) and Close (✕) */}
                  <div className="flex items-center gap-0.5 ml-1">
                    {/* Minimize button */}
                    <button
                      type="button"
                      data-testid={`workspace-tab-minimize-${tab.id}`}
                      title="Minimize (keep my work)"
                      aria-label={`Minimize ${config.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMinimizeTab(tab.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-[#C2410C] hover:bg-[#C2410C]/10 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    {/* Close button */}
                    <button
                      type="button"
                      data-testid={`workspace-tab-close-${tab.id}`}
                      title="Close"
                      aria-label={`Close ${config.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Overflow / Actions menu button */}
      <div className="relative shrink-0 flex items-center pr-1" ref={menuRef}>
        <button
          type="button"
          data-testid="workspace-tabs-overflow-btn"
          title="Workspace options"
          aria-label="Workspace options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-xl bg-white/70 hover:bg-[#FFF0E6] text-slate-500 hover:text-[#C2410C] border border-[#FED7AA]/50 transition-colors shadow-xs"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: prefersReducedMotion ? 0.05 : 0.12 }}
              className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-md rounded-xl border border-[#FED7AA] shadow-xl p-1.5 z-50 text-xs space-y-1"
            >
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspace Controls
              </div>

              {unminimizedTabs.length > 1 && (
                <button
                  type="button"
                  data-testid="workspace-tabs-close-others-btn"
                  onClick={() => {
                    onCloseOtherTabs(activeTab);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-[#FFF8F2] hover:text-[#C2410C] flex items-center gap-2 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                  <span>Close other tabs</span>
                </button>
              )}

              <button
                type="button"
                data-testid="workspace-tabs-close-all-btn"
                onClick={() => {
                  onCloseAllTabs();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-[#FFF8F2] hover:text-[#C2410C] flex items-center gap-2 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Close all tabs</span>
              </button>

              <div className="border-t border-[#FED7AA]/50 my-1" />

              <button
                type="button"
                data-testid="workspace-tabs-reset-btn"
                onClick={() => {
                  onResetWorkspace();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Reset workspace layout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
