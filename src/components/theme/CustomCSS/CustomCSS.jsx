import React from 'react';
import config from '@plone/volto/registry';

const CustomCSS = (props) => {
  const href = `/voltoCustom.css`;
  const src = `/voltoCustom.js`;
  return (
    <>
      <link rel="stylesheet" href={href} />
      <script type="text/javascript" src={src}></script>
    </>
  );
};
export default CustomCSS;
