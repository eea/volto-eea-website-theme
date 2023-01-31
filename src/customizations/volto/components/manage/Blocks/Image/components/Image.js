import React from 'react';
import cx from 'classnames';
import '../style.less';

const imageSizePicker = (url, size) => {
  if (url) {
    if (size === 'l') return `${url}/@@images/image`;
    if (size === 'm') return `${url}/@@images/image/preview`;
    if (size === 's') return `${url}/@@images/image/mini`;
    return `${url}/@@images/image`;
  }
};

const Image = ({ url, size, align, children }) => {
  const styles = {
    zIndex: 4,
    position: 'relative',
    backgroundImage: `url(${imageSizePicker(url, size)})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };

  const classes = cx({
    imageElement: true,
    'full-width': align === 'full',
    large: size === 'l',
    medium: size === 'm',
    small: size === 's',
  });

  return (
    <div className={classes} style={styles}>
      {children}
    </div>
  );
};

export default Image;
