import React from 'react';
import { render } from '@testing-library/react';
import config from '@plone/volto/registry';
import { BlocksToolbarComponent } from './BlocksToolbar';
import { loadBlocksClipboardFromStorage } from './blocksClipboardUtils';

jest.mock('@plone/volto/components/manage/Pluggable', () => ({
  Plug: ({ children }) => children,
}));

const storageKey = (state) => `redux_localstorage_simple_${state}`;

const renderToolbar = (props = {}) =>
  render(
    <BlocksToolbarComponent
      intl={{ formatMessage: () => '' }}
      formData={{ blocks: {}, blocks_layout: { items: [] } }}
      selectedBlock={null}
      selectedBlocks={[]}
      blocksClipboard={{}}
      setBlocksClipboard={jest.fn()}
      resetBlocksClipboard={jest.fn()}
      onSetSelectedBlocks={jest.fn()}
      onSelectBlock={jest.fn()}
      onChangeBlocks={jest.fn()}
      {...props}
    />,
  );

describe('BlocksToolbar clipboard storage sync', () => {
  const originalSettings = config.settings;

  beforeEach(() => {
    localStorage.clear();
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
    const setBlocksClipboard = jest.fn();

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
    const setBlocksClipboard = jest.fn();
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
