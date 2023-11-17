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
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
export const View = (props) => {
  const { data, detached } = props;
  const href = data?.href?.[0]?.['@id'] || '';
  const { copyright, copyrightIcon, copyrightPosition } = data;
  // const [hovering, setHovering] = React.useState(false);
  const [viewLoaded, setViewLoaded] = React.useState(false);

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
                      <img
                        className={cx(
                          {
                            'full-width': data.align === 'full',
                            large: data.size === 'l',
                            medium: data.size === 'm',
                            small: data.size === 's',
                          },
                          data?.styles?.objectPosition,
                        )}
                        src={
                          isInternalURL(data.url)
                            ? // Backwards compat in the case that the block is storing the full server URL
                              (() => {
                                if (data.align === 'full')
                                  return `${flattenToAppURL(
                                    data.url,
                                  )}/@@images/image/huge`;
                                if (data.size === 'l')
                                  return `${flattenToAppURL(
                                    data.url,
                                  )}/@@images/image/great`;
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
                                )}/@@images/image/great`;
                              })()
                            : data.url
                        }
                        alt={data.alt || ''}
                        loading="lazy"
                      />
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

export default withBlockExtensions(React.memo(View));
