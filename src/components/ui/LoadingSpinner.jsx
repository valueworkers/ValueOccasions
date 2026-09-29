import React from 'react';

const sizeClasses = {
  sm: 'h-4 w-4 border-b-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-12 w-12 border-b-2',
};

const colorClasses = {
  indigo: 'border-indigo-600',
  blue: 'border-blue-600',
  white: 'border-white',
};

/**
 * Shared spinner — use for actions, sections, and Suspense fallbacks.
 * @param {'sm'|'md'|'lg'} size
 * @param {'indigo'|'blue'|'white'} color
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'indigo',
  className = '',
  label = 'Loading',
}) {
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label={label}
    />
  );
}
