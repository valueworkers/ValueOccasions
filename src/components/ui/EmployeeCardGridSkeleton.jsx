import React from 'react';

/** Skeleton for payroll / attendance employee card grids. */
export default function EmployeeCardGridSkeleton({ count = 6, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 animate-pulse ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-16 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-100 rounded w-36" />
            <div className="h-8 w-full bg-gray-100 rounded-lg mt-1" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading employees…</span>
    </div>
  );
}
