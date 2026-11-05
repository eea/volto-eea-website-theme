import React from 'react';
import { Container } from 'semantic-ui-react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Helmet from '@plone/volto/helpers/Helmet/Helmet';

// EEA: users sign in with their Eionet account, so there is no local reset
// form: the page only links to the Eionet password reset page.
const EIONET_RESET_URL = 'https://www.eionet.europa.eu/password-reset';

const messages = defineMessages({
  passwordReset: {
    id: 'Password reset',
    defaultMessage: 'Password reset',
  },
});

function RequestPasswordReset() {
  const intl = useIntl();

  return (
    <div id="page-password-reset">
      <Helmet title={intl.formatMessage(messages.passwordReset)} />
      <Container id="passwordreset">
        <h1 className="documentFirstHeading">
          <FormattedMessage id="Lost Password" defaultMessage="Lost Password" />
        </h1>
        <p className="documentDescription">
          <FormattedMessage
            id="description_lost_password_eionet"
            defaultMessage="You sign in to this site with your Eionet account. For security reasons, passwords are stored encrypted and cannot be sent to you by email. To reset your password, use the Eionet password reset page linked below."
          />
        </p>
        <div className="documentContent">
          <p>
            <FormattedMessage
              id="To reset your password visit {link}."
              defaultMessage="To reset your password visit {link}."
              values={{
                link: (
                  <a href={EIONET_RESET_URL}>
                    <FormattedMessage
                      id="Reset Eionet account password page"
                      defaultMessage="Reset Eionet account password page"
                    />
                  </a>
                ),
              }}
            />
          </p>
        </div>
      </Container>
    </div>
  );
}

export default RequestPasswordReset;
