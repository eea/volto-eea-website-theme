import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers';
import { Redirect } from 'react-router-dom';

const WebReportSectionView = ({ content }) => {
  const history = useHistory();
  const redirectUrl = React.useMemo(() => {
    if (content) {
      const items = content.items;
      const firstItem = items?.[0];
      return firstItem?.['@id'] ?? content?.['@id'];
    }
  }, [content]);

  useEffect(() => {
    if (isInternalURL(redirectUrl)) {
      history.replace(flattenToAppURL(redirectUrl));
    } else if (!__SERVER__) {
      window.location.href = flattenToAppURL(redirectUrl);
    }
  }, [content, history]);

  if (__SERVER__ && redirectUrl) {
    return <Redirect to={redirectUrl} />;
  }
  return null;
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
