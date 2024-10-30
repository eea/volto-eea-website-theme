/**
 * Breadcrumbs components.
 * @module components/theme/Breadcrumbs/Breadcrumbs
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLocation } from 'react-router';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import { getBreadcrumbs } from '@plone/volto/actions';
import config from '@plone/volto/registry';

import EEABreadcrumbs from '@eeacms/volto-eea-design-system/ui/Breadcrumbs/Breadcrumbs';

const isContentRoute = (pathname) => {
  const { settings } = config;
  const normalized_nonContentRoutes = settings.nonContentRoutes.map((item) => {
    if (item.test) {
      return item;
    } else {
      return new RegExp(item + '$');
    }
  });

  const isNonContentRoute =
    normalized_nonContentRoutes.findIndex((item) => item.test(pathname)) > -1;

  return !isNonContentRoute;
};

const Breadcrumbs = (props) => {
  const dispatch = useDispatch();
  const { items = [], root = '/' } = useSelector((state) => state?.breadcrumbs);
  const content = useSelector((state) => state?.content?.data);

  // const pathname = useSelector((state) => state.location.pathname);
  const location = useLocation();
  const { pathname } = location;

  const linkLevels = useMemo(() => {
    if (content) {
      const type = content['@type'];
      const isContentTypesToAvoid =
        config.settings.contentTypeToAvoidAsLinks || {};
      if (isContentTypesToAvoid[type]) {
        return isContentTypesToAvoid[type];
      }
    }
  }, [content]);

  const sections = items.map((item) => ({
    ...item,
    key: item.title,
  }));

  useEffect(() => {
    if (
      !hasApiExpander('breadcrumbs', getBaseUrl(pathname)) &&
      isContentRoute(pathname)
    ) {
      dispatch(getBreadcrumbs(getBaseUrl(pathname)));
    }
  }, [dispatch, pathname]);

  return (
    <React.Fragment>
      <div id="page-header" />
      <EEABreadcrumbs
        pathname={pathname}
        sections={sections}
        root={root}
        linkLevels={linkLevels}
      />
    </React.Fragment>
  );
};

export default Breadcrumbs;
