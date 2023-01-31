import React from 'react';
import PropTypes from 'prop-types';
import { UniversalLink } from '@plone/volto/components';
import { Icon } from 'semantic-ui-react';
import cx from 'classnames';
import { withBlockExtensions } from '@plone/volto/helpers';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers';
import { Copyright } from '@eeacms/volto-eea-design-system/ui';
import '../style.less';

const CopyrightContent = ({
  align,
  copyrightPosition,
  showCopyrightHovering,
  setHovering,
  copyrightIcon,
  hovering,
  copyright,
}) => {
  return (
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
        onMouseEnter={() => (showCopyrightHovering ? setHovering(true) : '')}
        onMouseLeave={() => (showCopyrightHovering ? setHovering(false) : '')}
        id="copyright-icon-hoverable"
      >
        <Icon name={copyrightIcon} />
      </Copyright.Icon>
      {showCopyrightHovering ? (
        <Copyright.Text
          id={`copyright-hovering-text-${hovering ? 'active' : 'inactive'}-${
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
        <Copyright.Text id={'copyright-text'}>{copyright}</Copyright.Text>
      )}
    </Copyright>
  );
};

export default CopyrightContent;
