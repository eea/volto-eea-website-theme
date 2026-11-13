import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import ContentsItem from './ContentsItemReactDnd';

// react-dnd is not installed with Volto 19, so stand in for its HOCs: they
// hand the wrapped item no-op connectors and keep the drag/drop specs so the
// reordering logic can be exercised directly.
const dnd = vi.hoisted(() => ({ dragSpec: null, dropSpec: null }));

vi.mock('@plone/volto/helpers/Loadable/Loadable', async () => {
  const { createElement } = await import('react');
  const passThrough = () => (element) => element;
  const reactDnd = {
    DropTarget: (type, spec, collect) => (Component) => {
      dnd.dropSpec = spec;
      const collected = collect({ dropTarget: passThrough });
      return (props) => createElement(Component, { ...props, ...collected });
    },
    DragSource: (type, spec, collect) => (Component) => {
      dnd.dragSpec = spec;
      const collected = collect(
        { dragSource: passThrough, dragPreview: passThrough },
        { isDragging: () => false },
      );
      return (props) => createElement(Component, { ...props, ...collected });
    },
  };
  return {
    injectLazyLibs: () => (Component) => (props) =>
      createElement(Component, { ...props, reactDnd }),
  };
});

const DAY = 24 * 60 * 60 * 1000;
const iso = (offset) => new Date(Date.now() + offset).toISOString();

const makeItem = (extra = {}) => ({
  '@id': '/folder/page',
  title: 'A page',
  '@type': 'Document',
  Type: 'Page',
  is_folderish: false,
  ExpirationDate: 'None',
  EffectiveDate: 'None',
  review_state: 'private',
  exclude_from_nav: false,
  Subject: ['air'],
  ...extra,
});

const indexes = [
  { id: 'review_state', type: 'string' },
  { id: 'exclude_from_nav', type: 'boolean' },
  { id: 'Subject', type: 'array' },
];

const renderItem = (props = {}) => {
  const handlers = {
    onClick: vi.fn(),
    onCut: vi.fn(),
    onCopy: vi.fn(),
    onDelete: vi.fn(),
    onMoveToTop: vi.fn(),
    onMoveToBottom: vi.fn(),
    onOrderItem: vi.fn(),
  };
  const store = configureStore()({ intl: { locale: 'en', messages: {} } });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <table>
          <tbody>
            <ContentsItem
              item={props.item || makeItem()}
              selected={false}
              indexes={indexes}
              order={2}
              {...handlers}
              {...props}
            />
          </tbody>
        </table>
      </MemoryRouter>
    </Provider>,
  );
  return handlers;
};

describe('ContentsItemReactDnd', () => {
  it('renders the item link and its index columns', () => {
    renderItem();
    expect(screen.getByText('A page').closest('a')).toHaveAttribute(
      'href',
      '/folder/page',
    );
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('air')).toBeInTheDocument();
  });

  it('shows the expired, scheduled and working copy badges', () => {
    renderItem({
      item: makeItem({
        ExpirationDate: iso(-DAY),
        EffectiveDate: iso(DAY),
        is_working_copy: true,
        is_folderish: true,
      }),
    });
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Working copy')).toBeInTheDocument();
    expect(screen.getByText('A page').closest('a')).toHaveAttribute(
      'href',
      '/folder/page/contents',
    );
  });

  it('toggles the selection with the checkbox', () => {
    const handlers = renderItem({ selected: true });
    fireEvent.click(screen.getByLabelText('Unchecked'));
    expect(handlers.onClick).toHaveBeenCalledWith(
      expect.anything(),
      '/folder/page',
    );
  });

  it('runs the actions of the item menu', async () => {
    const handlers = renderItem();
    fireEvent.click(document.querySelector('.dropdown-popup-trigger'));
    fireEvent.click(await screen.findByText('Cut'));
    fireEvent.click(screen.getByText('Copy'));
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Move to top of folder'));
    fireEvent.click(screen.getByText('Move to bottom of folder'));
    expect(handlers.onCut).toHaveBeenCalled();
    expect(handlers.onCopy).toHaveBeenCalled();
    expect(handlers.onDelete).toHaveBeenCalled();
    expect(handlers.onMoveToTop).toHaveBeenCalled();
    expect(handlers.onMoveToBottom).toHaveBeenCalled();
  });

  describe('drag and drop', () => {
    beforeEach(() => renderItem());

    it('starts a drag with the item id and order', () => {
      expect(dnd.dragSpec.beginDrag({ item: makeItem(), order: 2 })).toEqual({
        id: '/folder/page',
        order: 2,
        startOrder: 2,
      });
    });

    it('moves the dragged item while hovering another row', () => {
      const dragged = { id: '/folder/other', order: 0, startOrder: 0 };
      const onOrderItem = vi.fn();
      dnd.dropSpec.hover({ order: 3, onOrderItem }, { getItem: () => dragged });
      expect(onOrderItem).toHaveBeenCalledWith('/folder/other', 0, 3, false);
      expect(dragged.order).toBe(3);
    });

    it('ignores hovering the row being dragged', () => {
      const onOrderItem = vi.fn();
      dnd.dropSpec.hover(
        { order: 1, onOrderItem },
        { getItem: () => ({ id: '/folder/other', order: 1 }) },
      );
      expect(onOrderItem).not.toHaveBeenCalled();
    });

    it('saves the new position on drop', () => {
      const dragged = { id: '/folder/other', order: 3, startOrder: 0 };
      const onOrderItem = vi.fn();
      dnd.dropSpec.drop({ order: 3, onOrderItem }, { getItem: () => dragged });
      expect(onOrderItem).toHaveBeenCalledWith('/folder/other', 0, 3, true);
    });

    it('does not save when dropped where it started', () => {
      const onOrderItem = vi.fn();
      dnd.dropSpec.drop(
        { order: 0, onOrderItem },
        { getItem: () => ({ id: '/folder/other', order: 0, startOrder: 0 }) },
      );
      expect(onOrderItem).not.toHaveBeenCalled();
    });
  });
});
