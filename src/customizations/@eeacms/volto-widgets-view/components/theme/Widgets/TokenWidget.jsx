import React from 'react';
import cx from 'classnames';
import Tag from '@eeacms/volto-eea-design-system/ui/Tag/Tag';

export const TokenWidget = ({ value, children, className }) =>
  value ? (
    <span className={cx(className, 'token', 'widget')}>
      {value.map((tag) => (
        <Tag href={`http://search.apps.eea.europa.eu/?q=${tag}`} key={tag}>
          {children ? children(tag) : tag}
        </Tag>
      ))}
    </span>
  ) : (
    ''
  );
