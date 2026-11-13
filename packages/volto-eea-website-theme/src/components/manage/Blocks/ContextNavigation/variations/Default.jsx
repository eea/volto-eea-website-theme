import React from 'react';
import ConnectedContextNavigation from '@plone/volto/components/theme/Navigation/ContextNavigation';

const Default = (props) => {
  const { params } = props;
  return <ConnectedContextNavigation params={params} />;
};

export default Default;
