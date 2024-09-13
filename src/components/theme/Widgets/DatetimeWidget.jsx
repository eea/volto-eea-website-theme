import React from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import { toBackendLang } from '@plone/volto/helpers';
import { formatDate } from '@plone/volto/helpers/Utils/Date';
import config from '@plone/volto/registry';

export const DatetimeWidget = ({ value, children, className }) => {
  const lang = useSelector((state) => state.intl.locale);
  const backendLang = toBackendLang(lang);
  const locale =
    backendLang === 'en' ? config.settings.dateLocale : backendLang;
  const formatOptions = {
    date: value,
    format: {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
    locale,
    includeTime: true,
    formatToParts: true,
  };

  let formattedParts = formatDate(formatOptions);

  const formattedDate = formattedParts
    .map((part) => {
      if (part.type === 'literal' && part.value === ', ') {
        return ' ';
      }
      return part.value;
    })
    .join('');

  return value ? (
    <span className={cx(className, 'datetime', 'widget')}>
      {children ? children(formattedDate) : formattedDate}
    </span>
  ) : (
    ''
  );
};
