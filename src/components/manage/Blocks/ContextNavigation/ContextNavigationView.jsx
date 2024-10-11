import React from 'react';
import { flattenToAppURL, withBlockExtensions } from '@plone/volto/helpers';
import DefaultTemplate from './variations/Default';

const ContextNavigationView = (props = {}) => {
  const { variation, data = {} } = props;
  const navProps = { ...data };
  const root_path = data?.root_node?.[0]?.['@id'];
  if (root_path) navProps['root_path'] = flattenToAppURL(root_path);
  const Renderer = variation?.view ?? DefaultTemplate;
  return <Renderer params={navProps} mode={props.mode} />;
};

export default withBlockExtensions(ContextNavigationView);
