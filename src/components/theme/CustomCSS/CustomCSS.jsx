import React from 'react';
import config from '@plone/volto/registry';

const CustomCSS = (props) => {
  const href = `${config.settings.apiPath}/voltoCustom.css`;
  return (
    <>
      <link rel="stylesheet" href={href} />
    </>
  );
};
export default CustomCSS;
