import React from 'react';

export type ProductStatus = 'LIVE' | 'BETA' | 'COMING SOON' | 'SAMPLE' | 'DEMO';

interface StatusBadgeProps {
  status: ProductStatus;
  size?: 'xs' | 'sm';
  className?: string;
}

export function StatusBadge({ status, size = 'xs', className = '' }: StatusBadgeProps) {
  const styles: Record<ProductStatus, string> = {
    LIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    BETA: 'bg-amber-50 text-amber-700 border-amber-200/80',
    'COMING SOON': 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    SAMPLE: 'bg-slate-100 text-slate-600 border-slate-300',
    DEMO: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
  };

  const dots: Record<ProductStatus, string> = {
    LIVE: 'bg-emerald-500',
    BETA: 'bg-amber-500',
    'COMING SOON': 'bg-indigo-500',
    SAMPLE: 'bg-slate-400',
    DEMO: 'bg-cyan-500',
  };

  const textSize = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border shadow-2xs ${styles[status]} ${textSize} ${className}`}
      title={`Product Status: ${status}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      <span>{status}</span>
    </span>
  );
}
