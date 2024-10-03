/**
 * Web Report title block variation.
 * @module components/manage/Blocks/Title/variations/WebReport
 */

import React from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';

import { MaybeWrap } from '@plone/volto/components';
import BannerView from '@eeacms/volto-eea-website-theme/components/theme/Banner/View';
import Banner from '@eeacms/volto-eea-design-system/ui/Banner/Banner';
import clsx from 'clsx';

import { BodyClass } from '@plone/volto/helpers';

function IsomorphicPortal({ children }) {
  const [isClient, setIsClient] = React.useState();
  React.useEffect(() => setIsClient(true), []);

  return isClient ? (
    <Portal node={document.querySelector('.eea.header')}>{children}</Portal>
  ) : (
    children
  );
}

const WebReport = (props) => {
  return (
    <MaybeWrap condition={!props.isEditMode} as={IsomorphicPortal}>
      <BodyClass
        className={clsx(
          'homepage homepage-inverse homepage-header light-header',
          props.data.hero_header ? 'hero-header' : '',
        )}
      />
      <BannerView
        {...props}
        data={{
          ...props.data,
          hideContentType: true,
          aboveTitle: (
            <div className="content-type">
              {props.data.content_type || props.properties.type_title}
            </div>
          ),
          belowTitle: (
            <>
              <Banner.Subtitle>
                <span className="subtitle-light">{props.data.subtitle}</span>
              </Banner.Subtitle>
            </>
          ),
        }}
      />
    </MaybeWrap>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
WebReport.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default WebReport;
