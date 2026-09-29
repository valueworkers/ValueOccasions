import React from 'react';

/** Skeleton for horizontal venue list rows (public list + admin dashboard). */
export default function VenueRowSkeleton({ count = 4, className = '' }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`} role="status" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-row min-h-[90px]"
        >
          <div className="w-32 md:w-40 h-24 md:h-40 bg-gray-200 shrink-0" />
          <div className="flex-1 px-3 py-3 space-y-2 min-w-0">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-5 bg-gray-100 rounded-full w-14" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-full max-w-md" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-100 rounded w-16" />
              <div className="h-6 bg-gray-100 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading venues…</span>
    </div>
  );
}
