import React from 'react';
import { Icon } from 'semantic-ui-react';
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
    <Copyright copyrightPosition={copyrightPosition}>
      <Copyright.Icon
        onMouseEnter={() => (showCopyrightHovering ? setHovering(true) : '')}
        onMouseLeave={() => (showCopyrightHovering ? setHovering(false) : '')}
        id="copyright-icon-hoverable"
      >
        <Icon name={copyrightIcon} />
      </Copyright.Icon>
      {showCopyrightHovering ? (
        <Copyright.Text
          id={`copyright-hovering-text-${
            hovering ? 'active' : 'inactive'
          }-${copyrightPosition}`}
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
