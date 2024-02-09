/**
 * View image block.
 * @module components/manage/Blocks/Image/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UniversalLink } from '@plone/volto/components';
import cx from 'classnames';
import config from '@plone/volto/registry';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import { Icon } from 'semantic-ui-react';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
const View = ({ data, properties }) => {
  const { copyright, copyrightIcon, copyrightPosition } = data;
  const Image = config.getComponent({ name: 'Image' }).component;

  return (
    <>
      <p
        className={cx(
          'block image align',
          {
            center: !Boolean(data.align),
          },
          data.align,
        )}
      >
        <div
          className={cx(
            `image-block-container ${data?.align ? data?.align : ''}`,
          )}
        >
          {properties.image && (
            <>
              {(() => {
                const image = (
                  <div className="image-block">
                    <Image
                      className={cx({ 'full-width': data.align === 'full' })}
                      item={properties}
                      imageField="image"
                      sizes={config.blocks.blocksConfig.leadimage.getSizes(
                        data,
                      )}
                      alt={properties.image_caption || ''}
                      responsive={true}
                    />
                    <div
                      className={`copyright-wrapper ${
                        copyrightPosition ? copyrightPosition : 'left'
                      }`}
                    >
                      {copyright ? (
                        <Copyright copyrightPosition={copyrightPosition}>
                          <Copyright.Icon>
                            <Icon className={copyrightIcon} />
                          </Copyright.Icon>
                        </Copyright>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                );
                if (data.href) {
                  return (
                    <UniversalLink
                      href={data.href}
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
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default React.memo(View);
