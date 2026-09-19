import React from 'react';

/**
 * Base atomic Skeleton component with luxury warm shimmer effect.
 */
export function Skeleton({ className = '', style }) {
  return (
    <div
      className={`skeleton-shimmer rounded-sm ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Full page skeleton for Dashboard / Overview.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500 pb-24">
      {/* Financial Position Hero */}
      <div className="space-y-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-3/4 max-w-lg" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-cream-secondary">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Progress / Ratio Bar */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>

      {/* Accounts Section */}
      <div className="space-y-6 pt-8 border-t border-cream-secondary">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-cream-secondary p-6 rounded-sm space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-40" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="space-y-6 pt-8 border-t border-cream-secondary">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-12 py-4 border-b border-cream-secondary gap-4 items-center">
              <div className="col-span-2">
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="col-span-6 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="col-span-4 flex justify-end">
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Transactions Ledger page.
 */
export function TransactionsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Category Filter Pills Shimmer */}
      <div className="flex flex-wrap gap-2">
        {['w-12', 'w-24', 'w-20', 'w-28', 'w-16', 'w-24'].map((w, idx) => (
          <Skeleton key={idx} className={`h-8 ${w} rounded-full`} />
        ))}
      </div>

      {/* Transaction Rows Shimmer */}
      <div className="border-t border-cream-secondary pt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="grid grid-cols-12 py-5 border-b border-cream-secondary gap-4 items-center">
            <div className="col-span-3 md:col-span-2">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-5 md:col-span-6 space-y-2">
              <Skeleton className="h-5 w-44" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-20 hidden md:block" />
              </div>
            </div>
            <div className="col-span-4 md:col-span-4 flex justify-end">
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Analytics page.
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      {/* AI Analyst Card Skeleton */}
      <div className="border border-cream-secondary p-8 md:p-12 rounded-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-10 w-3/4 max-w-xl" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
      </div>

      {/* Annual Trend Chart Skeleton */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="h-[350px] border border-cream-secondary rounded-sm p-6 flex items-end justify-between gap-4">
          {[40, 75, 55, 90, 60, 85, 50, 70, 95, 65, 80, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex gap-1 items-end justify-center" style={{ height: `${h}%` }}>
                <Skeleton className="w-1/2 h-full rounded-t-sm" />
                <Skeleton className="w-1/2 rounded-t-sm" style={{ height: `${Math.max(20, h - 25)}%` }} />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Skeleton */}
      <div className="space-y-6 pt-8 border-t border-cream-secondary">
        <Skeleton className="h-7 w-52" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for AI Analyst Box inside Analytics.
 */
export function AiAnalystSkeleton() {
  return (
    <div className="border border-cream-secondary p-8 md:p-12 rounded-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-10 w-full max-w-2xl" />
      <Skeleton className="h-10 w-3/4 max-w-xl" />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-full" />
      </div>
    </div>
  );
}

export default {
  Skeleton,
  DashboardSkeleton,
  TransactionsSkeleton,
  AnalyticsSkeleton,
  AiAnalystSkeleton,
};
