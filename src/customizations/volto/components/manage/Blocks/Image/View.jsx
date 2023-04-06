/* eslint-disable jsx-a11y/mouse-events-have-key-events */
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
import { setImageSize } from '@eeacms/volto-eea-website-theme/helpers';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getContent } from '@plone/volto/actions';
import { flattenToAppURL } from '@plone/volto/helpers';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import './style.less';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.url]);

  React.useEffect(() => {
    // using this method because the image is not loaded
    // correctly on a fresh render of the page
    // volto loses the parent container of
    // the image and the image is thrown randomly in the page
    // not happening if navigating to the page from routes (not fresh render)
    setViewLoaded(true);
  }, []);

  const { size = 'l', align = 'center' } = data;

  const scaledImage = data?.url
    ? setImageSize(data?.url, scales, align === 'full' ? 'h' : size)
    : '';

  const href = data?.href?.[0]?.['@id'] || '';
  const { copyright, copyrightIcon, copyrightPosition } = data;
  // const [hovering, setHovering] = React.useState(false);

  const showCopyright = data?.size === 'l' || !data.size;

  React.useEffect(() => {
    setViewLoaded(true);
  }, []);

  return (
    <>
      {viewLoaded && (
        <div
          className={cx(
            'block image align',
            {
              center: !Boolean(data.align),
              detached,
            },
            data.align,
          )}
        >
          <div
            className={cx(
              'image-block-container',
              {
                large: data.size === 'l',
                medium: data.size === 'm',
                small: data.size === 's',
              },
              data?.align ? data?.align : '',
            )}
          >
            {data.url && (
              <>
                {(() => {
                  const image = (
                    <>
                      <LazyLoadComponent>
                        <img
                          className={cx({
                            'full-width': data.align === 'full',
                            large: data.size === 'l',
                            medium: data.size === 'm',
                            small: data.size === 's',
                          })}
                          src={scaledImage?.download}
                          alt={data.alt || ''}
                          loading="lazy"
                        />
                      </LazyLoadComponent>
                      <div
                        // onMouseEnter={() => setHovering(true)}
                        // onMouseLeave={() => setHovering(false)}
                        className={`copyright-wrapper ${
                          copyrightPosition ? copyrightPosition : 'left'
                        }`}
                      >
                        {copyright && showCopyright ? (
                          <Copyright copyrightPosition={copyrightPosition}>
                            <Copyright.Icon>
                              <Icon className={copyrightIcon} />
                            </Copyright.Icon>
                            {/*<div*/}
                            {/*  className={cx(*/}
                            {/*    'copyright-hover-container',*/}
                            {/*    !hovering ? 'hiddenStructure' : '',*/}
                            {/*  )}*/}
                            {/*>*/}
                            <Copyright.Text>{copyright}</Copyright.Text>
                            {/*</div>*/}
                          </Copyright>
                        ) : (
                          ''
                        )}
                      </div>
                    </>
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
          </div>
        </div>
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
