import React from 'react';

/** Skeleton for service-style card grids (image + body). */
export default function CardGridSkeleton({
  count = 6,
  className = '',
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
}) {
  return (
    <div className={gridClassName} role="status" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden animate-pulse flex flex-col ${className}`}
        >
          <div className="h-36 w-full bg-gray-200" />
          <div className="p-4 space-y-3 flex-1">
            <div className="flex justify-between gap-3">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-3/5" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
            <div className="h-8 w-28 bg-gray-200 rounded-full mt-2" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading content…</span>
    </div>
  );
}
