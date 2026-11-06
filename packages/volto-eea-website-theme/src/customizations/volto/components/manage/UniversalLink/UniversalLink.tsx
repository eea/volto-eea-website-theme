/*
 * UniversalLink
 * @module components/UniversalLink
 *
 * EEA customizations:
 * - `rel="noopener"` without `noreferrer` on external and display-file links.
 * - `item.linkWithHash` (set by ObjectBrowserWidget) keeps `#anchors`.
 * - `/@@download/file` is appended only when the `download` prop is set.
 * - display-file links honor `openLinkInNewTab={false}`.
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
import type { ObjectBrowserItem } from '@plone/types';

type BaseProps = {
  openLinkInNewTab?: boolean;
  download?: boolean;
  children: React.ReactNode;
  className?: string;
  title?: string;
  smooth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
};

type HrefOnly = {
  href: string;
  item?: never;
} & BaseProps;

type ItemOnly = {
  href?: never;
  // EEA: `linkWithHash` is set by ObjectBrowserWidget for pasted `#anchor` links
  item: Partial<ObjectBrowserItem> & {
    remoteUrl?: string;
    linkWithHash?: string;
  };
} & BaseProps;

export type UniversalLinkProps = HrefOnly | ItemOnly;
export interface AppState {
  content: {
    data?: {
      '@components'?: {
        translations?: {
          items?: { language: string; '@id': string }[];
        };
      };
    };
  };
  navroot: {
    data: {
      navroot: {
        id: string;
      };
    };
  };
  intl: {
    locale: string;
  };
  userSession: {
    token: string | null;
  };
}

export const __test = {
  renderCounter: () => {},
};

// EEA: with the `download` prop, internal links point to the file download
// (e.g. the CTA block "download" option); `/@@download/file` is added once.
const withDownload = (props: UniversalLinkProps, url: string): string =>
  props.download && isInternalURL(url) && !url.includes('/@@download/file')
    ? `${url}/@@download/file`
    : url;

export function getUrl(
  props: UniversalLinkProps,
  token: string | null,
  item: UniversalLinkProps['item'],
  children: React.ReactNode,
): string {
  if ('href' in props && typeof props.href === 'string') {
    return withDownload(props, props.href);
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

  // EEA: `download` instead of `!token`, so anonymous visitors are not
  // always sent to the file download
  if (
    props.download &&
    item['@type'] &&
    config.settings.downloadableObjects.includes(item['@type']) &&
    !url.includes('/@@download/file')
  ) {
    url = `${url}/@@download/file`;
  }

  if (
    !token &&
    item['@type'] &&
    config.settings.viewableInBrowserObjects.includes(item['@type'])
  ) {
    url = `${url}/@@display-file/file`;
  }

  return withDownload(props, url);
}

const UniversalLink = React.memo(
  React.forwardRef<HTMLAnchorElement | HTMLDivElement, UniversalLinkProps>(
    function UniversalLink(props, ref) {
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
        href,
        ...rest
      } = props;
      __test.renderCounter();

      const token = useSelector<AppState, string | null>(
        (state) => state.userSession?.token,
      );

      let url = getUrl(props, token, item, children);

      const isExternal = !isInternalURL(url);

      const isDownload =
        (!isExternal && url.includes('@@download')) || download;
      const isDisplayFile =
        (!isExternal && url.includes('@@display-file')) || false;

      const checkedURL = URLUtils.checkAndNormalizeUrl(url);

      // EEA: we can receive an item with a linkWithHash property set from
      // ObjectBrowserWidget; if so, we use that instead of the computed url
      url = item?.linkWithHash || checkedURL.url;
      let tag = (
        <Link
          to={flattenToAppURL(url)}
          target={openLinkInNewTab ?? false ? '_blank' : undefined}
          title={title}
          className={className}
          onClick={onClick}
          smooth={smooth ?? config.settings.hashLinkSmoothScroll}
          // @ts-ignore
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
            // EEA: no `noreferrer`, so the target site gets the referrer
            rel="noopener"
            {...rest}
            className={getClassName}
            ref={ref as React.Ref<HTMLAnchorElement>}
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
            ref={ref as React.Ref<HTMLAnchorElement>}
          >
            {children}
          </a>
        );
      } else if (isDisplayFile) {
        tag = (
          <a
            title={title}
            // EEA: open in a new tab unless `openLinkInNewTab` is false
            target={!(openLinkInNewTab === false) ? '_blank' : undefined}
            // EEA: no `noreferrer`, so the target site gets the referrer
            rel="noopener"
            {...rest}
            href={flattenToAppURL(url)}
            className={className}
            ref={ref as React.Ref<HTMLAnchorElement>}
          >
            {children}
          </a>
        );
      }
      return tag;
    },
  ),
);

export default UniversalLink;
