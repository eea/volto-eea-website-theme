import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import config from '@plone/volto/registry';

import ObjectBrowserBody from './ObjectBrowserBody';

const navProps = { current: null };

vi.mock('@plone/volto/components/theme/Icon/Icon', () => ({
  default: () => null,
}));

// Capture the props the body passes to the nav and expose the item handlers.
vi.mock('@plone/volto/components/manage/Sidebar/ObjectBrowserNav', async () => {
  const React = (await vi.importActual('react')).default;
  const ObjectBrowserNav = (props) => {
    navProps.current = props;
    return React.createElement(
      'ul',
      { 'data-testid': 'nav', 'data-view': props.view || '' },
      (props.currentSearchResults?.items || []).map((item) =>
        React.createElement(
          'li',
          { key: item['@id'] },
          React.createElement(
            'button',
            { type: 'button', onClick: () => props.handleClickOnItem(item) },
            `click ${item.title}`,
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: () => props.handleDoubleClickOnItem(item),
            },
            `dblclick ${item.title}`,
          ),
        ),
      ),
    );
  };
  return { default: ObjectBrowserNav };
});

const mockStore = configureStore();

const image = {
  '@id': '/folder/bird.jpg',
  '@type': 'Image',
  getURL: '/folder/bird.jpg',
  title: 'A bird',
  description: 'A bird on a branch',
  rights: 'EEA',
};
const doc1 = { '@id': '/doc-1', '@type': 'Document', title: 'Doc 1' };
const doc2 = { '@id': '/doc-2', '@type': 'Document', title: 'Doc 2' };

const storeWith = (mode, items) =>
  mockStore({
    search: {
      subrequests: { [`test-block-${mode}`]: { items } },
    },
    intl: { locale: 'en', messages: {} },
  });

const baseProps = {
  block: 'test-block',
  data: {},
  closeObjectBrowser: () => {},
  onChangeBlock: () => {},
};

const renderBody = (props, items = []) => {
  const store = storeWith(props.mode, items);
  const result = render(
    <Provider store={store}>
      <ObjectBrowserBody {...baseProps} {...props} />
    </Provider>,
  );
  return { ...result, store };
};

const searchActions = (store) =>
  store.getActions().filter((action) => action.type === 'SEARCH_CONTENT');

describe('ObjectBrowserBody', () => {
  let imageObjects;

  beforeEach(() => {
    navProps.current = null;
    imageObjects = config.settings.imageObjects;
    config.settings.imageObjects = ['Image'];
  });

  afterEach(() => {
    config.settings.imageObjects = imageObjects;
    vi.useRealTimers();
  });

  it('uses initialPath as the default folder when mode=multiple', () => {
    const { store } = renderBody({
      mode: 'multiple',
      data: [],
      initialPath: '/company/team',
    });
    expect(searchActions(store)[0].request.path.split('/@search')[0]).toBe(
      '/company/team',
    );
  });

  it('fills alt and copyright from the picked image', () => {
    const onChangeBlock = vi.fn();
    renderBody({ mode: 'image', data: { url: '' }, onChangeBlock }, [image]);

    fireEvent.click(screen.getByText('click A bird'));

    expect(onChangeBlock).toHaveBeenCalledWith('test-block', {
      url: '/folder/bird.jpg',
      alt: 'A bird',
      copyright: 'EEA',
    });
  });

  it('falls back to the description for alt and to empty strings', () => {
    const onChangeBlock = vi.fn();
    renderBody({ mode: 'image', data: {}, onChangeBlock }, [
      { ...image, title: '', rights: undefined },
      {
        '@id': '/empty.jpg',
        '@type': 'Image',
        getURL: '/empty.jpg',
        title: '',
      },
    ]);
    const buttons = screen.getAllByText(/^click/);

    fireEvent.click(buttons[0]);
    expect(onChangeBlock).toHaveBeenLastCalledWith('test-block', {
      url: '/folder/bird.jpg',
      alt: 'A bird on a branch',
      copyright: '',
    });

    fireEvent.click(buttons[1]);
    expect(onChangeBlock).toHaveBeenLastCalledWith('test-block', {
      url: '/empty.jpg',
      alt: '',
      copyright: '',
    });
  });

  it('defaults to the icons view in image mode and toggles it', () => {
    renderBody({ mode: 'image', data: {} }, [image]);
    expect(screen.getByTestId('nav')).toHaveAttribute('data-view', 'icons');

    fireEvent.click(screen.getByRole('button', { name: 'List View' }));
    expect(screen.getByTestId('nav')).toHaveAttribute('data-view', 'list');

    fireEvent.click(screen.getByRole('button', { name: 'Icon View' }));
    expect(screen.getByTestId('nav')).toHaveAttribute('data-view', 'icons');
  });

  it('uses the list view without a view switch in link mode', () => {
    const { container } = renderBody({ mode: 'link', data: {} }, [doc1]);
    expect(screen.getByTestId('nav')).toHaveAttribute('data-view', 'list');
    expect(container.querySelector('.mode-switch')).toBeNull();
    expect(container.querySelector('.object-browser')).not.toBeNull();
  });

  it('shows "Search results" while searching and debounces the search', () => {
    vi.useFakeTimers();
    const { container, store } = renderBody(
      { mode: 'link', data: {}, selectableTypes: ['Document'] },
      [doc1],
    );
    fireEvent.click(screen.getByRole('button', { name: 'Search SVG' }));
    expect(screen.getByText('Search results')).toBeInTheDocument();

    const before = searchActions(store).length;
    const input = container.querySelector('.search input');
    fireEvent.change(input, { target: { value: 'wa' } });
    fireEvent.change(input, { target: { value: 'water' } });
    expect(searchActions(store)).toHaveLength(before);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    const actions = searchActions(store);
    expect(actions).toHaveLength(before + 1);
    expect(actions[actions.length - 1].request.path).toContain(
      'SearchableText=water*',
    );
    expect(actions[actions.length - 1].request.path).toContain(
      'portal_type:list=Document',
    );
  });

  it('closes the browser once maximumSelectionSize is reached', () => {
    const closeObjectBrowser = vi.fn();
    const onChangeBlock = vi.fn();
    renderBody(
      {
        mode: 'multiple',
        data: [doc1],
        maximumSelectionSize: 2,
        closeObjectBrowser,
        onChangeBlock,
        dataName: 'items',
      },
      [doc1, doc2],
    );

    fireEvent.click(screen.getByText('click Doc 2'));
    expect(onChangeBlock).toHaveBeenCalled();
    expect(closeObjectBrowser).toHaveBeenCalledTimes(1);
  });

  it('only keeps already selected items selectable at the limit', () => {
    const closeObjectBrowser = vi.fn();
    const onChangeBlock = vi.fn();
    renderBody(
      {
        mode: 'multiple',
        data: [doc1],
        maximumSelectionSize: 1,
        closeObjectBrowser,
        onChangeBlock,
        dataName: 'items',
      },
      [doc1, doc2],
    );

    expect(navProps.current.isSelectable(doc1)).toBe(true);
    expect(navProps.current.isSelectable(doc2)).toBe(false);

    // Deselecting the selected item keeps the browser open.
    fireEvent.click(screen.getByText('click Doc 1'));
    expect(onChangeBlock).toHaveBeenCalledTimes(1);
    expect(closeObjectBrowser).not.toHaveBeenCalled();
  });
});
