// To be removed when https://github.com/plone/volto/pull/5347 is merged and released in Volto 16.x
import { normalizeExternalData as normalize } from '@plone/volto-slate/utils';

export function normalizeExternalData(editor) {
  editor.normalizeExternalData = (fragment) => {
    return normalize(editor, fragment);
  };
  return editor;
}
