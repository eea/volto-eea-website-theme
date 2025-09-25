import React from 'react';
import config from '@plone/volto/registry';

const CustomCSS = (props) => {
  const href = `${config.settings.apiPath}/voltoCustom.css`;
  const src = `${config.settings.apiPath}/voltoCustom.js`;
  return (
    <>
      <link rel="stylesheet" href={href} />
      <script type="text/javascript" src={src}></script>
    </>
  );
};
export default CustomCSS;
