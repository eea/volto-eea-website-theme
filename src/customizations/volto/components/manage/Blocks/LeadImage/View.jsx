/**
 * View image block.
 * @module components/manage/Blocks/Image/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UniversalLink } from '@plone/volto/components';
import cx from 'classnames';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import { Icon } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
const View = (props) => {
  const { data, properties } = props;
  const { copyright, copyrightIcon, copyrightPosition } = data;

  const [hovering, setHovering] = React.useState(false);
  const [viewLoaded, setViewLoaded] = React.useState(false);

  React.useEffect(() => {
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
            },
            data.align,
          )}
        >
          <div
            className={`image-block-container ${
              data?.align ? data?.align : ''
            }`}
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
                      <div
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        className={`copyright-image ${
                          copyrightPosition ? copyrightPosition : 'left'
                        }`}
                      >
                        {copyright ? (
                          <Copyright copyrightPosition={copyrightPosition}>
                            <Copyright.Icon>
                              <Icon className={copyrightIcon} />
                            </Copyright.Icon>
                            <div
                              className={cx(
                                'copyright-hover-container',
                                !hovering ? 'visualHidden' : '',
                              )}
                            >
                              <Copyright.Text>{copyright}</Copyright.Text>
                            </div>
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
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default React.memo(View);
