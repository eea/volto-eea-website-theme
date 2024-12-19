/*
 * UniversalLink
 * @module components/UniversalLink
 * Removed noreferrer from rel attribute
 */

import React from 'react';
import PropTypes from 'prop-types';
import { HashLink as Link } from 'react-router-hash-link';
import { useSelector } from 'react-redux';
import {
  flattenToAppURL,
  isInternalURL,
  URLUtils,
} from '@plone/volto/helpers/Url/Url';

import config from '@plone/volto/registry';

const UniversalLink = ({
  href,
  item = null,
  openLinkInNewTab,
  download = false,
  children,
  className = null,
  title = null,
  ...props
}) => {
  const token = useSelector((state) => state.userSession?.token);

  let url = href;

  if (!href && item) {
    if (!item['@id']) {
      // eslint-disable-next-line no-console
      console.error(
        'Invalid item passed to UniversalLink',
        item,
        props,
        children,
      );
      url = '#';
    } else {
      //case: generic item
      url = flattenToAppURL(item['@id']);

      //case: item like a Link
      let remoteUrl = item.remoteUrl || item.getRemoteUrl;
      if (!token && remoteUrl) {
        url = remoteUrl;
      }

      //case: item of type 'File'
      if (
        download &&
        config.settings.downloadableObjects.includes(item['@type'])
      ) {
        url = url.includes('/@@download/file') ? url : `${url}/@@download/file`;
      }

      if (
        !token &&
        config.settings.viewableInBrowserObjects.includes(item['@type'])
      ) {
        url = `${url}/@@display-file/file`;
      }
    }
  }

  if (download && isInternalURL(url)) {
    url = url.includes('/@@download/file') ? url : `${url}/@@download/file`;
  }

  const isExternal = !isInternalURL(url);
  const isDownload =
    (!isExternal && url && url.includes('@@download')) || download;

  const isDisplayFile =
    (!isExternal && url.includes('@@display-file')) || false;
  const checkedURL = URLUtils.checkAndNormalizeUrl(url);

  // we can receive an item with a linkWithHash property set from ObjectBrowserWidget
  // if so, we use that instead of the url prop
  url = (item && item['linkWithHash']) || checkedURL.url;
  let tag = (
    <Link
      to={flattenToAppURL(url)}
      target={openLinkInNewTab ?? false ? '_blank' : null}
      title={title}
      className={className}
      smooth={config.settings.hashLinkSmoothScroll}
      {...props}
    >
      {children}
    </Link>
  );

  if (isExternal) {
    tag = (
      <a
        href={url}
        title={title}
        target={
          !checkedURL.isMail &&
          !checkedURL.isTelephone &&
          !(openLinkInNewTab === false)
            ? '_blank'
            : null
        }
        rel="noopener"
        className={className}
        {...props}
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
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  } else if (isDisplayFile) {
    tag = (
      <a
        href={flattenToAppURL(url)}
        title={title}
        target={!(openLinkInNewTab === false) ? '_blank' : null}
        rel="noopener"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }
  return tag;
};

UniversalLink.propTypes = {
  href: PropTypes.string,
  openLinkInNewTab: PropTypes.bool,
  download: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  item: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    remoteUrl: PropTypes.string, //of plone @type 'Link'
  }),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default UniversalLink;
