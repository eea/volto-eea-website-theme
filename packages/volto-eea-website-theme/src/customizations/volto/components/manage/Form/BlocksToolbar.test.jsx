import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import config from '@plone/volto/registry';
import { BlocksToolbarComponent } from './BlocksToolbar';
import { loadBlocksClipboardFromStorage } from './blocksClipboardUtils';

vi.mock('@plone/volto/components/manage/Pluggable', () => ({
  Plug: ({ children }) => children,
}));

const storageKey = (state) => `redux_localstorage_simple_${state}`;

// The Volto Vitest setup stubs `localStorage` with no-op methods; these tests
// need one that keeps what they write.
const createMemoryStorage = () => {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
  };
};

const renderToolbar = (props = {}) =>
  render(
    <BlocksToolbarComponent
      intl={{ formatMessage: () => '' }}
      formData={{ blocks: {}, blocks_layout: { items: [] } }}
      selectedBlock={null}
      selectedBlocks={[]}
      blocksClipboard={{}}
      setBlocksClipboard={vi.fn()}
      resetBlocksClipboard={vi.fn()}
      onSetSelectedBlocks={vi.fn()}
      onSelectBlock={vi.fn()}
      onChangeBlocks={vi.fn()}
      {...props}
    />,
  );

describe('BlocksToolbar clipboard storage sync', () => {
  const originalSettings = config.settings;

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    config.settings = {
      ...originalSettings,
      persistentReducers: ['blocksClipboard.cut', 'blocksClipboard.copy'],
    };
  });

  afterEach(() => {
    config.settings = originalSettings;
  });

  it('does not overwrite a fresh clipboard with stale storage on mount', () => {
    // localStorage is saved with a debounce, so right after a cut it can
    // still hold an older clipboard
    localStorage.setItem(
      storageKey('blocksClipboard.copy'),
      JSON.stringify([['old', { '@type': 'slate' }]]),
    );
    localStorage.setItem(storageKey('blocksClipboard'), JSON.stringify({}));
    const setBlocksClipboard = vi.fn();

    renderToolbar({
      blocksClipboard: { cut: [['new', { '@type': 'slate' }]] },
      setBlocksClipboard,
    });

    expect(setBlocksClipboard).not.toHaveBeenCalled();
  });

  it('syncs the clipboard from another tab', () => {
    const cut = [['other-tab', { '@type': 'slate' }]];
    localStorage.setItem(
      storageKey('blocksClipboard.cut'),
      JSON.stringify(cut),
    );
    const setBlocksClipboard = vi.fn();
    renderToolbar({ setBlocksClipboard });

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: storageKey('blocksClipboard.cut'),
      }),
    );

    expect(setBlocksClipboard).toHaveBeenCalledWith({ cut });
  });

  it('ignores the stale Volto 17 clipboard key', () => {
    localStorage.setItem(
      storageKey('blocksClipboard'),
      JSON.stringify({ copy: [['legacy', { '@type': 'slate' }]] }),
    );

    expect(loadBlocksClipboardFromStorage()).toBeUndefined();
  });
});

describe('BlocksToolbar in nested container blocks', () => {
  const originalBlocks = config.blocks;
  const clipboard = { copy: [['copied', { '@type': 'slate' }]] };
  const groupForm = {
    blocks: { g1: { '@type': 'slate' } },
    blocks_layout: { items: ['g1'] },
  };
  const columnForm = {
    blocks: {
      grp: { '@type': 'group', data: groupForm },
      s1: { '@type': 'slate' },
    },
    blocks_layout: { items: ['grp', 's1'] },
  };

  const toolbar = (props) => (
    <BlocksToolbarComponent
      intl={{ formatMessage: () => '' }}
      selectedBlocks={[]}
      blocksClipboard={clipboard}
      setBlocksClipboard={vi.fn()}
      resetBlocksClipboard={vi.fn()}
      onSetSelectedBlocks={vi.fn()}
      onSelectBlock={vi.fn()}
      {...props}
    />
  );

  beforeEach(() => {
    config.blocks = { ...originalBlocks, blocksConfig: { slate: {} } };
  });

  afterEach(() => {
    config.blocks = originalBlocks;
  });

  it('pastes in the group placed in a column, not in the column', () => {
    const onChangeColumn = vi.fn();
    const onChangeGroup = vi.fn();
    const { container } = render(
      <>
        {toolbar({
          formData: columnForm,
          selectedBlock: 'grp',
          onChangeBlocks: onChangeColumn,
        })}
        {toolbar({
          formData: groupForm,
          selectedBlock: 'g1',
          onChangeBlocks: onChangeGroup,
        })}
      </>,
    );

    const pasteButtons = container.querySelectorAll('#toolbar-paste-blocks');
    expect(pasteButtons).toHaveLength(1);
    fireEvent.click(pasteButtons[0]);

    expect(onChangeColumn).not.toHaveBeenCalled();
    expect(onChangeGroup).toHaveBeenCalledTimes(1);
    expect(onChangeGroup.mock.calls[0][0].blocks_layout.items).toHaveLength(2);
  });

  it('gives the buttons back to the column when the group is unselected', () => {
    const onChangeColumn = vi.fn();
    const { container, rerender } = render(
      <>
        {toolbar({
          formData: columnForm,
          selectedBlock: 'grp',
          onChangeBlocks: onChangeColumn,
        })}
        {toolbar({
          formData: groupForm,
          selectedBlock: 'g1',
          onChangeBlocks: vi.fn(),
        })}
      </>,
    );

    rerender(
      <>
        {toolbar({
          formData: columnForm,
          selectedBlock: 'grp',
          onChangeBlocks: onChangeColumn,
        })}
      </>,
    );

    fireEvent.click(container.querySelector('#toolbar-paste-blocks'));
    expect(onChangeColumn).toHaveBeenCalledTimes(1);
  });

  it('keeps the column buttons when blocks are multi-selected in it', () => {
    const { container } = render(
      <>
        {toolbar({
          formData: columnForm,
          selectedBlock: null,
          selectedBlocks: ['grp', 's1'],
          onChangeBlocks: vi.fn(),
        })}
        {toolbar({
          formData: groupForm,
          selectedBlock: 'g1',
          onChangeBlocks: vi.fn(),
        })}
      </>,
    );

    expect(container.querySelectorAll('#toolbar-copy-blocks')).toHaveLength(1);
  });
});
