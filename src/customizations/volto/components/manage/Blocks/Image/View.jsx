/* eslint-disable react-hooks/exhaustive-deps */
/**
 * View image block.
 * @module components/manage/Blocks/Image/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UniversalLink } from '@plone/volto/components';
import { Icon } from 'semantic-ui-react';
import cx from 'classnames';
import { withBlockExtensions } from '@plone/volto/helpers';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import './style.less';
import { setImageSize } from '@eeacms/volto-eea-website-theme/helpers';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getContent } from '@plone/volto/actions';
import { flattenToAppURL } from '@plone/volto/helpers';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
export const View = ({ data, detached, id, getContent, scales }) => {
  const [viewLoaded, setViewLoaded] = React.useState(false);

  React.useEffect(() => {
    if (data.url) {
      getContent(flattenToAppURL(data.url), null, id);
    }
  }, [data.url]);

  React.useEffect(() => {
    // using this method because the image is not loaded
    // correctly on a fresh render of the page
    // volto loses the parent container of
    // the image and the image is thrown randomly in the page
    // not happening if navigating to the page from routes (not fresh render)
    setViewLoaded(true);
  }, []);

  const { size = 'l', align = 'center', alt = '' } = data;

  const scaledImage = data?.url
    ? setImageSize(data?.url, scales, align === 'full' ? 'h' : size)
    : '';

  const href = data?.href?.[0]?.['@id'] || '';
  const { copyright, copyrightIcon, copyrightPosition } = data;
  return (
    <>
      {viewLoaded && (
        <p
          className={cx(
            'block image align',
            {
              center: !Boolean(align),
              detached,
            },
            align,
          )}
        >
          {scaledImage && (
            <>
              {(() => {
                const image = (
                  <div className="image-block">
                    <img
                      style={{
                        height: 'auto',
                        width: align === 'center' ? '100%' : scaledImage?.width,
                      }}
                      className={cx({
                        'full-width': align === 'full',
                        large: size === 'l',
                        medium: size === 'm',
                        small: size === 's',
                      })}
                      alt={alt || ''}
                      src={scaledImage?.download}
                      loading="lazy"
                    />
                    <div className="copyright-image">
                      {copyright ? (
                        <Copyright copyrightPosition={copyrightPosition}>
                          <Copyright.Icon>
                            <Icon className={copyrightIcon} />
                          </Copyright.Icon>
                          <Copyright.Text>{copyright}</Copyright.Text>
                        </Copyright>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                );
                if (href) {
                  return (
                    <UniversalLink
                      href={href}
                      openLinkInNewTab={data.openLinkInNewTab}
                    >
                      {image}
                    </UniversalLink>
                  );
                } else {
                  return image;
                }
              })()}
            </>
          )}
        </p>
      )}
    </>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default compose(
  withBlockExtensions,
  connect(
    (state, ownProps) => ({
      request: state.content.subrequests[ownProps.id] || {},
      scales: state.content.subrequests[ownProps.id]?.data?.image?.scales,
    }),
    { getContent },
  ),
)(View);
