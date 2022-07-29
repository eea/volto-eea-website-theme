/**
 * Breadcrumbs components.
 * @module components/theme/Breadcrumbs/Breadcrumbs
 */

import React, { useEffect } from 'react';
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
  // const pathname = useSelector((state) => state.location.pathname);
  const location = useLocation();
  const { pathname } = location;

  const sections = items.map((item) => ({
    title: item.title,
    href: item.url,
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
      <EEABreadcrumbs pathname={pathname} sections={sections} root={root} />
    </React.Fragment>
  );
};

export default Breadcrumbs;
