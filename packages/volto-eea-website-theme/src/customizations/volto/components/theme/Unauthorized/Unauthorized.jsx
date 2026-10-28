/**
 * @module components/theme/Unauthorized/Unauthorized
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Link, useHistory } from 'react-router-dom';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { Container, Button } from 'semantic-ui-react';

import { FormattedMessage } from 'react-intl';

import { withServerErrorCode } from '@plone/volto/helpers/Utils/Utils';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';

/**
 * unauthorized function.
 * @function Unauthorized
 * @returns {string} Markup of the unauthorized page.
 */

const Unauthorized = () => {
  const token = useSelector((state) => state.userSession.token);
  const error_message = useSelector((state) => state.apierror?.message);
  const location = useLocation();
  const pathname = location.pathname;
  const base_pathname = getBaseUrl(pathname);
  const login = `${base_pathname}/login`;
  const history = useHistory();
  const [countdown, setCountdown] = React.useState(5);

  // As in Volto 19, only anonymous users are sent to the login form.
  // Authenticated users stay on the page and see the error instead.
  useEffect(() => {
    if (token) return;
    const timer = setTimeout(() => {
      history.push({
        pathname: login,
        search: `?return_url=${encodeURIComponent(pathname)}`,
        state: { isLogout: true },
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [token, history, login, pathname]);

  useEffect(() => {
    if (token) return;
    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        clearTimeout(timer);
      }
    }, 1000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  }, [token, countdown]);

  if (token) {
    return (
      <Container className="view-wrapper">
        <BodyClass className="view-unauthorized" />
        <h1>
          <FormattedMessage id="Unauthorized" defaultMessage="Unauthorized" />
        </h1>
        <h3>{error_message}</h3>
        <p className="description">
          <FormattedMessage
            id="You are trying to access a protected resource."
            defaultMessage="You are trying to access a protected resource."
          />{' '}
          <FormattedMessage id="Click" defaultMessage="Click" />{' '}
          <Button
            size={'mini'}
            compact
            onClick={() => history.goBack()}
            className={'my-half unauthorized-buttons'}
          >
            <FormattedMessage id="Get back" defaultMessage="Get back" />
          </Button>
          <FormattedMessage
            id="to get to the previous location"
            defaultMessage="to get to the previous location"
          />
          .
        </p>
      </Container>
    );
  }

  return (
    <Container className="view-wrapper">
      <BodyClass className="view-unauthorized" />
      <h1>
        <FormattedMessage id="Unauthorized" defaultMessage="Unauthorized" />
      </h1>
      <h3>
        <FormattedMessage
          id="Forbidden, you will be redirected to the login screen in "
          defaultMessage="Forbidden, you will be redirected to the login screen in "
        />
        <span id="redirect-countdown">{countdown}</span>.
      </h3>

      <p className="description">
        <FormattedMessage id="Click" defaultMessage="Click" />{' '}
        <Link
          className={'ui mini compact button my-half unauthorized-buttons'}
          to={login}
        >
          <FormattedMessage id="Log in" defaultMessage="Log in" />
        </Link>
        <FormattedMessage
          id="to get to login screen or click"
          defaultMessage="to get to login screen or click"
        />{' '}
        <Button
          size={'mini'}
          compact
          onClick={() => history.goBack()}
          className={'my-half unauthorized-buttons'}
        >
          <FormattedMessage id="Get back" defaultMessage="Get back" />
        </Button>
        <FormattedMessage
          id="to get to the previous location"
          defaultMessage="to get to the previous location"
        />
        .
      </p>
    </Container>
  );
};

const UnauthorizedWithCode = withServerErrorCode(401)(Unauthorized);
UnauthorizedWithCode.displayName = 'unauthorized';
export default UnauthorizedWithCode;
