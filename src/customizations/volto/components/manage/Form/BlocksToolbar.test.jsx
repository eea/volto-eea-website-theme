import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Pluggable,
  PluggablesProvider,
} from '@plone/volto/components/manage/Pluggable';
import config from '@plone/volto/registry';
import { BlocksToolbarComponent } from './BlocksToolbar';

jest.mock('./blocksClipboardUtils', () => ({
  cloneBlocks: (data) => ({ ...data }),
  loadBlocksClipboardFromStorage: () => undefined,
}));
jest.mock('@plone/volto/components/theme/Icon/Icon', () => () => null);

const block = { '@type': 'slate', plaintext: 'Copied content' };
const makeProps = (id) => ({
  formData: { blocks: { [id]: block }, blocks_layout: { items: [id] } },
  selectedBlock: id,
  selectedBlocks: [],
  blocksClipboard: { copy: [['source', block]] },
  intl: { formatMessage: ({ defaultMessage, id }) => defaultMessage || id },
  setBlocksClipboard: jest.fn(),
  resetBlocksClipboard: jest.fn(),
  onChangeBlocks: jest.fn(),
  onSetSelectedBlocks: jest.fn(),
  onSelectBlock: jest.fn(),
});

beforeEach(() => {
  config.blocks.blocksConfig.slate = {};
});

it('pastes inside a column, then restores the page paste action when leaving it', () => {
  const page = makeProps('columns');
  const column = makeProps('paragraph');
  const Editor = ({ inside }) => (
    <PluggablesProvider>
      <Pluggable name="main.toolbar.bottom" />
      <BlocksToolbarComponent {...page} />
      {inside && <BlocksToolbarComponent {...column} />}
    </PluggablesProvider>
  );
  const { rerender } = render(<Editor inside={false} />);
  rerender(<Editor inside />);
  fireEvent.click(screen.getByRole('button', { name: /paste/i }));
  expect(column.onChangeBlocks).toHaveBeenCalledTimes(1);
  expect(page.onChangeBlocks).not.toHaveBeenCalled();
  rerender(<Editor inside={false} />);
  fireEvent.click(screen.getByRole('button', { name: /paste/i }));
  expect(page.onChangeBlocks).toHaveBeenCalledTimes(1);
});

it('ignores missing clipboard blocks and still pastes valid blocks', () => {
  const props = makeProps('paragraph');
  props.blocksClipboard.copy.unshift(['missing', null]);
  const toolbar = new BlocksToolbarComponent(props);
  toolbar.pasteBlocks({});
  expect(props.onChangeBlocks).toHaveBeenCalledTimes(1);
  expect(
    Object.values(props.onChangeBlocks.mock.calls[0][0].blocks),
  ).toHaveLength(2);
});

it('keeps the clipboard if applying a paste fails', () => {
  const props = makeProps('paragraph');
  props.onChangeBlocks.mockImplementation(() => {
    throw new Error('Update failed');
  });
  const toolbar = new BlocksToolbarComponent(props);
  expect(() => toolbar.pasteBlocks({})).toThrow('Update failed');
  expect(props.resetBlocksClipboard).not.toHaveBeenCalled();
});

it('restores copying outside Columns after copying inside it', () => {
  const page = { ...makeProps('columns'), selectedBlocks: ['columns'] };
  const column = { ...makeProps('paragraph'), selectedBlocks: ['paragraph'] };
  const Editor = ({ inside }) => (
    <PluggablesProvider>
      <Pluggable name="main.toolbar.bottom" />
      <BlocksToolbarComponent {...page} />
      {inside && <BlocksToolbarComponent {...column} />}
    </PluggablesProvider>
  );
  const { rerender } = render(<Editor inside={false} />);
  rerender(<Editor inside />);
  fireEvent.click(screen.getByRole('button', { name: /copy/i }));
  expect(column.setBlocksClipboard).toHaveBeenLastCalledWith({
    copy: [['paragraph', block]],
  });
  rerender(<Editor inside={false} />);
  fireEvent.click(screen.getByRole('button', { name: /copy/i }));
  expect(page.setBlocksClipboard).toHaveBeenLastCalledWith({
    copy: [['columns', block]],
  });
});

it('does not store missing selected blocks in the clipboard', () => {
  const props = makeProps('paragraph');
  props.selectedBlocks = ['missing', 'paragraph'];
  new BlocksToolbarComponent(props).copyBlocksToClipboard();
  expect(props.setBlocksClipboard).toHaveBeenCalledWith({
    copy: [['paragraph', block]],
  });
});
