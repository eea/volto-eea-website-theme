import { useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ContainerEdit from '@plone/volto/components/manage/Blocks/Container/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { setUIState } from '@plone/volto/actions/form/form';

// EEA: legacy @kitconcept/volto-blocks-grid `teaserGrid` blocks are converted
// to the core `gridBlock` format (refs #265726)
export const convertTeaserToGridIfNecessary = (data) => {
  if (data?.['@type'] !== 'teaserGrid') return data;
  const columns = data?.columns || [];
  return {
    ...data,
    '@type': 'gridBlock',
    blocks_layout: { items: columns.map((c) => c.id) },
    blocks: columns.reduce(
      (acc, current) => ({
        ...acc,
        [current?.id]: current,
      }),
      {},
    ),
  };
};

const GridBlockEdit = (props) => {
  const { block, onChangeBlock } = props;
  const isTeaserGrid = props.data?.['@type'] === 'teaserGrid';
  // EEA: render the converted data right away, the block data itself is
  // updated in an effect (never call onChangeBlock while rendering)
  const data = convertTeaserToGridIfNecessary(props.data);

  useEffect(() => {
    if (isTeaserGrid) {
      onChangeBlock(block, data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeaserGrid, block]);

  const columnsLength = data?.blocks_layout?.items?.length || 0;

  const selectedBlock = useSelector((state) => state.form.ui.gridSelected);
  const dispatch = useDispatch();

  return (
    <div
      className={cx({
        one: columnsLength === 1,
        two: columnsLength === 2,
        three: columnsLength === 3,
        four: columnsLength >= 4,
        'grid-items': true,
      })}
      // This is required to enabling a small "in-between" clickable area
      // for bringing the Grid sidebar alive once you have selected an inner block
      onClick={(e) => {
        if (!e.block) dispatch(setUIState({ gridSelected: null }));
      }}
      role="presentation"
    >
      <ContainerEdit
        {...props}
        data={data}
        selectedBlock={selectedBlock}
        setSelectedBlock={(id) => dispatch(setUIState({ gridSelected: id }))}
        direction="horizontal"
      />
    </div>
  );
};

GridBlockEdit.propTypes = {
  block: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  manage: PropTypes.bool.isRequired,
};

export default GridBlockEdit;
