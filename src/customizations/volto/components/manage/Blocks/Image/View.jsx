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
import { CopyrightContent, Image } from './components';

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
    size = 'l',
    alt,
  } = data;

  const showCopyrightHovering = copyright?.length > 50;

  console.log(data, 'data');

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
                <Image url={url} size={size} align={align}>
                  <div
                    className={cx('copyright-image-block ', {
                      right: align === 'right',
                    })}
                  >
                    {copyright && size === 'l' ? (
                      <CopyrightContent
                        align={align}
                        copyrightPosition={copyrightPosition}
                        showCopyrightHovering={showCopyrightHovering}
                        setHovering={setHovering}
                        copyrightIcon={copyrightIcon}
                        hovering={hovering}
                        copyright={copyright}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                </Image>
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
