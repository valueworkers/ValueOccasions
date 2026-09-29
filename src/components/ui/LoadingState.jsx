import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Centered section/page loading block.
 * Use for first load of lists, tables, dashboards.
 */
export default function LoadingState({
  message = 'Loading...',
  subMessage = '',
  size = 'md',
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-busy="true"
    >
      <LoadingSpinner size={size} />
      {message ? <p className="text-gray-600 text-sm sm:text-base">{message}</p> : null}
      {subMessage ? <p className="text-sm text-gray-400">{subMessage}</p> : null}
    </div>
  );
}
