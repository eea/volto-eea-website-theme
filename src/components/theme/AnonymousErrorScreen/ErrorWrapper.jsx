/**
 * Error Wrapper component that shows different error screens for anonymous vs authenticated users
 * @module components/theme/AnonymousErrorScreen/ErrorWrapper
 */

import React from 'react';
import { connect } from 'react-redux';
import AnonymousErrorScreen from './AnonymousErrorScreen';

/**
 * ErrorWrapper component
 * Shows custom error screen for anonymous users, falls back to technical details for authenticated users
 */
const ErrorWrapper = ({ token, ...props }) => {
  const isAnonymous = !token;

  if (isAnonymous) {
    return <AnonymousErrorScreen {...props} />;
  }

  // For authenticated users, show technical error details
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>An error occurred</h2>
      <p>{props.error?.message || 'Unknown error'}</p>
      <details>
        <summary>Error details</summary>
        <pre
          style={{
            textAlign: 'left',
            background: '#f5f5f5',
            padding: '1rem',
            marginTop: '1rem',
          }}
        >
          {JSON.stringify(props, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default connect((state) => ({
  token: state.userSession.token,
}))(ErrorWrapper);
