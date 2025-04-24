import React from 'react';
import cx from 'classnames';

const CreatorsViewWidget = ({ content, children, className }) => {
  const value = content?.creators_fullname || null;
  return value ? (
    <span className={cx(className, 'array', 'widget')}>
      {value.map((item, key) => (
        <>
          {key ? ', ' : ''}
          <span key={item.token || item.title || item}>
            {children
              ? children(item.title || item.token || item)
              : item.title || item.token || item}
          </span>
        </>
      ))}
    </span>
  ) : (
    ''
  );
};

export default CreatorsViewWidget;
