import React, { Component } from 'react';
import { UniversalLink } from '@plone/volto/components';
import { FormattedMessage } from 'react-intl';
import { Container } from 'semantic-ui-react';
import config from '@plone/volto/registry';

export class ContactFormComponent extends Component {
  componentDidMount() {
    if (config.settings.contactForm) {
      this.props.history.replace(config.settings.contactForm);
    }
  }

  render() {
    const remoteUrl = config.settings.contactForm;
    return (
      <Container id="page-document">
        <p>
          <FormattedMessage id="Contact us:" defaultMessage="Contact us:" />{' '}
          <UniversalLink href={remoteUrl}>{remoteUrl}</UniversalLink>
        </p>
      </Container>
    );
  }
}

export default ContactFormComponent;
