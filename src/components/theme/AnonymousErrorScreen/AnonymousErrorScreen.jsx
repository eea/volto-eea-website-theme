/**
 * Anonymous Error Screen component
 * Shows user-friendly error message for anonymous users when JavaScript errors occur
 * @module components/theme/App/AnonymousErrorScreen
 */

import React from 'react';
import { Container, Message, Button } from 'semantic-ui-react';
import './AnonymousErrorScreen.less';

/**
 * AnonymousErrorScreen component
 * @function AnonymousErrorScreen
 * @returns {string} Markup for the anonymous error screen
 */
const AnonymousErrorScreen = () => {
  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <Container className="anonymous-error-screen">
      <Message error size="large">
        <Message.Header>
          Our apologies, this page is not available at the moment.
        </Message.Header>
        <Message.Content>
          <p>
            If this problem persists please contact EEA Service Desk at{' '}
            <a
              href="https://service-portal.eea.europa.eu/external/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://service-portal.eea.europa.eu/external/
            </a>
          </p>
          <div style={{ marginTop: '2rem' }}>
            <Button
              primary
              size="large"
              onClick={handleBackToHome}
              className="back-to-home-button"
            >
              Back to Home
            </Button>
          </div>
        </Message.Content>
      </Message>
    </Container>
  );
};

export default AnonymousErrorScreen;
