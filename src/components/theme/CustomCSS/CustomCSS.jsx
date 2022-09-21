import React from 'react';

import config from '@plone/volto/registry';

const CustomCSS = (props) => {
  return (
    <link
      rel={'stylesheet'}
      href={`${config.settings.apiPath}/voltoCustom.css`}
    />
  );
};
export default CustomCSS;
