/**
 * View image block.
 * @module components/manage/Blocks/Image/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UniversalLink } from '@plone/volto/components';
import cx from 'classnames';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import './style.less';
import { Icon } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
const View = ({ data, properties }) => {
  const { copyright, copyrightIcon, copyrightPosition } = data;

  return (
    <p
      className={cx(
        'block image align',
        {
          center: !Boolean(data.align),
        },
        data.align,
      )}
    >
      {properties.image && (
        <>
          {(() => {
            const image = (
              <div className="image-block">
                <img
                  className={cx({ 'full-width': data.align === 'full' })}
                  src={flattenToAppURL(properties.image.download)}
                  alt={properties.image_caption || ''}
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
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default View;
