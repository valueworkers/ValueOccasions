import React from 'react';

/** Skeleton for modal / form first-load. */
export default function FormFieldsSkeleton({ fields = 6, className = '' }) {
  return (
    <div
      className={`animate-pulse p-6 space-y-4 max-h-[70vh] ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Loading form"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded-lg border border-gray-200" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading form…</span>
    </div>
  );
}
