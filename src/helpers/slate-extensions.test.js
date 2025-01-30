import { Editor, Range, Transforms } from 'slate';
import { breakList } from './slate-extensions';
import config from '@plone/volto/registry';

jest.mock('slate');
jest.mock('@plone/volto/registry');
jest.mock('@plone/volto-slate/utils/lists', () => ({
  getCurrentListItem: jest.fn().mockReturnValue([{ type: 'list-item' }, [0]]),
}));

jest.mock('@plone/volto-slate/utils/selection', () => ({
  isCursorAtBlockEnd: jest.fn().mockReturnValue(false),
}));

describe('breakList', () => {
  let editor;
  let originalInsertBreak;
  beforeEach(() => {
    originalInsertBreak = jest.fn();
    editor = {
      selection: { anchor: { path: [0] }, focus: { path: [0] } },
      children: [],
      insertBreak: originalInsertBreak,
    };

    config.settings = {
      slate: {
        listItemType: 'list-item',
      },
    };

    Editor.rangeRef.mockReturnValue({ current: [0] });
    Editor.parent.mockReturnValue([{ type: 'list-item' }, [0]]);
    Editor.string.mockReturnValue('');
    Editor.isEmpty.mockReturnValue(false);
    Range.isCollapsed.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls original insertBreak when selection is not collapsed', () => {
    Range.isCollapsed.mockReturnValue(false);
    const enhancedEditor = breakList(editor);
    enhancedEditor.insertBreak();

    expect(originalInsertBreak).toHaveBeenCalled();
  });

  it('splits list item when it has content', () => {
    Editor.string.mockReturnValue('some content');
    Transforms.splitNodes = jest.fn();

    const enhancedEditor = breakList(editor);
    const result = enhancedEditor.insertBreak();

    expect(Transforms.splitNodes).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('removes empty list item and creates new paragraph', () => {
    Editor.isEmpty.mockReturnValue(true);
    Editor.end.mockReturnValue([0]);
    Transforms.removeNodes = jest.fn();
    Transforms.insertNodes = jest.fn();
    Transforms.select = jest.fn();

    const enhancedEditor = breakList(editor);
    const result = enhancedEditor.insertBreak();

    expect(Transforms.removeNodes).toHaveBeenCalled();
    expect(Transforms.insertNodes).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('inserts break for non-list-item types', () => {
    Editor.parent.mockReturnValue([{ type: 'paragraph' }, [0]]);

    const enhancedEditor = breakList(editor);
    enhancedEditor.insertBreak();

    expect(originalInsertBreak).toHaveBeenCalled();
  });

  it('handles cursor at block end', () => {
    jest.mock('@plone/volto-slate/utils/selection', () => ({
      isCursorAtBlockEnd: jest.fn().mockReturnValue(true),
    }));
    Editor.insertNode = jest.fn();

    const enhancedEditor = breakList(editor);
    const result = enhancedEditor.insertBreak();

    expect(result).toBe(true);
  });
});
