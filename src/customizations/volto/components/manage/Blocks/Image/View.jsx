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
  const {
    copyright,
    copyrightIcon,
    copyrightPosition,
    align,
    url,
    size,
    alt,
  } = data;

  const showCopyrightHovering = copyright?.length > 50;

  const [hovering, setHovering] = React.useState(false);

  return (
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
      {url && (
        <>
          {(() => {
            const image = (
              <div className="image-block">
                <img
                  className={cx({
                    'full-width': data.align === 'full',
                    large: size === 'l',
                    medium: size === 'm',
                    small: size === 's',
                  })}
                  style={{ margin: 'unset', padding: 'unset' }}
                  src={
                    isInternalURL(data.url)
                      ? // Backwards compat in the case that the block is storing the full server URL
                        (() => {
                          if (size === 'l')
                            return `${flattenToAppURL(url)}/@@images/image`;
                          if (size === 'm')
                            return `${flattenToAppURL(
                              url,
                            )}/@@images/image/preview`;
                          if (size === 's')
                            return `${flattenToAppURL(
                              url,
                            )}/@@images/image/mini`;
                          return `${flattenToAppURL(url)}/@@images/image`;
                        })()
                      : url
                  }
                  alt={alt || ''}
                />
                <div
                  className={cx('copyright-image-block ', {
                    right: align === 'right',
                  })}
                >
                  {copyright && size === 'l' ? (
                    <Copyright
                      copyrightPosition={
                        align === 'right'
                          ? align
                          : align === 'left'
                          ? 'left'
                          : copyrightPosition
                      }
                    >
                      <Copyright.Icon
                        onMouseEnter={() =>
                          showCopyrightHovering ? setHovering(true) : ''
                        }
                        onMouseLeave={() =>
                          showCopyrightHovering ? setHovering(false) : ''
                        }
                        id="copyright-icon-hoverable"
                      >
                        <Icon size="large" name={copyrightIcon} />
                      </Copyright.Icon>
                      {showCopyrightHovering ? (
                        <Copyright.Text
                          id={`copyright-hovering-text-${
                            hovering ? 'active' : 'inactive'
                          }-${
                            align === 'right'
                              ? align
                              : align === 'left'
                              ? 'left'
                              : copyrightPosition
                          }`}
                        >
                          {copyright}
                        </Copyright.Text>
                      ) : (
                        <Copyright.Text id={'copyright-text'}>
                          {copyright}
                        </Copyright.Text>
                      )}
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
