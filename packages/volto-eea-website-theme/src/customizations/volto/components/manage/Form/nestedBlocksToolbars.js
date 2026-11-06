import { getBlocksFieldname } from '@plone/volto/helpers/Blocks/Blocks';

// Container blocks (columns, group, tabs, accordion) render their own
// BlocksToolbar next to the one of the main form, and all of them plug their
// buttons in the same toolbar. Only the innermost toolbar with a selection
// should show them, otherwise e.g. pasting in a group placed in a column
// pastes in the column.
const toolbars = new Set();
const listeners = new Set();

const getBlocks = (formData) =>
  formData ? formData[getBlocksFieldname(formData)] : undefined;

const hasSelection = ({ formData, selectedBlock, selectedBlocks = [] }) =>
  selectedBlocks.length > 0 || !!getBlocks(formData)?.[selectedBlock];

const containsAnyBlock = (data, blockIds) => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  if (Array.isArray(data)) {
    return data.some((item) => containsAnyBlock(item, blockIds));
  }
  return Object.keys(data).some(
    (key) => blockIds.has(key) || containsAnyBlock(data[key], blockIds),
  );
};

export const notifyToolbars = () => {
  listeners.forEach((listener) => listener());
};

export const registerToolbar = (toolbar, listener) => {
  toolbars.add(toolbar);
  listeners.add(listener);
  notifyToolbars();
};

export const unregisterToolbar = (toolbar, listener) => {
  toolbars.delete(toolbar);
  listeners.delete(listener);
  notifyToolbars();
};

// True when the block selected in this toolbar contains another toolbar that
// has a selection of its own, which then owns the toolbar buttons.
export const hasNestedSelection = (toolbar) => {
  const { formData, selectedBlock, selectedBlocks = [] } = toolbar.props;
  if (selectedBlocks.length > 0) {
    return false;
  }
  const selectedData = getBlocks(formData)?.[selectedBlock];
  if (!selectedData) {
    return false;
  }
  return [...toolbars].some(
    (other) =>
      other !== toolbar &&
      hasSelection(other.props) &&
      containsAnyBlock(
        selectedData,
        new Set(Object.keys(getBlocks(other.props.formData) || {})),
      ),
  );
};
