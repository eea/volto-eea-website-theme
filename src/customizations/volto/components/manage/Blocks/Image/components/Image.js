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

const selectScale = (size) => {
  if (size === 'l') return 'large';
  if (size === 'm') return 'preview';
  if (size === 's') return 'mini';
  return 'large';
};

const Image = ({ url, size, align, children, content }) => {
  const classes = cx({
    imageElement: true,
    'full-width': align === 'full',
    large: size === 'l',
    medium: size === 'm',
    small: size === 's',
  });

  const imageContent = content?.scales?.[selectScale(size)];

  const styles = {
    zIndex: 4,
    position: 'relative',
    backgroundImage: `url(${imageSizePicker(url, size)})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    height: imageContent?.height ? `${imageContent.height}px` : '500px',
    width: imageContent?.width ? `${imageContent.width}px` : '100%',
  };

  return (
    <div className={classes} style={styles}>
      {children}
    </div>
  );
};

export default Image;
