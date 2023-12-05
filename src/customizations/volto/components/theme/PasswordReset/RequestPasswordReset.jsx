import React from 'react';
import { Container } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import './style.less';

function RequestPasswordReset() {
  return (
    <Container id="passwordreset">
      <h1 className="documentFirstHeading">
        <FormattedMessage id="Lost Password" defaultMessage="Lost Password" />
      </h1>
      <p className="documentDescription">
        <div>
          <FormattedMessage
            id="For security reasons, we store your password encrypted, and cannot mail it to you. If you would like to reset your password, fill out the form below and we will send you an email at the address you gave when you registered to start the process of resetting your password."
            defaultMessage="For security reasons, we store your password encrypted, and cannot mail it to you. If you would like to reset your password, fill out the form below and we will send you an email at the address you gave when you registered to start the process of resetting your password."
          />
        </div>
      </p>
      <div className="documentContent">
        <p>
          <FormattedMessage
            id="To reset your password visit {link}."
            defaultMessage="To reset your password visit {link}."
            values={{
              link: (
                <a href="https://www.eionet.europa.eu/password-reset">
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
  );
}

export default RequestPasswordReset;
