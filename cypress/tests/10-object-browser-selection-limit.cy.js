import {
  isSelectableObjectBrowserItem,
  shouldCloseAfterObjectBrowserSelection,
} from '../../src/customizations/volto/components/manage/Sidebar/objectBrowserSelection';

describe('ObjectBrowser maximumSelectionSize logic', () => {
  it('keeps already selected items selectable when the limit is reached', () => {
    const isSelectable = isSelectableObjectBrowserItem({
      item: { '@id': '/cypress/a', '@type': 'Document', is_folderish: false },
      data: [
        { '@id': '/cypress/a', '@type': 'Document' },
        { '@id': '/cypress/b', '@type': 'Document' },
      ],
      mode: 'multiple',
      selectableTypes: ['Document'],
      maximumSelectionSize: 2,
      onlyFolderishSelectable: false,
    });

    expect(isSelectable).to.equal(true);
  });

  it('blocks non-selected items when the limit is reached', () => {
    const isSelectable = isSelectableObjectBrowserItem({
      item: { '@id': '/cypress/c', '@type': 'Document', is_folderish: false },
      data: [
        { '@id': '/cypress/a', '@type': 'Document' },
        { '@id': '/cypress/b', '@type': 'Document' },
      ],
      mode: 'multiple',
      selectableTypes: ['Document'],
      maximumSelectionSize: 2,
      onlyFolderishSelectable: false,
    });

    expect(isSelectable).to.equal(false);
  });

  it('does not close the browser when deselecting at the limit', () => {
    const shouldClose = shouldCloseAfterObjectBrowserSelection({
      mode: 'multiple',
      maximumSelectionSize: 2,
      currentLength: 2,
      isDeselecting: true,
    });

    expect(shouldClose).to.equal(false);
  });

  it('closes the browser when selecting the last available slot', () => {
    const shouldClose = shouldCloseAfterObjectBrowserSelection({
      mode: 'multiple',
      maximumSelectionSize: 2,
      currentLength: 1,
      isDeselecting: false,
    });

    expect(shouldClose).to.equal(true);
  });
});
