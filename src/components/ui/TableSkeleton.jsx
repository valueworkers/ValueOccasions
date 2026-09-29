import React from 'react';

/**
 * Table/list skeleton for first-load of structured data.
 * Prefer this over a blank spinner when the final UI is a table or card list.
 */
export default function TableSkeleton({
  rows = 5,
  columns = 4,
  className = '',
}) {
  return (
    <div className={`w-full animate-pulse ${className}`} role="status" aria-busy="true" aria-label="Loading">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex gap-3 bg-gray-100 rounded-t-lg p-3 border-b border-gray-200">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={`h-${i}`} className="h-3 bg-gray-300 rounded flex-1" />
            ))}
          </div>
          <div className="space-y-3 p-3 bg-white rounded-b-lg border border-t-0 border-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={`r-${rowIndex}`} className="flex gap-3 items-center">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div
                    key={`c-${rowIndex}-${colIndex}`}
                    className={`h-4 bg-gray-200 rounded flex-1 ${colIndex === 0 ? 'max-w-[48px]' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading content…</span>
    </div>
  );
}
