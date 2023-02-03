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
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import './style.less';
/**
 * View image block class.
 * @class View
 * @extends Component
 */
export const View = ({ data, detached }) => {
  const href = data?.href?.[0]?.['@id'] || '';
  const { copyright, copyrightIcon, copyrightPosition } = data;

  const showCopyrightHovering = copyright?.length > 50;

  const [hovering, setHovering] = React.useState(false);
  const [viewLoaded, setViewLoaded] = React.useState(false);

  const showCopyright = data?.size === 'l' || !data.size;

  React.useEffect(() => {
    // using this method because the image is not loaded
    // correctly on a fresh render of the page
    // volto loses the parent container of
    // the image and the image is thrown randomly in the page
    // not happening if navigating to the page from routes (not fresh render)
    setViewLoaded(true);
  }, []);

  return (
    <>
      {viewLoaded && (
        <p
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
            className={`image-block-container ${
              data?.align ? data?.align : ''
            }`}
          >
            {data.url && (
              <>
                {(() => {
                  const image = (
                    <>
                      <img
                        className={cx({
                          'full-width': data.align === 'full',
                          large: data.size === 'l',
                          medium: data.size === 'm',
                          small: data.size === 's',
                        })}
                        src={
                          isInternalURL(data.url)
                            ? // Backwards compat in the case that the block is storing the full server URL
                              (() => {
                                if (data.size === 'l')
                                  return `${flattenToAppURL(
                                    data.url,
                                  )}/@@images/image`;
                                if (data.size === 'm')
                                  return `${flattenToAppURL(
                                    data.url,
                                  )}/@@images/image/preview`;
                                if (data.size === 's')
                                  return `${flattenToAppURL(
                                    data.url,
                                  )}/@@images/image/mini`;
                                return `${flattenToAppURL(
                                  data.url,
                                )}/@@images/image`;
                              })()
                            : data.url
                        }
                        alt={data.alt || ''}
                        loading="lazy"
                      />
                      <div
                        onMouseEnter={() =>
                          showCopyrightHovering ? setHovering(true) : ''
                        }
                        onMouseLeave={() =>
                          showCopyrightHovering ? setHovering(false) : ''
                        }
                        className={`copyright-image ${
                          copyrightPosition ? copyrightPosition : 'left'
                        }`}
                      >
                        {copyright && showCopyright ? (
                          <Copyright copyrightPosition={copyrightPosition}>
                            <Copyright.Icon>
                              <Icon className={copyrightIcon} />
                            </Copyright.Icon>
                            {showCopyrightHovering ? (
                              <>
                                {hovering && (
                                  <div className="copyright-hover-container">
                                    <Copyright.Text>{copyright}</Copyright.Text>
                                  </div>
                                )}
                              </>
                            ) : (
                              <Copyright.Text>{copyright}</Copyright.Text>
                            )}
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

export default withBlockExtensions(View);
