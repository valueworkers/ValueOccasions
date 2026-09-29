import React from 'react';

/** Skeleton for KPI / stats card rows (e.g. customer payments). */
export default function StatsRowSkeleton({ count = 4, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 animate-pulse ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Loading statistics"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-4 border border-gray-200 h-16" />
      ))}
    </div>
  );
}
