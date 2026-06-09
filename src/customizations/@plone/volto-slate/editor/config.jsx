import React from 'react';

import { elements as originalElements } from '../../../../../../../../node_modules/@plone/volto-slate/src/editor/config.jsx';

export * from '../../../../../../../../node_modules/@plone/volto-slate/src/editor/config.jsx';

const inlineMarkupElements = [
  ['em', 'em'],
  ['i', 'i'],
  ['b', 'b'],
  ['strong', 'strong'],
  ['u', 'u'],
  ['s', 'del'],
  ['del', 'del'],
  ['sub', 'sub'],
  ['sup', 'sup'],
  ['code', 'code'],
];

const withSlateAttributes = (tagName) => {
  const InlineMarkupElement = ({ attributes, children }) =>
    React.createElement(tagName, attributes, children);

  return InlineMarkupElement;
};

export const elements = {
  ...originalElements,
  ...Object.fromEntries(
    inlineMarkupElements.map(([type, tagName]) => [
      type,
      withSlateAttributes(tagName),
    ]),
  ),
};
