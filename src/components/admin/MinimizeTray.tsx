'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, ChevronUp, ChevronDown, Layers } from 'lucide-react';
import { AdminNavTab } from './AdminSidebar';

export type MinimizedItemType = 'TAB' | 'MODAL';

export interface MinimizedItem {
  id: string; // unique identifier
  type: MinimizedItemType;
  label: string; // e.g. "Fire Equipment", "Edit HPT-8721"
  icon: any; // Lucide icon
  badge?: number | string;
  tabId?: AdminNavTab; // for TAB type
  modalKey?: string; // for MODAL type
}

export interface MinimizeTrayProps {
  items: MinimizedItem[];
  onRestore: (item: MinimizedItem) => void;
  onClose: (item: MinimizedItem) => void;
}

export function MinimizeTray({ items, onRestore, onClose }: MinimizeTrayProps) {
  const prefersReducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [hasToast, setHasToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect active toast on the page to shift position and avoid overlap
  useEffect(() => {
    const checkToasts = () => {
      const activeToast = document.querySelector('[data-sonner-toast]');
      setHasToast(Boolean(activeToast));
    };

    checkToasts();
    const observer = new MutationObserver(checkToasts);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Collapse if all items removed
  useEffect(() => {
    if (items.length === 0) {
      setExpanded(false);
    }
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  // Mobile or >3 pills collapsed mode
  const shouldCollapseByDefault = items.length > 3;

  return (
    <aside
      ref={containerRef}
      aria-label="Minimized items tray"
      data-testid="minimize-tray"
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)] select-none transition-all duration-300 ease-out ${
        hasToast
          ? '-translate-y-20 sm:-translate-y-0 sm:-translate-x-[360px]'
          : 'translate-x-0 translate-y-0'
      }`}
    >
      {/* If >3 items or on small screens, provide collapsed toggle */}
      {shouldCollapseByDefault ? (
        <div className="relative flex flex-col items-end">
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
                transition={{
                  duration: prefersReducedMotion ? 0.1 : 0.18,
                  ease: 'easeOut',
                }}
                className="mb-2 p-2 rounded-2xl glass-panel-dense border border-[#FED7AA] shadow-2xl space-y-1.5 max-h-72 overflow-y-auto no-scrollbar w-64"
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-[#FED7AA]/40 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Minimized Workspace ({items.length})</span>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700"
                    title="Collapse list"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {items.map((item) => {
                    const Icon = item.icon || Layers;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        data-testid={`tray-pill-${item.id}`}
                        onClick={() => {
                          onRestore(item);
                          if (items.length <= 4) setExpanded(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRestore(item);
                          }
                        }}
                        className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/90 hover:bg-[#FFF0E6] border border-[#FED7AA] border-l-4 border-l-[#EA580C] shadow-xs cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="w-4 h-4 text-[#EA580C] shrink-0" />
                          <span className="font-bold text-[#1C1917] truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#DC2626] text-white shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          data-testid={`tray-pill-close-${item.id}`}
                          title="Discard / Close"
                          aria-label={`Close ${item.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose(item);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Pill Button */}
          <button
            type="button"
            data-testid="minimize-tray-collapsed-btn"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#FED7AA] border-l-4 border-l-[#EA580C] shadow-lg text-slate-800 text-xs font-bold hover:bg-[#FFF0E6] transition-all hover:scale-102"
          >
            <Layers className="w-4 h-4 text-[#EA580C]" />
            <span>
              {expanded ? '▲' : '▼'} {items.length} Minimized
            </span>
            <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
          </button>
        </div>
      ) : (
        /* <= 3 items: horizontal cluster on desktop, stack on mobile */
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const Icon = item.icon || Layers;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 8 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.9, transition: { duration: 0.15 } }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.1 }
                      : { type: 'spring', stiffness: 350, damping: 25, duration: 0.22 }
                  }
                >
                  <div
                    role="button"
                    tabIndex={0}
                    data-testid={`tray-pill-${item.id}`}
                    onClick={() => onRestore(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRestore(item);
                      }
                    }}
                    className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-[#FED7AA] border-l-4 border-l-[#EA580C] shadow-lg hover:bg-[#FFF0E6] text-slate-800 transition-all cursor-pointer text-xs group hover:scale-102"
                  >
                    <Icon className="w-4 h-4 text-[#EA580C] shrink-0" />
                    <span className="font-bold text-[#1C1917] truncate max-w-[130px] sm:max-w-[170px]">
                      {item.label}
                    </span>

                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#DC2626] text-white shrink-0">
                        {item.badge}
                      </span>
                    )}

                    <button
                      type="button"
                      data-testid={`tray-pill-close-${item.id}`}
                      title="Discard / Close"
                      aria-label={`Close ${item.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose(item);
                      }}
                      className="p-1 rounded text-slate-400 group-hover:text-slate-600 hover:!text-rose-600 hover:bg-rose-50 transition-colors ml-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </aside>
  );
}
