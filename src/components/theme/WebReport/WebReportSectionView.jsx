import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers';
import { DefaultView } from '@plone/volto/components/';
import { Redirect } from 'react-router-dom';

const WebReportSectionView = (props) => {
  const { content, token } = props;
  const history = useHistory();
  const redirectUrl = React.useMemo(() => {
    if (content) {
      const items = content.items;
      const firstItem = items?.[0];
      return firstItem?.['@id'];
    }
  }, [content]);

  useEffect(() => {
    if (!token) {
      if (isInternalURL(redirectUrl)) {
        history.replace(flattenToAppURL(redirectUrl));
      } else if (!__SERVER__ && redirectUrl) {
        window.location.href = flattenToAppURL(redirectUrl);
      }
    }
  }, [history, content, redirectUrl, token]);

  if (__SERVER__ && redirectUrl && !token) {
    return <Redirect to={redirectUrl} />;
  }
  return <DefaultView {...props} />;
};

WebReportSectionView.propTypes = {
  content: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
      }),
    ),
  }),
};

WebReportSectionView.defaultProps = {
  content: null,
};

export default WebReportSectionView;
