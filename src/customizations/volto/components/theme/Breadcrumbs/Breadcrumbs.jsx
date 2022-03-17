/**
 * Breadcrumbs components.
 * @module components/theme/Breadcrumbs/Breadcrumbs
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import { getBreadcrumbs } from '@plone/volto/actions';
import EEABreadcrumbs from '@eeacms/volto-eea-design-system/ui/Breadcrumbs/Breadcrumbs';

const Breadcrumbs = (props) => {
  const dispatch = useDispatch();
  const { items = [], root = '/' } = useSelector((state) => state?.breadcrumbs);
  const { pathname } = props;

  const sections = items.map((item) => ({
    title: item.title,
    href: item.url,
    key: item.title,
  }));

  useEffect(() => {
    if (!hasApiExpander('breadcrumbs', getBaseUrl(pathname))) {
      dispatch(getBreadcrumbs(getBaseUrl(pathname)));
    }
  }, [dispatch, pathname]);

  return (
    <>
      <EEABreadcrumbs
        pathname={pathname}
        sections={sections}
        root={root}
        icon="right chevron"
      />
      <div id="page-header" />
    </>
  );
};

export default Breadcrumbs;
