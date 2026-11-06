import React from 'react';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { withBlockExtensions } from '@plone/volto/helpers/Extensions';
import DefaultTemplate from './variations/Default';

function arePropsEqual(prevProps, nextProps) {
  // check if component should be re-rendered
  return (
    prevProps.mode === nextProps.mode &&
    prevProps.id === nextProps.id &&
    prevProps.path === nextProps.path &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
}

const ContextNavigationView = React.memo((props = {}) => {
  const { variation, data = {} } = props;
  const navProps = React.useMemo(() => {
    const props = { ...data };
    const root_path = data?.root_node?.[0]?.['@id'];
    if (root_path) props['root_path'] = flattenToAppURL(root_path);
    return props;
  }, [data]);

  const Renderer = variation?.view ?? DefaultTemplate;
  return <Renderer params={navProps} mode={props.mode} />;
}, arePropsEqual);

export default withBlockExtensions(ContextNavigationView);
