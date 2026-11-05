import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import GridBlockEdit, { convertTeaserToGridIfNecessary } from './Edit';

const containerEditProps = vi.hoisted(() => ({ current: null }));

vi.mock('@plone/volto/components/manage/Blocks/Container/Edit', () => ({
  default: (props) => {
    containerEditProps.current = props;
    return (
      <div data-testid="container-edit">
        {props.data?.blocks_layout?.items?.join(',')}
        <button
          type="button"
          onClick={(e) => {
            e.block = 'col-2';
            props.setSelectedBlock('col-2');
          }}
        >
          select
        </button>
      </div>
    );
  },
}));

const mockStore = configureStore([]);

const teaserGrid = {
  '@type': 'teaserGrid',
  columns: [
    { id: 'col-1', '@type': 'teaser' },
    { id: 'col-2', '@type': 'teaser' },
  ],
};

const renderGrid = (data, store, onChangeBlock = vi.fn()) =>
  render(
    <Provider store={store}>
      <GridBlockEdit
        block="grid-1"
        data={data}
        onChangeBlock={onChangeBlock}
        pathname="/"
        selected
        manage={false}
      />
    </Provider>,
  );

describe('convertTeaserToGridIfNecessary', () => {
  it('converts a legacy teaserGrid into a gridBlock', () => {
    expect(convertTeaserToGridIfNecessary(teaserGrid)).toEqual({
      ...teaserGrid,
      '@type': 'gridBlock',
      blocks_layout: { items: ['col-1', 'col-2'] },
      blocks: {
        'col-1': { id: 'col-1', '@type': 'teaser' },
        'col-2': { id: 'col-2', '@type': 'teaser' },
      },
    });
  });

  it('leaves other blocks untouched', () => {
    const data = { '@type': 'gridBlock', blocks_layout: { items: [] } };
    expect(convertTeaserToGridIfNecessary(data)).toBe(data);
  });

  it('does not crash on a teaserGrid without columns', () => {
    expect(
      convertTeaserToGridIfNecessary({ '@type': 'teaserGrid' }),
    ).toMatchObject({ blocks_layout: { items: [] }, blocks: {} });
  });
});

describe('Grid Edit', () => {
  it('saves the converted teaserGrid from an effect, once', () => {
    const store = mockStore({ form: { ui: { gridSelected: null } } });
    const onChangeBlock = vi.fn();
    const { getByTestId, rerender } = renderGrid(
      teaserGrid,
      store,
      onChangeBlock,
    );
    expect(getByTestId('container-edit')).toHaveTextContent('col-1,col-2');
    expect(onChangeBlock).toHaveBeenCalledTimes(1);
    expect(onChangeBlock).toHaveBeenCalledWith(
      'grid-1',
      convertTeaserToGridIfNecessary(teaserGrid),
    );
    rerender(
      <Provider store={store}>
        <GridBlockEdit
          block="grid-1"
          data={teaserGrid}
          onChangeBlock={onChangeBlock}
          pathname="/"
          selected
          manage={false}
        />
      </Provider>,
    );
    expect(onChangeBlock).toHaveBeenCalledTimes(1);
  });

  it('does not change a gridBlock', () => {
    const store = mockStore({ form: { ui: { gridSelected: null } } });
    const onChangeBlock = vi.fn();
    const { container } = renderGrid(
      { '@type': 'gridBlock', blocks_layout: { items: ['a', 'b', 'c'] } },
      store,
      onChangeBlock,
    );
    expect(onChangeBlock).not.toHaveBeenCalled();
    expect(container.firstChild).toHaveClass('grid-items', 'three');
  });

  it('keeps the selected child in the Redux form UI state', () => {
    const store = mockStore({ form: { ui: { gridSelected: 'col-1' } } });
    const { getByText, container } = renderGrid(
      { '@type': 'gridBlock', blocks_layout: { items: ['col-1', 'col-2'] } },
      store,
    );
    expect(containerEditProps.current.selectedBlock).toBe('col-1');

    fireEvent.click(getByText('select'));
    expect(store.getActions()[0]).toEqual({
      type: 'SET_UI_STATE',
      ui: { gridSelected: 'col-2' },
    });

    fireEvent.click(container.firstChild);
    expect(store.getActions().at(-1)).toEqual({
      type: 'SET_UI_STATE',
      ui: { gridSelected: null },
    });
  });
});
