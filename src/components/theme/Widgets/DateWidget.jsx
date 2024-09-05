import React from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import { toBackendLang } from '@plone/volto/helpers';
import { formatDate } from '@plone/volto/helpers/Utils/Date';
import config from '@plone/volto/registry';

export const DateWidget = ({ value, children, className }) => {
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
    },
    locale,
  };

  return value ? (
    <span className={cx(className, 'date', 'widget')}>
      {children
        ? children(formatDate(formatOptions))
        : formatDate(formatOptions)}
    </span>
  ) : (
    ''
  );
};
