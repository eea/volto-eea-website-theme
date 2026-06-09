import { Editor, Point, Range } from 'slate';

export * from '../../../../../../../../node_modules/@plone/volto-slate/src/utils/selection.js';

export function isCursorAtBlockStart(editor) {
  if (!editor.selection || !Range.isCollapsed(editor.selection)) {
    return false;
  }

  try {
    return Point.equals(editor.selection.anchor, Editor.start(editor, []));
  } catch {
    return false;
  }
}
