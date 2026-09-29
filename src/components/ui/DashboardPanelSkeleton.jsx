import React from 'react';
import TableSkeleton from './TableSkeleton';

/** Generic dashboard panel skeleton (lazy route / full-page load). */
export default function DashboardPanelSkeleton({ variant = 'table' }) {
  return (
    <div className="p-4 sm:p-6 space-y-4 animate-pulse" role="status" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="h-10 max-w-sm w-full bg-gray-100 rounded-lg" />
      {variant === 'table' ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <div className="h-48 bg-gray-100 rounded-xl border border-gray-200" />
      )}
      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
