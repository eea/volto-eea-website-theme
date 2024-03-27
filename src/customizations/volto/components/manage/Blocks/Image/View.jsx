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
import {
  flattenToAppURL,
  isInternalURL,
  withBlockExtensions,
} from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
export const View = (props) => {
  const { className, data, detached, style } = props;
  const { copyright, copyrightIcon, copyrightPosition } = data;
  const href = data?.href?.[0]?.['@id'] ?? (data?.href || '');
  const showCopyright = data?.size === 'l' || !data.size;

  const Image = config.getComponent({ name: 'Image' }).component;

  return (
    <>
      <div
        className={cx(
          'block image align',
          {
            center: !Boolean(data.align),
            detached,
          },
          data.align,
          className,
        )}
        style={style}
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
                    <Image
                      className={cx(
                        {
                          'full-width': data.align === 'full',
                          large: data.size === 'l',
                          medium: data.size === 'm',
                          small: data.size === 's',
                        },
                        data?.styles?.objectPosition,
                      )}
                      item={
                        data.image_scales
                          ? {
                              '@id': data.url,
                              image_field: data.image_field,
                              image_scales: data.image_scales,
                            }
                          : undefined
                      }
                      src={
                        data.image_scales
                          ? undefined
                          : isInternalURL(data.url)
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
                      sizes={config.blocks.blocksConfig.image.getSizes(data)}
                      alt={data.alt || ''}
                      loading="lazy"
                      responsive={true}
                    />
                    <div
                      className={`copyright-wrapper ${
                        copyrightPosition ? copyrightPosition : 'left'
                      }`}
                    >
                      {copyright && showCopyright ? (
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
