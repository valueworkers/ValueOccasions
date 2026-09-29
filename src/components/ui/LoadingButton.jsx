import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Primary/secondary button with built-in loading state.
 * Disables click and shows spinner while `loading` is true.
 */
export default function LoadingButton({
  loading = false,
  loadingText = 'Saving…',
  children,
  className = '',
  disabled = false,
  type = 'button',
  spinnerColor = 'white',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" color={spinnerColor} />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
