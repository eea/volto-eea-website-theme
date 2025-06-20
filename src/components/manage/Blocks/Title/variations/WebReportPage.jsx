/**
 * Web Report Page title block variation.
 * @module components/manage/Title/variations/WebReport
 */

import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import { MaybeWrap } from '@plone/volto/components';
import BannerView from '@eeacms/volto-eea-website-theme/components/theme/Banner/View';
import clsx from 'clsx';

import { BodyClass } from '@plone/volto/helpers';

function IsomorphicPortal({ children }) {
  const [isClient, setIsClient] = React.useState();
  React.useEffect(() => setIsClient(true), []);

  return isClient
    ? createPortal(children, document.querySelector('.eea.header'))
    : children;
}

const WebReportPage = (props) => {
  return (
    <MaybeWrap condition={!props.isEditMode} as={IsomorphicPortal}>
      <BodyClass className={clsx('homepage-inverse light-header')} />
      <BannerView
        {...props}
        data={{
          ...props.data,
          aboveTitle: (
            <>
              {!props.data.hideContentType && (
                <div className="content-type">
                  {props.data.content_type || props.properties.type_title}
                </div>
              )}
              <div className="subtitle">{props.data.subtitle}</div>
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
WebReportPage.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default WebReportPage;
