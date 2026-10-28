import React from 'react';

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
