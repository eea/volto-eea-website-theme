/**
 * Contents item component.
 * @module components/manage/Contents/ContentsItem
 */

import React from 'react';
import voltoPackageJson from '@plone/volto/../package.json';
import ContentsItemDndKit from '@eeacms/volto-eea-website-theme/components/manage/Contents/ContentsItemDndKit';
import ContentsItemReactDnd from '@eeacms/volto-eea-website-theme/components/manage/Contents/ContentsItemReactDnd';

// Volto 19 sorts the contents view with dnd-kit, Volto 18 with react-dnd, and
// each Contents.jsx only provides the context of its own library. Pick the
// matching item until Volto 18 is no longer supported.
const isVolto18 = `${voltoPackageJson.version}`.startsWith('18.');

const ContentsItem = (props) =>
  isVolto18 ? (
    <ContentsItemReactDnd {...props} />
  ) : (
    <ContentsItemDndKit {...props} />
  );

export default ContentsItem;
