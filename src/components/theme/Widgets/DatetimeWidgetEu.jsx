import React from 'react';
import cx from 'classnames';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { toBackendLang } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

export const DatetimeWidgetEu = ({
  value,
  children,
  className,
  format = 'lll',
}) => {
  const lang = useSelector((state) => state.intl.locale);

  const backendLang = toBackendLang(lang);
  moment.locale(
    backendLang === 'en' ? config.settings.dateLocale : backendLang,
  );
  const dateFormat = backendLang === 'en' ? 'D MMM YYYY' : format;

  return value ? (
    <span className={cx(className, 'datetime', 'widget')}>
      {children
        ? children(moment(value).format(dateFormat))
        : moment(value).format(dateFormat)}
    </span>
  ) : (
    ''
  );
};
