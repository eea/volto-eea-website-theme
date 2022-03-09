import { makeInlineElementPlugin } from 'volto-slate/components/ElementEditor';
import Blockquote from './Blockquote';
import getSchema from './schema';

import quoteIcon from '@plone/volto/icons/quote.svg';

export default (config) => {
  const opts = {
    title: 'Blockquote',
    pluginId: 'blockquote',
    elementType: 'blockquote',
    element: Blockquote,
    isInlineElement: false,
    schemaProvider: ({ children, data }) => {
      return children(getSchema(data));
    },
    toolbarButtonIcon: quoteIcon,
  };

  const [installPullqote] = makeInlineElementPlugin(opts);
  config = installPullqote(config);

  return config;
};
