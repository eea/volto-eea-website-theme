import React from 'react';
import { expandToBackendURL } from '@plone/volto/helpers';

const CustomCSS = (props) => {
  return (
    <link rel={'stylesheet'} href={expandToBackendURL('voltoCustom.css')} />
  );
};
export default CustomCSS;
