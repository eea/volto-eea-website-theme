import React from 'react';
import { ErrorBoundary } from '@plone/volto/components';

export default function withErrorBoundary(WrappedComponent, options = {}) {
  // Handle backward compatibility - if second param is a component, treat as fallback
  const config =
    React.isValidElement(options) || typeof options === 'function'
      ? { fallback: options }
      : {
          fallback: null,
          onError: null,
          ...options,
        };

  const ErrorBoundaryWrapper = React.memo(function ErrorBoundaryWrapper(props) {
    const { fallback, onError } = config;

    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  });

  const wrappedComponentName = WrappedComponent.displayName || 'Component';
  ErrorBoundaryWrapper.displayName = `withErrorBoundary(${wrappedComponentName})`;

  return ErrorBoundaryWrapper;
}
