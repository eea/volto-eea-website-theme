import React from 'react';
import cx from 'classnames';
import Tag from '@eeacms/volto-eea-design-system/ui/Tag/Tag';

export const ThemesWidget = ({ value, children, className }) => {
  return value ? (
    <span className={cx(className, 'token', 'widget')}>
      {value.map((tag) => (
        <Tag
          href={`https://www.eea.europa.eu/en/advanced-search?filters[0][field]=topic&filters[0][values][0]=${tag.title}&filters[0][type]=any&filters[1][field]=language&filters[1][type]=any&filters[1][values][0]=en&sort-field=issued.date&sort-direction=desc`}
          key={tag.token}
        >
          {children ? children(tag.title) : tag.title}
        </Tag>
      ))}
    </span>
  ) : (
    ''
  );
};
