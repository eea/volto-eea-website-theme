/*
 * UniversalLink
 * @module components/UniversalLink
 * EEA Customizations:
 *  - Removed noreferrer from rel attribute (external links use rel="noopener")
 *  - linkWithHash support from ObjectBrowserWidget
 *  - Download logic preserved for authenticated users when download prop is set
 */

import React from 'react';
import { HashLink as Link } from 'react-router-hash-link';
import { useSelector } from 'react-redux';
import {
  flattenToAppURL,
  isInternalURL,
  URLUtils,
} from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import cx from 'classnames';

export const __test = {
  renderCounter: () => {},
};

export function getUrl(props, token, item, children) {
  if ('href' in props && typeof props.href === 'string') {
    return props.href;
  }

  if (!item || item['@id'] === '') return config.settings.publicURL;
  if (!item['@id']) {
    // eslint-disable-next-line no-console
    console.error(
      'Invalid item passed to UniversalLink',
      item,
      props,
      children,
    );
    return '#';
  }

  let url = flattenToAppURL(item['@id']);
  const remoteUrl = item.remoteUrl || item.getRemoteUrl;

  if (!token && remoteUrl) {
    url = remoteUrl;
  }

  // EEA: Keep download URL append for authenticated users when download prop
  // is explicitly set. Upstream only applies this when !token.
  if (
    props.download ||
    (!token &&
      item['@type'] &&
      config.settings.downloadableObjects.includes(item['@type']))
  ) {
    url = url.includes('/@@download/file') ? url : `${url}/@@download/file`;
  }

  if (
    !token &&
    item['@type'] &&
    config.settings.viewableInBrowserObjects.includes(item['@type'])
  ) {
    url = `${url}/@@display-file/file`;
  }

  return url;
}

const UniversalLink = React.memo(
  React.forwardRef(function UniversalLink(props, ref) {
    const {
      openLinkInNewTab,
      download,
      children,
      className,
      title,
      smooth,
      onClick,
      onKeyDown,
      item,
      ...rest
    } = props;
    __test.renderCounter();

    const token = useSelector((state) => state.userSession?.token);

    let url = getUrl(props, token, item, children);

    // EEA: download support for href-based internal URLs
    if (download && isInternalURL(url)) {
      url = url.includes('/@@download/file') ? url : `${url}/@@download/file`;
    }

    const isExternal = !isInternalURL(url);

    const isDownload = (!isExternal && url.includes('@@download')) || download;
    const isDisplayFile =
      (!isExternal && url.includes('@@display-file')) || false;

    const checkedURL = URLUtils.checkAndNormalizeUrl(url);

    // EEA: linkWithHash support - use item's linkWithHash if available
    url = (item && item['linkWithHash']) || checkedURL.url;

    let tag = (
      <Link
        to={flattenToAppURL(url)}
        target={openLinkInNewTab ?? false ? '_blank' : undefined}
        title={title}
        className={className}
        onClick={onClick}
        smooth={smooth ?? config.settings.hashLinkSmoothScroll}
        ref={ref}
        {...rest}
      >
        {children}
      </Link>
    );

    if (isExternal) {
      const isTelephoneOrMail = checkedURL.isMail || checkedURL.isTelephone;
      const getClassName = cx({ external: !isTelephoneOrMail }, className);

      tag = (
        <a
          href={url}
          title={title}
          target={
            !isTelephoneOrMail && !(openLinkInNewTab === false)
              ? '_blank'
              : undefined
          }
          rel="noopener"
          {...rest}
          className={getClassName}
          ref={ref}
        >
          {children}
        </a>
      );
    } else if (isDownload) {
      tag = (
        <a
          href={flattenToAppURL(url)}
          download
          title={title}
          {...rest}
          className={className}
          ref={ref}
        >
          {children}
        </a>
      );
    } else if (isDisplayFile) {
      tag = (
        <a
          title={title}
          target="_blank"
          rel="noopener"
          {...rest}
          href={flattenToAppURL(url)}
          className={className}
          ref={ref}
        >
          {children}
        </a>
      );
    }
    return tag;
  }),
);

export default UniversalLink;
