import Undoo from 'undoo';
import { deleteBlock } from '@plone/volto/helpers/Blocks/Blocks';
import { Form } from './Form';

jest.mock('uuid', () => ({ v4: jest.fn(() => 'generated-uuid') }), {
  virtual: true,
});

const layout = ['a', 'b', 'c', 'd'];

const selectBlock = ({
  id,
  selected = null,
  multiSelected = [],
  ctrlKey = false,
  metaKey = true,
  shiftKey = false,
}) => {
  const setUIState = jest.fn();
  const form = Object.create(Form.prototype);
  form.state = {
    formData: {
      blocks: Object.fromEntries(
        layout.map((blockId) => [blockId, { '@type': 'slate' }]),
      ),
      blocks_layout: { items: layout },
    },
  };
  form.props = {
    uiState: { selected, multiSelected },
    setUIState,
    onSelectForm: null,
  };

  form.onSelectBlock(id, true, {
    ctrlKey,
    metaKey,
    shiftKey,
  });

  return setUIState.mock.calls[0][0];
};

describe('Form top-level block selection', () => {
  it.each([
    ['Meta', { metaKey: true }],
    ['Control', { ctrlKey: true, metaKey: false }],
  ])('promotes the active block with %s-click', (_modifier, eventModifiers) => {
    expect(selectBlock({ id: 'a', selected: 'a', ...eventModifiers })).toEqual({
      selected: null,
      multiSelected: ['a'],
      gridSelected: null,
    });
  });

  it('includes the active block when adding another block', () => {
    expect(selectBlock({ id: 'b', selected: 'a' }).multiSelected).toEqual([
      'a',
      'b',
    ]);
  });

  it('adds blocks without inserting null ghost selections', () => {
    expect(
      selectBlock({ id: 'c', multiSelected: ['a', 'b'] }).multiSelected,
    ).toEqual(['a', 'b', 'c']);
  });

  it('removes only the clicked multi-selection member', () => {
    expect(
      selectBlock({ id: 'b', multiSelected: ['a', 'b', 'c'] }).multiSelected,
    ).toEqual(['a', 'c']);
  });

  it('returns an empty selection after removing the final member', () => {
    expect(
      selectBlock({ id: 'a', multiSelected: ['a'] }).multiSelected,
    ).toEqual([]);
  });

  it('selects a contiguous Shift-click range from the active block', () => {
    const getSelection = jest
      .spyOn(window, 'getSelection')
      .mockReturnValue({ empty: jest.fn() });

    expect(
      selectBlock({
        id: 'd',
        selected: 'b',
        metaKey: false,
        shiftKey: true,
      }).multiSelected,
    ).toEqual(['b', 'c', 'd']);

    getSelection.mockRestore();
  });
});

describe('Form undo history', () => {
  const createForm = (uiState = { selected: 'b', multiSelected: [] }) => {
    const form = Object.create(Form.prototype);
    form.state = {
      formData: {
        blocks: Object.fromEntries(
          layout.map((blockId) => [blockId, { '@type': 'slate' }]),
        ),
        blocks_layout: { items: [...layout] },
      },
    };
    form.props = {
      uiState,
      setUIState: jest.fn((ui) => {
        form.props.uiState = { ...form.props.uiState, ...ui };
      }),
    };
    form.setState = (state) => {
      form.state = { ...form.state, ...state };
    };
    return form;
  };

  it('undoes a block deleted by the mutating deleteBlock helper', () => {
    const form = createForm();
    const manager = new Undoo({ maxLength: 10 });
    manager.save({ state: form.getUndoState() });

    // deleteBlock mutates the blocks_layout shared with the previous formData
    form.setState({ formData: deleteBlock(form.state.formData, 'b') });
    form.props.uiState = { selected: null, multiSelected: [] };
    manager.save({ state: form.getUndoState() });

    manager.undo(({ state }) => form.onUndoRedo({ state }));

    expect(form.state.formData.blocks_layout.items).toEqual(layout);
    expect(form.state.formData.blocks.b).toEqual({ '@type': 'slate' });
    expect(form.props.setUIState).toHaveBeenLastCalledWith({
      selected: 'b',
      multiSelected: [],
    });
  });

  it('keeps the history intact when the restored formData is mutated', () => {
    const form = createForm();
    const snapshot = form.getUndoState();

    form.onUndoRedo({ state: snapshot });
    deleteBlock(form.state.formData, 'a');

    expect(snapshot.formData.blocks_layout.items).toEqual(layout);
  });

  it('reuses the snapshot while formData and selection are unchanged', () => {
    const form = createForm();
    const snapshot = form.getUndoState();

    expect(form.getUndoState()).toBe(snapshot);

    form.props.uiState = { selected: 'c', multiSelected: [] };
    const nextSnapshot = form.getUndoState();
    expect(nextSnapshot).not.toBe(snapshot);
    expect(nextSnapshot.formData).toBe(snapshot.formData);
  });
});
