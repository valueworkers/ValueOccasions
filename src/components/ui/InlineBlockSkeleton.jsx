import React from 'react';

/** Small skeleton block (select field, modal list). */
export default function InlineBlockSkeleton({ className = 'h-12 w-full rounded-lg' }) {
  return (
    <div
      className={`animate-pulse bg-gray-100 border-2 border-gray-200 ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
