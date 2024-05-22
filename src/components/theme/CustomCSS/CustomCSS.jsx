import React from 'react';
import config from '@plone/volto/registry';

const CustomCSS = (props) => {
  const href = `${config.settings.apiPath}/voltoCustom.css`;
  return (
    <>
      <link
        rel="preload"
        href={href}
        as="style"
        onload="this.onload=null;this.rel='stylesheet'"
      />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </>
  );
};
export default CustomCSS;
