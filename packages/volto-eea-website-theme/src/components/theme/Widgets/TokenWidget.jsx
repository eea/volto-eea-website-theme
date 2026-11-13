import React from 'react';
import cx from 'classnames';
import Tag from '@eeacms/volto-eea-design-system/ui/Tag/Tag';

export const TokenWidget = ({ value, children, className }) =>
  value ? (
    <div className={cx(className, 'token', 'widget', 'tags-content')}>
      {value.map((tag) => (
        <Tag
          href={`https://www.eea.europa.eu/en/advanced-search?q=${tag}`}
          key={tag}
        >
          {children ? children(tag) : tag}
        </Tag>
      ))}
    </div>
  ) : (
    ''
  );
