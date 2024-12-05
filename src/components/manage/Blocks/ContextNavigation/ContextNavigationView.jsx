import React from 'react';
import { flattenToAppURL, withBlockExtensions } from '@plone/volto/helpers';
import DefaultTemplate from './variations/Default';

const ContextNavigationView = React.memo(
  (props = {}) => {
    const { variation, data = {} } = props;
    const navProps = React.useMemo(() => {
      const props = { ...data };
      const root_path = data?.root_node?.[0]?.['@id'];
      if (root_path) props['root_path'] = flattenToAppURL(root_path);
      return props;
    }, [data]);

    const Renderer = variation?.view ?? DefaultTemplate;
    return <Renderer params={navProps} mode={props.mode} />;
  },
  (prevProps, nextProps) => {
    // check if props have changed for memo
    return (
      prevProps.mode === nextProps.mode &&
      prevProps.variation === nextProps.variation &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    );
  },
);

export default withBlockExtensions(ContextNavigationView);
